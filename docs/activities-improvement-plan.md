# Activities Feature – Optimization and Enhancements Plan

Goal: Improve efficiency of the Activities feature, implement missing update and soft-delete flows in the UI, and decouple dialog logic into one dialog per mode for clearer responsibilities and easier maintenance.

## Scope

- Features covered: `features/activity/*`, dialog registration/host, and minimal touch points in `app/(home)` and timeline hooks that open activity dialogs.
- Data layer already supports update/disable/soft-delete; this plan focuses on wiring the UI, improving performance, and refactoring dialogs.

## Changes Overview

- Implement soft delete (status = `DELETED`) from the Activities management UI.
- Ensure update/edit flow is fully wired using existing `updateActivity` store methods.
- Decouple `ActivityDialog` into one dialog per mode: legend, manage, create, edit.
- Optimize render/performance and reduce unnecessary store refreshes and writes.

## Simple structure of features/[folder]

```
features/activity/
├── components/.                // All the needed components
├── hooks/.                     // Custom hooks for activities
├── dialogs/.                   // New: Separate dialog components per mode
│   ├── ActivityLegendDialog.tsx  // Handles 'legend' mode logic
│   ├── ManageActivitiesDialog.tsx // Handles 'manage' mode logic
│   ├── CreateActivityDialog.tsx  // Handles 'create' mode logic
│   ├── EditActivityDialog.tsx    // Handles 'edit' mode logic
│   └── index.ts                  // Exports all dialog components
├── constants/.                  // Constants related to activities UI (e.g. grid config)
├── types.ts                     // Types specific to activities feature
├── utils/.                    // New: regroup all the utils scripts
```

The structure should remain simple and not duplicating any logic from the shared folder.

## Detailed Tasks

### A. Soft Delete and Update UX

- Replace the current "remove" action in edit/manage grid to support soft delete instead of only disable.
  - Option B (fallback, smallest change): Only enable the soft delete on the edit activity UI. Disable is available in the Edit Grid with the disable button, but delete is on the activity itself. On that action, retrieve all the timeslices with that activity and also activities with that activity as parent. If activity soft deleted has a parent, do not allow the user to delete it and prompt you need to change that activity first and then, if that condition is checked, ask the user to reassign the "x" timeslices with that activity to another and update the timeslices.
- Wire to store methods already present:
  - `useActivitiesStore.softDeleteActivity(id)`
  - Keep `disableActivity(id)` available via the same confirmation as a secondary option.
- Keep enable flow the same for disabled activities (existing "+" button already enables).

### B. Ensure Update/Edit Flow Completeness

- Edit form already calls `useActivitiesStore.updateActivity` via `ActivityDialog`. After dialog refactor (see section C), make sure `EditActivityDialog` passes correct initial values and calls `updateActivity` on submit.
- Keep `ActivityForm` unchanged except for minor efficiency tweaks (see section D) and ensure validation/errors are surfaced consistently.

### C. Dialog Refactor (One Dialog per Mode)

- Split `features/activity/ActivityDialog.tsx` into dedicated components:
  - `ActivityLegendDialog` (legend/view selection grid)
  - `ManageActivitiesDialog` (reorder, disable/enable, delete)
  - `CreateActivityDialog` (create form)
  - `EditActivityDialog` (edit form)
- Each dialog manages its own header props, height, and actions; no internal mode switching.
- Update `shared/dialogs/registry.tsx` to register new dialog types:
  - `activity-legend`, `activity-manage`, `activity-create`, `activity-edit`.
  - Keep `activity` mapped to `ActivityLegendDialog` for backward compatibility (so callers not yet migrated still work).
- Update call sites:
  - `app/(home)/index.tsx`: open `activity-legend` (instead of `activity` with `mode: "legend"`).
  - `features/timeline/hooks/useTimelineActions.ts`: open `activity-legend` when picking activities.
  - When the user taps "Edit" from legend, open `activity-manage` as a new dialog rather than switching mode.
  - From manage, tapping add opens `activity-create`; tapping an activity long-press opens `activity-edit`.

### D. Efficiency and Performance Improvements

- Drag ordering persistence:
  - Change `useDragOperations` to persist order on drag end (debounced) rather than every intermediate move, to avoid frequent writes. Keep optimistic local order during drag.
  - Provide an option prop `persistOn: 'end' | 'immediate'` with default `'end'`.
