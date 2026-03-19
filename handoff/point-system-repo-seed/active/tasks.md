# Point-System Pivot Tasks

## Completed

- Recognize that the dither-first reboot does not match the strongest visual target.
- Decide that the new target is persistent point/surfel rendering rather than text-art or dither-first post-processing.
- Preserve the original Chromatic train/world concept as product context rather than discarding it.
- Write a new documentation spine for the point-system pivot.
- Document the product vision, architecture direction, roadmap, and active handoff context for the pivot.

## Next

- Decide whether to continue implementation in this repo or start a fresh monorepo.
- Define the canonical point data model in code.
- Choose the first Blender/glTF proof asset.
- Build a minimal point renderer with black-background art direction controls.
- Prove animated surface binding on one asset before broader site work.
- Decide whether the first studio prototype should live inside the current SvelteKit app or in a clean new app package.

## Later

- Build image/video/webcam ingest.
- Build scan/LiDAR ingest.
- Reintroduce the train scene as a consumer of the point runtime.
- Build the functional website layer around the point engine.
- Add export/capture tooling.
- Add XR adapters only if they still matter after the core is proven.

## Risks

- carrying too much dither-first architecture forward into the new system
- trying to support every source type at once
- over-designing the point schema before the first proof exists
- confusing site-level UI decisions with engine/runtime decisions
- treating shaders/effects as the architecture instead of stable point identity and binding

