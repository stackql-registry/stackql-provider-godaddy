#!/usr/bin/env node

// Populates stackql_resource_name, stackql_method_name, stackql_verb and
// stackql_object_key in provider-dev/config/all_services.csv from the split
// service specs in provider-dev/source. Deterministic and re-runnable on
// spec refreshes; review the CSV diff after running. Every mapping decision
// is a rule here, never a hand-edit to the CSV, and the CSV is the checked-in
// record of every operation -> resource/method binding (a durable reference
// against accidental renames between provider releases).
//
// Naming conventions (see CLAUDE.md):
//   - Resources are plural snake_case nouns derived from the API path.
//   - Resources served by the Domains v1 API carry the bare name; resources
//     served by the Domains v2 API (customer-scoped) are suffixed _v2 and
//     resources served by the Domains v3 API are suffixed _v3, always. The
//     suffix tells the reader which API version, scoping and credential rules
//     apply, and keeps names stable when a later version adds a resource.
//   - GET collection -> SELECT list; GET single -> SELECT get; POST create ->
//     INSERT create; PATCH/PUT edit -> UPDATE update/replace; DELETE ->
//     DELETE delete/cancel; every other action (renew, verify, transfer
//     workflow steps, validations, bulk checks, nameserver replacement, the
//     Domains v1 bulk DNS record writes whose bodies are bare arrays) -> EXEC.
//   - v3 collection responses wrap their rows in {items: [...]} and take
//     objectKey $.items; v1 and v2 collections are bare JSON arrays, which
//     stackql iterates natively (no object key; see post_normalize.mjs).
//
// Validates before writing: every spec operation has exactly one rule, every
// CSV row is covered, (resource, method) is unique per service, and selectable
// methods on one resource have distinct required-parameter signatures (the
// engine picks the first method whose required parameters are satisfied).
// Fails without writing on any violation.
//
// Usage: npm run map-operations [-- --out other.csv]

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { HTTP_VERBS, configDir, sourceDir, makeResolver, pathParams } from './lib/spec_helpers.mjs';

const csvPath = path.join(configDir, 'all_services.csv');

