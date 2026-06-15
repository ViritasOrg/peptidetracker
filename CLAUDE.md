# Peptide Tracker — Claude Instructions

## Git workflow — ALWAYS follow this
1. Make changes on a feature branch
2. Create a PR then **immediately merge it yourself** — never stop and ask the user to merge, never push directly to main
3. After merge the `version-bump` GitHub Action auto-increments the minor version in `version.json` and `const VERSION` in `index.html` and commits with `[skip ci]`
4. **After merging, poll `https://henrikschaub.github.io/peptidetracker/version.json` every 30 s until the new version appears, then tell the user "live as vX.XXX — test now"**

## Deployment
- GitHub Pages at `https://henrikschaub.github.io/peptidetracker/`
- Deploys automatically on push to `main`
- No Google Drive involved — deployment is entirely via GitHub
- Monitor live version: `https://henrikschaub.github.io/peptidetracker/version.json`

## User environment
- **Henrik uses Chrome on mobile, never Safari** — when troubleshooting caching/reload issues, give Chrome instructions (3-dot menu → More tools → Hard Reload, or chrome://settings/clearBrowserData)

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