- Reduce redundant fetches in dialogs:
  - Remove extra `getAllActivities()`/`loadStoredOrder()` calls from components where the store already holds data or where a single `refresh()` is sufficient.
  - Eliminate console logging in production paths.
- Zustand selector efficiency:
  - Use focused selectors and shallow comparison where helpful in hot paths to reduce re-renders in grids.
- Minor UI recalculation improvements:
  - Memoize combined lists and grid config (already in place) and ensure dependent arrays are stable across renders.

### E. Tests and Safety

- Existing tests cover activities CRUD API including soft delete. No changes expected at API layer.
- Manual verification steps (see Validation) and light component-level checks for regression.

## Files Impacted

- New files (under `features/activity/dialogs/`):
  - `ActivityLegendDialog.tsx`
  - `ManageActivitiesDialog.tsx`
  - `CreateActivityDialog.tsx`
  - `EditActivityDialog.tsx`
- Modified:
  - `features/activity/components/ui/DraggableActivityItem.tsx` (confirmation to Disable/Delete)
  - `features/activity/hooks/useActivityManagement.ts` (use `softDeleteActivity` path)
  - `features/activity/hooks/useDragOperations.ts` (persist on drag end)
  - `shared/dialogs/registry.tsx` (register new dialog types; map legacy `activity` to legend)
  - `app/(home)/index.tsx` and `features/timeline/hooks/useTimelineActions.ts` (open new dialog type)
  - `features/activity/ActivityDialog.tsx` (either remove or keep as thin wrapper to the new dialogs for backward compatibility; preferred: deprecate and prune usages)

## Validation

- Soft delete:
  - From Manage dialog, remove an activity via "Delete" → activity moves to deleted list (not shown in enabled/disabled), order storage updated.
  - From Manage dialog, choose "Disable" → activity moves to disabled grid; re-enable via plus button works.
- Update:
  - From Edit dialog, change fields and save → activity updates in enabled grid without flicker; order preserved.
- Drag reorder:
  - Reordering is smooth; no excessive save calls; final order persists across refresh.
- Dialogs:
  - Legend, Manage, Create, Edit open independently; headers and heights are correct; Done/back actions work; no unintended cross-dialog state.

## Edge Cases To Analyze & Handle

- Hierarchy constraints:
  - Child cannot be deleted: block if `parent_activity_id` set.
  - Parent with children cannot be deleted: block until children are reassigned or parent cleared.
  - Prevent cycles when editing parent assignment in form (out of scope here but note for validation).
- Timeslices reassignment:
  - No same-category replacements: fallback to any enabled activity.
  - No enabled activities at all: block delete with guidance to create/enable a replacement first.
  - Partial failures during bulk update: surface error and leave source activity untouched.
- Store/order consistency:
  - On disable: maintain order slot for later re-enable.
  - On delete: remove from order storage.
  - Re-enable places activity back respecting stored order.
- Concurrency:
  - If activity status changes while Edit dialog is open, validate again before delete/save.
  - If timeslices set changes between count and reassign, re-query before applying updates.
- Dialog UX:
  - Small confirmation before delete.
  - Manage dialog does not offer delete to avoid accidental destructive actions.
- Internationalization:
  - All new strings (confirm, errors, prompts) should be added to i18n files (follow-ups).

## Risks / Mitigations

- Dialog type changes could break call sites → keep legacy `activity` mapping to legend; adjust only the known callers in this repo.
- Changing drag persistence could alter UX → keep haptics; ensure final save still happens reliably on drag end; add quick debounce as safety.
- Introducing confirm UI for Disable/Delete needs a minimal, dependency-free approach → use a lightweight custom confirm or basic prompt.

## Open Questions for Review

- Confirm Option A for Disable vs Delete selection (single confirm with both actions) vs Option B (repurpose current button for Delete, add second gesture for Disable).
- Should we hide deleted activities completely in UI, or add an (optional) archived section later? Plan assumes hidden for now.
- Keep `ActivityDialog.tsx` as deprecated wrapper for a short time, or remove immediately?

---

If this plan looks good, I will proceed with implementation in the order A → C → D, with focused commits and minimal surface-area changes.

```

```
# Activities Feature – Optimization and Enhancements Plan

Goal: Improve efficiency of the Activities feature, implement missing update and soft-delete flows in the UI, and decouple dialog logic into one dialog per mode for clearer responsibilities and easier maintenance.

