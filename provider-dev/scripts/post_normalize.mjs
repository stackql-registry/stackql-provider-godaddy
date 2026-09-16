#!/usr/bin/env node

// Reverts the bare-array envelope that @stackql/provider-utils normalize
// (pass 1f, wrapBareArrayResponses) applies to every operation whose 2xx
// response is a top-level `type: array`.
//
// The Domains v1 and v2 collection reads (domain list, DNS records by type
// and name, agreements, suggestions, TLDs, pending actions, notification
// opt-ins, forwarding rules) return bare JSON arrays. stackql iterates a
// bare-array response natively - the previous godaddy provider shipped these
// operations with no objectKey and no transform and they work - so the
// Go-template transform the wrap emits adds runtime cost for no functional
// gain, and the v1 domain-list pagination token (the last row's `domain`,
// see post_process.mjs) is read from the raw response either way. The github
// provider takes the same decision for the same reason.
//
// The revert is exact: the synthesised wrapper schema holds the original
// array schema under `properties[<wrapperKey>]`, so it goes back as the
// response schema, the wrapper schema is deleted, and the marker dropped.
// Idempotent - re-running on already-unwrapped specs is a no-op.
//
// Usage: node provider-dev/scripts/post_normalize.mjs [--api-dir provider-dev/source] [--verbose]

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, resolve } from 'path';
import yaml from 'js-yaml';

const MARKER = 'x-stackql-bare-array-wrap';
const OPS = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace']);

function getArg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

const apiDir = resolve(getArg('--api-dir', 'provider-dev/source'));
const verbose = process.argv.includes('--verbose');

let filesTouched = 0;
let unwrapped = 0;
const problems = [];

for (const f of readdirSync(apiDir)) {
  const ext = extname(f).toLowerCase();
  if (ext !== '.yaml' && ext !== '.yml') continue;
  const full = join(apiDir, f);
  const doc = yaml.load(readFileSync(full, 'utf8'));
  if (!doc || typeof doc !== 'object' || !doc.paths) continue;

  let changed = false;
  const schemas = doc.components?.schemas ?? {};

  for (const [p, pathItem] of Object.entries(doc.paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const [verb, op] of Object.entries(pathItem)) {
      if (!OPS.has(verb) || !op || typeof op !== 'object') continue;
      const wrap = op[MARKER];
      if (!wrap) continue;
      const { wrapperKey, wrapperName, mediaType } = wrap;
      let reverted = false;
      for (const [code, resp] of Object.entries(op.responses ?? {})) {
        if (!/^2/.test(code)) continue;
        const mt = resp?.content?.[mediaType || 'application/json'];
        const ref = mt?.schema?.$ref;
        if (!ref || ref !== `#/components/schemas/${wrapperName}`) continue;
        const wrapper = schemas[wrapperName];
        const original = wrapper?.properties?.[wrapperKey];
        if (!original) {
          problems.push(`${f} ${verb.toUpperCase()} ${p}: wrapper schema ${wrapperName} missing properties.${wrapperKey}`);
          continue;
        }
        mt.schema = original;
        delete schemas[wrapperName];
        reverted = true;
      }
      if (reverted) {
        delete op[MARKER];
        unwrapped++;
        changed = true;
        if (verbose) console.log(`unwrapped ${f} ${verb.toUpperCase()} ${p}`);
      } else {
        problems.push(`${f} ${verb.toUpperCase()} ${p}: marker present but no wrapped 2xx response found`);
      }
    }
  }
  if (changed) {
    writeFileSync(full, yaml.dump(doc, { lineWidth: -1, noRefs: true }));
    filesTouched++;
  }
}

if (problems.length > 0) {
  console.error(`post_normalize: ${problems.length} problem(s):`);
  for (const pr of problems) console.error(`  ${pr}`);
  process.exit(1);
}
console.log(`post_normalize: reverted the bare-array wrap on ${unwrapped} operation(s) across ${filesTouched} file(s)`);
