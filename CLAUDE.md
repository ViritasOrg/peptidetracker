# Peptide Tracker — Claude Instructions

## Verify before you speak (Henrik's standing rule)

- Before telling Henrik a cause, a fix, or a step to take, check the facts yourself first: read the config, logs, code, settings or live state. Never present a guess as the answer.
- Never send him to repeat something he may already have done; check whether it is already done first.
- If something can't be verified, say exactly what is unverified, instead of giving an instruction built on an assumption.
- If you notice you'd have to write "let me find the actual cause instead of guessing", you already broke this rule: the checking belongs before the first answer, not after he pushes back.


## Answer first (Henrik, 2026-10-10)

- **Answer first, then say what you will do before doing it** ("You're right. I'll answer first and say what I'm doing before I start."). A question gets its answer in the first lines, before any tool call. Before starting any work (a workflow, a PR, a deploy, waiting on CI), say in one line what you are about to do and why; never disappear into tool calls on a simple question.
- **Every request carries context** (Henrik, 2026-10-10: "add context to requests so I have a clue what you are talking about"). When you ask Henrik to do or check something, say what it is for, where it fits in the overall task (step N of what), and what he should see when it worked. Never a bare instruction that assumes he remembers the thread.
- **Every step Henrik must do comes with its commands, in the same message** (Henrik, 2026-10-10: "you must always provide detailed instructions and commands for stuff like this"). When a reply mentions anything he will have to do (merge, deploy, change a config, restart, check), give the full instructions and the exact, complete, copy-paste commands right there, saying which machine each runs on. Never "I'll give you the command when…" or "deploy as usual": he should never have to ask for the how.

## 🔒 PROD IS READ-ONLY — DO NOT TOUCH WITHOUT EXPLICIT PERMISSION
This repo (`peptidetracker`) is **PRODUCTION**. Claude may read, inspect, and
diagnose anything here freely (view files, check workflow runs, look at commit
history, etc.) but must **NEVER** create branches, commit, push, open PRs, or
merge into this repo on its own initiative — not even for "obvious" fixes,
hotfixes, or anything CI-related.

The **only** repo Claude may freely make changes to in this app pair is
`peptidetracker-staging`.

Changes only reach this repo via:
1. **Henrik explicitly tells Claude, in that specific conversation turn, to make
   a change directly to prod.** Authorization does not carry over to future
   turns or sessions — ask again next time.
2. **The staging → prod promotion pipeline**: Henrik clicks "Push to Prod" in
   the staging app's Settings UI, which fires a `repository_dispatch` event
   running `.github/workflows/promote-to-prod.yml` on `peptidetracker-staging`.
   That workflow opens a PR on this repo. Claude must still **never merge that
   PR** without Henrik's explicit go-ahead in the moment.

This rule exists because on 2026-06-16 Claude bypassed the agreed workflow by
directly hand-editing prod's `index.html` locally instead of working through
staging and the promotion pipeline. Never repeat that.

## 🔒 ALL DATA LIVES IN THE BACKEND — AND YOU CAN READ IT 🔒
**Every compound/PK parameter, reference range, baseline, catalogue entry and all user
data lives in `ViritasOrg/claude-agent-backend` and is served to this app by API at
runtime. This repo holds almost no data of its own.**