## Scope

- Features covered: `features/activity/*`, dialog registration/host, and minimal touch points in `app/(home)` and timeline hooks that open activity dialogs.
- Data layer already supports update/disable/soft-delete; this plan focuses on wiring the UI, improving performance, and refactoring dialogs.

## Changes Overview

- Implement soft delete (status = `DELETED`) from the Edit dialog with reassignment flow.
- Keep disable/enable actions in Manage dialog; ensure update/edit form flow is complete.
- Decouple current multi-mode `ActivityDialog` into one dialog per mode: legend, manage, create, edit.
- Optimize drag saving (persist on drag end), reduce redundant fetches, and trim re-renders.

## Folder Structure (Simplified)

```
features/activity/
  Activities.tsx                # Shared grid wrapper (view/edit switch)
  components/
    EditActivitiesView.tsx      # Manage grid UI
    ui/                         # Low-level UI primitives (ActivityBox, GridView, etc.)
  dialogs/
    ActivityLegendDialog.tsx    # Legend/view dialog
    ManageActivitiesDialog.tsx  # Manage dialog (reorder/disable/enable)
    CreateActivityDialog.tsx    # Create form dialog
    EditActivityDialog.tsx      # Edit form dialog (with Delete action)
    index.ts                    # Re-exports
  hooks/                        # Existing hooks remain
  constants/
  types.ts
  utils/                        # Local small utilities (if needed)
```

Keep structure small and avoid duplicating logic that already lives under `shared/`.

## Detailed Tasks

### A. Soft Delete and Update UX (Option B — definitive spec)

We adopt Option B with a clear separation of responsibilities between Manage and Edit UIs:

- Manage view (grid with shake/drag):
  - Keep current overlay button behavior as Disable (no delete here).
  - Calls `useActivitiesStore.disableActivity(id)`.
  - Disabled activities section keeps the existing `+` overlay to Enable.

- Edit view (single-activity form):
  - Add a Delete (soft) action in `EditActivityDialog` header.
  - When tapped, run safe-guards and reassignment flow:
    1) If the activity has a parent (`activity.parent_activity_id` is not null), block deletion and show: "This activity is a child of another. Change its parent first before deleting." Abort.
    2) If any activities exist where `parent_activity_id === activity.id` (children), block deletion and show: "This activity has sub-activities. Reassign or remove their parent before deleting." Abort.
    3) Fetch count of timeslices referencing this activity. If zero, proceed to soft delete immediately.
    4) If there are N timeslices, prompt to reassign them to another enabled activity via a simple picker (default filter by same category; allow override).
    5) On confirm, bulk-update those timeslices to the selected replacement activity, then soft delete the original activity.

- Wiring:
  - Soft delete: `useActivitiesStore.softDeleteActivity(id)`.
  - Disable/Enable: `disableActivity(id)` / `enableActivity(id)`.
  - Timeslices reassignment (new helpers, see section F):
    - `getTimeslicesByActivityId(activityId)`
    - `reassignTimeslicesActivity(timesliceIds, newActivityId)`

### B. Ensure Update/Edit Flow Completeness

- `EditActivityDialog` passes correct initial values to `ActivityForm` and calls `useActivitiesStore.updateActivity` on submit.
- Surface validation/errors consistently (reuse existing `useActivityValidation`).

### C. Dialog Refactor (One Dialog per Mode)

- Split `features/activity/ActivityDialog.tsx` into dedicated components in `features/activity/dialogs/`:
  - `ActivityLegendDialog` (legend/view selection grid)
  - `ManageActivitiesDialog` (reorder, disable/enable)
  - `CreateActivityDialog` (create form)
  - `EditActivityDialog` (edit form + Delete action per Option B)
- Each dialog manages its own header props, height, and actions; no internal mode switching.
- Update `shared/dialogs/registry.tsx` to register new dialog types:
  - `activity-legend`, `activity-manage`, `activity-create`, `activity-edit`.
  - Keep legacy `activity` mapped to `ActivityLegendDialog` for backward compatibility.
- Update call sites:
  - `app/(home)/index.tsx`: open `activity-legend` (instead of `activity` with `mode: "legend"`).
  - `features/timeline/hooks/useTimelineActions.ts`: open `activity-legend` when picking activities.
  - From legend, tapping "Edit" opens `activity-manage` as a new dialog.
  - From manage, tapping Add opens `activity-create`; tapping a tile long-press opens `activity-edit`.