// One rule per operation: [service, verb, path, resource, method, sqlVerb, objectKey]
const RULES = [
  // ------------------------------------------------------------ domains v1
  ['domains', 'get', '/v1/domains', 'domains', 'list', 'select', ''],
  ['domains', 'get', '/v1/domains/{domain}', 'domains', 'get', 'select', ''],
  ['domains', 'patch', '/v1/domains/{domain}', 'domains', 'update', 'update', ''],
  ['domains', 'delete', '/v1/domains/{domain}', 'domains', 'cancel', 'delete', ''],
  ['domains', 'patch', '/v1/domains/{domain}/contacts', 'domains', 'update_contacts', 'exec', ''],
  ['domains', 'post', '/v1/domains/{domain}/verifyRegistrantEmail', 'domains', 'verify_registrant_email', 'exec', ''],
  ['domains', 'post', '/v1/domains/{domain}/renew', 'domains', 'renew', 'exec', ''],
  // ------------------------------------------------------------ domains v2 (customer-scoped)
  ['domains', 'get', '/v2/customers/{customerId}/domains/{domain}', 'domains_v2', 'get', 'select', ''],
  ['domains', 'put', '/v2/customers/{customerId}/domains/{domain}/nameServers', 'domains_v2', 'update_nameservers', 'exec', ''],
  ['domains', 'get', '/v2/customers/{customerId}/domains/{domain}/changeOfRegistrant', 'registrant_changes_v2', 'get', 'select', ''],
  ['domains', 'delete', '/v2/customers/{customerId}/domains/{domain}/changeOfRegistrant', 'registrant_changes_v2', 'cancel', 'delete', ''],
  ['domains', 'get', '/v2/customers/{customerId}/domains/{domain}/privacy/forwarding', 'privacy_forwarding_v2', 'get', 'select', ''],
  ['domains', 'patch', '/v2/customers/{customerId}/domains/{domain}/privacy/forwarding', 'privacy_forwarding_v2', 'update', 'update', ''],
  ['domains', 'get', '/v2/customers/{customerId}/domains/{domain}/actions', 'actions_v2', 'list', 'select', ''],
  ['domains', 'get', '/v2/customers/{customerId}/domains/{domain}/actions/{type}', 'actions_v2', 'get', 'select', ''],
  ['domains', 'delete', '/v2/customers/{customerId}/domains/{domain}/actions/{type}', 'actions_v2', 'cancel', 'delete', ''],
  ['domains', 'get', '/v2/customers/{customerId}/domains/notifications', 'notifications_v2', 'get', 'select', ''],
  ['domains', 'post', '/v2/customers/{customerId}/domains/notifications/{notificationId}/acknowledge', 'notifications_v2', 'acknowledge', 'exec', ''],
  ['domains', 'get', '/v2/customers/{customerId}/domains/notifications/optIn', 'notification_opt_ins_v2', 'list', 'select', ''],
  ['domains', 'put', '/v2/customers/{customerId}/domains/notifications/optIn', 'notification_opt_ins_v2', 'replace', 'exec', ''],
  ['domains', 'get', '/v2/customers/{customerId}/domains/notifications/schemas/{type}', 'notification_schemas_v2', 'get', 'select', ''],
  ['domains', 'get', '/v2/domains/usage/{yyyymm}', 'api_usage_v2', 'get', 'select', ''],
  // ------------------------------------------------------------ domains v3
  ['domains', 'get', '/v3/domains/domain-names', 'domains_v3', 'list', 'select', '$.items'],
  ['domains', 'get', '/v3/domains/domain-names/{domain_name}', 'domains_v3', 'get', 'select', ''],
  ['domains', 'put', '/v3/domains/domain-names/{domain_name}/nameservers', 'domains_v3', 'update_nameservers', 'exec', ''],
  ['domains', 'get', '/v3/domains/operations/{operationId}', 'operations_v3', 'get', 'select', ''],
  // ------------------------------------------------------------ dns v1
  ['dns', 'get', '/v1/domains/{domain}/records/{type}/{name}', 'records', 'list', 'select', ''],
  ['dns', 'put', '/v1/domains/{domain}/records', 'records', 'replace_all', 'exec', ''],
  ['dns', 'patch', '/v1/domains/{domain}/records', 'records', 'add', 'exec', ''],
  ['dns', 'put', '/v1/domains/{domain}/records/{type}', 'records', 'replace_by_type', 'exec', ''],
  ['dns', 'put', '/v1/domains/{domain}/records/{type}/{name}', 'records', 'replace_by_type_name', 'exec', ''],
  ['dns', 'delete', '/v1/domains/{domain}/records/{type}/{name}', 'records', 'delete', 'delete', ''],
  // ------------------------------------------------------------ dns v2 (forwards)
  ['dns', 'get', '/v2/customers/{customerId}/domains/forwards/{fqdn}', 'forwards_v2', 'list', 'select', ''],
  ['dns', 'post', '/v2/customers/{customerId}/domains/forwards/{fqdn}', 'forwards_v2', 'create', 'insert', ''],
  ['dns', 'put', '/v2/customers/{customerId}/domains/forwards/{fqdn}', 'forwards_v2', 'replace', 'update', ''],
  ['dns', 'delete', '/v2/customers/{customerId}/domains/forwards/{fqdn}', 'forwards_v2', 'delete', 'delete', ''],
  // ------------------------------------------------------------ dns v3
  ['dns', 'get', '/v3/domains/zones/{zone}/dns-records', 'records_v3', 'list', 'select', '$.items'],
  ['dns', 'post', '/v3/domains/zones/{zone}/dns-records', 'records_v3', 'create', 'insert', ''],
  ['dns', 'put', '/v3/domains/zones/{zone}/dns-records/{recordId}', 'records_v3', 'replace', 'update', ''],
  ['dns', 'delete', '/v3/domains/zones/{zone}/dns-records/{recordId}', 'records_v3', 'delete', 'delete', ''],
  // ------------------------------------------------------------ registration v1
  ['registration', 'get', '/v1/domains/agreements', 'agreements', 'list', 'select', ''],
  ['registration', 'get', '/v1/domains/available', 'availability', 'get', 'select', ''],
  ['registration', 'post', '/v1/domains/available', 'availability', 'check_bulk', 'exec', ''],
  ['registration', 'get', '/v1/domains/suggest', 'suggestions', 'list', 'select', ''],
  ['registration', 'get', '/v1/domains/tlds', 'tlds', 'list', 'select', ''],
  ['registration', 'post', '/v1/domains/purchase', 'purchases', 'create', 'insert', ''],
  ['registration', 'post', '/v1/domains/purchase/validate', 'purchases', 'validate', 'exec', ''],
  ['registration', 'post', '/v1/domains/contacts/validate', 'purchases', 'validate_contacts', 'exec', ''],
  ['registration', 'get', '/v1/domains/purchase/schema/{tld}', 'purchase_schemas', 'get', 'select', ''],
  // ------------------------------------------------------------ registration v2
  ['registration', 'post', '/v2/customers/{customerId}/domains/register', 'registrations_v2', 'create', 'insert', ''],
  ['registration', 'post', '/v2/customers/{customerId}/domains/register/validate', 'registrations_v2', 'validate', 'exec', ''],
  ['registration', 'get', '/v2/customers/{customerId}/domains/register/schema/{tld}', 'registration_schemas_v2', 'get', 'select', ''],
  // ------------------------------------------------------------ registration v3
  ['registration', 'get', '/v3/domains/check-availability', 'availability_v3', 'get', 'select', ''],
  ['registration', 'post', '/v3/domains/check-availability', 'availability_v3', 'check_bulk', 'exec', ''],
  ['registration', 'get', '/v3/domains/suggestions', 'suggestions_v3', 'list', 'select', '$.items'],
  ['registration', 'post', '/v3/domains/registration-quotes', 'registration_quotes_v3', 'create', 'insert', ''],
  ['registration', 'post', '/v3/domains/registrations', 'registrations_v3', 'create', 'insert', ''],
  ['registration', 'get', '/v3/domains/registrations/{registrationId}', 'registrations_v3', 'get', 'select', ''],
  // ------------------------------------------------------------ transfers v1
  ['transfers', 'post', '/v1/domains/{domain}/transfer', 'transfers', 'transfer_in', 'exec', ''],
  // ------------------------------------------------------------ transfers v2
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transfer', 'transfers_v2', 'transfer_in', 'exec', ''],
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transferInAccept', 'transfers_v2', 'accept_transfer_in', 'exec', ''],
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transferInCancel', 'transfers_v2', 'cancel_transfer_in', 'exec', ''],
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transferInRestart', 'transfers_v2', 'restart_transfer_in', 'exec', ''],
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transferInRetry', 'transfers_v2', 'retry_transfer_in', 'exec', ''],
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transferOut', 'transfers_v2', 'transfer_out', 'exec', ''],
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transferOutAccept', 'transfers_v2', 'accept_transfer_out', 'exec', ''],
  ['transfers', 'post', '/v2/customers/{customerId}/domains/{domain}/transferOutReject', 'transfers_v2', 'reject_transfer_out', 'exec', '']
];

