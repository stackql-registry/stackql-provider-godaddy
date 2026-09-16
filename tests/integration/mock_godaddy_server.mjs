// In-process mock of the GoDaddy Domains API for the integration suite.
// Serves the wire shapes the provider depends on (captured from the live
// API and redacted), records every request for assertion, and enforces the
// bearer credential. Started by run_integration_tests.mjs on a free port.
//
//   GET  /v1/domains                                   bare array, marker + limit paging
//   GET  /v1/domains/{domain}                          domain detail
//   PATCH /v1/domains/{domain}                         204-style empty body
//   GET  /v1/domains/{domain}/records/{type}/{name}    bare array
//   PATCH /v1/domains/{domain}/records                 expects a JSON ARRAY body
//   PUT  /v1/domains/{domain}/records/{type}/{name}    expects a JSON ARRAY body
//   DELETE /v1/domains/{domain}/records/{type}/{name}  204
//   GET  /v1/domains/suggest                           bare array (records query params)
//   GET  /v1/domains/agreements                        bare array (requires tlds + privacy)
//   GET  /v2/customers/{customerId}/domains/{domain}/actions   bare array (records customerId)
//   GET  /v2/domains/usage/{yyyymm}                    object
//   GET  /v3/domains/domain-names                      {items, links} pageToken paging
//   GET  /v3/domains/domain-names/{domain}             object
//   PUT  /v3/domains/domain-names/{domain}/nameservers expects a JSON ARRAY body, 202 operation
//   GET  /v3/domains/zones/{zone}/dns-records          {items, links} page/pageSize paging
//   POST /v3/domains/zones/{zone}/dns-records          201 record with recordId
//   PUT  /v3/domains/zones/{zone}/dns-records/{id}     200 record
//   DELETE /v3/domains/zones/{zone}/dns-records/{id}   204
//   GET  /v3/domains/operations/{id}                   object

import http from 'http';

export const TEST_TOKEN = 'gd_test_token_000000000000000000000';
export const CUSTOMER_ID = '11111111-2222-3333-4444-555555555555';

const DOMAINS = ['alpha.example', 'bravo.example', 'charlie.example', 'delta.example', 'echo.example'];
const RECORDS = [
  { recordId: 'r1', name: '@', type: 'A', data: '203.0.113.10', ttl: 3600 },
  { recordId: 'r2', name: '@', type: 'A', data: '203.0.113.11', ttl: 3600 },
  { recordId: 'r3', name: 'www', type: 'CNAME', data: 'alpha.example.', ttl: 3600 },
  { recordId: 'r4', name: '_verify', type: 'TXT', data: 'token', ttl: 600 },
  { recordId: 'r5', name: '@', type: 'NS', data: 'ns33.domaincontrol.com.', ttl: 3600 }
];

function domainSummary(domain) {
  return {
    domain, domainId: 1000 + DOMAINS.indexOf(domain), status: 'ACTIVE', expires: '2027-01-01T00:00:00.000Z',
    createdAt: '2020-01-01T00:00:00.000Z', renewAuto: true, locked: true, privacy: false, expirationProtected: false,
    holdRegistrar: false, transferProtected: false, renewable: true, nameServers: ['ns33.domaincontrol.com', 'ns34.domaincontrol.com']
  };
}

function domainV3(domain) {
  return {
    domain, status: 'ACTIVE', expiresAt: '2027-01-01T00:00:00.000Z', createdAt: '2020-01-01T00:00:00.000Z',
    renewBy: '2027-02-15T00:00:00.000Z', autoRenew: true, privacy: false, transferLock: true,
    nameServers: ['ns33.domaincontrol.com', 'ns34.domaincontrol.com'],
    links: [{ href: `http://mock/v3/domains/domain-names/${domain}`, method: 'GET', rel: 'self' }]
  };
}

