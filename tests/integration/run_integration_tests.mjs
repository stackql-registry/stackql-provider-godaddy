#!/usr/bin/env node

// Row-level integration tests for the godaddy provider against the in-process
// mock GoDaddy API (mock_godaddy_server.mjs) - no credentials, no network.
//
// The runner materialises a test copy of the generated registry under
// tests/integration/.registry-tmp with every server URL (the document-level
// production server and the path-level Domains v2 customer server template,
// variables and x-stackQL-envVar preserved) pointed at the mock, then runs
// stackql against it and asserts both the rows returned and the requests the
// mock recorded:
//
//   - the bearer credential from GODADDY_API_KEY on every request
//   - v1 marker pagination (limit/marker, terminates on the short page)
//   - v3 HATEOAS link pagination (links[rel=next].href followed verbatim)
//   - GODADDY_CUSTOMER_ID resolution vs a WHERE customer_id override vs unset
//   - snake_case WHERE keys resolving to camelCase query parameters
//   - LIMIT pushdown on the (unpaged) suggestion read
//   - the wrapped array request bodies unwrapped on the wire (v1 record
//     writes, v3 nameservers)
//   - a v3 DNS record INSERT / UPDATE / DELETE lifecycle and the v1 record
//     read / delete
//   - the 404 error envelope surfacing as a query error
//
// Usage: node tests/integration/run_integration_tests.mjs [--verbose]
// Binary resolution: $STACKQL, ./stackql(.exe), then PATH.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startMockServer, TEST_TOKEN, CUSTOMER_ID } from './mock_godaddy_server.mjs';

const verbose = process.argv.includes('--verbose');
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const srcRegistry = path.join(repoRoot, 'provider-dev', 'openapi');
const tmpRegistry = path.join(here, '.registry-tmp');

function findBinary() {
  if (process.env.STACKQL && fs.existsSync(process.env.STACKQL)) return process.env.STACKQL;
  for (const name of ['stackql', 'stackql.exe']) {
    const local = path.join(repoRoot, name);
    if (fs.existsSync(local)) return local;
  }
  return 'stackql';
}
const bin = findBinary();

// ---------------------------------------------------------------- registry copy
function materialiseRegistry(port) {
  fs.rmSync(tmpRegistry, { recursive: true, force: true });
  const srcProvider = path.join(srcRegistry, 'src', 'godaddy', 'v00.00.00000');
  const dstProvider = path.join(tmpRegistry, 'src', 'godaddy', 'v00.00.00000');
  fs.mkdirSync(path.join(dstProvider, 'services'), { recursive: true });
  fs.copyFileSync(path.join(srcProvider, 'provider.yaml'), path.join(dstProvider, 'provider.yaml'));
  const mock = `http://127.0.0.1:${port}`;
  let replaced = 0;
  for (const f of fs.readdirSync(path.join(srcProvider, 'services'))) {
    let text = fs.readFileSync(path.join(srcProvider, 'services', f), 'utf8');
    const before = text;
    text = text.replace(/https:\/\/api\.godaddy\.com/g, mock);
    if (text !== before) replaced++;
    fs.writeFileSync(path.join(dstProvider, 'services', f), text);
  }
  if (replaced === 0) throw new Error('no server URLs replaced - is the provider generated?');
  const regPath = tmpRegistry.replace(/\\/g, '/');
  return JSON.stringify({ url: `file://${regPath}`, localDocRoot: regPath, verifyConfig: { nopVerify: true } });
}

function runSql(registry, sql, envOverrides = {}) {
  return new Promise((resolve) => {
    const env = { ...process.env, GODADDY_API_KEY: TEST_TOKEN, ...envOverrides };
    for (const [k, v] of Object.entries(envOverrides)) if (v === undefined) delete env[k];
    const child = spawn(bin, [`--registry=${registry}`, 'exec', sql, '--output', 'json'], { cwd: repoRoot, env });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      let rows = null;
      try { rows = JSON.parse(stdout); } catch { rows = null; }
      if (verbose) console.log(`\n$ ${sql}\n${stdout.slice(0, 600)}${stderr ? `\n[stderr] ${stderr.slice(0, 400)}` : ''}`);
      resolve({ code, rows: Array.isArray(rows) ? rows : [], raw: stdout, stderr });
    });
    child.on('error', (err) => resolve({ code: -1, rows: [], raw: '', stderr: String(err) }));
  });
}

const results = [];
function check(name, cond, note = '') {
  results.push({ name, pass: !!cond });
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : `  [${String(note).slice(0, 220)}]`}`);
}

const { server, port, requests } = await startMockServer();
const registry = materialiseRegistry(port);
console.log(`stackql: ${bin}\nmock GoDaddy API: http://127.0.0.1:${port}`);
const since = () => requests.length;
const reqsSince = (n) => requests.slice(n);

