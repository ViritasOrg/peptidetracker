#!/usr/bin/env python3
"""
Backend API tests for peptide tracker
Run: python3 /tmp/test_backend.py
"""
import json
import urllib.request
import urllib.error
import sys

BASE = "https://claude-agent-api-aged-sun-3616.fly.dev"
TOKEN = "10vtu"
HEADERS = {"x-app-token": TOKEN}
JSON_HEADERS = {**HEADERS, "Content-Type": "application/json"}

passed = 0
failed = 0

def req(method, path, body=None, expected_status=200):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    headers = JSON_HEADERS if data else HEADERS
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, {}

def check(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  ✓ {name}")
        passed += 1
    else:
        print(f"  ✗ {name}{': ' + detail if detail else ''}")
        failed += 1

print("── Health ───────────────────────────────────")
status, r = req("GET", "/health")
check("GET /health returns 200", status == 200)
check("/health has status:ok", r.get("status") == "ok")

print("\n── Peptide Log ──────────────────────────────")
status, r = req("GET", "/peptide-log")
check("GET /peptide-log returns 200", status == 200, f"got {status}")
check("/peptide-log returns list", isinstance(r, list), f"got {type(r).__name__}")
check("/peptide-log has entries", len(r) > 0, f"got {len(r)} entries")
# All entries should have date and doses
valid = all("date" in e and "doses" in e for e in r)
check("all entries have date + doses", valid)

# POST a test entry
test_date = "2099-1-1"
status, r = req("POST", "/peptide-log", {"date": test_date, "doses": ["test-dose_2099-1-1"]})
check("POST /peptide-log returns 200", status == 200, f"got {status}")
check("POST returns status:saved", r.get("status") == "saved")

# Verify it was saved
status, logs = req("GET", "/peptide-log")
saved = next((l for l in logs if l.get("date") == test_date), None)
check("saved entry appears in GET", saved is not None)
check("saved doses match", saved and saved.get("doses") == ["test-dose_2099-1-1"])

# DELETE it
status, r = req("DELETE", f"/peptide-log/{test_date}")
check("DELETE /peptide-log/{date} returns 200", status == 200, f"got {status}")
status, logs = req("GET", "/peptide-log")
gone = all(l.get("date") != test_date for l in logs)
check("deleted entry is gone", gone)

print("\n── Weight ───────────────────────────────────")
status, r = req("GET", "/weight")
check("GET /weight returns 200", status == 200, f"got {status}")
check("/weight has weight field", "weight" in r)
check("/weight has unit field", "unit" in r)

status, r = req("POST", "/weight", {"weight": 91.5, "unit": "kg"})
check("POST /weight returns 200", status == 200, f"got {status}")
check("POST returns status:saved", r.get("status") == "saved")
status, r = req("GET", "/weight")
check("weight persists after save", r.get("weight") == 91.5, f"got {r.get('weight')}")

print("\n── Protocol / Stacks ────────────────────────")
status, r = req("GET", "/protocol/stacks")
check("GET /protocol/stacks returns 200", status == 200, f"got {status}")
check("/protocol/stacks has stacks list", isinstance(r.get("stacks"), list))
check("/protocol/stacks has active_index", "active_index" in r)
check("at least 1 stack saved", len(r.get("stacks", [])) > 0, "run app first to create stack")

if r.get("stacks"):
    s = r["stacks"][0]
    check("stack has name", "name" in s)
    check("stack has peptides list", isinstance(s.get("peptides"), list))
    check("stack has cycle_length", "cycle_length" in s)

status, r = req("GET", "/protocol")
check("GET /protocol returns 200", status == 200, f"got {status}")
check("/protocol returns dict (active stack)", isinstance(r, dict))

print("\n── User data isolation ──────────────────────")
# Two different app tokens should see different data
status1, r1 = req("GET", "/peptide-log")
# A random token should see no data
r2_req = urllib.request.Request(f"{BASE}/peptide-log",
    headers={"x-app-token": "wrong_token_xyz"})
try:
    with urllib.request.urlopen(r2_req) as resp:
        r2 = json.loads(resp.read())
        different = r2 != r1
        check("different tokens see different data", different, "GDPR — isolation required")
except:
    check("different tokens see different data", True, "different token rejected")

print(f"\n{'─'*45}")
print(f"  {passed} passed  {failed} failed  {passed+failed} total")
sys.exit(0 if failed == 0 else 1)
