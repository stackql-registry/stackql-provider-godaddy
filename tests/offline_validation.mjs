#!/usr/bin/env node

// Quick offline validation of the generated provider against the local file
// registry - no network, no server, no credentials. Runs SHOW SERVICES /
// SHOW RESOURCES / SHOW METHODS and DESCRIBE over representative resources
// and asserts the expected shape: the four services and their resources, the
// verb mapping per resource, the snake_case column surface, the objectKey
// projection on the v3 lists, the pagination configuration on the three
// paged reads, and the x-stackQL-envVar behaviour of the Domains v2
// customer_id server variable (GODADDY_CUSTOMER_ID). Exit 1 on any failure.
//
// Usage: node tests/offline_validation.mjs
// Binary resolution: $STACKQL, ./stackql(.exe), then PATH.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const regPath = path.join(repoRoot, 'provider-dev', 'openapi').replace(/\\/g, '/');
const registry = JSON.stringify({ url: `file://${regPath}`, localDocRoot: regPath, verifyConfig: { nopVerify: true } });
const servicesDir = path.join(repoRoot, 'provider-dev', 'openapi', 'src', 'godaddy', 'v00.00.00000', 'services');

function findBinary() {
  if (process.env.STACKQL && fs.existsSync(process.env.STACKQL)) return process.env.STACKQL;
  for (const name of ['stackql', 'stackql.exe']) {
    const local = path.join(repoRoot, name);
    if (fs.existsSync(local)) return local;
  }
  return 'stackql'; // PATH
}
const bin = findBinary();

function runSql(sql, envOverrides = {}) {
  return new Promise((resolve) => {
    const env = { ...process.env, ...envOverrides };
    for (const [k, v] of Object.entries(envOverrides)) if (v === undefined) delete env[k];
    const child = spawn(bin, [`--registry=${registry}`, 'exec', sql, '--output', 'json'], { cwd: repoRoot, env });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      let rows = [];
      try { rows = JSON.parse(stdout) ?? []; } catch { rows = []; }
      resolve({ code, rows, stdout, stderr });
    });
    child.on('error', (err) => resolve({ code: -1, rows: [], stdout: '', stderr: String(err) }));
  });
}

