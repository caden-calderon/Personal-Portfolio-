# Dither Reboot Tasks

## Completed

- Review current repository and identify why the ASCII prototype should not be the base for the reboot.
- Choose a dither-first architecture direction.
- Define the engine/UI boundary.
- Define the planned repo organization and build phases.
- Record the reboot plan and context for future sessions.
- Remove the active ASCII/Threlte implementation from `src`.
- Scaffold a framework-agnostic Three.js engine under `src/lib/engine`.
- Implement typed lab settings, validation, serialization, and first-class presets.
- Build a minimal viewport plus controls shell in Svelte without leaking Svelte into engine internals.
- Add a primitive demo scene.
- Implement tone, palette, dither, and finish postprocess stages.
- Add two GPU-safe dither algorithms: Bayer 4x4 and interleaved noise.
- Add unit test infrastructure with Vitest and cover pure settings/registry logic.
- Add Playwright render regression scaffolding and generate the first Chromium baseline snapshot.
- Expand the dither stage with Bayer 8x8 and clustered-dot screening.
- Add deterministic capture-mode preset/algorithm overrides for screenshot generation.
- Expand Playwright baseline coverage across multiple preset/algorithm cases.
- Add palette interpolation, quantization, and tonal bias controls to the typed settings and shader pipeline.
- Refresh preset tuning so palette behavior varies meaningfully across baselines.
- Improve the primitive scene harness for gradients, silhouettes, and varied material response.
- Make capture-mode scene freezing deterministic for screenshot baselines.
- Replace the small palette uniform path with a texture-backed palette foundation.
- Add curated palette packs and matching UI support.
- Raise palette capacity toward the future 64-color target.
- Lock the page shell to the viewport and move scrolling into the settings sidebar.
- Add a collapsible sidebar so the render stage can take the full page width.
- Add viewport zoom and pan inspection controls without pushing that responsibility into the engine.
- Make the sidebar toggle persistent so the controls can always be restored after full-screening the stage.
- Fix palette interpolation: interpolation modes were invisible when dithering was active because the dither pass discarded palette pass RGB and read only the alpha tone value. Interpolation now shapes the dither transition curve directly in the dither shader.
- Add modular Prep stage (blur + sharpen) between scene render and tone pass. Single-pass 3x3 box filter with independent controls, early-return passthrough when both are zero.
- Introduce typed color modes (`mono`, `tonal`, `indexed`, `rgb`) on the palette foundation. `mono`, `tonal`, and `indexed` are implemented in the active pipeline. `rgb` currently exists as an engine path but remains hidden from the public UI until its control semantics are cleaned up.
- Wire color mode and prep controls into the settings schema, UI, presets, and validation.
- Update unit tests to cover prep settings, color mode validation, and serialization round-trips.
- Newsprint Draft preset now uses `mono` color mode to exercise both tonal and mono paths.
- Implement `indexed` color mode with per-fragment nearest-color RGB distance search. Dithers between the two closest palette colors. Palette pass passes through original RGB so the dither pass can compute distances. Preview (dithering off) snaps to nearest palette color.
- Implement `rgb` color mode with per-channel quantization and dithering. Each R, G, B channel is independently scaled to palette-size levels, dithered against the same spatial threshold, and quantized. Palette pass passes through original RGB. Preview (dithering off) snaps each channel to nearest level.
- Review pass: fix mono preview so dither-disabled mono stays binary, correct the prep kernel to a true 3x3 box filter, and temporarily hide `rgb` from the public control schema pending semantics review.
- Investigate the large client chunk. The route entry now lazy-loads `ChromaticEngine`, and Vite splits `three` and `postprocessing` into separate vendor chunks. Initial route payload is down to roughly 101 kB of preloaded JS; the remaining warning is the standalone `three` vendor chunk at roughly 501.6 kB. Testing `three/src/Three.js` made that worse, so the public package entry remains the baseline.
- Fix the lazy-load controls regression. `LabViewport` now reads `settings` before the engine null-guard in its reactive effect so settings changes remain tracked after the async engine import resolves.
- Restore `rgb` to the public color-mode selector as an explicit experimental option so the UI matches the implemented engine path.

- Add three new GPU-safe dither algorithms: Line Screen (halftone sine-wave stripes, screened), Crosshatch (layered diagonal accumulation, ordered), Concentric Screen (tiling concentric rings, screened). All pure math, no textures. Algorithm count now 7.

## Next

- Refine shader quality now that the algorithm set is broader.
- Decide whether `rgb` mode should be palette-count-based, palette-derived, or moved out of `PaletteSettings` before it returns to the UI.
- Design the settings shape for future masks, transparency-aware processing, and text overlays without coupling them to Svelte or route code.
- Decide whether capture/export hooks belong in the engine core or in adjacent tooling.
- Add the first image palette import flow and worker-side extraction path.
- Decide whether the next evaluation target should be a richer primitive scene variant or the first Blender-driven environment slice.
- Revisit the remaining `three` vendor chunk only if route count grows, renderer reuse expands across pages, or import-level changes justify trading maintainability for finer-grained bundle splitting.
- Update Playwright render regression baselines to match the interpolation fix and new pipeline shape.

## Later

- Add experimental CPU diffusion path in a worker.
- Add Blender asset integration.
- Add character rig and clip playback pipeline.
- Add export and capture utilities.
- Reintroduce website-layer concerns only after the dither lab is proven.

## Risks To Watch

- overbuilding the parameter system before real rendering needs appear
- letting experimental diffusion requirements distort the realtime pipeline
- tying engine internals back to Svelte component lifecycle
- adding new controls as ad hoc shader flags instead of stage-level modules
- letting build size/perf work distract from proving the art direction too early