const ruleIndex = new Map();
for (const r of RULES) {
  const [service, verb, p] = r;
  const key = `${service}::${verb}::${p}`;
  if (ruleIndex.has(key)) {
    console.error(`duplicate rule for ${key}`);
    process.exit(1);
  }
  ruleIndex.set(key, r);
}

// ---------------------------------------------------------------------------
// Index every operation in the split service specs
// ---------------------------------------------------------------------------

const ops = new Map(); // `${service}::${verb}::${path}` -> { op, pathItem, resolve }
const specFiles = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.yaml')).sort();
if (specFiles.length === 0) {
  console.error(`Error: no service specs in ${sourceDir} - run npm run split first`);
  process.exit(1);
}
for (const filename of specFiles) {
  const spec = yaml.load(fs.readFileSync(path.join(sourceDir, filename), 'utf8'));
  const resolve = makeResolver(spec);
  const service = filename.replace(/\.yaml$/, '');
  for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
    for (const verb of HTTP_VERBS) {
      if (!pathItem[verb]) continue;
      ops.set(`${service}::${verb}::${pathKey}`, { op: pathItem[verb], pathItem, resolve });
    }
  }
}

// ---------------------------------------------------------------------------
// CSV read/transform/write (RFC 4180, preserves column order)
// ---------------------------------------------------------------------------

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else { field += c; }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function csvField(v) {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

if (!fs.existsSync(csvPath)) {
  console.error(`Error: ${csvPath} not found - run npm run generate-mappings first`);
  process.exit(1);
}
const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const header = rows[0];
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const required of ['filename', 'path', 'verb', 'operationId', 'stackql_resource_name', 'stackql_method_name', 'stackql_verb', 'stackql_object_key']) {
  if (!(required in col)) {
    console.error(`Missing expected CSV column: ${required}`);
    process.exit(1);
  }
}

const errors = [];
const seenKeys = new Set();
const stats = { select: 0, insert: 0, update: 0, delete: 0, exec: 0 };

