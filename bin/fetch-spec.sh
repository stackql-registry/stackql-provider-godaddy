#!/usr/bin/env bash

# Downloads the three GoDaddy Domains OpenAPI specs published on the GoDaddy
# Developer Platform (https://developer.godaddy.com/openapi/domains-v{1,2,3}.json)
# into provider-dev/downloaded/, validates each with @apidevtools/swagger-parser,
# and records the fetch date and content hash per spec in
# provider-dev/config/spec_pin.json.
#
# The spec URLs are not versioned beyond the API namespace, so the pin is the
# record of what was built. If a download does not match the recorded pin the
# script fails without writing anything; pass --update to accept the upstream
# change and rewrite the pin (treat the resulting spec diff as a reviewed
# refresh).
#
# Usage: bin/fetch-spec.sh [--update]

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
DOWNLOAD_DIR="$REPO_ROOT/provider-dev/downloaded"
PIN_FILE="$REPO_ROOT/provider-dev/config/spec_pin.json"
SPEC_BASE_URL="https://developer.godaddy.com/openapi"
SPECS="domains-v1 domains-v2 domains-v3"

UPDATE=false
if [ "${1:-}" = "--update" ]; then
  UPDATE=true
fi

mkdir -p "$DOWNLOAD_DIR"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

for spec in $SPECS; do
  echo "Fetching $SPEC_BASE_URL/$spec.json"
  curl -fsSL "$SPEC_BASE_URL/$spec.json" -o "$TMP_DIR/$spec.json"
done

# Validate every spec, verify against the pin (or write it), then move into place.
UPDATE="$UPDATE" TMP_DIR="$TMP_DIR" DOWNLOAD_DIR="$DOWNLOAD_DIR" PIN_FILE="$PIN_FILE" \
SPEC_BASE_URL="$SPEC_BASE_URL" SPECS="$SPECS" \
node "$REPO_ROOT/provider-dev/scripts/record_spec_pin.mjs"

echo "Specs downloaded to $DOWNLOAD_DIR, pin recorded in $PIN_FILE"