Sessions have repeatedly diagnosed this app from `index.html` alone and concluded a
number was unexplainable, when the number came from the backend and was readable all
along (2026-09-09: a whole session spent reverse-engineering a free-T curve before
discovering both the model constants and Henrik's own bloodwork were one API call away).

- **Attach the backend repo** (`add_repo` → `ViritasOrg/claude-agent-backend`). Research
  and reference docs live in its `docs/enhanced-bodybuilding/`; served constants live in
  `routers/systemic_interactions.py`, `citations.py` and `routers/lab_markers.py`.
- **Henrik's real data is readable.** `API_SECRET_RO` is a read-only admin credential in
  the session environment; `GET https://claude-agent-api-aged-sun-3616.fly.dev/<endpoint>`
  with header `x-api-secret: $API_SECRET_RO` serves `/bloodwork`, `/injections`,
  `/systemic-interactions`, `/trt-catalog` and the rest. **READ-ONLY — never try to
  widen it, never write with it.**
- Henrik uses **prod** for real, so prod is where examples and bug reports come from. The
  data behind them is in the backend regardless of which frontend raised it.
- **Never hardcode data into this repo.** New data goes to the backend first.

## ⛔ THE FREE-T MODEL AND ITS KNOWN GAP — READ BEFORE TOUCHING THE CURVE ⛔
**Do NOT "fix" it. Read `docs/enhanced-bodybuilding/17-the-model-vs-measured-gap.md` in
the backend first.**

The model runs ~1.5× above Bhasin 2001 (PMID 11701431) compared trough-to-nadir.
**Both sides are sourced** — the model is clearance arithmetic matching the literature
MCR (1,240 L/day, PMID 6025489) against a 3–10 mg/day production rate — so it is a
disagreement between published figures, not a bug. The gap is **dose-dependent**
(1.62× at 25 mg/wk → 1.37× at 300), so **no fixed factor reproduces it**.

⚠️ **Always compare TROUGH to NADIR.** Bhasin reports mean *nadir*. Comparing a weekly
*mean* against it overstates the disagreement by about a third — a mistake made twice,
on consecutive days.

⚠️ **The 2026-06-26 bloodwork is NOT a clean baseline.** It was taken under acute
conditions that depress testosterone, so it understates the true unmedicated level by an
unknown amount. Anything derived from it inherits that.

**A red model test means REVERT your change — never rewrite the test to match what you
just did.** If you think a settled value is genuinely wrong, say so in your reply and let
Henrik decide.

**The model here is the population dose-response slope with a personal offset**, promoted
from staging on 2026-09-10 (#369, v1.314). It is no longer anchored on the user's own
draw. See `TCALC_TT_PER_MGD` in `tab-tcalc.js` for why, and backend doc 17 for what that
change did NOT fix.

## ⚠️ UI CONSISTENCY — ALL COMPOUND TIERS MUST BE IDENTICAL ⚠️
Every compound tier (Peptides, TRT, Enhanced) must have **exactly the same UI features**. If one tier shows dose recommendations, all tiers must show dose recommendations. If one shows an info card, all must. If you add a UI element to one tier, immediately add it to all others in the same session.

**Non-negotiable parity rules:**
- Dose guidance shown in BOTH the add-compound modal AND the edit/configure view for every tier
- Unit dropdowns must include all units used by any compound in that tier (e.g. `IU/day`, `IU/week` for GH Axis; `mg/week`, `mg/day`, `mg/EOD` for androgens)
- Info cards (mechanism, side effects) shown consistently across all three tiers
- No tier may have a feature that another tier is silently missing

When a new compound tier feature is added, check all other tiers before closing the PR.

## ⚠️ AUTH WARNING — READ BEFORE TOUCHING ANY AUTH CODE ⚠️
**PIN/passcode auth has been PERMANENTLY REMOVED.** Google Sign-In is the ONLY
end-user authentication method across this entire ecosystem (peptidetracker,
peptidetracker-staging, workout, workout-staging, claude-agent-backend). The
whitelist currently contains ONLY `henrik.schaub@gmail.com`. **NEVER
reintroduce a PIN, passcode, shared-secret, or any non-Google login for end
users** — not even as a "fallback" or "legacy" path. The only other credential
in the system is `x-api-secret`, used exclusively by Claude's own backend
tooling, never by end-user-facing apps.

**Known gap (2026-06-16): prod still has PIN auth.** The original PIN-removal
PR (#95) on this repo was reverted as part of fixing the 2026-06-15 outage, and
was never reapplied directly to prod (per the read-only rule above, it now must
go through staging + the promotion pipeline instead). `peptidetracker-staging`
already has PIN removed.

## ⚠️ TRAINING TAG RULES — NEVER DEVIATE ⚠️
Canonical source: `GET /training-rules` on the backend. If this app ever gains
workout programming features, these rules must be followed exactly:

| Tag | Rep range | Notes |
|-----|-----------|-------|
| `strength` | 4–6 reps | Heavy loading, neural adaptation |
| `volume` | 8–12 reps | Moderate loading, primary hypertrophy stimulus |
| `rehab` | 15 reps | **The ONLY tag permitted above 12 reps** |

**Never write rep counts above 12 except with the `rehab` tag.**

## ⚠️ ONLY FIX WHAT WAS ASKED — NO UNSOLICITED CHANGES ⚠️
Fix exactly what Henrik asked. **Never change anything else**, even if it looks
like an improvement. This applies especially to:
- Visual appearance: colors, gradients, opacity, fills, chart styling
- Layout or spacing
- Unrelated logic or data handling

If you notice something that could be improved while fixing a bug, mention it
in your reply — do NOT silently change it. Unsolicited "improvements" cause
confusion, break things Henrik didn't intend to change, and waste debugging
time. **One PR = one explicitly requested change.**

## ⚠️ "MY FIX MADE IT REDUNDANT" IS NOT PERMISSION TO REMOVE IT ⚠️
This is the single most common way the rule above gets bypassed — through internal reasoning rather than intent.

**The exact failure (2026-06-25, peptidetracker-staging):** A bug was fixed where T3 users didn't always get the Enhanced wizard step. Fix: auto-include `'enhanced'` in `_wiz.goals` inside `initWizard()`. Claude then reasoned: *"The Enhanced toggle in Goals is now redundant — T3 users always have it auto-included."* Claude removed the toggle without being asked. Users lost the ability to opt out of Enhanced on a per-stack basis and saw a blank section with no explanation.

**Why this reasoning is always wrong:**
- "Redundant" is the user's call, not Claude's
- A default and a toggle serve different purposes even when the default is always-on — the toggle gives the user agency to override it per-stack
- A side-effect of your fix appearing "unnecessary" is not the same as being asked to remove it
- This is still a violation of "ONLY FIX WHAT WAS ASKED," just disguised as logical cleanup

**The rule:**
- Make the fix. Stop. Do not touch anything the fix made look unnecessary.
- If your fix genuinely makes something obsolete, **say so in your reply and ask** — never remove it silently.
- You may only remove code that was **explicitly named** in the request.

## Deployment
- GitHub Pages at `https://henrikschaub.github.io/peptidetracker/`
- Deploys automatically on push to `main`
- No Google Drive involved — deployment is entirely via GitHub
- Monitor live version: `https://henrikschaub.github.io/peptidetracker/version.json`

## User environment
- **Henrik runs these apps as installed PWAs on iOS** (added to the home screen, launched
  standalone — not in a browser tab). Do **NOT** give browser "hard reload" or clear-cache
  instructions (Chrome 3-dot menu → More tools → Hard Reload, `chrome://settings/clearBrowserData`,
  etc.) — they do **not** apply to a standalone PWA and are wrong for his setup. To pick up a new
  version, rely on the app's in-app update checker, or tell him to fully close (swipe away) and
  reopen the app. Never assume a desktop/Chrome browser context.

## App structure
- Single-file app: `index.html` (JS, CSS, HTML all inline, ~125KB)
- `version.json` — current version, read by the update-checker in the app
- `const VERSION='x.xx'` in index.html must match `version.json`
- Version bump workflow updates both on merge to main

## Feature parity with Workout App — be proactive
The two apps (peptidetracker + workout) should stay in sync on UX/settings features.
Whenever working on either app, check if a feature exists in the other and **proactively suggest or implement parity** without waiting to be asked.

### Known gaps — Peptide Tracker is MISSING these Workout features
- **Update checker in Settings** — Workout has an explicit "Check for updates" button in Settings. Peptide only shows a passive banner when a new version is detected on load.

### Known gaps — Workout is MISSING these Peptide Tracker features
- **Configurable tabs** — Peptide has per-tab ON/OFF toggles in Settings (stored in `proto-tab-vis` localStorage key). Workout does not.
- *(document here as discovered)*

### Rule
If you add a settings feature, UX polish, or structural improvement to one app, immediately note "the other app doesn't have this yet — want me to add it?" at the end of your reply.

## Pushing large files
Same approach as workout repo — use the MCP HTTP endpoint with session ingress token if `push_files` struggles with size. See workout/CLAUDE.md for the pattern.

## Enhanced Bodybuilding Docs

Reference documents stored in `docs/enhanced-bodybuilding/` — read these when discussing protocols, compounds, cycles, or enhancement for Henrik:

- `01-coach-video-transcript.md` — Bodybuilder's Dimensional Framework (coach case study: client Trey, 24-week push, 4-phase implementation, enhancement tiers, dosing progressions)
- `02-mike-israetel-peter-attia-anabolics.md` — AAS effects, risks, and insights (Mike Israetel + Peter Attia; TRT vs supraphysiological dosing, estrogen management, safer use model, psychological effects)
- `03-what-are-anabolic-steroids.md` — Medical safety overview (organ system effects, bloodwork monitoring, harm reduction protocols)
- `04-history-of-steroids-attia-derek.md` — History and pharmacology of steroids (Derek MPMD + Peter Attia; compound-by-compound breakdown, anabolic:androgenic ratios, SARMs, safer use model)
- `05-personal-protocol-log.md` — Henrik's personal protocol and weekly log (Retatrutide, CJC-1295/Ipa, Glow Blend, Testosterone; weight/BF% tracking from April 2026)
- `06-scientific-research-foundation.md` — PubMed/PMC literature review across 10 topic areas (cycle duration, dose-response, compound pharmacology, bloodwork, aromatization, HPTA/PCT, psychology, SARMs, body composition, PK/injection frequency); includes explicit divergences where science contradicts coach advice
- `07-female-enhancement-protocols.md` — Female-specific research: testosterone in women (Lancet 2019 meta-analysis, 36 RCTs), oxandrolone clinical dosing (FDA-validated), virilization dose-response, voice change irreversibility (PMID 40641310), SARMs in women (ostarine Phase 2/3 data), compound safety ranking by virilization risk, harm reduction framework, female-specific bloodwork additions
