#!/usr/bin/env node
// Post-docgen sanitizer for the generated provider docs. Deterministic;
// run after `npm run generate-docs`, before building the website.
//
// 1. MDX safety. MDX v3 parses any raw <token> as JSX and {...} as an
//    expression, and fails the build on the first mismatch. Description text
//    only ever appears as <td> inner content (one cell per line), so inside
//    every description cell every angle bracket and brace is escaped, with
//    the tags docgen itself emits (<br />, <code>, <a>, <b>, <CopyableCode/>)
//    protected. Every other line is untouched.
//
// 2. Hyphenated parameter aliases. docgen renders the snake alias of a
//    hyphenated wire name (X-Request-Id, X-Shopper-Id, X-Market-Id,
//    Idempotency-Key) as `x-_request-_id`; the engine's alias is
//    `x_request_id`. Every `-_` in a parameter token becomes `_`.
//
// 3. EXEC examples. docgen writes EXEC variables in wire casing
//    (@notificationId, @X-Request-Id); the engine accepts the snake aliases
//    and a hyphenated identifier is not valid SQL, so EXEC variables and
//    their placeholders are rewritten to snake_case.
//
// 4. Domains v2 customer scope. The customer-scoped v2 resources address
//    /v2/customers/{customer_id}/... through a path-level server template
//    whose variable resolves from GODADDY_CUSTOMER_ID (x-stackQL-envVar).
//    docgen only reads document-level server variables, so those pages
//    would not mention customer_id at all. On every `_v2` resource page
//    except api_usage_v2 (not customer-scoped): a customer_id row is added
//    to the Parameters table, appended to the required parameters of every
//    method, and written into the SELECT / DELETE / UPDATE / EXEC examples
//    as "required unless GODADDY_CUSTOMER_ID is set".

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');

const TD_LINE = /^(\s*<td>)(.*)(<\/td>\s*)$/;
const PROTECTED = /<br \/>|<\/?code>|<\/?b>|<a href="[^"]*">|<\/a>|<CopyableCode\b[^<>]*\/>/g;
const OPEN = '';
const CLOSE = '';

const CUSTOMER_LINK = '<a href="#parameter-customer_id"><code>customer_id</code></a>';
const CUSTOMER_ROW = [
  '<tr id="parameter-customer_id">',
  '    <td><CopyableCode code="customer_id" /></td>',
  '    <td><code>string (uuid)</code></td>',
  '    <td>GoDaddy customer identifier (UUID, not the numeric shopper number). Resolved from the <code>GODADDY_CUSTOMER_ID</code> environment variable when it is set (server variable, x-stackQL-envVar); otherwise required on every method of this resource. A WHERE value always takes precedence over the environment. API resellers acting on behalf of a subaccount pass the subaccount customer identifier.</td>',
  '</tr>'
];
const CUSTOMER_WHERE = "AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set";
const CUSTOMER_EXEC = "@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, ";

function toSnake(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

function escapeCell(inner) {
  const protectedTags = [];
  let out = inner.replace(PROTECTED, (m) => {
    protectedTags.push(m);
    return `${OPEN}${protectedTags.length - 1}${CLOSE}`;
  });
  out = out.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
  return out.replace(new RegExp(`${OPEN}(\\d+)${CLOSE}`, 'g'), (_, i) => protectedTags[Number(i)]);
}

let files = 0, cells = 0, aliases = 0, execVars = 0, customerPages = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.mdx?$/.test(entry.name)) sanitize(full);
  }
}