const results = [];
function check(name, cond, note = '') {
  results.push({ name, pass: !!cond, note });
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : `  [${String(note).slice(0, 200)}]`}`);
}

const EXPECTED_SERVICES = ['dns', 'domains', 'registration', 'transfers'];
const EXPECTED_RESOURCES = {
  dns: ['forwards_v2', 'records', 'records_v3'],
  domains: ['actions_v2', 'api_usage_v2', 'domains', 'domains_v2', 'domains_v3', 'notification_opt_ins_v2', 'notification_schemas_v2', 'notifications_v2', 'operations_v3', 'privacy_forwarding_v2', 'registrant_changes_v2'],
  registration: ['agreements', 'availability', 'availability_v3', 'purchase_schemas', 'purchases', 'registration_quotes_v3', 'registration_schemas_v2', 'registrations_v2', 'registrations_v3', 'suggestions', 'suggestions_v3', 'tlds'],
  transfers: ['transfers', 'transfers_v2']
};

console.log(`stackql: ${bin}`);
let r = await runSql('SHOW SERVICES IN godaddy');
check('SHOW SERVICES (4)', r.rows.length === 4 && EXPECTED_SERVICES.every((s) => r.rows.some((x) => x.name === s)), r.stderr || JSON.stringify(r.rows.map((x) => x.name)));

for (const [svc, expected] of Object.entries(EXPECTED_RESOURCES)) {
  r = await runSql(`SHOW RESOURCES IN godaddy.${svc}`);
  const names = r.rows.map((x) => x.name).sort();
  check(`SHOW RESOURCES IN godaddy.${svc} (${expected.length})`, JSON.stringify(names) === JSON.stringify(expected), r.stderr || JSON.stringify(names));
}

// domains.domains: 7 methods, verbs, get before list (most selective first)
r = await runSql('SHOW METHODS IN godaddy.domains.domains');
const methods = Object.fromEntries(r.rows.map((x) => [x.MethodName, x]));
check('domains.domains has 7 methods', r.rows.length === 7, r.stderr || JSON.stringify(Object.keys(methods)));
check('domains.domains verbs', methods.list?.SQLVerb === 'SELECT' && methods.get?.SQLVerb === 'SELECT' && methods.update?.SQLVerb === 'UPDATE' && methods.cancel?.SQLVerb === 'DELETE' && methods.renew?.SQLVerb === 'EXEC' && methods.update_contacts?.SQLVerb === 'EXEC' && methods.verify_registrant_email?.SQLVerb === 'EXEC', JSON.stringify(methods));
check('domains.domains.get requires domain', methods.get?.RequiredParams === 'domain', JSON.stringify(methods.get));
check('domains.domains.get listed before list', r.rows.findIndex((x) => x.MethodName === 'get') < r.rows.findIndex((x) => x.MethodName === 'list'), JSON.stringify(r.rows.map((x) => x.MethodName)));

// Domains v2 customer scoping: customer_id required only when GODADDY_CUSTOMER_ID is unset
r = await runSql('SHOW METHODS IN godaddy.domains.domains_v2', { GODADDY_CUSTOMER_ID: undefined });
let m = Object.fromEntries(r.rows.map((x) => [x.MethodName, x.RequiredParams]));
check('domains_v2.get requires customer_id when GODADDY_CUSTOMER_ID is unset', /customer_id/.test(m.get || '') && /domain/.test(m.get || ''), r.stderr || JSON.stringify(m));
r = await runSql('SHOW METHODS IN godaddy.domains.domains_v2', { GODADDY_CUSTOMER_ID: '00000000-0000-0000-0000-000000000000' });
m = Object.fromEntries(r.rows.map((x) => [x.MethodName, x.RequiredParams]));
check('domains_v2.get needs only domain when GODADDY_CUSTOMER_ID is set', m.get === 'domain', r.stderr || JSON.stringify(m));
r = await runSql('SHOW METHODS IN godaddy.transfers.transfers_v2', { GODADDY_CUSTOMER_ID: undefined });
check('transfers_v2 has 8 EXEC methods requiring customer_id', r.rows.length === 8 && r.rows.every((x) => x.SQLVerb === 'EXEC' && /customer_id/.test(x.RequiredParams)), r.stderr || JSON.stringify(r.rows));

// v3 kebab path parameter surfaces as domain_name
r = await runSql('SHOW METHODS IN godaddy.domains.domains_v3');
m = Object.fromEntries(r.rows.map((x) => [x.MethodName, x.RequiredParams]));
check('domains_v3.get requires domain_name (snake alias of domain-name)', m.get === 'domain_name', r.stderr || JSON.stringify(m));
check('domains_v3.list has no required params', m.list === '', JSON.stringify(m));

// dns.records (v1) verbs and dns.records_v3 CRUD
r = await runSql('SHOW METHODS IN godaddy.dns.records');
m = Object.fromEntries(r.rows.map((x) => [x.MethodName, x.SQLVerb]));
check('dns.records: list SELECT, delete DELETE, bulk writes EXEC', m.list === 'SELECT' && m.delete === 'DELETE' && m.add === 'EXEC' && m.replace_all === 'EXEC' && m.replace_by_type === 'EXEC' && m.replace_by_type_name === 'EXEC', r.stderr || JSON.stringify(m));
r = await runSql('SHOW METHODS IN godaddy.dns.records_v3');
m = Object.fromEntries(r.rows.map((x) => [x.MethodName, x]));
check('dns.records_v3: list/create/replace/delete', m.list?.SQLVerb === 'SELECT' && m.create?.SQLVerb === 'INSERT' && m.replace?.SQLVerb === 'UPDATE' && m.delete?.SQLVerb === 'DELETE' && m.list?.RequiredParams === 'zone', r.stderr || JSON.stringify(m));

// snake_case columns on the v1 domain detail and the v3 record
r = await runSql('DESCRIBE godaddy.domains.domains');
let cols = r.rows.map((x) => x.name);
check('DESCRIBE domains.domains: snake_case columns', ['domain', 'domain_id', 'name_servers', 'renew_auto', 'contact_registrant', 'expiration_protected'].every((c) => cols.includes(c)) && !cols.includes('nameServers'), r.stderr || JSON.stringify(cols));
r = await runSql('DESCRIBE godaddy.dns.records_v3');
cols = r.rows.map((x) => x.name);
check('DESCRIBE dns.records_v3: record_id/name/type/data/ttl', ['record_id', 'name', 'type', 'data', 'ttl'].every((c) => cols.includes(c)), r.stderr || JSON.stringify(cols));
r = await runSql('SHOW INSERT INTO godaddy.dns.records_v3');
check('SHOW INSERT dns.records_v3 lists zone and the record body fields', /zone/.test(r.stdout) && /\bttl\b/.test(r.stdout) && /\bdata\b/.test(r.stdout), r.stderr || r.stdout.slice(0, 200));
r = await runSql('SHOW INSERT INTO godaddy.registration.purchases');
check('SHOW INSERT registration.purchases (v1 purchase body)', /\bdomain\b/.test(r.stdout) && /consent/.test(r.stdout), r.stderr || r.stdout.slice(0, 200));

// Generated document assertions (pagination, objectKey, nativeCasing, v2 server template)
const domainsDoc = yaml.load(fs.readFileSync(path.join(servicesDir, 'domains.yaml'), 'utf8'));
const dnsDoc = yaml.load(fs.readFileSync(path.join(servicesDir, 'dns.yaml'), 'utf8'));
const dres = domainsDoc.components['x-stackQL-resources'];
check('domains.list marker pagination config', dres.domains.methods.list.config?.pagination?.requestToken?.key === 'marker' && dres.domains.methods.list.config?.pagination?.responseToken?.key === '$[-1:].domain', JSON.stringify(dres.domains.methods.list.config));
const isLinkPaging = (m) => m.config?.pagination?.requestToken?.location === 'request' && /rel=="next"/.test(m.config?.pagination?.responseToken?.key || '');
check('domains_v3.list objectKey $.items + links pagination (request-URL token)', dres.domains_v3.methods.list.response?.objectKey === '$.items' && isLinkPaging(dres.domains_v3.methods.list), JSON.stringify(dres.domains_v3.methods.list));
check('records_v3.list objectKey $.items + links pagination (request-URL token)', dnsDoc.components['x-stackQL-resources'].records_v3.methods.list.response?.objectKey === '$.items' && isLinkPaging(dnsDoc.components['x-stackQL-resources'].records_v3.methods.list));
check('array-body methods carry the unwrapping request transform', ['add', 'replace_all', 'replace_by_type', 'replace_by_type_name'].every((m) => /toJson \.records/.test(dnsDoc.components['x-stackQL-resources'].records.methods[m].request?.transform?.body || '')) && /toJson \.nameServers/.test(dres.domains_v3.methods.update_nameservers.request?.transform?.body || ''));
check('LIMIT pushdown only on unpaged reads', !dres.domains.methods.list.config?.queryParamPushdown && !dres.domains_v3.methods.list.config?.queryParamPushdown && dnsDoc.components['x-stackQL-resources'].records.methods.list.config?.queryParamPushdown?.top?.paramName === 'limit');
let allCased = true;
for (const f of fs.readdirSync(servicesDir).filter((x) => x.endsWith('.yaml'))) {
  const d = yaml.load(fs.readFileSync(path.join(servicesDir, f), 'utf8'));
  for (const res of Object.values(d.components['x-stackQL-resources'])) {
    for (const method of Object.values(res.methods)) if (method.request?.nativeCasing !== 'camel') allCased = false;
  }
  for (const [p, item] of Object.entries(d.paths)) {
    if (p.startsWith('/v2/customers/')) allCased = false;
    if (item.servers && item.servers[0]?.variables?.customer_id?.['x-stackQL-envVar'] !== 'GODADDY_CUSTOMER_ID') allCased = false;
  }
}
check('request.nativeCasing: camel on every method; v2 customer paths rebased with GODADDY_CUSTOMER_ID', allCased);
const v2Item = domainsDoc.paths['/domains/{domain}/actions'];
check('v2 actions path carries the customer server template', v2Item?.servers?.[0]?.url === 'https://api.godaddy.com/v2/customers/{customer_id}', JSON.stringify(v2Item?.servers));
check('no v2 operation still declares a customerId path parameter', !JSON.stringify(domainsDoc.paths).includes('"name":"customerId"'));
check('no x-ext refs survive in the generated provider', !fs.readdirSync(servicesDir).some((f) => fs.readFileSync(path.join(servicesDir, f), 'utf8').includes('#/x-ext/')));

const failed = results.filter((x) => !x.pass);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
