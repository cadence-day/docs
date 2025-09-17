# Timeline feature

## Overview

The Timeline feature renders a user's day as a horizontal sequence of time slices. It provides UI for viewing, creating, and interacting with activity timeslices and metadata. It is designed to be modular and reactive, using hooks and small presentational components.

## Key files

- `Timeline.tsx` — main view component that composes the timeline and handles high-level layout.
- `components/TimelineTimeslices.tsx` — renders the list of timeslice elements and handles virtualization/scroll behaviour.
- `components/ui/TimeSlice.tsx` — presentational component for an individual timeslice.
- `components/ui/MetadataVertical.tsx` — small UI for metadata shown along the timeline.
- `hooks/` — feature-local hooks that encapsulate behaviour (creation, scrolling, data, refresh, haptics).
- `styles.ts`, `constants/dimensions.ts`, `types.ts`, `utils.ts` — supporting utilities, styles and types.

## Implementation notes

- Data flow: `useTimelineData` provides the timeslices and derived layout information to `TimelineTimeslices` and `Timeline.tsx`.
- User actions: `useTimelineActions` exposes create/update/delete handlers and integrates with stores/backing APIs.
- Automatic creation: `useAutomaticTimesliceCreation` contains logic to create pending timeslices (e.g., when the user starts tracking an activity).
- UX helpers: `useScrollToCurrent` ensures the current time is visible; `useWheelHaptics` adds haptic feedback for wheel/scroll interactions.

## Contract (inputs/outputs)

- Input: a set of timeslice records (typed in `types.ts`) and optional UI state (selected slice, zoom level).
- Output: user interactions via handlers (select, create, update, delete) and visual updates to the timeline.

## Edge cases and behavior

- Empty day: timeline renders placeholder state and allows quick creation of the first timeslice.
- Overlapping timeslices: layout utilities in `utils.ts` handle stacking and metadata placement.
- Large number of slices: `TimelineTimeslices` is optimized to avoid rendering work for off-screen slices.

## Dev notes

- Keep presentational components small and stateless. Move logic into hooks.
- Types in `types.ts` should be the source of truth for stores and API responses.
- When changing layout constants, check `constants/dimensions.ts` and `styles.ts` together.

## Where to look next

- If you need to modify creation behaviour, start with `hooks/useAutomaticTimesliceCreation.ts`.
- For scroll/visibility issues, inspect `hooks/useScrollToCurrent.ts` and `components/TimelineTimeslices.tsx`.

## Quick try (dev)

Open the app in the simulator and navigate to the timeline screen (usually under the home or main tab) to see live updates while editing hooks or components.

---

This README is intentionally short; refer to the individual files in this folder for implementation details.
