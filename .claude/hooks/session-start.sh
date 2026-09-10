#!/bin/bash
# SessionStart hook — peptidetracker (PRODUCTION)
#
# WHY (2026-09-10). A session diagnosed a T-Calc number from index.html alone, concluded it
# was unexplainable, and reverse-engineered the whole free-T curve — while the model
# constants AND the user's own bloodwork were one API call away in the backend. Nothing in
# this repo said the data was reachable. The same session also rebuilt a change the backend
# docs explicitly rule out, because nothing here pointed at them.
#
# The rules below are already in CLAUDE.md. This puts the ones that keep being missed into
# context before the first tool call, which is where they are needed.
set -euo pipefail

# No dependencies: single-file frontend, CI runs node --check + tests/test_frontend.js on
# plain Node 20. Nothing to install.

cat <<'BANNER'
════════ peptidetracker — THIS IS PRODUCTION ════════

1. READ-ONLY. Never create branches, commit, push, open PRs or merge here on your
   own initiative — not for "obvious" fixes, hotfixes, or anything CI-related.
   Changes reach prod ONLY via (a) Henrik saying so IN THAT TURN — authorisation
   does not carry over — or (b) the staging→prod promotion pipeline, whose PRs you
   must never merge without his go-ahead in the moment.
   The repo you may freely change is peptidetracker-staging.

2. THE DATA IS IN THE BACKEND, AND YOU CAN READ IT. Compound/PK parameters,
   reference ranges, catalogues and ALL user data live in claude-agent-backend and
   are served by API. Attach it (add_repo ViritasOrg/claude-agent-backend). Henrik's
   own records are readable read-only:
     curl -H "x-api-secret: $API_SECRET_RO" \
       https://claude-agent-api-aged-sun-3616.fly.dev/bloodwork
   (also /injections, /systemic-interactions, /trt-catalog). NEVER widen it, never
   write with it. Do not reverse-engineer a number that is one call away.

3. THE FREE-T MODEL GAP IS KNOWN AND OPEN. It runs ~1.5x above Bhasin 2001
   (PMID 11701431) trough-to-nadir. BOTH sides are sourced and the gap is
   dose-dependent, so no fixed factor closes it. Read
   claude-agent-backend/docs/enhanced-bodybuilding/17-the-model-vs-measured-gap.md
   before forming an opinion.
   ⚠️ Always compare TROUGH to NADIR — comparing a weekly MEAN against a nadir
   overstates it by ~a third. Made twice, on consecutive days.
   ⚠️ The 2026-06-26 bloodwork is NOT a clean baseline; anything derived from it
   inherits that.
   ⚠️ A red model test means REVERT — never rewrite the test to match your change.

4. SCOPE. Fix exactly what was asked. "My fix made it redundant" is not permission
   to remove anything. One PR = one requested change.

Henrik runs this as an installed iOS PWA — never give browser hard-reload or
clear-cache instructions.

TESTS: node tests/test_frontend.js index.html
═════════════════════════════════════════════════════
BANNER
