// Shared helpers for the GoDaddy provider build scripts (bin/split.mjs,
// map_operations.mjs, post_process.mjs, tests): spec preparation per API
// version, service resolution from the path rules in
// provider-dev/config/service_names.json, naming utilities and the v2
// customer-scoped path rebase. Single-sourced so the split, the mapping and
// the post-processing can never disagree.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const HTTP_VERBS = ['get', 'post', 'put', 'patch', 'delete'];

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const configDir = path.join(repoRoot, 'provider-dev', 'config');
export const downloadedDir = path.join(repoRoot, 'provider-dev', 'downloaded');
export const sourceDir = path.join(repoRoot, 'provider-dev', 'source');
export const providerDir = path.join(repoRoot, 'provider-dev', 'openapi', 'src', 'godaddy', 'v00.00.00000');
export const servicesDir = path.join(providerDir, 'services');

// The three pinned specs, in merge order. Where the same component name is
// defined differently by two versions, the earlier version keeps the bare
// name and the later one is suffixed (_v2, _v3) - see mergeServiceDocs.
export const SPEC_VERSIONS = [
  { version: 1, file: 'domains-v1.json' },
  { version: 2, file: 'domains-v2.json' },
  { version: 3, file: 'domains-v3.json' }
];

// The v3 spec is served relative to https://api.{env}.com/v3/domains; every
// v3 path is rebased under this prefix so all three versions share the
// single production server in provider-dev/config/servers.json.
export const V3_PATH_PREFIX = '/v3/domains';

// Domains v2 customer scoping: every customer-scoped path lives under this
// prefix. It becomes a path-level server template (post_process.mjs) whose
// {customer_id} variable carries x-stackQL-envVar: GODADDY_CUSTOMER_ID.
export const V2_CUSTOMER_PREFIX = '/v2/customers/{customerId}';

export function camelToSnake(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[-. ]/g, '_')
    .toLowerCase();
}

export function toPascal(s) {
  return String(s)
    .replace(/\([^)]*\)/g, ' ')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}

export function pathParams(pathKey) {
  return (pathKey.match(/\{[^}]+\}/g) || []).map((s) => s.slice(1, -1));
}

export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

