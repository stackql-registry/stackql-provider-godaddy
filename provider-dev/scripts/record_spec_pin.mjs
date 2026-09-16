#!/usr/bin/env node

// Helper for bin/fetch-spec.sh: validates each freshly downloaded GoDaddy
// Domains spec with @apidevtools/swagger-parser, verifies it against
// provider-dev/config/spec_pin.json, and moves it into place. All-or-nothing
// across the three specs.
//
// - Validation failure: fail without writing anything.
// - No pin recorded for a spec: record it (first fetch).
// - Pin matches: refresh the fetched date only.
// - Pin mismatch: fail without writing anything, unless UPDATE=true, in
//   which case the new hash is recorded (a reviewed spec refresh).
//
// Reports each spec's stated version, path count and operation count on
// every run. Inputs via environment: UPDATE, TMP_DIR, DOWNLOAD_DIR, PIN_FILE,
// SPEC_BASE_URL, SPECS (space separated basenames without .json).

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';

const update = process.env.UPDATE === 'true';
const tmpDir = process.env.TMP_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;
const pinFile = process.env.PIN_FILE;
const specBaseUrl = process.env.SPEC_BASE_URL;
const specs = (process.env.SPECS || '').split(/\s+/).filter(Boolean);

if (!tmpDir || !downloadDir || !pinFile || !specBaseUrl || specs.length === 0) {
  console.error('record_spec_pin.mjs: missing TMP_DIR / DOWNLOAD_DIR / PIN_FILE / SPEC_BASE_URL / SPECS');
  process.exit(1);
}

const HTTP_VERBS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

let pin = { specs: {} };
if (fs.existsSync(pinFile)) {
  pin = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
}

const pending = [];
for (const name of specs) {
  const tmpPath = path.join(tmpDir, `${name}.json`);
  const content = fs.readFileSync(tmpPath);
  const spec = JSON.parse(content.toString('utf8'));

  // The v3 spec keeps shared schemas under a top-level `x-ext` map (refs of
  // the form #/x-ext/<hash>); swagger-parser resolves arbitrary JSON pointers,
  // so validation covers them. Validate a clone: the parser mutates its input.
  // The vendor `servers` block is replaced by the fixed production server for
  // validation only: swagger-parser v12 rejects a `description` on a server
  // variable under its OpenAPI 3.1 schema (the v3 environment-subdomain
  // variable), and the build replaces every spec's servers with
  // provider-dev/config/servers.json regardless.
  try {
    const candidate = structuredClone(spec);
    candidate.servers = [{ url: 'https://api.godaddy.com' }];
    await SwaggerParser.validate(candidate);
    console.log(`${name}: validated OK (@apidevtools/swagger-parser; servers substituted for validation)`);
  } catch (err) {
    console.error(`${name}: spec validation FAILED, nothing written: ${err.message}`);
    process.exit(1);
  }

  const pathKeys = Object.keys(spec.paths || {});
  let opCount = 0;
  for (const p of pathKeys) for (const v of HTTP_VERBS) if (spec.paths[p][v]) opCount++;
  console.log(`  ${spec.info?.title} - openapi ${spec.openapi}, stated version ${spec.info?.version}, ${pathKeys.length} paths, ${opCount} operations`);

  const sha256 = crypto.createHash('sha256').update(content).digest('hex');
  const existing = pin.specs[name];
  if (existing && existing.sha256 !== sha256 && !update) {
    console.error(
      `${name}: spec pin verification FAILED, nothing written: upstream content changed ` +
      `(pinned ${existing.sha256.slice(0, 12)}..., fetched ${sha256.slice(0, 12)}...). ` +
      `Re-run with --update to accept the refresh.`
    );
    process.exit(1);
  }
  const status = !existing ? 'pinned' : existing.sha256 === sha256 ? 'unchanged' : 'updated';
  pending.push({
    name, content, status,
    record: {
      url: `${specBaseUrl}/${name}.json`,
      filename: `${name}.json`,
      title: spec.info?.title,
      spec_version: spec.info?.version,
      openapi: spec.openapi,
      paths: pathKeys.length,
      operations: opCount,
      sha256,
      bytes: content.length,
      fetched: new Date().toISOString().slice(0, 10)
    }
  });
}

// every spec validated and pin-checked: write all of them
fs.mkdirSync(downloadDir, { recursive: true });
for (const p of pending) {
  fs.writeFileSync(path.join(downloadDir, `${p.name}.json`), p.content);
  pin.specs[p.name] = p.record;
  console.log(`  ${p.name}.json: ${p.status} (sha256 ${p.record.sha256.slice(0, 12)}..., ${p.content.length} bytes)`);
}
fs.mkdirSync(path.dirname(pinFile), { recursive: true });
fs.writeFileSync(pinFile, JSON.stringify(pin, null, 2) + '\n');
