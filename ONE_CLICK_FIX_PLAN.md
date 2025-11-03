## AllyFix “1‑Click Fix” Implementation Plan

### Core Concept
User sees a violation → clicks “Fix” → AllyFix auto‑generates, previews, and applies a code patch (diff) directly in the UI. No copy‑paste. No manual editing.

---

## Phases & Scope

### Phase 1 — MVP: Per‑violation patch preview (1–2 weeks)
- **Backend**
  - Convert existing `FixSuggestion { before, after }` to unified diffs.
  - Create API `POST /api/fix/preview` to return `{ unifiedDiff, before, after, explanation }` per violation.
  - Optional: `POST /api/fix/batch-preview` for combined diffs of selected violations.
- **UI**
  - Add a “Fix” button on each violation card in `app/scan/[id]/page.tsx`.
  - Open a modal with tabs: “Diff” (unified), “Before/After” (reuse `CodeDiff`), “Preview”.
  - Actions: Copy patch, Download `.diff`, Copy “After” snippet.
- **Preview**
  - Basic sandboxed `<iframe>` that loads minimal HTML context and injects the “after” snippet at the target selector for visual confirmation.
- **Out of scope**
  - No repo writes. Users apply patches locally.

### Phase 2 — DOM→Source mapping + local apply (2–4 weeks)
- **Source localization**
  - Strategies to map DOM nodes back to files/lines:
    - SSR/Static: optional `data-source-path` build‑time attributes.
    - SPA: heuristics with component/test IDs; configurable selectors.
    - Optional lightweight SDK to embed a “source locator” script.
- **Patches**
  - Generate diffs with correct file paths and context hunks; bundle as `allyfix-patches.tar.gz`.
- **API**
  - `POST /api/fix/apply-local` → returns an archive of patch files per selection.
- **UI**
  - “Apply locally” drawer with step‑by‑step commands (uses `git apply --3way`).

### Phase 3 — GitHub PR integration (2–3 weeks)
- **Auth & App**
  - Register a GitHub App; store installation + repo mapping per user.
- **Backend**
  - `POST /api/fix/apply-github` → create branch, add patches, open PR.
  - Webhooks for PR status and checks.
- **UI**
  - Modal flow: choose repo/branch, confirm; surface PR link and status.

### Phase 4 — High‑fidelity live preview (1–2 weeks)
- Load original page markup captured during scan into an iframe.
- Apply “after” snippets at exact selectors; quick axe re‑check/contrast measurement to show confidence.

---

## Current Assets to Reuse
- `lib/fix-engine.ts`: maps `Violation` → `FixSuggestion`.
- `app/api/scan/route.ts`: already stores `violations_data[*].fix`.
- `components/code-diff.tsx`: use in the Fix modal’s “Before/After” tab.
- `app/scan/[id]/page.tsx`: add Fix button and modal per violation.

---

## API Design
- `POST /api/fix/preview`
  - Input: `{ scanId: string, violationKey: string }` (key: `${violation.id}-${index}`)
  - Output: `{ unifiedDiff: string, before: string, after: string, explanation: string }`

- `POST /api/fix/batch-preview` (optional)
  - Input: `{ scanId: string, violationKeys: string[] }`
  - Output: `{ files: Array<{ path: string, diff: string }>, unifiedDiff: string }`

- `POST /api/fix/apply-local` (Phase 2)
  - Input: `{ scanId: string, violationKeys: string[] }`
  - Output: `application/gzip` (tar.gz with patch files)

- `POST /api/fix/apply-github` (Phase 3)
  - Input: `{ scanId, violationKeys, repoId, baseBranch, newBranch, commitMessage }`
  - Output: `{ prUrl, prNumber }`

---

## Data Model
- Keep `scans.violations_data[*].fix` as is.
- New transient server types:
  - `PatchPreview { unifiedDiff: string, files?: Array<{ path: string, diff: string }> }`
  - `FixApplyPayload { repoId?: string, branch?: string, violations: string[] }`
- Optional tables (Phase 3):
  - `integrations` (GitHub app installation & repo mapping)
  - `applied_fixes` (track applied patches per repo/scan)

---

## UI/UX Details
- Violation Card → “Fix” button opens modal.
- Modal Tabs:
  - Diff: show unified diff with syntax highlighting; Copy & Download buttons.
  - Before/After: reuse `CodeDiff`.
  - Preview: sandboxed iframe; selector‑based injection; show quick checks (contrast/axe lite).
- Batch mode: multi‑select violations → combined diff preview (optional in MVP).

---

## Technical Considerations
- **Selector reliability**: use axe `nodes[*].target` to locate elements for preview and mapping.
- **Source mapping**: hardest part; prefer conventions (`data-source-path`) or SDK to emit trace info.
- **Idempotency/conflicts**: generate context hunks; recommend `git apply --3way`; surface conflicts in UI.
- **Security**: sanitize HTML, sandbox iframe, validate GitHub inputs, store tokens securely.
- **Performance**: avoid heavy recomputation; cache previews per violation.

---

## Effort & Milestones
- Phase 1: 1–2 weeks
- Phase 2: 2–4 weeks
- Phase 3: 2–3 weeks
- Phase 4: 1–2 weeks

Milestone checkpoints:
1) Single‑violation diff preview shipped
2) Batch preview + download archive
3) Local apply (archive with file‑scoped patches)
4) GitHub PR flow live
5) High‑fidelity live preview with quick re‑check

---

## Acceptance Criteria (Phase 1)
- “Fix” button exists on each violation card.
- Modal shows unified diff and Before/After view.
- User can copy/download `.diff` for a single violation.
- Basic iframe preview renders “after” snippet at the target selector without errors.

---

## Command Hints (Phase 2 local apply)
```bash
git checkout -b allyfix/fixes-<scanId>
tar -xzf allyfix-patches.tar.gz
git apply --3way
git commit -m "AllyFix: apply accessibility fixes"
```