for (const row of rows.slice(1)) {
  const service = row[col.filename].replace(/\.yaml$/, '');
  const key = `${service}::${row[col.verb]}::${row[col.path]}`;
  seenKeys.add(key);
  if (!ops.has(key)) {
    errors.push(`CSV row not in the split specs: ${key}`);
    continue;
  }
  const rule = ruleIndex.get(key);
  if (!rule) {
    errors.push(`no mapping rule for ${key} (add one to RULES in map_operations.mjs)`);
    continue;
  }
  row[col.stackql_resource_name] = rule[3];
  row[col.stackql_method_name] = rule[4];
  row[col.stackql_verb] = rule[5];
  row[col.stackql_object_key] = rule[6];
  stats[rule[5]]++;
}
for (const key of ops.keys()) {
  if (!seenKeys.has(key)) errors.push(`in spec but not in CSV (re-run npm run generate-mappings): ${key}`);
}
for (const key of ruleIndex.keys()) {
  if (!ops.has(key)) errors.push(`rule for an operation that no longer exists upstream: ${key}`);
}

// ---------------------------------------------------------------------------
// Consistency checks
// ---------------------------------------------------------------------------

const methodSeen = new Map();
const sigSeen = new Map();
for (const row of rows.slice(1)) {
  const resource = row[col.stackql_resource_name];
  if (!resource) continue;
  const service = row[col.filename].replace(/\.yaml$/, '');
  const methodKey = `${service}.${resource}.${row[col.stackql_method_name]}`;
  if (methodSeen.has(methodKey)) {
    errors.push(`duplicate method ${methodKey} (${methodSeen.get(methodKey)} and ${row[col.path]}:${row[col.verb]})`);
  }
  methodSeen.set(methodKey, `${row[col.path]}:${row[col.verb]}`);
  const version = /_v2$/.test(resource) ? 'v2' : /_v3$/.test(resource) ? 'v3' : 'v1';
  const pathVersion = row[col.path].startsWith('/v2/') ? 'v2' : row[col.path].startsWith('/v3/') ? 'v3' : 'v1';
  if (version !== pathVersion) errors.push(`${methodKey}: resource suffix says ${version} but the path is ${pathVersion} (${row[col.path]})`);

  const sqlVerb = row[col.stackql_verb];
  if (sqlVerb === 'exec') continue;
  const entry = ops.get(`${service}::${row[col.verb]}::${row[col.path]}`);
  const requiredQuery = [...(entry?.pathItem?.parameters || []), ...(entry?.op.parameters || [])]
    .map((p) => entry.resolve(p))
    .filter((p) => p && p.in === 'query' && p.required)
    .map((p) => p.name);
  const sig = [...pathParams(row[col.path]), ...requiredQuery].sort().join(',');
  const sigKey = `${service}.${resource}.${sqlVerb}::${sig}`;
  if (sigSeen.has(sigKey)) {
    errors.push(`signature clash on ${service}.${resource} ${sqlVerb} [${sig}] (${sigSeen.get(sigKey)} and ${row[col.stackql_method_name]})`);
  }
  sigSeen.set(sigKey, row[col.stackql_method_name]);
}

if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s), nothing written:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const outArgIdx = process.argv.indexOf('--out');
const outPath = outArgIdx !== -1 ? path.resolve(process.argv[outArgIdx + 1]) : csvPath;
// stable order: service, resource, method
const body = rows.slice(1).sort((a, b) =>
  a[col.filename].localeCompare(b[col.filename]) ||
  a[col.stackql_resource_name].localeCompare(b[col.stackql_resource_name]) ||
  a[col.stackql_method_name].localeCompare(b[col.stackql_method_name]));
const out = [header, ...body].map((r) => r.map(csvField).join(',')).join('\n') + '\n';
fs.writeFileSync(outPath, out);

const resourcesByService = new Map();
for (const row of body) {
  const service = row[col.filename].replace(/\.yaml$/, '');
  if (!resourcesByService.has(service)) resourcesByService.set(service, new Set());
  resourcesByService.get(service).add(row[col.stackql_resource_name]);
}
console.log(`Mapped ${body.length} operations: select ${stats.select}, insert ${stats.insert}, update ${stats.update}, delete ${stats.delete}, exec ${stats.exec}`);
console.log('Resources per service:');
for (const [service, resources] of [...resourcesByService.entries()].sort()) {
  console.log(`  ${service}: ${[...resources].sort().join(', ')}`);
}
