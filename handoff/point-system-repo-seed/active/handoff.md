# Point-System Pivot Handoff

## Current Baseline

- The repo's active implementation is still the dither lab.
- The repo's active documentation now points to a point-system-first future.
- The train-compartment portfolio concept remains valid and should be preserved.
- The dither reboot should now be treated as historical context unless a user explicitly asks to continue it.

## What Changed

This session did not pivot the implementation yet.
It pivoted the documentation and project framing.

New docs added:

- `README.md`
- `docs/vision.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `dev/active/point-system-pivot/plan.md`
- `dev/active/point-system-pivot/context.md`
- `dev/active/point-system-pivot/tasks.md`
- `dev/active/point-system-pivot/handoff.md`

Updated agent entry doc:

- `CLAUDE.md`

## How A New Agent Should Start

Read in this order:

1. `CLAUDE.md`
2. `README.md`
3. `docs/vision.md`
4. `docs/architecture.md`
5. `docs/roadmap.md`
6. `dev/active/point-system-pivot/*`

Then inspect `src/` only after understanding that the current code reflects the older dither-first experiment rather than the new target architecture.

## Immediate Recommended Path

1. Decide whether the proof of concept stays in this repo or starts fresh in a new monorepo.
2. Define the canonical point primitive and runtime boundaries.
3. Build the first static 3D asset proof.
4. Build the first animated binding proof.

## Important Constraints

- Do not keep extending dither-specific architecture by default.
- Keep the core runtime framework-agnostic where practical.
- Preserve accessibility for site text and controls even if the surrounding visuals become point-based.
- Keep source ingestion separate from rendering and separate from app shell concerns.

