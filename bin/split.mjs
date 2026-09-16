#!/usr/bin/env node

// Splits the three pinned GoDaddy Domains specs (v1, v2, v3) into the
// functional StackQL service specs in provider-dev/source, one document per
// service, each merging the operations of every API version that serves it.
//
// Per version, before the split (see lib/spec_helpers.mjs):
//   v1 - used as published.
//   v2 - 26 of 30 operations carry no operationId; deterministic ids are
//        synthesized from verb + path segments.
//   v3 - shared schemas live in a top-level `x-ext` map addressed by hash;
//        they are relocated into components.schemas under their component
//        alias or title, and every path is rebased under /v3/domains (the
//        spec's server template is https://api.{env}.com/v3/domains) so all
//        three versions share the production server in
//        provider-dev/config/servers.json.
//
// Service assignment is the ordered path rules in
// provider-dev/config/service_names.json. A path with no rule fails the run
// without writing. provider-utils split() then prunes each per-version
// service doc to the components its operations reference, and the docs are
// merged across versions: paths are disjoint by prefix; a component defined
// differently by two versions keeps the bare name for the earlier version
// and is suffixed _v<N> for the later one (refs rewritten). The Domains v2
// customer-scoped paths keep their full /v2/customers/{customerId} form here;
// post_process.mjs rebases them onto the customer server template after
// generation (the normalize step strips path-level servers).
//
// Usage:
//   node bin/split.mjs [--output-dir provider-dev/source] [--overwrite] [--verbose]

import fs from 'fs';
import os from 'os';
import path from 'path';
import yaml from 'js-yaml';
import { providerdev } from '@stackql/provider-utils';
import {
  SPEC_VERSIONS, HTTP_VERBS, configDir, sourceDir, downloadedDir,
  loadPreparedSpec, loadServiceNames, makeServiceResolver, mergeServiceDocs, deepClone
} from '../provider-dev/scripts/lib/spec_helpers.mjs';

const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
};
const outputDir = getArg('--output-dir') || sourceDir;
const overwrite = args.includes('--overwrite');
const verbose = args.includes('--verbose');

for (const entry of SPEC_VERSIONS) {
  if (!fs.existsSync(path.join(downloadedDir, entry.file))) {
    console.error(`Error: ${entry.file} not found in ${downloadedDir} (run npm run fetch-spec first)`);
    process.exit(1);
  }
}
const servers = JSON.parse(fs.readFileSync(path.join(configDir, 'servers.json'), 'utf8'));
const serviceNames = loadServiceNames();
const resolveService = makeServiceResolver();

fs.mkdirSync(outputDir, { recursive: true });
const existing = fs.readdirSync(outputDir).filter((f) => /\.(yaml|yml|json)$/.test(f));
if (existing.length > 0 && !overwrite) {
  console.error(`Error: output directory ${outputDir} is not empty. Use --overwrite to replace existing service specs.`);
  process.exit(1);
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'stackql-godaddy-split-'));
const merged = {}; // service -> doc
const renamesByService = {};
const unmapped = new Set();
let totalOps = 0;
try {
  for (const entry of SPEC_VERSIONS) {
    const { spec, notes } = loadPreparedSpec(entry, servers);
    for (const [p, item] of Object.entries(spec.paths)) {
      for (const verb of HTTP_VERBS) if (item[verb]) totalOps++;
      if (!resolveService(p)) unmapped.add(`v${entry.version} ${p}`);
    }
    if (unmapped.size > 0) continue;
    const specPath = path.join(tmpRoot, `prepared-${entry.file}`);
    fs.writeFileSync(specPath, JSON.stringify(spec));
    const versionOut = path.join(tmpRoot, `v${entry.version}`);
    const ok = await providerdev.split({
      apiDoc: specPath,
      providerName: 'godaddy',
      outputDir: versionOut,
      svcDiscriminator: 'function',
      svcDiscriminatorFn: (pathKey) => resolveService(pathKey),
      overwrite: true,
      verbose,
      svcNameOverrides: {}
    });
    if (!ok) {
      console.error(`Error: provider-utils split failed for ${entry.file}`);
      process.exit(1);
    }
    console.log(`v${entry.version} (${entry.file}): ${notes.join('; ')}`);
    for (const outFile of fs.readdirSync(versionOut).sort()) {
      const service = outFile.replace(/\.(yaml|yml|json)$/, '');
      const doc = yaml.load(fs.readFileSync(path.join(versionOut, outFile), 'utf8'));
      if (!merged[service]) {
        const meta = serviceNames.services[service];
        if (!meta) {
          console.error(`Error: service ${service} has no entry under "services" in provider-dev/config/service_names.json`);
          process.exit(1);
        }
        merged[service] = {
          openapi: '3.1.1',
          info: {
            title: `GoDaddy ${meta.title}`,
            description: meta.description,
            version: 'v00.00.00000'
          },
          servers: deepClone(servers),
          security: [{ bearerAuth: [] }],
          tags: [],
          paths: {},
          components: {}
        };
        renamesByService[service] = [];
      }
      const renames = mergeServiceDocs(merged[service], doc, entry.version);
      renamesByService[service].push(...renames.map((r) => `v${entry.version}: ${r}`));
    }
  }
  if (unmapped.size > 0) {
    console.error('Error: paths with no service rule in provider-dev/config/service_names.json:');
    for (const t of [...unmapped].sort()) console.error(`  ${t}`);
    process.exit(1);
  }
  // Every configured service must have received operations, and every
  // operation must have landed in exactly one service.
  let placed = 0;
  for (const [service, doc] of Object.entries(merged)) {
    for (const item of Object.values(doc.paths)) for (const verb of HTTP_VERBS) if (item[verb]) placed++;
    if (!doc.components.securitySchemes?.bearerAuth) {
      doc.components.securitySchemes = { bearerAuth: { type: 'http', scheme: 'bearer', description: 'GoDaddy Personal Access Token (PAT), passed as Authorization: Bearer <token>.' } };
    }
    void service;
  }
  const missing = Object.keys(serviceNames.services).filter((s) => !merged[s]);
  if (missing.length > 0) {
    console.error(`Error: configured services received no operations: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (placed !== totalOps) {
    console.error(`Error: ${totalOps} operations in the prepared specs but ${placed} placed in service docs`);
    process.exit(1);
  }
  // Clear previous service specs only after everything validated
  for (const f of existing) fs.rmSync(path.join(outputDir, f));
  for (const [service, doc] of Object.entries(merged).sort()) {
    fs.writeFileSync(path.join(outputDir, `${service}.yaml`), yaml.dump(doc, { lineWidth: -1, noRefs: true }));
  }
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

console.log(`Split completed: ${Object.keys(merged).length} service specs written to ${outputDir} (${totalOps} operations)`);
for (const [service, doc] of Object.entries(merged).sort()) {
  let ops = 0;
  for (const item of Object.values(doc.paths)) for (const verb of HTTP_VERBS) if (item[verb]) ops++;
  const schemas = Object.keys(doc.components.schemas || {}).length;
  console.log(`  ${service}.yaml: ${Object.keys(doc.paths).length} paths, ${ops} operations, ${schemas} schemas`);
  for (const r of renamesByService[service]) console.log(`    renamed ${r}`);
}
