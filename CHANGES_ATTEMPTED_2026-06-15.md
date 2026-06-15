# Changes Attempted — 15 June 2026 (reverted)

All changes below were reverted to restore the working v1.179 state.

---

## What was broken (the trigger)

The TODAY tab showed the hardcoded HTML badge value `0 / 0` (meaning `buildToday()` never updated it), and the CYCLES tab showed "No peptides in this stack".

**Root cause** (discovered late): Chrome mobile's disk cache had an old version of `index.html`. The update banner's "Reload now" button used `window.location.reload(true)`, which is deprecated in Chrome and **does not bypass the disk cache**. Every "fix" deployed updated GitHub Pages, but the user's browser kept running the old cached code.

---

## Features / PRs attempted (all reverted)

### PR #82 — Fix Today tab: show doses immediately, add 5s fetch timeout (v1.180)
- Removed the `_syncPending` spinner guard from `buildToday()` so doses show immediately
- Added AbortController with 5s timeout to `syncPeptideLogFromAgent`
- **Side effect**: broke the loading sequence that v1.179 relied on

### PR #83 — Docs: Henrik uses Chrome on mobile, not Safari (v1.181)
- Added Chrome-specific instructions to `CLAUDE.md`

### PR #84 — Redesign Cycles tab: replace sub-tabs with single scrollable view (v1.182)
- Replaced the Cycles sub-nav structure (`buildStackStore`) with a new `renderCyclesTab` / `cycRenderPeptideSection` architecture
- Removed sub-tab buttons in favour of a single scrollable Cycles page
- This redesign introduced regressions: `cycRenderPeptideSection` lacked a loading-state guard

### PR #85 — fix(cycles): prevent cycles-tab init from breaking Today/settings (v1.183)
- Stopped `openCyclesTab()` from crashing if called during startup

### PR #86 — fix(settings): render Tabs/Appearance cards before async network calls (v1.184)
- Settings tab was partially blank while async calls were in flight

### PR #87 — fix: restore peptides when active stack has empty peptides array (v1.185)
- Frontend fallback: if `_userStacks[_activeStackIndex].peptides` is empty, synthesize from `WEEKLY_DEFAULT`
- Added `stacks_cache` localStorage fallback when backend fetch fails
- Also added `_repair_empty_peptides()` to the backend (`/protocol/stacks` GET) so it auto-heals empty stacks on every fetch

### PR #90 — fix: cycles tab empty + WEEKLY fallback + loading state (v1.186)
- Added `_stacksLoaded` guard to `cycRenderPeptideSection` ("Loading…" instead of "No peptides" during async fetch)
- Added WEEKLY fallback in `updateWEEKLY()`: `WEEKLY = _built.length ? _built : WEEKLY_DEFAULT.slice()`
- Called `buildToday()` and `renderCyclesTab()` at end of `loadUserStacks()`

### PR #91 — fix: startup update banner — top of screen, z-index 9999 (v1.187)
- Moved update banner from bottom to top of screen so it wasn't hidden behind sync bar
- Added `cache: 'no-store'` to the version.json fetch
- Button still used `window.location.reload(true)` — **the fundamental cache problem was not fixed**

### PR #92 — fix: cache-busting reload (v1.188)
- Changed both reload buttons to navigate to `location.pathname + '?t=' + Date.now()`
- This actually bypasses disk cache in Chrome mobile
- **Partially kept** — the same fix is applied in the v1.179 restore

### Backend: PR #22 (claude-agent-backend) — auto-repair empty stacks
- Added `_repair_empty_peptides()` to `GET /protocol/stacks`
- If active stack has no peptides, backend restores the known default set (Retatrutide, CJC-1295/IPA, GLOW Stack)
- **Kept** — backend-only change, no downside

---

## What v1.179 had (the restored baseline)

- `buildToday()` checked `_syncPending` at top — showed a spinner while log sync was in flight, then re-rendered once complete (clean, no flash of wrong state)
- `buildStackStore()` handled the Cycles/stacks view (simpler, more stable architecture)
- `_stacksLoaded` flag + `buildToday()` call at end of `loadUserStacks()` (already present)
- Today check-in card, Macros tab, cycle creation wizard, Enhancement section, consent screen all present (features from v1.174–v1.178)

---

## To get the update in Chrome mobile

Navigate to:
```
https://henrikschaub.github.io/peptidetracker/?t=1
```

Adding `?t=1` forces Chrome to fetch a fresh copy of the page, bypassing disk cache.