### D. Efficiency and Performance Improvements

- Drag ordering persistence:
  - Persist order on drag end (debounced) rather than on every intermediate move; keep optimistic local order during drag.
  - Add optional prop `persistOn: 'end' | 'immediate'` (default `'end'`) to `useDragOperations` for flexibility.
- Reduce redundant fetches in dialogs:
  - Remove extra `getAllActivities()`/`loadStoredOrder()` calls where the store already holds data or a single `refresh()` suffices.
  - Strip console logging in production paths.
- Zustand selector efficiency:
  - Use focused selectors and shallow comparison in hot paths to reduce re-renders.
- Minor UI recalculation improvements:
  - Ensure combined lists and grid config are memoized and dependencies stable.

### E. Tests and Safety

- Existing tests cover activities CRUD API including soft delete. No API-layer behavior changes expected.
- Manual verification steps (see Validation) and quick component-level checks for regressions.

### F. New/Updated API helpers (timeslices)

- `shared/api/resources/timeslices/get.ts`
  - Add `getTimeslicesByActivityId(activityId: string): Promise<Timeslice[]>`.
- `shared/api/resources/timeslices/update.ts`
  - Add `reassignTimeslicesActivity(timesliceIds: string[], newActivityId: string): Promise<Timeslice[]>` that bulk-updates `activity_id`.
- Optional (store): expose wrappers in `useTimeslicesStore` only if needed by UI; otherwise call API helpers directly from the Edit dialog flow.

## Files Impacted

- New files (under `features/activity/dialogs/`):
  - `ActivityLegendDialog.tsx`
  - `ManageActivitiesDialog.tsx`
  - `CreateActivityDialog.tsx`
  - `EditActivityDialog.tsx`
- Modified:
  - `features/activity/components/ui/DraggableActivityItem.tsx` (ensure overlay button = Disable only; remove any delete behavior here)
  - `features/activity/hooks/useActivityManagement.ts` (expose `handleDisableActivity`, add `handleSoftDeleteActivity` for Edit dialog use)
  - `features/activity/hooks/useDragOperations.ts` (persist on drag end)
  - `shared/dialogs/registry.tsx` (register new dialog types; map legacy `activity` to legend)
  - `app/(home)/index.tsx` and `features/timeline/hooks/useTimelineActions.ts` (open new dialog type)
  - `features/activity/ActivityDialog.tsx` (deprecate; keep as wrapper or rename to `.old`)
  - `shared/api/resources/timeslices/get.ts` (add new getter)
  - `shared/api/resources/timeslices/update.ts` (add bulk reassignment)

## Validation

- Soft delete:
  - From Edit dialog, tap Delete → if 0 timeslices and no hierarchy constraints, activity becomes DELETED and disappears from lists; order storage updated.
  - If timeslices exist, reassignment prompt appears; after confirm, timeslices are updated and activity is soft deleted.
- Disable/Enable:
  - From Manage dialog, disable moves to disabled grid; enable restores to enabled grid at preserved position.
- Update:
  - From Edit dialog, change fields and save → activity updates in enabled grid without flicker; order preserved.
- Drag reorder:
  - Reordering is smooth; no excessive saves; final order persists across refresh.
- Dialogs:
  - Legend, Manage, Create, Edit open independently; headers and heights are correct; Done/back actions work; no unintended cross-dialog state.

## Risks / Mitigations

- Dialog type changes could break call sites → keep legacy `activity` mapping; update known callers in this repo.
- Changing drag persistence could alter UX → keep haptics; ensure final save on drag end; add short debounce.
- Reassignment flow adds complexity → scope to Edit dialog only; use simple picker and a single confirm.

## Open Questions for Review

- Approve Option B interaction (Delete only in Edit dialog; Disable only in Manage view)?
- Hide deleted activities completely in UI for now? (Assumed yes.)
- Keep `ActivityDialog.tsx` as a deprecated wrapper temporarily, or rename to `.old` immediately?

## Files Proposed To Be Deprecated (rename with .old for manual review)

- `features/activity/ActivityDialog.tsx` → `features/activity/ActivityDialog.tsx.old`

---

If this plan looks good, I will proceed with implementation in the order A → C → D, with focused commits and minimal surface-area changes.
