#!/usr/bin/env node

// Post-generation fixes for things the generator cannot express. Idempotent;
// re-run after every generate. Validates and fails without writing.
//
// 1. Domains v2 customer scoping. Every customer-scoped v2 path
//    (/v2/customers/{customerId}/...) is rebased onto the path-level server
//    template in provider-dev/config/customer_server.json:
//    https://api.godaddy.com/v2/customers/{customer_id}, with the
//    {customer_id} server variable carrying x-stackQL-envVar
//    GODADDY_CUSTOMER_ID. stackql resolves the variable from the environment
//    when it is set (a WHERE customer_id value still wins); unset, customer_id
//    is a required parameter on those methods. It has to be applied here
//    because the normalize step strips path-level servers from
//    provider-dev/source. any-sdk resolves servers operation -> path item ->
//    document, so the override applies to the v2 operations only.
//
// 2. Pagination. Three collection reads page, each in its own style:
//      domains.domains.list (v1)     - marker cursor: `marker` is the last
//                                      domain of the previous page; the token
//                                      is read from the raw response array
//                                      ($[-1:].domain) and the loop ends on an
//                                      empty page.
//      domains.domains_v3.list (v3)  - HATEOAS: links[rel=next].href is the
//                                      next page URL (odata_next_link style,
//                                      the URL is followed verbatim).
//      dns.records_v3.list (v3)      - same HATEOAS links.
//    Method-level x-stackQL config so nothing else in the service inherits it.
//
// 3. snake_case surface. `request.nativeCasing: camel` on every method,
//    paired with `snake_case_aliases: true` on the provider config: snake_case
//    WHERE / INSERT keys resolve against the camelCase (and kebab-case, via
//    the declared-name alias lookup) wire parameters and body attributes, and
//    SELECT / DESCRIBE columns present as snake aliases. Wire casing is
//    untouched.
//
// 4. Resource titles and descriptions naming the GoDaddy API version behind
//    each resource (v1 bare names, _v2 customer-scoped, _v3 PAT-only), so
//    SHOW RESOURCES and the docs carry the scoping and credential rules.
//
// Usage: node provider-dev/scripts/post_process.mjs

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { servicesDir, configDir, rebaseV2CustomerPaths, isV2CustomerScoped, ARRAY_BODY_MARKER, HTTP_VERBS } from './lib/spec_helpers.mjs';

if (!fs.existsSync(servicesDir)) {
  console.error(`Error: ${servicesDir} not found - run the generate step first`);
  process.exit(1);
}
const customerServer = JSON.parse(fs.readFileSync(path.join(configDir, 'customer_server.json'), 'utf8'));

const V1_LIST_PAGINATION = {
  requestToken: { key: 'marker', location: 'query' },
  responseToken: { key: '$[-1:].domain', location: 'body' }
};
// requestToken location `request`: the extracted token (a full URL) replaces
// the request URL for the next page - the mechanism the github provider uses
// for RFC 5988 Link headers, here fed from the HATEOAS links array.
const V3_LINKS_PAGINATION = {
  requestToken: { key: '', location: 'request' },
  responseToken: { key: '$.links[?(@.rel=="next")].href', location: 'body' }
};
const PAGINATION = {
  'domains.yaml': { domains: { list: V1_LIST_PAGINATION }, domains_v3: { list: V3_LINKS_PAGINATION } },
  'dns.yaml': { records_v3: { list: V3_LINKS_PAGINATION } }
};

// LIMIT pushdown: SELECT ... LIMIT n sends n as the page-size query
// parameter of the read. Only on reads that do NOT page: on the paged lists
// (domains.list, domains_v3.list, records_v3.list) a pushed LIMIT shrinks
// every page and the pagination loop then walks the whole collection in
// tiny pages (measured: 34 s for LIMIT 3 over 185 domains vs 5 s unpushed),
// so those keep the client-side LIMIT and expose limit / page_size as
// ordinary WHERE parameters for callers who want to size pages.
const TOP_PUSHDOWN = {
  'dns.yaml': { records: { list: { paramName: 'limit' } } },
  'registration.yaml': { suggestions: { list: { paramName: 'limit' } }, suggestions_v3: { list: { paramName: 'pageSize', maxValue: 100 } } }
};

// Request transform for the wrapped bare-array bodies (see
// ARRAY_BODY_RULES): the wrapper property is emitted alone on the wire.
// The attribute arrives either as the user's JSON string or as an already
// parsed array, so both are handled.
function arrayBodyTransform(property) {
  return {
    type: 'golang_template_json_v0.3.0',
    body: `{{ if eq (kindOf .${property}) "string" }}{{ .${property} }}{{ else }}{{ toJson .${property} }}{{ end }}`
  };
}

const VERSION_NOTES = {
  v1: 'GoDaddy Domains v1 API. Accepts a Personal Access Token (Bearer) or a classic sso-key credential.',
  v2: 'GoDaddy Domains v2 API, scoped to a customer: customer_id is resolved from the GODADDY_CUSTOMER_ID environment variable when set, otherwise it is a required parameter (a WHERE value always wins). Accepts a Personal Access Token (Bearer) or a classic sso-key credential.',
  v2_unscoped: 'GoDaddy Domains v2 API (account-level, not customer-scoped). Accepts a Personal Access Token (Bearer) or a classic sso-key credential.',
  v3: 'GoDaddy Domains v3 API (Personal Access Token only). Mutations are asynchronous and return an operation to poll via domains.operations_v3.'
};

const errors = [];
const summary = [];
const docsByFile = new Map();

