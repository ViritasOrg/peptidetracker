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

## Pushing large files
Same approach as workout repo — use the MCP HTTP endpoint with session ingress token if `push_files` struggles with size. See workout/CLAUDE.md for the pattern.