function sanitize(file) {
  const original = fs.readFileSync(file, 'utf8');
  let lines = original.split('\n');
  let inCode = false;
  let execBlock = false;
  const resource = path.basename(path.dirname(file));
  const customerScoped = /_v2$/.test(resource) && resource !== 'api_usage_v2' && /[\/\\]services[\/\\]/.test(file);
  let section = '';
  let methodsTd = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (/^```/.test(line.trim())) {
      inCode = !inCode;
      execBlock = false;
      continue;
    }
    if (/^## /.test(line)) { section = line.trim(); methodsTd = 0; }

    if (inCode) {
      // 2. aliases in examples; 3. EXEC variables to snake_case
      if (/-_/.test(line)) { line = line.replace(/-_/g, '_'); aliases++; }
      if (/^EXEC /.test(line)) execBlock = true;
      if (execBlock) {
        line = line.replace(/@([A-Za-z][A-Za-z0-9-]*)='\{\{ ([^}]+) \}\}'/g, (_, v, ph) => { execVars++; return `@${toSnake(v)}='{{ ${toSnake(ph.trim())} }}'`; });
        if (customerScoped && /^EXEC /.test(line) && !/customer_id/.test(lines[i + 1] || '')) {
          lines.splice(i + 1, 0, CUSTOMER_EXEC);
        }
        // 3b. docgen renders request body attributes as an @@json block;
        // the engine requires body attributes that the API marks required
        // to be passed as @attribute variables (a verified limitation), and
        // accepts every body attribute that way, so the block becomes one
        // @snake_attribute='{{ snake_attribute }}' line per attribute.
        if (/^@@json=/.test(line.trim())) {
          let j = i + 1;
          const attrs = [];
          while (j < lines.length && !/^}'/.test(lines[j].trim())) {
            const am = lines[j].match(/^\s*"([^"]+)":/);
            if (am) attrs.push(toSnake(am[1]));
            j++;
          }
          if (j < lines.length) {
            const prev = lines[i - 1] || '';
            if (/'\s*$/.test(prev) || /--required,?\s*$/.test(prev)) lines[i - 1] = prev.replace(/,?\s*$/, ', ');
            const replacement = attrs.map((a, k) => `@${a}='{{ ${a} }}'${k < attrs.length - 1 ? ', ' : ''}`);
            lines.splice(i, j - i + 1, ...replacement);
            execVars += attrs.length;
            i += replacement.length - 1;
            continue;
          }
        }
      }
      // 4. WHERE examples on customer-scoped pages
      if (customerScoped && /^WHERE .* -- ?required$/.test(line.trim()) && !/customer_id/.test(lines[i + 1] || '')) {
        lines[i] = line;
        lines.splice(i + 1, 0, CUSTOMER_WHERE);
      }
      lines[i] = line;
      continue;
    }

    // 2. aliases in tables and anchors
    if (/-_/.test(line)) { line = line.replace(/-_/g, '_'); aliases++; }
    // 2b. EXEC header and body parameters are rendered in wire casing in the
    //     Methods and Parameters sections (Idempotency-Key, nameServers); the
    //     engine surface is the snake alias, so parameter tokens there are
    //     snake_cased (field tables already carry snake names with wire notes).
    if (section === '## Methods' || section === '## Parameters') {
      const snakeToken = (t) => (/[A-Z-]/.test(t) ? toSnake(t) : t);
      line = line
        .replace(/#parameter-([A-Za-z0-9_-]+)"><code>([A-Za-z0-9_-]+)<\/code>/g, (_, a, b) => `#parameter-${snakeToken(a)}"><code>${snakeToken(b)}</code>`)
        .replace(/<tr id="parameter-([A-Za-z0-9_-]+)">/g, (_, a) => `<tr id="parameter-${snakeToken(a)}">`)
        .replace(/<CopyableCode code="([A-Za-z0-9_-]+)" \/>/g, (_, a) => `<CopyableCode code="${snakeToken(a)}" />`);
    }

    // 4. methods table: append customer_id to the required-params cell
    if (customerScoped && section === '## Methods') {
      if (/^<tr>/.test(line.trim())) methodsTd = 0;
      if (TD_LINE.test(line)) {
        methodsTd++;
        if (methodsTd === 3) {
          const m = line.match(TD_LINE);
          const inner = m[2].trim();
          line = `${m[1]}${inner ? `${inner}, ${CUSTOMER_LINK}` : CUSTOMER_LINK}${m[3]}`;
          lines[i] = line;
          continue;
        }
      }
    }
    // 4. parameters table: add the customer_id row before the first parameter row
    if (customerScoped && section === '## Parameters' && /^<tbody>/.test(line.trim()) && !/parameter-customer_id/.test(original)) {
      lines.splice(i + 1, 0, ...CUSTOMER_ROW);
      customerPages++;
    }

    // 1. MDX escaping inside description cells
    const m = line.match(TD_LINE);
    if (m) {
      const escaped = escapeCell(m[2]);
      if (escaped !== m[2]) { line = `${m[1]}${escaped}${m[3]}`; cells++; }
    }
    lines[i] = line;
  }

  const out = lines.join('\n');
  if (out !== original) {
    fs.writeFileSync(file, out);
    files++;
  }
}

if (!fs.existsSync(docsDir)) {
  console.error(`docs directory not found: ${docsDir}`);
  process.exit(1);
}
walk(docsDir);
console.log(`sanitize-docs: ${files} file(s) changed, ${cells} description cell(s) escaped, ${aliases} hyphenated alias line(s) fixed, ${execVars} EXEC variable(s) snake_cased, ${customerPages} customer-scoped v2 page(s) annotated`);
