# Peptide Tracker — Claude Instructions

<!-- BEGIN ORG-WIDE RULES v7. Canonical copy: ViritasOrg/claude-agent-backend docs/org-rules.md. Edit it there, then copy this block unchanged into every ViritasOrg repo's CLAUDE.md (scripts/check_org_rules.py finds drift). -->
## Org-wide rules: every ViritasOrg repo (canonical v7, 2026-10-28)

These rules are identical in every repo's `CLAUDE.md` under `ViritasOrg`. Rules further down in this file add repo-specific detail. If one of them seems to contradict this block, say so to Henrik instead of silently picking one. They bind every session, whatever started it (Claude Code, claude.ai, a Project, a scheduled task, an agent).

### Verify before you speak (Henrik's standing rule)
- Before telling Henrik a cause, a fix, or a step to take, check the facts yourself first: read the config, logs, code, settings or live state. Never present a guess as the answer.
- Never send him to repeat something he may already have done; check whether it is already done first.
- If something can't be verified, say exactly what is unverified, instead of giving an instruction built on an assumption.
- If you notice you'd have to write "let me find the actual cause instead of guessing", you already broke this rule: the checking belongs before the first answer, not after he pushes back.
- **Never answer from memory, ever** (Henrik, 2026-10-26: "NEVER answer from memory ever!", https://github.com/ViritasOrg/flyt/issues/910). Training memory is not a source. Every fact about the outside world (what a product or provider offers, plan tiers and limits, prices, API endpoints and fields, how a library or service behaves) comes from something read in that session: the provider's docs (fetched, or archived through a docs-fetch workflow when the sandbox can't reach them), the code, the config or the live system, and the reply names where it came from. Not read yet? Read it before answering. If it can't be read, say plainly that it is unchecked and what would check it; never fill the gap with "as far as I know", "I believe" or a confident guess. Triggered when a session described ElevenLabs' voice features and plan tiers from memory instead of reading their docs.

### Talking to Henrik
- **Answer first, then say what you will do before doing it** (Henrik, 2026-10-10: "You're right. I'll answer first and say what I'm doing before I start."). A question gets its answer in the first lines, before any tool call. Before starting any work (a workflow, a PR, a deploy, waiting on CI), say in one line what you are about to do and why; never disappear into tool calls on a simple question.
- **Every request carries context** (Henrik, 2026-10-10: "add context to requests so I have a clue what you are talking about"). When you ask Henrik to do or check something, say what it is for, where it fits in the overall task (step N of what), and what he should see when it worked. Never a bare instruction that assumes he remembers the thread.
- **Number questions** (Henrik, 2026-10-15: "if you give me more than one question at the time always remember to enumerate them pls"). Two or more questions in one message are a numbered list, so he can answer "1 yes 2 no".
- **Don't stop for minor things: decide and do it** (Henrik, 2026-10-12: "don't stop for minor things like this, show a little self confidence"). A small, reversible call inside the task (an estimate, a naming choice, an obvious adjacent fix) is made, shipped and reported in the reply, not turned into a question. Ask only when the choice is genuinely Henrik's: it changes what he asked for, touches prod, deletes something, or picks between real trade-offs he would care about.
- **Once Henrik has answered, carry on** (Henrik, 2026-10-16: "Never stop like this if I answered the questions", https://github.com/ViritasOrg/Flyt/issues/582). Never end a turn on "shall I go ahead?" or anything else his answer already settles; build up to the next point that truly needs him.
- **A message sent while you work never means stop** (Henrik, 2026-10-26: "\"Send Now\" messages never means stop, just that I need a quick answer before you continue working", https://github.com/ViritasOrg/Flyt/issues/895). A message that arrives mid-turn (the app's **Send Now**), and the tool call it cuts short, is a question or an extra instruction, never a stop: answer it in a line or two, then carry on with the work in hand in the same turn, re-running the interrupted step. Stop only when Henrik says so in words ("stop", "wait", "hold", "don't").
- **Every reference is a clickable link, its full URL visible** (Henrik, 2026-10-14: "give me only ever clickable links … this is unacceptable!!!", https://github.com/ViritasOrg/Flyt/issues/425). Every issue, PR, Claude session, Actions run, commit, file or page named to Henrik is written as its full `https://` URL, visible as the text itself, inside the sentence. Never link text that hides the URL (`[session](…)`, `[#299](…)`), never a bare `#299`, `owner/repo#n` or file path, never a URL in bold, in code formatting or on a line of its own apart from its sentence. Claude session links above all: the Claude app shows a named link to a session but doesn't open it.

### Answer the question (Henrik, 2026-10-28)
> "answer the question, LLM comfort isnt as important as quality of responses" / "a wall o[f] words I wont read regardless, it waste[s] your time and my token budget"

- **The answer goes first, in the first line.** If the opening line is not the information he asked for, the reply has failed, whatever else is in it.
- **No answer is a complete answer: say so and stop.** "Not in what we hold — X would establish it" is finished. Never fill the gap with the nearest data you happen to have: that reads as an answer while leaving the question open.
- **Everything unasked-for is cut.** Context, caveats, related findings, tables of what is available — one line at the end at most, usually nothing. Never its own section.
- **He will not read a wall of text.** It burns his token budget and your time and tells him nothing. Short and answering beats long and circling, every time.

Triggered by: asked for the highest recorded natural free testosterone in a male, and got the healthy-male distribution, a conversion table and an unasked-for note on two papers disagreeing — everything except the answer, which was "not in the corpus".

### Steps Henrik has to do
- **Every step Henrik must do comes with its commands, in the same message** (Henrik, 2026-10-10: "you must always provide detailed instructions and commands for stuff like this"). Give the full instructions and the exact, complete, copy-paste commands right there, saying which machine each runs on. Never "I'll give you the command when…" or "deploy as usual". **Never point back in the chat** (Henrik, 2026-10-22, https://github.com/ViritasOrg/Flyt/issues/679: "never ask me to search backwards in a session chatt , just show me the needed bash to copy into terminal!!!"): a message that asks him to run something carries the complete command itself, never "the command above", "as before" or "scroll up".
- **Every step on a page links that exact page** (Henrik, 2026-10-28, https://github.com/ViritasOrg/flyt/issues/1015: "I want to make a org wide rule to always provide clickable links so I dont have to spend time on it when doing this!!!"). A step Henrik does in a browser (try a feature on staging, press a button in Admin, change a GitHub setting, open a board or console) carries the full `https://` URL of the page where he does it, inside that step's own sentence, the deepest page Claude can name (the new-link form, not the site's front page). Look the URL up (routes in the code, the app's host in its config) before writing it; never "on staging", "in Admin", "on the dashboard" or "the release PR" without its URL. The clickable-link rule above holds for the rest: full URL visible, never hidden behind link text. Triggered by a staging test that said "On staging, make a 20 EUR Direct card payment link and open it" with no link, and named the release PR as `[ViritasOrg/flyt#1013](…)`.
- **Henrik's computer is a Mac: macOS with zsh, never bash** (Henrik, 2026-10-07). Commands he runs on his own computer must work as typed in zsh: `read -s "T?Prompt: "` (never `read -p`), BSD tools (`sed -i ''`, `base64 -D`, `date -v`, no `grep -P`, no `${!var}`, `open` not `xdg-open`). Fly machines, CI and the Pi are Linux/bash: say which machine each command runs on.
- **Henrik's Macs have EU keyboards: the Option key is labelled `alt`** (Henrik, 2026-10-11: "no option on eu keyboards only alt"). Write **alt (⌥)**, never "Option", and **cmd (⌘)**, not "Command".
- **Henrik uses Chrome, on his iPhone and his Macs, unless something forces him to use another browser** (Henrik, 2026-10-17: "update all repos that I only use Chrome unless forced to"). Every browser step is written for Chrome; on iPhone a page goes to the home screen through Chrome's **Share → Add to Home Screen**. Name Safari only when iOS genuinely requires it for that step, and say why.
- **Passwords: Henrik types them, Claude never routes them** (Henrik, 2026-10-15, https://github.com/ViritasOrg/Flyt/issues/530: "I will never put passwords on clipboard … you dont need to deal with passwords ever"). He types a password, or pastes it from his password manager, into the prompt that asks for it. Never a command that feeds a password from `pbpaste`, the clipboard, a shell variable, a heredoc or `sudo -S`; never ask him to paste a token, key or password into the chat, and never print one into a reply.
- **Henrik's home connection has no fixed IP: never ask for a home-IP whitelist** (Henrik, 2026-10-23, https://github.com/ViritasOrg/flyt/issues/761: "update md files in all repos to never ask something as stupid again"). Never tell him to allow-list his home IP for a partner key (Revolut X, Kraken, bunq, Stripe, anything later), never print his IP for one, never write such a step into a doc. A key is kept small by its permissions and, where offered, an expiry date; leave the partner's IP field empty.

### No legal advice unless Henrik asks for it (Henrik, 2026-10-21, https://github.com/ViritasOrg/Flyt/issues/646)
> "update all md files to never provide unsolicited legal advice, I need a real laywer not pointless discussions with Claude or any AI/LLM."
- Claude is the development team, not legal counsel. Never, unless Henrik asks in that conversation: legal opinions, caveats, warnings, "check with a lawyer", "may need a licence", regulatory risk notes or compliance discussion, in chat, issues, PRs, code comments, docs or research reports.
- A technical choice that depends on a legal answer gets one line asking for Henrik's call ("needs your call: A or B"), then Claude builds what he decides. Never argue it, never repeat it.
- Provider facts that decide what works technically are stated plainly in one line with their source, without legal commentary.
- Existing legal lists (e.g. Flyt's "Legal questions", https://github.com/ViritasOrg/Flyt/issues/313) are his record: never add to them or comment on them unless he asks.

### Nothing half-built is ever visible (Henrik, 2026-10-15, https://github.com/ViritasOrg/Flyt/issues/544)
> "update all claude.md in all repos to warn for this to ever happen again, this is very stupid!"
- Anything a user, vendor, buyer or Henrik's family can see, use or rely on stays switched off (a flag or setting off by default, off in production) until every step of its flow works end to end outside production and Henrik gives the go. Turning it on is its own change.
- Splitting work into issues never makes a part shippable on its own.
- User-facing docs describe what production runs, never a switched-off feature.

### "btcpay" is Henrik's own Pi service, never the other product (Henrik, 2026-10-15, https://github.com/ViritasOrg/btcpay/issues/112)
> "add rules to all repos to never mention BTCPay ever again"
- **btcpay** always means Henrik's own Bitcoin payment queue on the Raspberry Pi 4 (repo `ViritasOrg/btcpay`). There is an unrelated open-source payment server with a similar name: never name it, link it, quote its docs or use it as a mental model ("store", "pull payment", "payout processor", "Greenfield" and the like exist nowhere here).
- Answers about payouts, holds, funding or addresses come from `ViritasOrg/btcpay`'s own `docs/` and Flyt's `docs/`. Unsure which is meant? It is this one.

### Every repo lives under `ViritasOrg`: the old owner name is dead (Henrik, 2026-10-16)
> "update md files in all repos to forget the old name henrikschaub for the repos."
- Repos, PRs, runs, files and Pages sites are written and linked as `ViritasOrg/<repo>` and `https://viritasorg.github.io/<repo>/`, never `henrikschaub/<repo>` or `henrikschaub.github.io`. GitHub still redirects the old names (a GET works, a POST silently doesn't), which is how they survive unnoticed.
- A session whose repository scope, clone remote or task prompt shows `henrikschaub/<repo>` is misconfigured: do the work, and tell Henrik which setting carries the old name. (`henrikschaub` is still Henrik's personal GitHub user; only repo owners moved.)

### Credentials are replaced, never just deleted (Henrik, 2026-10-08: "update all md files to make sure you don't do the same mistake ever again")
- A credential that must go is replaced in one step: new value generated, set where the server reads it and where the caller reads it, verified with a real call. Never a delete with the replacement left for later.
- Never advise deleting, revoking, rotating or unsetting a credential, env var, secret, file, branch or data store before establishing what reads it. Grep for it first.
- An env var reference (`$CLAUDE_READONLY_API_KEY`) in a file is correct practice, not a leak; only a literal secret value committed to a file is, and then name the exact file and line.

### Keys live in Bitwarden and move with rekey.sh (Henrik, 2026-10-28, https://github.com/ViritasOrg/flyt/issues/993)
> "no tokens and keys are stored in Bitwarden, follow the correct process, if it is unknown to you make sure all Viritas Repos has updated claude.md instructions to use rekey.sh and Bitwarden"
- Every token, key and secret of Henrik's lives in Bitwarden, folder `rekey`: one item per key, named exactly as the key, the value in the password field.
- `rekey.sh` puts it where it is used: GitHub secrets, Fly secrets, flyt-ops and the agent API. Keys a command makes (a Fly deploy token) it writes into Bitwarden first. The script is `ViritasOrg/flyt` `infra/rekey/rekey.sh`, `~/ClaudeCode/rekey/rekey.sh` on the M1 Max; its phases and items are listed in `infra/rekey/README.md`.
- A key that only a settings page Henrik opens can take (the Claude environment's Network secrets, a provider's dashboard) he pastes from Bitwarden.
- Never give Henrik a command that prints a key, puts it on the clipboard or passes it in argv. Never ask for a key in chat.
- A key `rekey.sh` doesn't cover yet gets its item and phase in `rekey.sh` in a PR before Henrik is asked to do anything with it.
- A session that finds a key refused names the key and the `rekey.sh` phase that renews it, with its exact command.

### Merge your PR once it is green (Henrik, 2026-10-26, https://github.com/ViritasOrg/flyt/issues/930)
> "update all repos to not wait for 4h to merge PRs, all sessions can merge once their PRs are green, we have good test coverage and see few issues."
- A session merges its own PR as soon as every required check is green and it is mergeable, into the branch the repo's workflow targets (Flyt: `staging`, and release and hotfix PRs into `main`; btcpay and the staging apps: `main`). No merge ask, no waiting for Henrik, no 4-hour clock.
- Still never: push to a protected branch, change branch protection, merge red or conflicted, or merge a PR that lists a step Henrik must do or check before merging (ask for that step first).
- Henrik can still merge anything himself. A repo whose rules keep production behind his own step keeps it: `peptidetracker` and `workout` reach production only through his Push to Prod.

### Every repo has CI and tests (Henrik, 2026-10-28, https://github.com/ViritasOrg/flyt/issues/982)
> "I want CI setup and tests written and that all claude.md files for all repos future and present include this requirement."
- Every repo has a GitHub Actions workflow that runs its tests on every pull request and on every push to its main branch. A repo without one, or without tests, gets both in its own PR before the next change to its code merges.
- A new repo gets its CI workflow and first tests in its first PR, its line in `REPOS` in `ViritasOrg/claude-agent-backend` `scripts/check_org_rules.py`, and this block in its `CLAUDE.md`.
- New or changed behaviour comes with tests in the same PR. A bug fix comes with a regression test that fails on the code before the fix.
- Tests call the code and check what it returns. A test that greps the source is a structural guard (a trust split, a banned call, a registry), never coverage of behaviour; such guards stay, next to tests that call the code. Tests in CI never call a real partner or need a real secret: stub them.
- A PR merges only after the repo's CI ran green on its latest commit; no checks at all is not green. The one exception is a docs-only PR in a repo whose CI doesn't run on pull requests yet. Never skip, disable or loosen a test, a coverage floor or a CI step to get a change through.

### Every background job has a readable name (Henrik, 2026-10-28, https://github.com/ViritasOrg/flyt/issues/1004)
> "I want everything to have understandable names" … "fix all these names to correct ones, this is a mess, also update the central claude.md rule book to avoid this in the future"
- macOS System Settings → General → Login Items names a LaunchAgent or LaunchDaemon after the file its plist starts. A plist that starts `node`, `python`, `bash` or any other interpreter directly shows up as "node" or "python" from an "unidentified developer", and nobody can tell what it is.
- Every LaunchAgent or LaunchDaemon an installer writes starts a link or wrapper named after what it is, never a bare interpreter: Flyt's `~/.flyt-launchers/<name>` (`packages/shared/launch-name`), btcpay's console venv link, the podcast worker's `venv/bin/Podcast Voice`. The name says the product and the service, as Henrik would call it (`Flyt Ops Board (production)`, `btcpay CFO Console`), and is unique.
- A Python job's link sits in its venv's `bin/` next to `python`, so Python still finds the venv.
- A new background job gets its name in the same PR that adds it, with a test that its plist starts the named link.

### A verified error in an md file gets fixed immediately (Henrik, 2026-08-08: "When you find verified errors in md files always fix em instantly.")
- If you establish that something in a `CLAUDE.md` (or any md in these repos) is wrong, correct it in that session, in every repo that repeats it. Verified means you checked (read the workflow, ran the command, saw the run); a hunch is not a finding.
- Say what was wrong and why in the commit and the reply. This does not license rewriting rules you disagree with: those are Henrik's call. A SETTLED marker still wins: raise it, don't edit.
- An org-wide rule is changed in the canonical file first, then copied into every repo's block in the same session.
<!-- END ORG-WIDE RULES v7 -->

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
- **Henrik's real data is readable.** `CLAUDE_READONLY_API_KEY` (named `API_SECRET_RO` before 2026-10-14) is a read-only admin credential in
  the session environment; `GET https://claude-agent-api-aged-sun-3616.fly.dev/<endpoint>`
  with header `x-api-secret: $CLAUDE_READONLY_API_KEY` serves `/bloodwork`, `/injections`,
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
| `strength` | 2–6 reps | Heavy loading, neural adaptation. 2–3 is the max-testing end (widened from 4–6 on 2026-08-08) |
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
- GitHub Pages at `https://viritasorg.github.io/peptidetracker/`
- Deploys automatically on push to `main`
- No Google Drive involved — deployment is entirely via GitHub
- Monitor live version: `https://viritasorg.github.io/peptidetracker/version.json`

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