for (const f of fs.readdirSync(servicesDir).filter((x) => x.endsWith('.yaml')).sort()) {
  const doc = yaml.load(fs.readFileSync(path.join(servicesDir, f), 'utf8'));
  const resources = doc.components?.['x-stackQL-resources'] || {};
  if (Object.keys(resources).length === 0) errors.push(`${f}: no x-stackQL-resources`);

  // 1. v2 customer scoping
  const v2Count = Object.keys(doc.paths || {}).filter(isV2CustomerScoped).length;
  const rebased = rebaseV2CustomerPaths(doc, customerServer);
  if (rebased !== v2Count) errors.push(`${f}: expected to rebase ${v2Count} v2 customer-scoped path items, rebased ${rebased}`);
  for (const [p, item] of Object.entries(doc.paths || {})) {
    if (p.startsWith('/v2/customers/')) errors.push(`${f}: path ${p} was not rebased onto the customer server`);
    if (item.servers && !item.servers[0]?.variables?.customer_id?.['x-stackQL-envVar']) errors.push(`${f}: path ${p} has a servers override without the customer_id x-stackQL-envVar variable`);
  }
  // every resource method must still resolve to an existing path item
  for (const [rname, res] of Object.entries(resources)) {
    for (const [mname, method] of Object.entries(res.methods || {})) {
      const ref = method.operation?.$ref || '';
      const m = ref.match(/^#\/paths\/(.+)\/(get|post|put|patch|delete)$/);
      if (!m) { errors.push(`${f}: ${rname}.${mname} has no operation $ref`); continue; }
      const pathKey = m[1].replace(/~1/g, '/').replace(/~0/g, '~');
      if (!doc.paths?.[pathKey]?.[m[2]]) errors.push(`${f}: ${rname}.${mname} references missing operation ${m[2].toUpperCase()} ${pathKey}`);
    }
  }

  // 2. pagination
  for (const [rname, methods] of Object.entries(PAGINATION[f] || {})) {
    for (const [mname, pagination] of Object.entries(methods)) {
      const method = resources[rname]?.methods?.[mname];
      if (!method) { errors.push(`${f}: pagination target ${rname}.${mname} not found`); continue; }
      method.config = { ...(method.config || {}), pagination };
      summary.push(`${f}: pagination on ${rname}.${mname} (${pagination.algorithm || 'token'})`);
    }
  }

  // 2b. LIMIT pushdown
  for (const [rname, methods] of Object.entries(TOP_PUSHDOWN[f] || {})) {
    for (const [mname, top] of Object.entries(methods)) {
      const method = resources[rname]?.methods?.[mname];
      if (!method) { errors.push(`${f}: top pushdown target ${rname}.${mname} not found`); continue; }
      method.config = { ...(method.config || {}), queryParamPushdown: { top } };
    }
  }

  // 2c. bare-array request bodies: the wrapper property is unwrapped on the wire
  const markerByRef = new Map();
  for (const [p, item] of Object.entries(doc.paths || {})) {
    for (const verb of HTTP_VERBS) {
      const op = item[verb];
      if (!op || !op[ARRAY_BODY_MARKER]) continue;
      markerByRef.set(`${p}::${verb}`, op[ARRAY_BODY_MARKER]);
      delete op[ARRAY_BODY_MARKER];
    }
  }
  let transformed = 0;
  for (const [rname, res] of Object.entries(resources)) {
    for (const [mname, method] of Object.entries(res.methods || {})) {
      const m = (method.operation?.$ref || '').match(/^#\/paths\/(.+)\/(get|post|put|patch|delete)$/);
      if (!m) continue;
      const pathKey = m[1].replace(/~1/g, '/').replace(/~0/g, '~');
      const property = markerByRef.get(`${pathKey}::${m[2]}`);
      if (!property) continue;
      method.request = { ...(method.request || {}), mediaType: 'application/json', transform: arrayBodyTransform(property) };
      markerByRef.delete(`${pathKey}::${m[2]}`);
      transformed++;
    }
  }
  if (markerByRef.size > 0) errors.push(`${f}: array-body operations without a resource method: ${[...markerByRef.keys()].join(', ')}`);
  if (transformed) summary.push(`${f}: request transform on ${transformed} array-body method(s)`);

  // 3. nativeCasing, 4. titles and descriptions
  let cased = 0;
  for (const [rname, res] of Object.entries(resources)) {
    for (const method of Object.values(res.methods || {})) {
      method.request = { ...(method.request || {}), nativeCasing: 'camel' };
      cased++;
    }
    const version = /_v2$/.test(rname) ? 'v2' : /_v3$/.test(rname) ? 'v3' : 'v1';
    const base = rname.replace(/_v[23]$/, '');
    res.title = `${base.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')} (${version === 'v1' ? 'Domains v1' : version === 'v2' ? 'Domains v2' : 'Domains v3'})`;
    // a v2 resource whose operations all sit on the base server (api usage) is not customer-scoped
    const customerScoped = Object.values(res.methods || {}).some((method) => {
      const m = (method.operation?.$ref || '').match(/^#\/paths\/(.+)\/(get|post|put|patch|delete)$/);
      const pathKey = m ? m[1].replace(/~1/g, '/').replace(/~0/g, '~') : '';
      return Boolean(doc.paths?.[pathKey]?.servers);
    });
    res.description = VERSION_NOTES[version === 'v2' && !customerScoped ? 'v2_unscoped' : version];
  }
  summary.push(`${f}: request.nativeCasing: camel on ${cased} methods, ${rebased} v2 path items on the customer server`);
  docsByFile.set(f, doc);
}

if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s), nothing written:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
for (const [f, doc] of docsByFile) fs.writeFileSync(path.join(servicesDir, f), yaml.dump(doc, { lineWidth: -1, noRefs: true }));
for (const s of summary) console.log(`post_process: ${s}`);
