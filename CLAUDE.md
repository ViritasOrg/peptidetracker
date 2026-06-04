# Peptide Tracker — Claude Instructions

## Git workflow — ALWAYS follow this
1. Make changes on a feature branch
2. **Always create a PR, then merge it** — never push directly to main, never skip the PR step
3. After merge the `version-bump` GitHub Action auto-increments the minor version in `version.json` and `const VERSION` in `index.html` and commits with `[skip ci]`
4. **Always tell the user the version number to test** — after creating or merging a PR, explicitly state "test as **vX.XXX**" (current prod version + 1 per PR merged)

## Deployment
- GitHub Pages at `https://henrikschaub.github.io/peptidetracker/`
- Deploys automatically on push to `main`
- No Google Drive involved — deployment is entirely via GitHub
- Monitor live version: `https://henrikschaub.github.io/peptidetracker/version.json`

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
