#!/usr/bin/env python3
"""pystackql smoke test for the godaddy stackql provider.

Exercises the most common read and mutation operations against a real
GoDaddy account, the way the Terraform godaddy providers use the API (domain
records, addresses, nameservers, domain settings):

  reads      - domain inventory (v1, marker paging) and the v3 list (link
               paging), domain detail by name (v1 and v3), DNS records
               (v3 list, v1 by type and name), TLDs, agreements, availability
               and suggestions (v1 and v3), purchase schema, monthly API usage
  mutations  - a TXT record lifecycle through the v3 API (INSERT, SELECT,
               UPDATE, DELETE) and through the v1 bulk API (EXEC add,
               replace_by_type_name, DELETE), a no-op domain settings UPDATE
               (renew_auto set to its current value), a bulk availability
               EXEC, and a nameserver update through the v3 API that re-sends
               the current nameservers (GoDaddy answers 422 REDUNDANT_CHANGE,
               which proves the wire body and is recorded as a pass;
               --with-nameservers performs a real change and reverts it)

Every record the suite creates is named `_stackql-smoke-<stamp>`; before
running, the suite sweeps `_stackql-smoke*` TXT records from the test
domains so a failed run cannot leave breadcrumbs past the next run. Nothing
here registers, renews, transfers or cancels a domain, and nothing is
billable: the budget is $0.

Credentials and targets come from the environment, exactly as the provider
reads them (the Makefile sources .env):

    export GODADDY_API_KEY=gd_...            # Personal Access Token (Bearer)
    export GODADDY_SMOKE_DOMAINS=a.com,b.io  # optional; default enablytics.io,enablytics.com.au
    export GODADDY_CUSTOMER_ID=<uuid>        # optional; enables the Domains v2 read smokes

Rate limiting: 60 requests per minute per credential. Statements are paced
by INTER_REQUEST_DELAY_S; a 429 is a harness bug and fails the run.

Usage:
    pip install pystackql
    python tests/smoke_test.py                    # local registry (provider-dev/openapi)
    python tests/smoke_test.py --live             # published provider (REGISTRY PULL godaddy)
    python tests/smoke_test.py --read-only        # read smokes only
    python tests/smoke_test.py --cleanup-only     # sweep breadcrumbs and exit
    python tests/smoke_test.py --with-nameservers # real nameserver change + revert (v3, async)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import uuid
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SMOKE_PREFIX = "_stackql-smoke"
INTER_REQUEST_DELAY_S = 1.1  # < 60 requests per minute with margin
DEFAULT_DOMAINS = "enablytics.io,enablytics.com.au"
# x-stackQL-envVar server variables (GODADDY_CUSTOMER_ID) and request
# transforms need a current stackql; pystackql manages its own binary.
MIN_STACKQL_VERSION = (0, 11, 600)

ERROR_RE = re.compile(
    r"http response status code: [45]|over HTTP error|error assembling|"
    r"cannot find matching operation|FindRoute|no matching operation|"
    r"cannot find any viable servers|parser error|panic|"
    r"no request body for operation|schema unsuitable|UNAUTHORIZED|FORBIDDEN|ACCESS_DENIED",
    re.I,
)
RATE_LIMIT_RE = re.compile(r"status code: 429|TOO_MANY_REQUESTS|rate limit", re.I)
REDUNDANT_RE = re.compile(r"REDUNDANT_CHANGE|No update is required", re.I)


class Smoke:
    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.stamp = str(int(time.time()))[-6:]
        self.name = f"{SMOKE_PREFIX}-{self.stamp}"
        self.domains = [d.strip() for d in os.environ.get("GODADDY_SMOKE_DOMAINS", DEFAULT_DOMAINS).split(",") if d.strip()]
        self.results: list[tuple[str, str, str]] = []
        self.requests = 0

        if not os.environ.get("GODADDY_API_KEY"):
            sys.exit("GODADDY_API_KEY is not set - see the module docstring")
        # a stray \r (Windows-edited .env) silently breaks the auth header
        os.environ["GODADDY_API_KEY"] = os.environ["GODADDY_API_KEY"].strip()

        from pystackql import StackQL

        if args.live:
            self.sq = StackQL(output="dict")
        else:
            reg_path = (BASE_DIR / "provider-dev" / "openapi").resolve()
            reg_url = "file://" + reg_path.as_posix()
            self.sq = StackQL(output="dict", custom_registry=reg_url)
            # pystackql only serialises {"url": ...}; a local file registry
            # additionally needs localDocRoot + nopVerify - patch the exec
            # params in place (compact JSON, shell-quoted).
            full = json.dumps(
                {"url": reg_url, "localDocRoot": reg_path.as_posix(), "verifyConfig": {"nopVerify": True}},
                separators=(",", ":"),
            )
            if sys.platform.startswith("win"):
                quoted = '"' + full.replace('"', '\\"') + '"'
            else:
                import shlex
                quoted = shlex.quote(full)
            params = self.sq.local_query_executor.params
            for i, p in enumerate(params):
                if p == "--registry":
                    params[i + 1] = quoted
                    break
        self.ensure_stackql_version()
        if args.live:
            print("pulling the published godaddy provider")
            self.sq.executeStmt("REGISTRY PULL godaddy")

    def ensure_stackql_version(self) -> None:
        def parse(v: str) -> tuple[int, ...]:
            return tuple(int(x) for x in re.findall(r"\d+", str(v))[:3])

        current = parse(getattr(self.sq, "version", "") or "")
        if current and current >= MIN_STACKQL_VERSION:
            return
        print(f"stackql {self.sq.version} at {self.sq.bin_path} is older than "
              f"v{'.'.join(map(str, MIN_STACKQL_VERSION))} - upgrading pystackql's binary")
        self.sq.upgrade(showprogress=False)
        if parse(self.sq.version) < MIN_STACKQL_VERSION:
            sys.exit(f"stackql {self.sq.version} is still too old after upgrade")

    # ------------------------------------------------------------------ core
    def q(self, sql: str):
        if self.requests:
            time.sleep(INTER_REQUEST_DELAY_S)
        self.requests += 1
        try:
            if sql.lstrip().upper().startswith(("SELECT", "SHOW", "DESCRIBE")):
                out = self.sq.execute(sql)
            else:
                out = self.sq.executeStmt(sql)
        except Exception as exc:  # noqa: BLE001
            return [], str(exc)
        text = json.dumps(out, default=str)
        if RATE_LIMIT_RE.search(text):
            return out if isinstance(out, list) else [out], "RATE LIMITED (429) - harness pacing bug: " + text
        if ERROR_RE.search(text):
            return out if isinstance(out, list) else [out], text
        if isinstance(out, list) and out and isinstance(out[0], dict) and "error" in out[0]:
            return out, text
        return out if isinstance(out, list) else [out], None

    def step(self, name: str, sql: str, expect_rows: bool = False, contains: str | None = None, min_rows: int = 0):
        rows, err = self.q(sql)
        if err:
            self.results.append((name, "FAIL", err[:200]))
            print(f"  FAIL  {name}  [{err[:140]}]")
            return None
        blob = json.dumps(rows, default=str)
        if (expect_rows and not rows) or len(rows) < min_rows:
            self.results.append((name, "FAIL", f"expected rows (min {max(min_rows, 1)}), got {len(rows)}"))
            print(f"  FAIL  {name}  [{len(rows)} rows]")
            return None
        if contains and contains not in blob:
            self.results.append((name, "FAIL", f"'{contains}' not in result"))
            print(f"  FAIL  {name}  ['{contains}' not in {blob[:100]}]")
            return None
        self.results.append((name, "PASS", ""))
        print(f"  PASS  {name}")
        return rows

    def record(self, name: str, ok: bool, note: str = "") -> None:
        self.results.append((name, "PASS" if ok else "FAIL", note))
        print(f"  {'PASS' if ok else 'FAIL'}  {name}{'' if ok else '  [' + note[:140] + ']'}")

    # ------------------------------------------------------- breadcrumb sweep
    def cleanup_breadcrumbs(self) -> None:
        print("== breadcrumb sweep ==")
        for domain in self.domains:
            rows, err = self.q(f"SELECT record_id, name FROM godaddy.dns.records_v3 WHERE zone = '{domain}' AND type = 'TXT'")
            if err:
                print(f"  WARN record sweep list failed for {domain}: {err[:120]}")
                continue
            for r in rows:
                if str(r.get("name", "")).startswith(SMOKE_PREFIX):
                    print(f"  sweeping {domain} TXT {r['name']}")
                    self.q(f"DELETE FROM godaddy.dns.records_v3 WHERE zone = '{domain}' AND record_id = '{r['record_id']}'")

    # -------------------------------------------------------------- read path
    def read_smokes(self) -> None:
        print("== read smokes ==")
        d0 = self.domains[0]
        self.step("show services", "SHOW SERVICES IN godaddy", expect_rows=True, contains="domains")
        self.step("domain inventory (v1, marker paging)", "SELECT domain, status, expires, renew_auto FROM godaddy.domains.domains", expect_rows=True, contains=d0)
        self.step("active domains only (statuses pushed down)", "SELECT domain, expires FROM godaddy.domains.domains WHERE statuses = 'ACTIVE'", expect_rows=True)
        self.step("domain detail with registrant contact (v1)",
                  f"SELECT domain, status, name_servers, json_extract(contact_registrant, '$.email') AS registrant_email FROM godaddy.domains.domains WHERE domain = '{d0}'",
                  expect_rows=True, contains=d0)
        self.step("domain inventory (v3, link paging)", "SELECT domain, status, expires_at, auto_renew FROM godaddy.domains.domains_v3 WHERE page_size = 10", expect_rows=True, contains=d0)
        self.step("domain detail (v3, domain_name)", f"SELECT domain, status, name_servers, transfer_lock FROM godaddy.domains.domains_v3 WHERE domain_name = '{d0}'", expect_rows=True, contains=d0)
        self.step("DNS records (v3, record ids)", f"SELECT record_id, name, type, data, ttl FROM godaddy.dns.records_v3 WHERE zone = '{d0}'", expect_rows=True, contains="record_id")
        self.step("DNS records by type (v3, type pushed down, page_size 2)", f"SELECT name, type, data FROM godaddy.dns.records_v3 WHERE zone = '{d0}' AND type = 'NS' AND page_size = 2", expect_rows=True, contains="NS")
        self.step("DNS records by type and name (v1)", f"SELECT name, type, data, ttl FROM godaddy.dns.records WHERE domain = '{d0}' AND type = 'NS' AND name = '@'", expect_rows=True)
        self.step("TLDs", "SELECT name, type FROM godaddy.registration.tlds", min_rows=100, contains="com")
        self.step("agreements for .com", "SELECT agreement_key, title FROM godaddy.registration.agreements WHERE tlds = 'com' AND privacy = false", expect_rows=True, contains="DNRA")
        probe = f"stackql-smoke-{self.stamp}.com"
        self.step("availability (v1)", f"SELECT domain, available, price, currency FROM godaddy.registration.availability WHERE domain = '{probe}'", expect_rows=True, contains=probe)
        self.step("availability (v3, prices)", f"SELECT domain, available, inventory, json_extract(prices, '$[0].price.value') AS first_year FROM godaddy.registration.availability_v3 WHERE domain = '{probe}'", expect_rows=True, contains=probe)
        self.step("suggestions (v1, LIMIT pushed down)", "SELECT domain FROM godaddy.registration.suggestions WHERE query = 'stackql' LIMIT 3", expect_rows=True)
        self.step("suggestions (v3)", "SELECT domain, inventory FROM godaddy.registration.suggestions_v3 WHERE query = 'stackql' AND page_size = 3", expect_rows=True)
        self.step("purchase schema for .com", "SELECT id, required FROM godaddy.registration.purchase_schemas WHERE tld = 'com'", expect_rows=True, contains="DomainPurchase")
        yyyymm = time.strftime("%Y-%m")
        self.step("monthly API usage (v2, not customer-scoped)", f"SELECT yyyymm, total FROM godaddy.domains.api_usage_v2 WHERE yyyymm = '{yyyymm}'", expect_rows=True, contains=yyyymm)
        if os.environ.get("GODADDY_CUSTOMER_ID"):
            self.step("pending actions (v2, GODADDY_CUSTOMER_ID)", f"SELECT type, origination, status FROM godaddy.domains.actions_v2 WHERE domain = '{d0}'")
            self.step("domain detail (v2)", f"SELECT domain, status FROM godaddy.domains.domains_v2 WHERE domain = '{d0}'", expect_rows=True)
        else:
            print("  SKIP  Domains v2 reads (GODADDY_CUSTOMER_ID not set)")

    # ------------------------------------------------------------- write path
    def record_lifecycle_v3(self, domain: str) -> None:
        name = self.name
        print(f"== v3 DNS record lifecycle ({domain} TXT {name}) ==")
        self.step("record INSERT (v3)", f"INSERT INTO godaddy.dns.records_v3 (zone, name, type, data, ttl) SELECT '{domain}', '{name}', 'TXT', 'stackql smoke {self.stamp}', 600")
        rows = self.step("record visible after INSERT", f"SELECT record_id, data, ttl FROM godaddy.dns.records_v3 WHERE zone = '{domain}' AND type = 'TXT' AND name = '{name}'", expect_rows=True, contains=f"stackql smoke {self.stamp}")
        if not rows:
            return
        rid = rows[0]["record_id"]
        self.step("record UPDATE (v3 PUT, full record)", f"UPDATE godaddy.dns.records_v3 SET name = '{name}', type = 'TXT', data = 'stackql smoke {self.stamp} updated', ttl = 900 WHERE zone = '{domain}' AND record_id = '{rid}'")
        self.step("record reflects UPDATE", f"SELECT data, ttl FROM godaddy.dns.records_v3 WHERE zone = '{domain}' AND type = 'TXT' AND name = '{name}'", expect_rows=True, contains="updated")
        self.step("record DELETE (v3)", f"DELETE FROM godaddy.dns.records_v3 WHERE zone = '{domain}' AND record_id = '{rid}'")
        rows, err = self.q(f"SELECT record_id FROM godaddy.dns.records_v3 WHERE zone = '{domain}' AND type = 'TXT' AND name = '{name}'")
        self.record("record gone after DELETE", not err and not rows, err or json.dumps(rows))

    def record_lifecycle_v1(self, domain: str) -> None:
        name = f"{self.name}-v1"
        print(f"== v1 bulk DNS record lifecycle ({domain} TXT {name}) ==")
        self.step("records EXEC add (v1, array body)", f"EXEC godaddy.dns.records.add @domain = '{domain}', @records = '[{{\"type\": \"TXT\", \"name\": \"{name}\", \"data\": \"v1 {self.stamp}\", \"ttl\": 600}}]'")
        self.step("record visible (v1 by type and name)", f"SELECT name, data, ttl FROM godaddy.dns.records WHERE domain = '{domain}' AND type = 'TXT' AND name = '{name}'", expect_rows=True, contains=f"v1 {self.stamp}")
        self.step("records EXEC replace_by_type_name (v1)", f"EXEC godaddy.dns.records.replace_by_type_name @domain = '{domain}', @type = 'TXT', @name = '{name}', @records = '[{{\"data\": \"v1 {self.stamp} replaced\", \"ttl\": 900}}]'")
        self.step("record reflects replace", f"SELECT data, ttl FROM godaddy.dns.records WHERE domain = '{domain}' AND type = 'TXT' AND name = '{name}'", expect_rows=True, contains="replaced")
        self.step("record DELETE (v1 by type and name)", f"DELETE FROM godaddy.dns.records WHERE domain = '{domain}' AND type = 'TXT' AND name = '{name}'")
        rows, err = self.q(f"SELECT name FROM godaddy.dns.records WHERE domain = '{domain}' AND type = 'TXT' AND name = '{name}'")
        self.record("record gone after DELETE (v1)", not err and not rows, err or json.dumps(rows))

    def domain_settings(self, domain: str) -> None:
        print(f"== domain settings ({domain}) ==")
        rows = self.step("read current settings", f"SELECT renew_auto, locked, name_servers FROM godaddy.domains.domains WHERE domain = '{domain}'", expect_rows=True)
        if not rows:
            return
        current = str(rows[0].get("renew_auto")).lower()
        self.step("domain UPDATE (v1 PATCH, renew_auto to its current value)", f"UPDATE godaddy.domains.domains SET renew_auto = '{current}' WHERE domain = '{domain}'")
        self.step("settings unchanged", f"SELECT renew_auto FROM godaddy.domains.domains WHERE domain = '{domain}'", expect_rows=True, contains=current)
        self.step("bulk availability EXEC (v1, array body)",
                  f"SELECT * FROM (EXEC godaddy.registration.availability.check_bulk @domains = '[\"stackql-smoke-{self.stamp}-a.com\", \"stackql-smoke-{self.stamp}-b.com\"]')",
                  expect_rows=True, contains="available")
        try:
            nameservers = json.loads(rows[0].get("name_servers") or "[]")
        except (TypeError, ValueError):
            nameservers = []
        if len(nameservers) < 2:
            self.record("nameserver update (v3)", False, f"domain has fewer than two nameservers: {nameservers}")
            return
        ns_json = json.dumps(nameservers)
        sql = (f"EXEC godaddy.domains.domains_v3.update_nameservers @domain_name = '{domain}', "
               f"@idempotency_key = '{uuid.uuid4()}', @name_servers = '{ns_json}'")
        _, err = self.q(sql)
        if err and REDUNDANT_RE.search(err):
            self.record("nameserver update (v3, same nameservers -> 422 REDUNDANT_CHANGE, body accepted)", True)
        elif err:
            self.record("nameserver update (v3, same nameservers)", False, err)
        else:
            self.record("nameserver update (v3, same nameservers accepted)", True)
        if self.args.with_nameservers:
            swapped = json.dumps(list(reversed(nameservers)))
            print("  real nameserver change: reversed order, then revert (async operations)")
            for label, body in (("change", swapped), ("revert", ns_json)):
                rows2, err2 = self.q(f"SELECT * FROM (EXEC godaddy.domains.domains_v3.update_nameservers @domain_name = '{domain}', "
                                     f"@idempotency_key = '{uuid.uuid4()}', @name_servers = '{body}')")
                if err2 and REDUNDANT_RE.search(err2):
                    self.record(f"nameserver {label} (order-insensitive: REDUNDANT_CHANGE)", True)
                    continue
                if err2:
                    self.record(f"nameserver {label}", False, err2)
                    continue
                op = (rows2[0] or {}).get("operation_id") if rows2 else None
                self.record(f"nameserver {label} accepted (operation {op})", bool(op), json.dumps(rows2)[:120])
                if op:
                    self.step(f"operation status ({label})", f"SELECT operation_id, type, status FROM godaddy.domains.operations_v3 WHERE operation_id = '{op}'", expect_rows=True)
                    time.sleep(5)

    # ---------------------------------------------------------------- summary
    def summary(self) -> int:
        print("\n== summary ==")
        counts = {"PASS": 0, "FAIL": 0}
        for name, status, note in self.results:
            counts[status] = counts.get(status, 0) + 1
            if status != "PASS":
                print(f"  {status:5s} {name}  [{note[:110]}]")
        mode = "published provider" if self.args.live else "local registry"
        print(f"  {counts['PASS']} passed, {counts['FAIL']} failed; {self.requests} statements, paced at {INTER_REQUEST_DELAY_S}s ({mode})")
        return 1 if counts["FAIL"] else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="godaddy provider smoke test")
    ap.add_argument("--live", action="store_true", help="run against the published provider (REGISTRY PULL godaddy) instead of provider-dev/openapi")
    ap.add_argument("--cleanup-only", action="store_true", help="sweep _stackql-smoke* TXT records from the test domains and exit")
    ap.add_argument("--read-only", action="store_true", help="read smokes only")
    ap.add_argument("--with-nameservers", action="store_true", help="also perform a real nameserver change (reversed order) and revert it")
    args = ap.parse_args()

    smoke = Smoke(args)
    print(f"godaddy smoke test  mode={'live' if args.live else 'local'}  domains={','.join(smoke.domains)}  "
          f"name={smoke.name}  stackql={smoke.sq.version}")
    smoke.cleanup_breadcrumbs()
    if args.cleanup_only:
        return 0
    smoke.read_smokes()
    if not args.read_only:
        smoke.record_lifecycle_v3(smoke.domains[0])
        smoke.record_lifecycle_v1(smoke.domains[-1])
        smoke.domain_settings(smoke.domains[0])
    return smoke.summary()


if __name__ == "__main__":
    sys.exit(main())
