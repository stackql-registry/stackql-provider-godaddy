# CLAUDE.md

## Project

This repository builds and documents the `godaddy` provider for [StackQL](https://github.com/stackql/stackql): SQL query and provisioning over the GoDaddy Domains APIs published on the GoDaddy Developer Platform - registered domain inventory and settings, contacts, nameservers, renewal and cancellation, DNS records, forwarding, registrant changes, privacy forwarding, pending actions and notifications, transfers, availability and pricing, suggestions, TLDs, agreements, purchase and registration, and monthly API usage.

**Scope: the three GoDaddy Domains APIs (v1, v2, v3).** GoDaddy publishes OpenAPI specs for these three namespaces only (`https://developer.godaddy.com/openapi/domains-v{1,2,3}.json`). The other API families on the developer portal (Auctions, Aftermarket, Parking, Shoppers, Subscriptions, Orders, Certificates, Abuse, Agreements, Countries, ANS, Node.js hosting) have no published machine-readable spec, and most of them reject the Personal Access Token in favour of the classic key that GoDaddy is retiring. The previous provider release carried eight of those services from a since-removed swagger bundle; they are retired in this release and recorded as breaking changes in the README. They come back only when GoDaddy publishes a spec for them, through the same pipeline.

The provider is built with `@stackql/provider-utils` and follows the repository pattern of the `clickhouse` and `github` provider repositories in `stackql-registry` (Makefile pipeline, deterministic scripts, offline / integration / meta-route / smoke test layers, Docusaurus microsite on the shared config). When in doubt about structure, mirror those.

## Spec source and pin

`bin/fetch-spec.sh` downloads the three specs into `provider-dev/downloaded/`, validates each with `@apidevtools/swagger-parser` (the vendor `servers` block is substituted for validation only - swagger-parser v12 rejects a `description` on a server variable under its 3.1 schema, and the build replaces servers anyway) and records date, content hash, path and operation counts per spec in `provider-dev/config/spec_pin.json`. A mismatch fails without writing; `--update` (`make refresh-spec`) accepts a reviewed refresh. GoDaddy revises the specs in place, so the pin is the record of what was built.

Known vendor spec facts the pipeline compensates for (all in `provider-dev/scripts/lib/spec_helpers.mjs`):

- v3 keeps shared schemas in a top-level `x-ext` map addressed by hash (and the `Error` entry nests a `definitions` map); they are relocated into `components.schemas` under their component alias or title. stackql's loader cannot resolve `#/x-ext/...`.
- v3 is served relative to `https://api.{env}.com/v3/domains`; every v3 path is rebased under `/v3/domains` so all versions share `https://api.godaddy.com`.
- v3 names its domain path parameter `domain-name`; it is renamed `domain_name` (template and declaration) since provider-utils snake-cases path templates.
- v2 declares no operationIds on 26 of 30 operations; deterministic ids are synthesized from verb and path.
- v1 `GET /v1/domains/agreements` declares its privacy flag as `v1-privacy`; the live API accepts `privacy` (verified) and the parameter is exposed as `privacy`.
- Six operations take a bare JSON array as the request body (v1 bulk DNS record writes, v1 bulk availability, v3 nameservers). stackql builds bodies from named attributes, so each is wrapped in a single-property object in the spec (`records`, `domains`, `nameServers`) and unwrapped on the wire by a request transform added in `post_process.mjs`.
- The published v1 spec omits the `GET /v1/domains/{domain}/records` and `.../records/{type}` reads the live API still serves; only the published surface is mapped. Use `dns.records_v3` for a full zone listing.

## Design principles

- **Bearer auth, one variable.** `GODADDY_API_KEY` holds a GoDaddy Personal Access Token (the `.env` in this checkout carries a 30-day all-scopes PAT for the smoke suite). The name follows the Terraform godaddy providers (`GODADDY_API_KEY`/`GODADDY_API_SECRET`), whose classic key/secret credential GoDaddy is deprecating; the classic `sso-key key:secret` form is documented as an `--auth` override, never the default. The PAT is rejected by the Auctions API and by the legacy non-domain APIs (401), which is part of why they are out of scope.
- **Functional services, versioned resource names.** Four services: `domains`, `dns`, `registration`, `transfers` (path rules in `provider-dev/config/service_names.json`). Within a service, resources served by Domains v1 carry the bare name; resources served by v2 are always suffixed `_v2`, by v3 always `_v3`. The suffix tells the reader the API version, scoping and credential rules, and keeps names stable when a later version adds a resource. Never rename a resource between releases without a Breaking Changes entry.
- **Customer scoping via `x-stackQL-envVar`.** Every Domains v2 customer-scoped path is rebased (post-generation, because normalize strips path-level servers) onto the path-level server template `https://api.godaddy.com/v2/customers/{customer_id}` from `provider-dev/config/customer_server.json`; `customer_id` resolves from `GODADDY_CUSTOMER_ID` when set, is a required parameter otherwise, and a `WHERE customer_id` value always wins. The customer id is a UUID that the PAT cannot look up (`/v1/shoppers` needs the classic key); the `me`/`MY` alias is rejected by v2. `GET /v2/domains/usage/{yyyymm}` is not customer-scoped and stays on the base server.
- **snake_case surface.** `snake_case_aliases: true` on the provider config plus `request.nativeCasing: camel` on every method (post-process): snake WHERE / INSERT / EXEC keys resolve against camelCase and kebab-case wire names (`domain_name`, `x_request_id`, `idempotency_key`), columns present as snake aliases. Nested JSON keeps wire casing.
- **Pagination, three styles.** v1 `domains.list`: `marker` cursor fed from `$[-1:].domain` of the raw response array, ending on the empty page. v3 `domains_v3.list` and `records_v3.list`: `links[rel=next].href` followed verbatim (request token location `request`, the github Link-header mechanism). Method-level config only.
- **Pushdown.** Declared query parameters are the filter pushdown (`statuses`, `status_groups`, `modified_date`, `lifecycle_groups`, `type`, `name`, `page_size`, `includes`). `LIMIT` is pushed to the page-size parameter only on the unpaged reads (`records.list`, `suggestions.list`, `suggestions_v3.list`); pushing it on a paged list shrinks every page and the loop walks the whole collection (measured 34 s vs 5 s). `limit` is a SQL keyword: quote it in WHERE or use LIMIT.
- **Bare arrays stay bare.** provider-utils normalize wraps bare-array responses; `post_normalize.mjs` reverts it (stackql iterates bare arrays natively; the github provider takes the same decision). v3 collections use `objectKey: $.items`.
- **Verbs.** GET collection -> SELECT `list`; GET single -> SELECT `get`; POST create -> INSERT `create`; PATCH/PUT -> UPDATE `update`/`replace` (v3 record PUT requires the full record); DELETE -> DELETE `delete`/`cancel`; every other action -> EXEC (renew, verify, contacts update, nameserver replacement, transfer workflow, validations, bulk checks, the v1 bulk record writes). EXEC syntax: `EXEC res.method @a = 'x', @b = 'y'` (comma-separated); array attributes are passed as JSON strings (`@records = '[...]'`). Booleans in UPDATE are quoted strings (`SET renew_auto = 'false'`) and coerced to the schema type.
- **Rate limit.** 60 requests per minute per credential; the smoke suite paces at 1.1 s and treats a 429 as a harness bug.
- **Deterministic builds.** Every step is a re-runnable script; mapping decisions are rules in `provider-dev/scripts/map_operations.mjs` (one rule per operation, validated: complete, unique, version suffix consistent with the path, distinct select signatures); `provider-dev/config/all_services.csv` is the checked-in record of every operation binding. Scripts validate and fail without writing.

## Toolchain rules

- Latest `@stackql/provider-utils` (0.7.9 at the time of this refresh) and `@stackql/pgwire-lite` (1.0.2); check npm before starting work, never pin an old minor.
- Node >= 20, `type: module`; CLI entry points wrapped as npm scripts invoked through `node`.
- A local `stackql` binary for testing (`$STACKQL`, `./stackql`, or on PATH). Development runs under WSL; use the latest release binary there (`~/.local/bin/stackql`).
- Docusaurus 3.10.x on the shared `stackql/docusaurus-config` (vendored at build time); `showLastUpdateTime` is switched on in `website/docusaurus.config.js`.

## Repository layout

```
provider-dev/
  downloaded/          # pinned spec snapshots (domains-v1/v2/v3.json)
  source/              # split + merged per-service specs (build artifacts, committed)
  config/              # spec_pin.json, service_names.json, servers.json, provider_config.json,
                       # customer_server.json, all_services.csv (operation -> resource/method record)
  openapi/src/godaddy/ # generated provider output
  scripts/             # record_spec_pin, map_operations, post_normalize, post_process, lib/spec_helpers
  docgen/provider-data/# headerContent1.txt, headerContent2.txt (docs landing page)
bin/                   # fetch-spec.sh, split.mjs, server lifecycle scripts, test-meta-routes.cjs
tests/
  offline_validation.mjs        # SHOW / DESCRIBE assertions, env var scoping, generated-doc assertions
  integration/                  # mock GoDaddy API + row-level assertions (no credentials)
  smoke_test.py                 # pystackql live suite (--live for the published provider)
website/               # Docusaurus microsite (shared config, provider.js, scripts/sanitize-docs.mjs)
Makefile               # make all / build / test / smoke / docs / website
```

## Build pipeline

`make all` = deps, fetch-spec (pin check), split, mappings, normalize (+ post-normalize), generate (+ post-process), test-offline, test-integration, test-meta, docs, website. Nothing in `all` touches the account.

1. `make fetch-spec` (or `refresh-spec` to accept drift)
2. `make split` - `bin/split.mjs`: prepare each version, split by path rules, merge per service (component collisions renamed `<Name>_v<N>`)
3. `make mappings` - provider-utils `analyze` then `map_operations.mjs`
4. `make normalize` - provider-utils normalize, then `post_normalize.mjs`
5. `make generate` - provider-utils generate (bearer auth, snake aliases, naive body translate), then `post_process.mjs`
6. `make test` - offline, integration (mock), meta-route
7. `make smoke` / `make smoke-live` / `make smoke-read-only` / `make smoke-cleanup` - live, sources `.env`
8. `make docs` then `make website`

## Tests and the live account

- The smoke suite runs against the test domains `enablytics.io` and `enablytics.com.au` (override with `GODADDY_SMOKE_DOMAINS`). It creates and removes `_stackql-smoke-*` TXT records (v3 CRUD and v1 bulk EXEC), re-applies the current `renew_auto`, runs a bulk availability check, and re-sends the current nameservers through v3 (GoDaddy answers `422 REDUNDANT_CHANGE`, recorded as a pass because the body was accepted). `--with-nameservers` performs a real change and reverts it. Budget is $0: never register, renew, transfer or cancel a domain from a test, and never run tests against domains in real use.
- Domains v2 cannot be smoke-tested without `GODADDY_CUSTOMER_ID`; the mock integration suite covers the URL construction and env var resolution instead.

## Writing conventions

- README and docs copy: measured, precise, no hyperbole. No em dashes (use `-`), no characters that are not on a QWERTY keyboard, `->` for arrows.
- Sample queries are runnable against the test account; nested fields use `json_extract`.

## Non-negotiables

1. Latest `@stackql/provider-utils`, always
2. Deterministic scripts, never hand-edits to derived artifacts (CSV, source specs, generated provider, docs)
3. Every regeneration is followed by `make test` before commit; `all_services.csv` diffs are reviewed for renames
4. Resource names are stable: bare = v1, `_v2`, `_v3`; a rename is a documented breaking change
5. The smoke suite is non-billable and cleans up everything it creates
6. The PAT in `.env` is never committed and never printed