export function startMockServer() {
  const requests = [];
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const bodyText = Buffer.concat(chunks).toString('utf8');
      const url = new URL(req.url, `http://${req.headers.host}`);
      const entry = { method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams.entries()), headers: req.headers, body: bodyText };
      requests.push(entry);
      const send = (code, payload) => {
        if (payload === undefined) { res.writeHead(code); res.end(); return; }
        const text = JSON.stringify(payload);
        res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
        res.end(text);
      };
      if (req.headers.authorization !== `Bearer ${TEST_TOKEN}`) return send(401, { code: 'UNAUTHORIZED', message: 'bad credential' });
      const p = url.pathname;
      const base = `http://127.0.0.1:${server.address().port}`;
      let m;
      // ---------------------------------------------------------------- v1
      if (req.method === 'GET' && p === '/v1/domains') {
        const limit = Number(url.searchParams.get('limit') || 2);
        const marker = url.searchParams.get('marker');
        let start = 0;
        if (marker) start = DOMAINS.indexOf(marker) + 1;
        return send(200, DOMAINS.slice(start, start + limit).map(domainSummary));
      }
      // static v1 routes before the {domain} route
      if (req.method === 'GET' && p === '/v1/domains/suggest') {
        const n = Number(url.searchParams.get('limit') || 5);
        return send(200, ['stackql.dev', 'stackql.pro', 'stackql.app', 'stackql.io', 'stackql.net'].slice(0, n).map((domain) => ({ domain })));
      }
      if (req.method === 'GET' && p === '/v1/domains/agreements') {
        if (!url.searchParams.get('tlds') || url.searchParams.get('privacy') === null) return send(422, { code: 'INVALID_PARAMETERS', message: 'tlds and privacy required' });
        return send(200, [{ agreementKey: 'DNRA', title: 'Domain Registration Agreement', url: 'http://mock/dnra', content: '<p>...</p>' }]);
      }
      if (req.method === 'GET' && (m = p.match(/^\/v1\/domains\/([^/]+)$/))) {
        if (!DOMAINS.includes(m[1])) return send(404, { code: 'NOT_FOUND', message: 'Domain not found' });
        return send(200, { ...domainSummary(m[1]), contactRegistrant: { nameFirst: 'Ada', nameLast: 'Lovelace', email: 'ada@example' } });
      }
      if (req.method === 'PATCH' && (m = p.match(/^\/v1\/domains\/([^/]+)$/))) return send(200);
      if (req.method === 'GET' && (m = p.match(/^\/v1\/domains\/([^/]+)\/records\/([^/]+)\/([^/]+)$/))) {
        return send(200, RECORDS.filter((r) => r.type === m[2] && r.name === m[3]).map(({ recordId, ...r }) => r));
      }
      if ((req.method === 'PATCH' || req.method === 'PUT') && /^\/v1\/domains\/[^/]+\/records/.test(p)) {
        let parsed;
        try { parsed = JSON.parse(bodyText); } catch { return send(400, { code: 'INVALID_BODY', message: 'not json' }); }
        if (!Array.isArray(parsed)) return send(400, { code: 'INVALID_BODY', message: 'body must be an array', fields: [{ path: 'records' }] });
        return send(200);
      }
      if (req.method === 'DELETE' && /^\/v1\/domains\/[^/]+\/records\/[^/]+\/[^/]+$/.test(p)) return send(204);
      // ---------------------------------------------------------------- v2
      if (req.method === 'GET' && (m = p.match(/^\/v2\/customers\/([^/]+)\/domains\/([^/]+)\/actions$/))) {
        if (m[1] !== CUSTOMER_ID) return send(403, { code: 'ACCESS_DENIED', message: 'Authenticated user is not allowed access' });
        return send(200, [{ type: 'RENEW', origination: 'USER', status: 'COMPLETED', createdAt: '2026-01-01T00:00:00Z', domain: m[2] }]);
      }
      if (req.method === 'GET' && (m = p.match(/^\/v2\/domains\/usage\/([^/]+)$/))) return send(200, { yyyymm: m[1], total: 42 });
      // ---------------------------------------------------------------- v3
      if (req.method === 'GET' && p === '/v3/domains/domain-names') {
        const size = Number(url.searchParams.get('pageSize') || 2);
        const token = url.searchParams.get('pageToken');
        const start = token ? Number(Buffer.from(token, 'base64').toString('utf8')) : 0;
        const items = DOMAINS.slice(start, start + size).map(domainV3);
        const links = [{ href: `${base}${p}?${url.searchParams.toString()}`, method: 'GET', rel: 'self' }];
        if (start + size < DOMAINS.length) {
          const next = new URLSearchParams(url.searchParams);
          next.set('pageToken', Buffer.from(String(start + size)).toString('base64'));
          links.push({ href: `${base}${p}?${next.toString()}`, method: 'GET', rel: 'next' });
        }
        return send(200, { items, links });
      }
      if (req.method === 'GET' && (m = p.match(/^\/v3\/domains\/domain-names\/([^/]+)$/))) return send(200, domainV3(m[1]));
      if (req.method === 'PUT' && (m = p.match(/^\/v3\/domains\/domain-names\/([^/]+)\/nameservers$/))) {
        let parsed;
        try { parsed = JSON.parse(bodyText); } catch { return send(400, { name: 'INVALID_BODY', message: 'not json' }); }
        if (!Array.isArray(parsed)) return send(400, { name: 'INVALID_BODY', message: 'Request body is required.' });
        return send(202, { operationId: 'op-1', type: 'NAMESERVER_UPDATE', domain: m[1], status: 'PENDING' });
      }
      if (req.method === 'GET' && (m = p.match(/^\/v3\/domains\/zones\/([^/]+)\/dns-records$/))) {
        const size = Number(url.searchParams.get('pageSize') || 100);
        const page = Number(url.searchParams.get('page') || 1);
        const type = url.searchParams.get('type');
        const all = RECORDS.filter((r) => !type || r.type === type);
        const items = all.slice((page - 1) * size, page * size);
        const links = [{ href: `${base}${p}?page=${page}&pageSize=${size}`, method: 'GET', rel: 'self' }];
        if (page * size < all.length) links.push({ href: `${base}${p}?page=${page + 1}&pageSize=${size}${type ? `&type=${type}` : ''}`, method: 'GET', rel: 'next' });
        return send(200, { items, links });
      }
      if (req.method === 'POST' && (m = p.match(/^\/v3\/domains\/zones\/([^/]+)\/dns-records$/))) {
        const parsed = JSON.parse(bodyText || '{}');
        return send(201, { recordId: 'r-new', ...parsed });
      }
      if (req.method === 'PUT' && (m = p.match(/^\/v3\/domains\/zones\/([^/]+)\/dns-records\/([^/]+)$/))) {
        const parsed = JSON.parse(bodyText || '{}');
        return send(200, { recordId: m[2], ...parsed });
      }
      if (req.method === 'DELETE' && /^\/v3\/domains\/zones\/[^/]+\/dns-records\/[^/]+$/.test(p)) return send(204);
      if (req.method === 'GET' && (m = p.match(/^\/v3\/domains\/operations\/([^/]+)$/))) return send(200, { operationId: m[1], type: 'NAMESERVER_UPDATE', domain: 'alpha.example', status: 'COMPLETED', result: { domain: 'alpha.example' } });
      return send(404, { code: 'NOT_FOUND', message: 'There is no method to handle request' });
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port, requests }));
  });
}