// Resolves local $refs against the containing spec document
export function makeResolver(spec) {
  return function resolve(schema, depth = 0) {
    if (!schema || depth > 12) return schema;
    if (schema.$ref) {
      const parts = schema.$ref.replace(/^#\//, '').split('/').map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
      let node = spec;
      for (const p of parts) node = node?.[p];
      return resolve(node, depth + 1);
    }
    return schema;
  };
}

// Walks every $ref in a document and rewrites it through `fn`.
export function rewriteRefs(node, fn) {
  if (Array.isArray(node)) {
    for (const v of node) rewriteRefs(v, fn);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (typeof node.$ref === 'string') node.$ref = fn(node.$ref);
  for (const v of Object.values(node)) rewriteRefs(v, fn);
}

export function stripKeysDeep(node, keys) {
  if (Array.isArray(node)) {
    for (const v of node) stripKeysDeep(v, keys);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const k of Object.keys(node)) {
    if (keys.includes(k)) delete node[k];
    else stripKeysDeep(node[k], keys);
  }
}

// ---------------------------------------------------------------------------
// Service resolution
// ---------------------------------------------------------------------------

export function loadServiceNames() {
  return JSON.parse(fs.readFileSync(path.join(configDir, 'service_names.json'), 'utf8'));
}

export function makeServiceResolver() {
  const config = loadServiceNames();
  const rules = config.rules.map((r) => ({ re: new RegExp(r.pathRegex), service: r.service }));
  return function resolveService(pathKey) {
    for (const rule of rules) {
      if (rule.re.test(pathKey)) return rule.service;
    }
    return null;
  };
}

// ---------------------------------------------------------------------------
// Per-version spec preparation (applied in memory to a copy of the pinned
// spec before the split; the pinned snapshot is never modified)
// ---------------------------------------------------------------------------

// Names for the untitled scalar aliases in the v3 `x-ext` map, keyed by a
// distinctive fragment of their description. Everything titled takes its
// title; a component schema that merely aliases an x-ext entry takes over
// the entry under its own component name.
const UNTITLED_EXT_NAMES = [
  { re: /universally unique identifier/i, name: 'Uuid' },
  { re: /date and time/i, name: 'DateTime' },
  { re: /email address/i, name: 'EmailAddress' },
  { re: /ISO 3166-1/i, name: 'CountryCode' }
];

function relocateV3Ext(spec) {
  const ext = spec['x-ext'] || {};
  const schemas = spec.components.schemas;
  const rename = {}; // hash -> new ref
  // 1. component aliases take over their x-ext target
  for (const [name, def] of Object.entries(schemas)) {
    const m = typeof def?.$ref === 'string' && def.$ref.match(/^#\/x-ext\/([a-z0-9]+)$/);
    if (!m) continue;
    const hash = m[1];
    if (!ext[hash]) throw new Error(`v3: components.schemas.${name} aliases missing x-ext entry ${hash}`);
    schemas[name] = deepClone(ext[hash]);
    rename[hash] = `#/components/schemas/${name}`;
  }
  // 2. remaining entries are named from their title (or description fragment)
  for (const [hash, def] of Object.entries(ext)) {
    if (rename[hash]) continue;
    let name = def.title ? toPascal(def.title) : null;
    if (!name) {
      const hit = UNTITLED_EXT_NAMES.find((u) => u.re.test(def.description || ''));
      if (!hit) throw new Error(`v3: x-ext entry ${hash} has no title and no known description fragment: ${(def.description || '').slice(0, 80)}`);
      name = hit.name;
    }
    if (schemas[name] && !deepEqual(schemas[name], def)) name = `${name}Ext`;
    if (schemas[name] && !deepEqual(schemas[name], def)) throw new Error(`v3: cannot place x-ext entry ${hash} as ${name}`);
    schemas[name] = deepClone(def);
    rename[hash] = `#/components/schemas/${name}`;
  }
  // 3. nested definitions (the Error entry carries a `definitions` map whose
  //    members alias other x-ext entries, addressed as
  //    #/x-ext/<hash>/definitions/<key>): resolve through the alias to the
  //    relocated target, or relocate the definition as <Parent><Key>.
  const resolveNested = (hash, key) => {
    const parentRef = rename[hash];
    if (!parentRef) throw new Error(`v3: nested ref into unknown x-ext entry ${hash}`);
    const def = ext[hash]?.definitions?.[key];
    if (!def) throw new Error(`v3: x-ext entry ${hash} has no definitions.${key}`);
    const alias = typeof def.$ref === 'string' && def.$ref.match(/^#\/x-ext\/([a-z0-9]+)$/);
    if (alias) {
      if (!rename[alias[1]]) throw new Error(`v3: nested alias ${def.$ref} unresolved`);
      return rename[alias[1]];
    }
    const name = `${parentRef.split('/').pop()}${toPascal(key)}`;
    if (!schemas[name]) schemas[name] = deepClone(def);
    return `#/components/schemas/${name}`;
  };
  delete spec['x-ext'];
  rewriteRefs(spec, (ref) => {
    const nested = ref.match(/^#\/x-ext\/([a-z0-9]+)\/definitions\/([A-Za-z0-9_-]+)$/);
    if (nested) return resolveNested(nested[1], nested[2]);
    const m = ref.match(/^#\/x-ext\/([a-z0-9]+)$/);
    if (!m) return ref;
    if (!rename[m[1]]) throw new Error(`v3: unresolved x-ext ref ${ref}`);
    return rename[m[1]];
  });
  // `definitions` is not an OpenAPI schema keyword; every member was
  // reachable only through the refs rewritten above
  for (const schema of Object.values(schemas)) delete schema.definitions;
  return Object.keys(rename).length;
}

// Path parameters named in kebab-case (the v3 `domain-name`) are renamed to
// snake_case in both the path template and the parameter object, so the
// template variable and the declared parameter agree after provider-utils
// split (which snake-cases path templates) and the SQL surface has a plain
// identifier (`domain_name`).
function snakeCasePathParams(spec) {
  let renamed = 0;
  const paths = {};
  for (const [pathKey, item] of Object.entries(spec.paths)) {
    const newKey = pathKey.replace(/\{([^}]+)\}/g, (_, name) => `{${name.replace(/-/g, '_')}}`);
    const fix = (params) => {
      for (const p of params || []) {
        if (p && p.in === 'path' && typeof p.name === 'string' && p.name.includes('-')) {
          p.name = p.name.replace(/-/g, '_');
          renamed++;
        }
      }
    };
    fix(item.parameters);
    for (const verb of HTTP_VERBS) fix(item[verb]?.parameters);
    paths[newKey] = item;
  }
  spec.paths = paths;
  // shared parameter components (v3 declares domainNamePath there)
  for (const p of Object.values(spec.components?.parameters || {})) {
    if (p && p.in === 'path' && typeof p.name === 'string' && p.name.includes('-')) {
      p.name = p.name.replace(/-/g, '_');
      renamed++;
    }
  }
  return renamed;
}

function synthesizeOperationIds(spec, version) {
  let added = 0;
  const seen = new Set();
  for (const [pathKey, item] of Object.entries(spec.paths)) {
    for (const verb of HTTP_VERBS) {
      const op = item[verb];
      if (!op) continue;
      if (op.operationId) { seen.add(op.operationId); continue; }
      // verb + PascalCase static segments after the customer prefix, with
      // trailing path parameters folded in as By<Param>
      const rel = pathKey.replace(V2_CUSTOMER_PREFIX, '').replace(/^\/v\d+\//, '/');
      const segs = rel.split('/').filter(Boolean);
      const words = segs.map((s) => (s.startsWith('{') ? `By${toPascal(s.slice(1, -1))}` : toPascal(s)));
      let id = `${verb}${words.join('')}`;
      if (seen.has(id)) id = `${id}${version}`;
      if (seen.has(id)) throw new Error(`v${version}: duplicate synthesized operationId ${id}`);
      op.operationId = id;
      seen.add(id);
      added++;
    }
  }
  return added;
}

// Operations whose JSON request body is a bare array. stackql builds request
// bodies from named attributes (INSERT columns, EXEC @params, @@json objects),
// so each of these bodies is wrapped in a single-property object in the
// spec; post_process.mjs pairs the wrapper with a request transform that
// unwraps it on the wire. The marker survives normalize and generate.
export const ARRAY_BODY_MARKER = 'x-stackql-array-body';
export const ARRAY_BODY_RULES = [
  { re: /^\/v1\/domains\/\{domain\}\/records(\/\{type\}(\/\{name\})?)?$/, verbs: ['put', 'patch'], property: 'records', description: 'DNS records to write (the request body array).' },
  { re: /^\/v1\/domains\/available$/, verbs: ['post'], property: 'domains', description: 'Domain names to check (the request body array).' },
  { re: /^\/v3\/domains\/domain-names\/\{domain-name\}\/nameservers$/, verbs: ['put'], property: 'nameServers', description: 'Ordered list of authoritative nameserver hostnames (the request body array).' }
];

function wrapArrayRequestBodies(spec, resolve) {
  let wrapped = 0;
  for (const [pathKey, item] of Object.entries(spec.paths)) {
    for (const rule of ARRAY_BODY_RULES) {
      if (!rule.re.test(pathKey)) continue;
      for (const verb of rule.verbs) {
        const op = item[verb];
        if (!op) continue;
        const content = op.requestBody?.content;
        if (!content) throw new Error(`array body rule matched ${verb.toUpperCase()} ${pathKey} but it has no request body`);
        for (const [mediaType, media] of Object.entries(content)) {
          const schema = resolve(media.schema);
          if (schema?.type !== 'array') throw new Error(`${verb.toUpperCase()} ${pathKey} ${mediaType}: expected an array body, found ${schema?.type}`);
          media.schema = {
            type: 'object',
            required: [rule.property],
            properties: { [rule.property]: { ...deepClone(media.schema), description: rule.description } }
          };
        }
        op[ARRAY_BODY_MARKER] = rule.property;
        wrapped++;
      }
    }
  }
  return wrapped;
}

// Vendor spec corrections, applied deterministically and recorded here:
//   v1 GET /v1/domains/agreements declares its privacy flag as `v1-privacy`;
//   the live API accepts `privacy` (verified) and every other operation
//   names the same concept `privacy`, so the parameter is exposed as
//   `privacy` (the snake alias of `v1-privacy` would be `v_1_privacy`).
const PARAMETER_RENAMES = [
  { version: 1, path: '/v1/domains/agreements', verb: 'get', from: 'v1-privacy', to: 'privacy' }
];

function applyParameterRenames(spec, version) {
  let renamed = 0;
  for (const r of PARAMETER_RENAMES.filter((x) => x.version === version)) {
    const op = spec.paths[r.path]?.[r.verb];
    if (!op) throw new Error(`parameter rename target ${r.verb.toUpperCase()} ${r.path} not found`);
    const param = (op.parameters || []).find((p) => p.name === r.from);
    if (!param) throw new Error(`parameter ${r.from} not found on ${r.verb.toUpperCase()} ${r.path}`);
    param.name = r.to;
    renamed++;
  }
  return renamed;
}

// Loads and prepares one pinned spec. Returns { spec, notes[] }.
export function loadPreparedSpec(entry, servers) {
  const raw = fs.readFileSync(path.join(downloadedDir, entry.file), 'utf8');
  const spec = JSON.parse(raw);
  const notes = [];
  if (entry.version === 3) {
    // vendor-internal extensions carry no information for the provider (the
    // paths object itself carries an x-visibility key)
    stripKeysDeep(spec, ['x-slack-channel', 'x-visibility', 'x-sensitivity']);
    const relocated = relocateV3Ext(spec);
    notes.push(`relocated ${relocated} x-ext schemas into components.schemas`);
    const rebased = {};
    for (const [p, item] of Object.entries(spec.paths)) {
      if (!p.startsWith('/')) continue;
      rebased[`${V3_PATH_PREFIX}${p}`] = item;
    }
    spec.paths = rebased;
    notes.push(`rebased ${Object.keys(rebased).length} paths under ${V3_PATH_PREFIX}`);
  }
  if (entry.version === 2) {
    const added = synthesizeOperationIds(spec, entry.version);
    notes.push(`synthesized ${added} missing operationIds`);
  }
  const wrapped = wrapArrayRequestBodies(spec, makeResolver(spec));
  if (wrapped) notes.push(`wrapped ${wrapped} bare-array request bodies`);
  const renamed = applyParameterRenames(spec, entry.version);
  if (renamed) notes.push(`applied ${renamed} parameter rename(s)`);
  const renamedParams = snakeCasePathParams(spec);
  if (renamedParams) notes.push(`snake_cased ${renamedParams} kebab-case path parameter declaration(s)`);
  delete spec['x-ext-urls'];
  spec.servers = deepClone(servers);
  return { spec, notes };
}

// ---------------------------------------------------------------------------
// Cross-version merge of split service documents
// ---------------------------------------------------------------------------

const COMPONENT_CONTAINERS = ['schemas', 'requestBodies', 'parameters', 'responses', 'headers', 'securitySchemes'];

// Merges `incoming` (a split service doc from spec version N) into `target`.
// Paths are disjoint by construction (each version has its own prefix).
// Components with the same name are kept when identical; otherwise the
// incoming one is renamed <Name>_v<N> (refs rewritten first). Returns the
// list of renames for the split summary.
export function mergeServiceDocs(target, incoming, version) {
  const renames = [];
  const refMap = {};
  incoming.components = incoming.components || {};
  target.components = target.components || {};
  for (const container of COMPONENT_CONTAINERS) {
    const src = incoming.components[container] || {};
    const dst = target.components[container] || {};
    for (const [name, def] of Object.entries(src)) {
      if (dst[name] !== undefined && !deepEqual(dst[name], def)) {
        const newName = `${name}_v${version}`;
        if (dst[newName] !== undefined && !deepEqual(dst[newName], def)) {
          throw new Error(`merge: cannot rename ${container}.${name} to ${newName} (already taken)`);
        }
        refMap[`#/components/${container}/${name}`] = `#/components/${container}/${newName}`;
        renames.push(`${container}.${name} -> ${newName}`);
      }
    }
  }
  if (Object.keys(refMap).length > 0) {
    rewriteRefs(incoming, (ref) => refMap[ref] || ref);
  }
  for (const container of COMPONENT_CONTAINERS) {
    const src = incoming.components[container] || {};
    if (Object.keys(src).length === 0) continue;
    target.components[container] = target.components[container] || {};
    for (const [name, def] of Object.entries(src)) {
      const finalName = refMap[`#/components/${container}/${name}`] ? `${name}_v${version}` : name;
      target.components[container][finalName] = def;
    }
  }
  for (const [p, item] of Object.entries(incoming.paths || {})) {
    if (target.paths[p]) throw new Error(`merge: duplicate path ${p}`);
    target.paths[p] = item;
  }
  for (const tag of incoming.tags || []) {
    target.tags = target.tags || [];
    if (!target.tags.some((t) => t.name === tag.name)) target.tags.push(tag);
  }
  return renames;
}

// ---------------------------------------------------------------------------
// Domains v2 customer-scoped rebase (post_process.mjs)
// ---------------------------------------------------------------------------

export function isV2CustomerScoped(pathKey) {
  return pathKey.startsWith(`${V2_CUSTOMER_PREFIX}/`);
}

// Rewrites the customer-scoped v2 path items of a generated service doc in
// place: the path key loses the /v2/customers/{customerId} prefix, the
// customerId path parameter is dropped, and a path-level `servers` entry
// carrying the {customer_id} template (with x-stackQL-envVar) is set.
// Resource method $refs into #/paths/... are rewritten to the new keys.
// Returns the number of rebased path items.
export function rebaseV2CustomerPaths(doc, customerServer) {
  const newPaths = {};
  const keyMap = {};
  let rebased = 0;
  for (const [pathKey, item] of Object.entries(doc.paths || {})) {
    if (!isV2CustomerScoped(pathKey)) {
      newPaths[pathKey] = item;
      continue;
    }
    const shortKey = pathKey.slice(V2_CUSTOMER_PREFIX.length);
    if (newPaths[shortKey] || doc.paths[shortKey]) throw new Error(`v2 rebase collision: ${pathKey} -> ${shortKey}`);
    const dropCustomer = (params) => (params || []).filter((p) => !(p && p.in === 'path' && p.name === 'customerId'));
    if (item.parameters) item.parameters = dropCustomer(item.parameters);
    for (const verb of HTTP_VERBS) {
      if (item[verb]?.parameters) item[verb].parameters = dropCustomer(item[verb].parameters);
    }
    item.servers = [deepClone({ url: customerServer.url, variables: customerServer.variables })];
    newPaths[shortKey] = item;
    keyMap[pathKey] = shortKey;
    rebased++;
  }
  doc.paths = newPaths;
  const encode = (p) => p.replace(/~/g, '~0').replace(/\//g, '~1');
  const refMap = {};
  for (const [from, to] of Object.entries(keyMap)) refMap[`#/paths/${encode(from)}`] = `#/paths/${encode(to)}`;
  rewriteRefs(doc, (ref) => {
    const m = ref.match(/^(#\/paths\/[^/]+)(\/.*)?$/);
    if (!m) return ref;
    return refMap[m[1]] ? `${refMap[m[1]]}${m[2] || ''}` : ref;
  });
  return rebased;
}
