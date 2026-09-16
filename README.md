# `godaddy` provider for [`stackql`](https://github.com/stackql/stackql)

This repository builds and documents the `godaddy` provider for StackQL, enabling SQL-based query and provisioning operations against the [GoDaddy Domains APIs](https://developer.godaddy.com/en/docs/references/rest) - registered domain inventory and settings, contacts, nameservers, renewal and cancellation, DNS records and forwarding, registrant changes, privacy forwarding, pending actions and notifications, transfers, availability and pricing, name suggestions, TLDs, legal agreements, purchase and registration, and monthly API usage. Docs: [godaddy-provider.stackql.io](https://godaddy-provider.stackql.io).

## Design Principles

- **The three GoDaddy Domains APIs, side by side.** GoDaddy publishes OpenAPI specs for Domains v1, v2 and v3 on its Developer Platform (`https://developer.godaddy.com/openapi/domains-v{1,2,3}.json`) and this provider is generated from all three. Resources served by Domains v1 carry the bare name (`domains`, `records`, `agreements`); resources served by v2 are suffixed `_v2` and by v3 `_v3`, always, so the name states the API version, the scoping and the credential rules that apply, and names stay stable when a later version adds a resource.
- **Bearer auth with a Personal Access Token.** `GODADDY_API_KEY` holds a GoDaddy PAT (`Authorization: Bearer`), the credential GoDaddy recommends and the only one the v3 API accepts. The variable name follows the Terraform godaddy providers; the classic `sso-key key:secret` credential those providers use is deprecated by GoDaddy and is supported here as an `--auth` override, not the default.
- **Customer scope from the environment.** Every Domains v2 resource is customer-scoped. The customer identifier is a server variable resolved from `GODADDY_CUSTOMER_ID` (`x-stackQL-envVar`) when set; otherwise `customer_id` is a required parameter, and a `WHERE customer_id` value always wins.
- **snake_case user surface.** Columns and `WHERE` / `INSERT` / `EXEC` keys are snake_case over GoDaddy's camelCase (and kebab-case) wire names (`snake_case_aliases: true` on the provider config plus `request.nativeCasing: camel` on every method). Nested JSON columns keep wire casing inside the blob.
- **Pagination follows each API's own style.** The v1 domain list pages with a marker cursor (the last domain of the previous page), the v3 lists follow their HATEOAS `links[rel=next]`; both are configured per method and walked automatically.
- **Predicate pushdown through declared parameters.** Filters such as `statuses`, `status_groups`, `modified_date`, `lifecycle_groups`, `type`, `name` and `page_size` are query parameters of the underlying operations and are sent to the API from the `WHERE` clause. `LIMIT` is pushed to the page-size parameter on the unpaged reads.
- **Every operation exposed, lifecycle on the resource.** 67 operations, all mapped: collection and single reads as `SELECT`, creates as `INSERT`, edits as `UPDATE`, removals as `DELETE`, and every other action (renew, verify, contacts, nameservers, the transfer workflow, validations, bulk checks) as `EXEC` on the resource it acts on. Five write-only resources remain (purchases, quotes, v2 registrations, the two transfer resources).
- **Deterministic builds.** Every pipeline step is a re-runnable script; mapping decisions are rules in `provider-dev/scripts/map_operations.mjs`, and `provider-dev/config/all_services.csv` is the checked-in record of every operation binding. Scripts validate and fail without writing on any violation.

## Breaking changes from the previous release

The previous `godaddy` provider was generated from a swagger bundle GoDaddy has since removed, and authenticated with the classic key. This release is generated from the published Domains specs and authenticates with a PAT. Every previous resource is dispositioned below.

| Previous | Disposition |
|---|---|
| auth `api_key` with `valuePrefix: sso-key` (`GODADDY_API_KEY` = `key:secret`) | `bearer` with `GODADDY_API_KEY` = Personal Access Token. Classic key users pass `--auth='{"godaddy": {"type": "api_key", "valuePrefix": "sso-key ", "credentialsenvvar": "GODADDY_SSO_KEY"}}'` (see the docs) |
| `godaddy.domains.domains` | carried as `godaddy.domains.domains` (v1); methods `list`, `get`, `update`, `cancel`, `update_contacts`, `verify_registrant_email`, `renew` |
| `godaddy.domains.records` | `godaddy.dns.records` (v1, by type and name) and `godaddy.dns.records_v3` (record-id CRUD, full zone listing) |
| `godaddy.domains.agreements` | `godaddy.registration.agreements` |
| `godaddy.domains.available` | `godaddy.registration.availability` (`get`, `check_bulk`) and `availability_v3` |
| `godaddy.domains.suggest` | `godaddy.registration.suggestions` and `suggestions_v3` |
| `godaddy.domains.tlds` | `godaddy.registration.tlds` |
| `godaddy.domains.purchase_schema` | `godaddy.registration.purchase_schemas` |
| `godaddy.domains.identity_documents`, `identity_documents_verifications` | retired - `/v1/domains/identityDocuments` is not in the published Domains v1 spec |
| services `abuse`, `aftermarket`, `agreements`, `certificates`, `countries`, `orders`, `shoppers`, `subscriptions` | retired - no published spec on the Developer Platform, and the PAT is rejected by these APIs (they require the classic key GoDaddy is retiring). They return when GoDaddy publishes a spec, through the same pipeline |

New in this release: the whole Domains v2 surface (`domains_v2`, `registrant_changes_v2`, `privacy_forwarding_v2`, `actions_v2`, `notifications_v2`, `notification_opt_ins_v2`, `notification_schemas_v2`, `api_usage_v2`, `forwards_v2`, `registrations_v2`, `registration_schemas_v2`, `transfers_v2`), the Domains v3 surface (`domains_v3`, `operations_v3`, `records_v3`, `availability_v3`, `suggestions_v3`, `registration_quotes_v3`, `registrations_v3`), and the v1 purchase, transfer and bulk DNS operations.

## Prerequisites

- Node.js >= 20 (`npm install` pins `@stackql/provider-utils` 0.7.9 and `@stackql/pgwire-lite` 1.0.2)
- A local `stackql` binary for testing (`$STACKQL`, `./stackql`, or on `PATH`; development runs under WSL with the latest release binary)
- Python 3 for the smoke suite (a venv with `pystackql` is created on demand)
- yarn for the website
- A GoDaddy Personal Access Token for live tests - create one on the [developer dashboard](https://developer.godaddy.com/personal-access-token)

### Makefile

Every step below is a `make` target (GNU make, bash; Linux, WSL and macOS). `make help` lists them; the composite targets are:

```bash
make all      # deps, full pipeline (fetch/pin, split, mappings, normalize, generate, post-process),
              # offline + integration + meta-route tests, docs generation, website build
make smoke    # live smoke suite with the locally generated provider (sources .env if present)
make smoke-live   # the same suite against the PUBLISHED provider (post-publish verification)
```

`make all` never touches the account. Live credentials are read from the environment or a gitignored `.env`:

```bash
GODADDY_API_KEY=gd_...                       # Personal Access Token
GODADDY_CUSTOMER_ID=<uuid>                   # optional: enables the Domains v2 read smokes
GODADDY_SMOKE_DOMAINS=enablytics.io,enablytics.com.au   # optional: test domains (default shown)
```

## 0. Download and Pin the Specs

```bash
make fetch-spec        # npm run fetch-spec
make refresh-spec      # npm run fetch-spec -- --update  (accept upstream drift, review the diff)
```

`bin/fetch-spec.sh` downloads the three specs into `provider-dev/downloaded/`, validates each with `@apidevtools/swagger-parser` (the vendor `servers` block is substituted for validation only: swagger-parser v12 rejects a `description` on a server variable under its OpenAPI 3.1 schema, and the build replaces every spec's servers with `provider-dev/config/servers.json` regardless) and records date, content hash, path and operation counts per spec in `provider-dev/config/spec_pin.json`. A mismatch fails without writing. Pinned on 2026-09-16: Domains v1 (17 paths, 23 operations), v2 (23 paths, 30 operations), v3 (12 paths, 14 operations).

## 1. Split into Service Specs

```bash
make split             # npm run split -- --overwrite
```

`bin/split.mjs` prepares each pinned spec in memory (the snapshots are never modified), splits it with provider-utils by the ordered path rules in `provider-dev/config/service_names.json`, and merges the per-version results into one document per service in `provider-dev/source/`. Preparation, recorded in `provider-dev/scripts/lib/spec_helpers.mjs`:

- **v3** keeps 46 shared schemas in a top-level `x-ext` map addressed by hash (its `Error` entry nests a `definitions` map); they are relocated into `components.schemas` under their component alias or title, since stackql's loader cannot resolve `#/x-ext/...` refs. Every v3 path is rebased under `/v3/domains` (the spec's server is `https://api.{env}.com/v3/domains`) so all versions share the production server. The `domain-name` path parameter is renamed `domain_name` in template and declaration.
- **v2** declares no `operationId` on 26 of 30 operations; deterministic ids are synthesized from verb and path.
- **v1** `GET /v1/domains/agreements` declares its privacy flag as `v1-privacy`; the live API accepts `privacy` (verified) and the parameter is exposed as `privacy`.
- Six operations take a bare JSON array as the request body (the v1 bulk DNS record writes, the v1 bulk availability check, the v3 nameserver replacement). stackql builds bodies from named attributes, so each is wrapped in a single-property object (`records`, `domains`, `nameServers`) and unwrapped on the wire by a request transform added in the post-process step.

A component defined differently by two versions keeps the bare name for the earlier version and is suffixed `_v<N>` for the later one (`Error_v3`, `Address_v2`, `Consent_v3`, ...); identical definitions are shared. A path with no service rule fails the run.

| Service | Surface | Operations |
|---|---|---|
| `domains` | domain inventory, detail, settings, contacts, renewal, cancellation (v1); customer-scoped detail, nameservers, registrant changes, privacy forwarding, actions, notifications (v2); domain list, detail, nameservers, operations (v3); monthly API usage (v2) | 26 |
| `registration` | agreements, availability, suggestions, TLDs, purchase and validation (v1); registration and schema (v2); availability, suggestions, quotes, registrations (v3) | 18 |
| `dns` | DNS records by type and name and bulk writes (v1); forwarding rules (v2); record-id based records (v3) | 14 |
| `transfers` | transfer-in order (v1); the transfer workflow (v2) | 9 |

## 2. Generate Mappings

```bash
make mappings          # generate-mappings (provider-utils analyze) + npm run map-operations
```

`analyze` writes the skeleton `provider-dev/config/all_services.csv`; `map_operations.mjs` fills `stackql_resource_name`, `stackql_method_name`, `stackql_verb` and `stackql_object_key` from one explicit rule per operation, and validates before writing: every operation has exactly one rule, every rule still exists upstream, `(resource, method)` is unique per service, the `_v2`/`_v3` suffix agrees with the path version, and selectable methods on a resource have distinct required-parameter signatures. The CSV is committed as the durable record of every binding, so a refresh that moves an operation to a different resource or renames one shows up in the diff.

| Operation pattern | StackQL verb | Method |
|---|---|---|
| GET collection | `SELECT` | `list` (v3 collections take `objectKey: $.items`; v1/v2 bare arrays need none) |
| GET single | `SELECT` | `get` |
| POST create | `INSERT` | `create` (v1 `purchases`, v2 `registrations_v2`, v3 `registration_quotes_v3`, `registrations_v3`, `records_v3`, `forwards_v2`) |
| PATCH / PUT edit | `UPDATE` | `update` (v1 domain, v2 privacy forwarding) / `replace` (v3 record PUT, v2 forward PUT - full representation) |
| DELETE | `DELETE` | `delete` / `cancel` |
| everything else | `EXEC` | `renew`, `verify_registrant_email`, `update_contacts`, `update_nameservers`, `acknowledge`, `validate`, `validate_contacts`, `check_bulk`, the transfer workflow, the v1 bulk record writes (`add`, `replace_all`, `replace_by_type`, `replace_by_type_name`) |

Mapping results: 67 operations - 26 `SELECT`, 6 `INSERT`, 4 `UPDATE`, 6 `DELETE`, 25 `EXEC`; 28 resources:

- `domains`: `domains`, `domains_v2`, `registrant_changes_v2`, `privacy_forwarding_v2`, `actions_v2`, `notifications_v2`, `notification_opt_ins_v2`, `notification_schemas_v2`, `api_usage_v2`, `domains_v3`, `operations_v3`
- `dns`: `records`, `forwards_v2`, `records_v3`
- `registration`: `agreements`, `availability`, `suggestions`, `tlds`, `purchases`, `purchase_schemas`, `registrations_v2`, `registration_schemas_v2`, `availability_v3`, `suggestions_v3`, `registration_quotes_v3`, `registrations_v3`
- `transfers`: `transfers`, `transfers_v2`

## 3. Normalize the Service Specs

```bash
make normalize         # npm run normalize -- --api-dir provider-dev/source, then npm run post-normalize
```

The generic provider-utils pass flattens `allOf` (the v3 schemas), lifts path-item parameters and stringifies opaque objects; deeply nested objects (contacts, prices, links, consent) land as JSON columns addressed with `json_extract`. It also wraps every bare-array response in an object envelope with a Go-template transform; `post_normalize.mjs` reverts that wrap on the 8 affected v1/v2 collection reads, because stackql iterates bare-array responses natively and the transform adds runtime cost for no functional gain (the github provider takes the same decision).

## 4. Generate the Provider

```bash
make generate
```

which runs:

```bash
rm -rf provider-dev/openapi/*
npm run generate-provider -- \
  --provider-name godaddy \
  --input-dir provider-dev/source \
  --output-dir provider-dev/openapi/src/godaddy \
  --config-path provider-dev/config/all_services.csv \
  --servers provider-dev/config/servers.json \
  --provider-config provider-dev/config/provider_config.json \
  --naive-req-body-translate \
  --overwrite
npm run post-process
```

`provider_config.json` is `{"auth": {"type": "bearer", "credentialsenvvar": "GODADDY_API_KEY"}, "snake_case_aliases": true}`. `--naive-req-body-translate` exposes top-level request body properties as columns, so `INSERT INTO godaddy.dns.records_v3 (zone, name, type, data, ttl) ...` and `UPDATE godaddy.domains.domains SET renew_auto = 'true' ...` render the wire bodies as written (snake keys resolve to the camelCase attributes through `request.nativeCasing: camel`; string booleans are coerced to the schema type).

`post_process.mjs` then applies what the generator cannot express:

1. **Domains v2 customer scoping.** Every customer-scoped v2 path item (22 across the services) is rebased onto the path-level server template in `provider-dev/config/customer_server.json` - `https://api.godaddy.com/v2/customers/{customer_id}` with `x-stackQL-envVar: GODADDY_CUSTOMER_ID` - and loses its `customerId` path parameter. any-sdk resolves servers operation -> path item -> document, so the override applies to the v2 operations only; `GET /v2/domains/usage/{yyyymm}` stays on the base server. This runs after generation because the normalize step strips path-level servers.
2. **Pagination.** `domains.domains.list`: `requestToken` `marker` (query) fed from `responseToken` `$[-1:].domain` (the last domain of the raw response array; the loop ends on the empty page). `domains.domains_v3.list` and `dns.records_v3.list`: `responseToken` `$.links[?(@.rel=="next")].href` with the request token at location `request`, so the link URL replaces the request URL (the github Link-header mechanism).
3. **`LIMIT` pushdown** (`queryParamPushdown.top`) on the unpaged reads only: `dns.records.list` (`limit`), `registration.suggestions.list` (`limit`), `registration.suggestions_v3.list` (`pageSize`). Pushing `LIMIT` on a paged list shrinks every page and the pagination loop then walks the whole collection in tiny pages (measured: 34 s for `LIMIT 3` over 185 domains vs 5 s unpushed), so the paged lists keep the client-side `LIMIT`.
4. **Array request bodies.** The six wrapped operations get `request.transform` (`golang_template_json_v0.3.0`) emitting the wrapper property alone, whether it arrives as the caller's JSON string or an already parsed array.
5. **`request.nativeCasing: camel`** on all 67 methods, and a title and description on every resource naming the API version behind it.

### Authentication

Provider config: `{"auth": {"type": "bearer", "credentialsenvvar": "GODADDY_API_KEY"}}` - the PAT, sent as `Authorization: Bearer`. The classic key is an `--auth` override:

```bash
export GODADDY_SSO_KEY='<key>:<secret>'
stackql shell --auth='{"godaddy": {"type": "api_key", "valuePrefix": "sso-key ", "credentialsenvvar": "GODADDY_SSO_KEY"}}'
```

The classic key does not work for the `_v3` resources. The PAT is also rejected by the GoDaddy Auctions API and the legacy non-domain APIs, which is one reason they are out of scope.

### Customer scope

```sql
-- GODADDY_CUSTOMER_ID exported: no customer_id needed
SELECT type, origination, status FROM godaddy.domains.actions_v2 WHERE domain = 'example.com';
-- explicit (a reseller acting on a subaccount)
SELECT type FROM godaddy.domains.actions_v2 WHERE customer_id = '<uuid>' AND domain = 'example.com';
```

With the variable unset `SHOW METHODS IN godaddy.domains.actions_v2` lists `customer_id` as required. The customer UUID is shown in the GoDaddy account settings; it cannot be looked up with a PAT (`/v1/shoppers` requires the classic key) and the `me` / `MY` alias is rejected by the v2 API.

## 5. Test the Provider

Four layers, in order. `make test` runs the first three (no credentials); the fourth is live.

### Validate offline

```bash
make test-offline          # node tests/offline_validation.mjs
```

`SHOW SERVICES` / `SHOW RESOURCES` / `SHOW METHODS` and `DESCRIBE` against the local file registry: the four services and 28 resources, the verb mapping and method order on `domains.domains`, `customer_id` required only when `GODADDY_CUSTOMER_ID` is unset, the `domain_name` alias, the snake_case columns, the pagination and pushdown configuration, the array-body transforms, and that no `x-ext` refs or `customerId` parameters survive. 29 checks.

### Integration tests (mock GoDaddy API - no credentials)

```bash
make test-integration      # add -- --verbose for per-query output
```

Runs the provider against an in-process mock of the GoDaddy API ([tests/integration/mock_godaddy_server.mjs](tests/integration/mock_godaddy_server.mjs)) serving the live wire shapes (bare v1 arrays, `{items, links}` v3 collections, the customer-scoped v2 routes, the error envelopes) and enforcing the bearer credential. The runner materialises a test copy of the registry with every server URL - including the path-level customer template - pointed at the mock, and asserts 28 row-level checks: the bearer header on every request, the v1 marker walk (marker = last domain, stop on the empty page), the v3 link walk for domains and DNS records, `GODADDY_CUSTOMER_ID` resolution vs a `WHERE customer_id` override vs unset, snake_case `WHERE` keys reaching the wire as camelCase, `LIMIT` pushed to `limit` on the suggestion read, the renamed `privacy` parameter, the bare-array bodies emitted by the v1 record writes and the v3 nameserver replacement (with the `Idempotency-Key` header), a v3 record `INSERT` / `UPDATE` / `DELETE` lifecycle, the v1 record read and delete, the v1 domain `UPDATE` with coerced booleans, and the 404 envelope.

### Meta-route test suite

```bash
make test-meta             # start-server / test-meta-routes -- godaddy / stop-server
```

Walks every service, resource and method over a local wire server: 4 services, 28 resources, 67 methods, 26 selectable, 5 write-only resources, no failures.

### Smoke tests (live)

```bash
make smoke                 # local provider: reads + DNS record lifecycles + domain settings
make smoke-live            # the same suite against the published provider (REGISTRY PULL godaddy)
make smoke-read-only       # reads only
make smoke-cleanup         # sweep _stackql-smoke* TXT records from the test domains
```

[tests/smoke_test.py](tests/smoke_test.py) (pystackql) runs against the test domains `enablytics.io` and `enablytics.com.au` (`GODADDY_SMOKE_DOMAINS` to override): read smokes over the domain inventory (v1 marker paging and v3 link paging), domain detail (v1 with registrant contact, v3), DNS records (v3 list with type filter and page size, v1 by type and name), TLDs, agreements, availability and suggestions (v1 and v3), the purchase schema and monthly API usage; then a `_stackql-smoke-<stamp>` TXT record lifecycle through the v3 API (`INSERT`, `SELECT`, `UPDATE`, `DELETE`) and through the v1 bulk API (`EXEC add`, `replace_by_type_name`, `DELETE`), a no-op domain settings `UPDATE` (`renew_auto` to its current value), a bulk availability `EXEC`, and a v3 nameserver replacement that re-sends the current nameservers (GoDaddy answers `422 REDUNDANT_CHANGE`, which proves the wire body and is recorded as a pass; `--with-nameservers` performs a real change and reverts it). The suite sweeps breadcrumbs first, paces at 1.1 s (under 60 requests per minute) and treats a 429 as a harness bug. Nothing is billable: no registration, renewal, transfer or cancellation is ever issued. The Domains v2 read smokes run only when `GODADDY_CUSTOMER_ID` is set.

### UAT

```bash
set -a; source .env; set +a
REG_ROOT="$(pwd)/provider-dev/openapi"
REG="{\"url\":\"file://${REG_ROOT}\",\"localDocRoot\":\"${REG_ROOT}\",\"verifyConfig\":{\"nopVerify\":true}}"
stackql --registry="${REG}" shell
```

```sql
SELECT domain, status, expires, renew_auto FROM godaddy.domains.domains WHERE statuses = 'ACTIVE';
SELECT record_id, name, type, data, ttl FROM godaddy.dns.records_v3 WHERE zone = 'enablytics.io';
SELECT domain, available, price, currency FROM godaddy.registration.availability WHERE domain = 'my-next-domain.com';
```

Two v1 query parameters (`limit`, and `type` on the v1 records) are SQL keywords: `limit` must be quoted in a `WHERE` clause (`"limit" = 10`) or expressed as `LIMIT`; `type` works unquoted in `WHERE` and as an `EXEC` variable.

### CI

[.github/workflows/build-and-test.yml](.github/workflows/build-and-test.yml): pin check (warns on drift) + build + generation-drift check, offline validation, integration tests, meta-route tests and docs generation on every push and PR; the secret-gated live smoke suite on pushes; and a weekly `spec-drift` job that fetches the published specs, compares them with the pin, and opens a `spec-drift` issue when they move. The web workflows build and deploy the microsite from `main`.

## 6. Publish the Provider

Push the `godaddy` dir (`provider-dev/openapi/src/godaddy`) to `providers/src` in a feature branch of [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry) and follow the [registry release flow](https://github.com/stackql/stackql-provider-registry/blob/dev/docs/build-and-deployment.md). Verify against the dev registry, then run `make smoke-live` once published:

```bash
export DEV_REG="{ \"url\": \"https://registry-dev.stackql.app/providers\" }"
stackql --registry="${DEV_REG}" shell
```

```sql
registry pull godaddy;
```

## 7. Generate the Docs

```bash
make docs
```

which runs provider-utils `generate-docs` with `--snake-case-aliases` (the docs show the engine's snake_case surface) over `provider-dev/docgen/provider-data/headerContent1.txt` and `headerContent2.txt` (installation, PAT authentication and the classic-key override, the version naming table, the customer scope, casing, rate limit, and the getting-started queries), then `website/scripts/sanitize-docs.mjs`: escapes angle brackets and braces inside description cells (MDX safety), fixes the rendering of hyphenated parameter aliases (`x-_request-_id` -> `x_request_id`), rewrites `EXEC` example variables to their snake_case aliases, and annotates every customer-scoped `_v2` page with `customer_id` (parameters table, required parameters, examples), which docgen cannot see because it reads document-level server variables only.

## 8. Build the Website

```bash
make website               # cd website && yarn install && yarn build
make website-start         # dev server
```

`website/` is Docusaurus 3.10 on the shared [`stackql/docusaurus-config`](https://github.com/stackql/docusaurus-config), vendored into `website/.shared-config` at install and build time (the `prestart` / `prebuild` scripts). Site-local files are `website/provider.js`, the thin `docusaurus.config.js` wrapper (which switches on `showLastUpdateTime`, so every page carries "Last updated on ..." from git history), `sidebars.js`, the shared components and `static/CNAME` (`godaddy-provider.stackql.io`). The generated docs tree is committed after each refresh so the date stamps reflect it.

## License

MIT

## Contributing

Contributions are welcome. Please open a pull request.