try {
  // ---------------------------------------------------------------- auth
  let n = since();
  let r = await runSql(registry, 'SELECT domain, domain_id, status, name_servers, renew_auto FROM godaddy.domains.domains');
  check('v1 domain list returns every row across marker pages (5 rows)', r.rows.length === 5, r.stderr || r.raw);
  let reqs = reqsSince(n).filter((x) => x.path === '/v1/domains');
  check('every request carries Authorization: Bearer $GODADDY_API_KEY', reqs.length > 0 && reqs.every((x) => x.headers.authorization === `Bearer ${TEST_TOKEN}`));
  // pages of 2 over 5 domains: 3 pages, then the marker after the last
  // domain returns an empty page which terminates the loop (4 requests)
  check('v1 marker pagination: marker = last domain of the previous page, stops on the empty page', reqs.length === 4 && !reqs[0].query.marker && reqs[1].query.marker === 'bravo.example' && reqs[2].query.marker === 'delta.example' && reqs[3].query.marker === 'echo.example', JSON.stringify(reqs.map((x) => x.query)));
  check('snake_case columns on the row (domain_id, name_servers, renew_auto)', r.rows[0] && 'domain_id' in r.rows[0] && 'name_servers' in r.rows[0] && 'renew_auto' in r.rows[0] && /ns33/.test(r.rows[0].name_servers), JSON.stringify(r.rows[0] || {}));

  n = since();
  r = await runSql(registry, "SELECT domain, status FROM godaddy.domains.domains WHERE statuses = 'ACTIVE' AND \"limit\" = 4");
  reqs = reqsSince(n).filter((x) => x.path === '/v1/domains');
  check('statuses pushed down as a query parameter; quoted "limit" sizes the page (4 + 1 + empty = 3 requests)', r.rows.length === 5 && reqs.length === 3 && reqs.every((x) => x.query.statuses === 'ACTIVE' && x.query.limit === '4'), JSON.stringify(reqs.map((x) => x.query)));

  r = await runSql(registry, "SELECT domain, json_extract(contact_registrant, '$.email') AS email FROM godaddy.domains.domains WHERE domain = 'alpha.example'");
  check('v1 domain get by domain with json_extract on the contact blob', r.rows.length === 1 && r.rows[0].email === 'ada@example', r.stderr || r.raw);

  // ---------------------------------------------------------------- v3 links pagination
  n = since();
  r = await runSql(registry, 'SELECT domain, status, expires_at FROM godaddy.domains.domains_v3');
  reqs = reqsSince(n).filter((x) => x.path === '/v3/domains/domain-names');
  check('v3 domain list follows links[rel=next] (5 rows over 3 requests)', r.rows.length === 5 && reqs.length === 3 && reqs[1].query.pageToken && reqs[2].query.pageToken, `${r.rows.length} rows, ${JSON.stringify(reqs.map((x) => x.query))} ${r.stderr}`);
  n = since();
  r = await runSql(registry, "SELECT domain FROM godaddy.domains.domains_v3 WHERE page_size = 4 AND statuses = 'ACTIVE,EXPIRED'");
  reqs = reqsSince(n).filter((x) => x.path === '/v3/domains/domain-names');
  check('snake_case WHERE keys map to camelCase query params (page_size -> pageSize)', reqs[0]?.query.pageSize === '4' && reqs[0]?.query.statuses === 'ACTIVE,EXPIRED' && r.rows.length === 5, JSON.stringify(reqs.map((x) => x.query)));
  r = await runSql(registry, "SELECT domain, auto_renew, name_servers FROM godaddy.domains.domains_v3 WHERE domain_name = 'alpha.example'");
  check('v3 domain get via the domain_name alias of the domain-name path parameter', r.rows.length === 1 && r.rows[0].domain === 'alpha.example', r.stderr || r.raw);

  n = since();
  r = await runSql(registry, "SELECT record_id, name, type, data FROM godaddy.dns.records_v3 WHERE zone = 'alpha.example' AND page_size = 2");
  reqs = reqsSince(n).filter((x) => /dns-records$/.test(x.path));
  check('v3 DNS records follow page links (5 rows over 3 requests)', r.rows.length === 5 && reqs.length === 3, `${r.rows.length} rows / ${reqs.length} requests ${r.stderr}`);
  n = since();
  r = await runSql(registry, "SELECT record_id, name, data FROM godaddy.dns.records_v3 WHERE zone = 'alpha.example' AND type = 'A'");
  reqs = reqsSince(n).filter((x) => /dns-records$/.test(x.path));
  check('record type filter pushed down (type=A, 2 rows)', r.rows.length === 2 && reqs[0]?.query.type === 'A', JSON.stringify(reqs.map((x) => x.query)));

  // ---------------------------------------------------------------- v2 customer scoping
  n = since();
  r = await runSql(registry, "SELECT type, status FROM godaddy.domains.actions_v2 WHERE domain = 'alpha.example'", { GODADDY_CUSTOMER_ID: CUSTOMER_ID });
  reqs = reqsSince(n);
  check('GODADDY_CUSTOMER_ID resolves the v2 customer server (no WHERE customer_id)', r.rows.length === 1 && reqs[0]?.path === `/v2/customers/${CUSTOMER_ID}/domains/alpha.example/actions`, `${reqs[0]?.path} ${r.stderr}`);
  n = since();
  r = await runSql(registry, `SELECT type FROM godaddy.domains.actions_v2 WHERE domain = 'alpha.example' AND customer_id = 'other-customer'`, { GODADDY_CUSTOMER_ID: CUSTOMER_ID });
  reqs = reqsSince(n);
  check('WHERE customer_id overrides GODADDY_CUSTOMER_ID (mock answers 403 for it)', reqs[0]?.path === '/v2/customers/other-customer/domains/alpha.example/actions' && /403|ACCESS_DENIED/.test(r.stderr + r.raw), `${reqs[0]?.path} ${(r.stderr + r.raw).slice(0, 120)}`);
  r = await runSql(registry, "SELECT type FROM godaddy.domains.actions_v2 WHERE domain = 'alpha.example'", { GODADDY_CUSTOMER_ID: undefined });
  check('unset GODADDY_CUSTOMER_ID and no WHERE customer_id fails (no viable server for the customer template)', r.rows.length === 0 && /matching operation|required|viable servers/i.test(r.stderr + r.raw), (r.stderr + r.raw).slice(0, 160));
  n = since();
  r = await runSql(registry, "SELECT yyyymm, total FROM godaddy.domains.api_usage_v2 WHERE yyyymm = '2026-09'", { GODADDY_CUSTOMER_ID: undefined });
  reqs = reqsSince(n);
  check('v2 usage (not customer-scoped) stays on the production server path', r.rows.length === 1 && reqs[0]?.path === '/v2/domains/usage/2026-09', `${reqs[0]?.path} ${r.stderr}`);

  // ---------------------------------------------------------------- LIMIT pushdown (unpaged read)
  n = since();
  r = await runSql(registry, "SELECT domain FROM godaddy.registration.suggestions WHERE query = 'stackql' LIMIT 2");
  reqs = reqsSince(n).filter((x) => x.path === '/v1/domains/suggest');
  check('LIMIT pushed down to the suggest limit parameter', r.rows.length === 2 && reqs[0]?.query.limit === '2' && reqs[0]?.query.query === 'stackql', JSON.stringify(reqs.map((x) => x.query)));
  n = since();
  r = await runSql(registry, "SELECT agreement_key, title FROM godaddy.registration.agreements WHERE tlds = 'com' AND privacy = false");
  reqs = reqsSince(n).filter((x) => x.path === '/v1/domains/agreements');
  check('agreements: renamed privacy parameter reaches the wire as privacy=false', r.rows.length === 1 && reqs[0]?.query.privacy === 'false' && reqs[0]?.query.tlds === 'com', JSON.stringify(reqs.map((x) => x.query)) + r.stderr);

  // ---------------------------------------------------------------- array bodies (request transform)
  n = since();
  r = await runSql(registry, `EXEC godaddy.dns.records.add @domain = 'alpha.example', @records = '[{"type": "TXT", "name": "_verify", "data": "token", "ttl": 600}]'`);
  reqs = reqsSince(n).filter((x) => x.method === 'PATCH');
  let body = null;
  try { body = JSON.parse(reqs[0]?.body || 'null'); } catch { body = null; }
  check('v1 records.add sends the bare JSON array (wrapper unwrapped by the request transform)', Array.isArray(body) && body[0]?.type === 'TXT' && body[0]?.ttl === 600, `${reqs[0]?.body} ${r.stderr}`);
  n = since();
  r = await runSql(registry, `EXEC godaddy.dns.records.replace_by_type_name @domain = 'alpha.example', @type = 'TXT', @name = '_verify', @records = '[{"data": "token2", "ttl": 300}]'`);
  reqs = reqsSince(n).filter((x) => x.method === 'PUT');
  try { body = JSON.parse(reqs[0]?.body || 'null'); } catch { body = null; }
  check('v1 records.replace_by_type_name: PUT /records/TXT/_verify with the array body', reqs[0]?.path === '/v1/domains/alpha.example/records/TXT/_verify' && Array.isArray(body) && body[0]?.data === 'token2', `${reqs[0]?.path} ${reqs[0]?.body} ${r.stderr}`);
  n = since();
  r = await runSql(registry, `EXEC godaddy.domains.domains_v3.update_nameservers @domain_name = 'alpha.example', @idempotency_key = 'k-1', @name_servers = '["ns1.example.net", "ns2.example.net"]'`);
  reqs = reqsSince(n).filter((x) => x.method === 'PUT');
  try { body = JSON.parse(reqs[0]?.body || 'null'); } catch { body = null; }
  check('v3 update_nameservers: bare array body + Idempotency-Key header', reqs[0]?.path === '/v3/domains/domain-names/alpha.example/nameservers' && Array.isArray(body) && body[1] === 'ns2.example.net' && reqs[0]?.headers['idempotency-key'] === 'k-1', `${reqs[0]?.path} ${reqs[0]?.body} ${JSON.stringify(reqs[0]?.headers)} ${r.stderr}`);
  r = await runSql(registry, "SELECT operation_id, status FROM godaddy.domains.operations_v3 WHERE operation_id = 'op-1'");
  check('v3 operation poll', r.rows.length === 1 && r.rows[0].status === 'COMPLETED', r.stderr || r.raw);

  // ---------------------------------------------------------------- v3 record lifecycle
  n = since();
  r = await runSql(registry, "INSERT INTO godaddy.dns.records_v3 (zone, name, type, data, ttl) SELECT 'alpha.example', 'app', 'A', '203.0.113.20', 3600");
  reqs = reqsSince(n).filter((x) => x.method === 'POST');
  try { body = JSON.parse(reqs[0]?.body || 'null'); } catch { body = null; }
  check('records_v3 INSERT posts the record body with wire keys and integer ttl', reqs[0]?.path === '/v3/domains/zones/alpha.example/dns-records' && body?.name === 'app' && body?.ttl === 3600, `${reqs[0]?.path} ${reqs[0]?.body} ${r.stderr}`);
  n = since();
  r = await runSql(registry, "UPDATE godaddy.dns.records_v3 SET name = 'app', type = 'A', data = '203.0.113.21', ttl = 600 WHERE zone = 'alpha.example' AND record_id = 'r-new'");
  reqs = reqsSince(n).filter((x) => x.method === 'PUT');
  try { body = JSON.parse(reqs[0]?.body || 'null'); } catch { body = null; }
  check('records_v3 UPDATE puts the full record to /dns-records/{recordId}', reqs[0]?.path === '/v3/domains/zones/alpha.example/dns-records/r-new' && body?.data === '203.0.113.21', `${reqs[0]?.path} ${reqs[0]?.body} ${r.stderr}`);
  n = since();
  r = await runSql(registry, "DELETE FROM godaddy.dns.records_v3 WHERE zone = 'alpha.example' AND record_id = 'r-new'");
  reqs = reqsSince(n).filter((x) => x.method === 'DELETE');
  check('records_v3 DELETE', reqs[0]?.path === '/v3/domains/zones/alpha.example/dns-records/r-new', `${reqs[0]?.path} ${r.stderr}`);

  // ---------------------------------------------------------------- v1 records read/delete
  r = await runSql(registry, "SELECT name, type, data, ttl FROM godaddy.dns.records WHERE domain = 'alpha.example' AND type = 'A' AND name = '@'");
  check('v1 records list by type and name (bare array, 2 rows)', r.rows.length === 2 && r.rows[0].data === '203.0.113.10', r.stderr || r.raw);
  n = since();
  r = await runSql(registry, "DELETE FROM godaddy.dns.records WHERE domain = 'alpha.example' AND type = 'TXT' AND name = '_verify'");
  reqs = reqsSince(n).filter((x) => x.method === 'DELETE');
  check('v1 records DELETE by type and name', reqs[0]?.path === '/v1/domains/alpha.example/records/TXT/_verify', `${reqs[0]?.path} ${r.stderr}`);

  // ---------------------------------------------------------------- UPDATE domains (v1) + error envelope
  n = since();
  r = await runSql(registry, "UPDATE godaddy.domains.domains SET renew_auto = 'false', locked = 'true' WHERE domain = 'alpha.example'");
  reqs = reqsSince(n).filter((x) => x.method === 'PATCH');
  try { body = JSON.parse(reqs[0]?.body || 'null'); } catch { body = null; }
  check('v1 domain UPDATE patches camelCase booleans (renewAuto=false, locked=true)', reqs[0]?.path === '/v1/domains/alpha.example' && body?.renewAuto === false && body?.locked === true, `${reqs[0]?.body} ${r.stderr}`);
  r = await runSql(registry, "SELECT domain FROM godaddy.domains.domains WHERE domain = 'missing.example'");
  check('404 error envelope surfaces as a query error', r.rows.length === 0 && /404|NOT_FOUND/.test(r.stderr + r.raw), (r.stderr + r.raw).slice(0, 160));
} finally {
  server.close();
}

const failed = results.filter((x) => !x.pass);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
