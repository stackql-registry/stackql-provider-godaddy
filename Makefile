# StackQL godaddy provider build pipeline.
#
# Every step is deterministic and re-runnable; manual mapping decisions live
# in provider-dev/scripts, never in hand-edited artifacts. `make all` runs
# the full chain: fetch/pin the three GoDaddy Domains specs -> split into
# service specs -> mappings -> normalize -> generate -> post-process ->
# offline + integration + meta-route tests -> docs -> website build.
# `make smoke` (live, needs credentials) is separate so `all` never touches
# the account.
#
# Requirements: Node >= 20, GNU make, a stackql binary ($STACKQL, ./stackql
# or on PATH), Python 3 (a venv with pystackql is created on demand for the
# smoke suite), yarn for the website. Runs under Linux / WSL / macOS.
#
# Live credentials for the smoke suite (never committed - .env is
# gitignored; the smoke targets source it if present):
#   GODADDY_API_KEY          Personal Access Token (Bearer)
#   GODADDY_CUSTOMER_ID      optional, customer UUID for the Domains v2 resources
#   GODADDY_SMOKE_DOMAINS    optional, comma-separated test domains (see tests/smoke_test.py)

SHELL := bash
.DEFAULT_GOAL := help

PROVIDER := godaddy
VERSION := v00.00.00000
SERVICES_DIR := provider-dev/openapi/src/$(PROVIDER)
PROVIDER_DIR := $(SERVICES_DIR)/$(VERSION)
SOURCE_DIR := provider-dev/source
CONFIG_DIR := provider-dev/config
WEBSITE_DIR := website
PORT ?= 5444
VENV := .venv
PY := $(VENV)/bin/python
ENV_FILE := .env

.PHONY: help deps fetch-spec refresh-spec split mappings normalize generate post-process build \
        test-offline test-integration test-meta test smoke smoke-live smoke-read-only smoke-cleanup venv \
        docs website website-start start-server stop-server server-status clean all

help: ## show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

deps: ## install node dependencies (latest @stackql/provider-utils per package.json range)
	npm install

# ---------------------------------------------------------------- pipeline

fetch-spec: ## download the three GoDaddy Domains specs and verify them against the pin (fails on drift)
	npm run fetch-spec

refresh-spec: ## download the specs and ACCEPT the upstream change (rewrites the pin - review the diff)
	npm run fetch-spec -- --update

split: ## split and merge the pinned specs into per-service specs (path rules in config/service_names.json)
	npm run split -- --overwrite

mappings: ## regenerate all_services.csv from scratch and apply the deterministic operation mapping rules
	rm -f $(CONFIG_DIR)/all_services.csv
	npm run generate-mappings -- --input-dir $(SOURCE_DIR) --output-dir $(CONFIG_DIR)
	npm run map-operations

normalize: ## generic provider-utils normalize pass, then revert the bare-array wrap (v1/v2 list responses)
	npm run normalize -- --api-dir $(SOURCE_DIR)
	npm run post-normalize -- --api-dir $(SOURCE_DIR)

generate: ## generate the provider (bearer auth, snake_case aliases, naive request body translate)
	rm -rf provider-dev/openapi/*
	npm run generate-provider -- \
	  --provider-name $(PROVIDER) \
	  --input-dir $(SOURCE_DIR) \
	  --output-dir $(SERVICES_DIR) \
	  --config-path $(CONFIG_DIR)/all_services.csv \
	  --servers $(CONFIG_DIR)/servers.json \
	  --provider-config $(CONFIG_DIR)/provider_config.json \
	  --naive-req-body-translate \
	  --overwrite
	$(MAKE) post-process

post-process: ## re-apply generated-provider fixes (v2 customer server, pagination, nativeCasing, resource notes)
	npm run post-process

build: fetch-spec split mappings normalize generate ## full spec -> provider pipeline

# ------------------------------------------------------------------- tests

test-offline: ## quick offline validation against the local file registry (SHOW / DESCRIBE, env var scoping)
	node tests/offline_validation.mjs

test-integration: ## row-level integration tests against the mock GoDaddy API (auth, pagination, v2 scoping, bodies)
	node tests/integration/run_integration_tests.mjs

test-meta: ## meta-route suite against a local stackql server
	bash bin/start-server.sh --provider $(PROVIDER) --registry "$(CURDIR)/provider-dev/openapi" --port $(PORT)
	node bin/test-meta-routes.cjs $(PROVIDER) --port $(PORT); status=$$?; bash bin/stop-server.sh --port $(PORT); exit $$status

test: test-offline test-integration test-meta ## all non-live test layers

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install --quiet --upgrade pip pystackql

venv: $(VENV)/bin/activate ## create the python venv with pystackql for the smoke suite

# The smoke targets source .env when present so a developer checkout works
# without exporting anything; CI sets the variables from secrets. CRLF is
# stripped so a Windows-edited .env cannot leak a \r into the auth header.
with_env = set -a; [ -f $(ENV_FILE) ] && source <(tr -d '\r' < $(ENV_FILE)); set +a;

smoke: venv ## live smoke suite with the locally generated provider - reads + DNS record lifecycle + no-op domain updates
	@$(with_env) $(PY) tests/smoke_test.py

smoke-live: venv ## live smoke suite against the PUBLISHED provider (registry pull; post-publish verification)
	@$(with_env) $(PY) tests/smoke_test.py --live

smoke-read-only: venv ## live smoke suite, read queries only
	@$(with_env) $(PY) tests/smoke_test.py --read-only

smoke-cleanup: venv ## sweep stackql-smoke DNS records from the test domains and exit
	@$(with_env) $(PY) tests/smoke_test.py --cleanup-only

# -------------------------------------------------------------------- docs

docs: ## generate the website docs (snake_case surface), then sanitize for MDX and annotate v2 scoping
	rm -rf $(WEBSITE_DIR)/docs/services $(WEBSITE_DIR)/docs/index.md
	npm run generate-docs -- \
	  --provider-name $(PROVIDER) \
	  --provider-dir ./$(PROVIDER_DIR) \
	  --output-dir ./$(WEBSITE_DIR) \
	  --provider-data-dir ./provider-dev/docgen/provider-data \
	  --snake-case-aliases
	node $(WEBSITE_DIR)/scripts/sanitize-docs.mjs

website: ## build the docusaurus microsite (vendors the shared config first)
	cd $(WEBSITE_DIR) && yarn install && yarn build

website-start: ## run the docusaurus dev server
	cd $(WEBSITE_DIR) && yarn install && yarn start

# ------------------------------------------------------------------ server

start-server: ## start a local stackql server on PORT (default 5444) with the local registry
	bash bin/start-server.sh --provider $(PROVIDER) --registry "$(CURDIR)/provider-dev/openapi" --port $(PORT)

stop-server: ## stop the local stackql server
	bash bin/stop-server.sh --port $(PORT)

server-status: ## show the local stackql server status
	bash bin/server-status.sh --port $(PORT)

clean: ## remove generated artifacts (provider output, docs, website build, test registry copy)
	rm -rf provider-dev/openapi/* $(WEBSITE_DIR)/build $(WEBSITE_DIR)/.docusaurus $(WEBSITE_DIR)/docs/services $(WEBSITE_DIR)/docs/index.md tests/integration/.registry-tmp

all: deps build test docs website ## everything non-live: deps, pipeline, tests, docs, site build
