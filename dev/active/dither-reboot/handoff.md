# Dither Reboot Handoff

## Current Baseline

- The repo is on the new dither-first SvelteKit + raw Three.js base.
- The active render pipeline is `Prep -> Tone -> Palette -> Dither -> Finish`.
- Palette interpolation now works: modes shape the dither threshold curve, not just preview RGB.
- Color modes (`mono`, `tonal`, `indexed`) are implemented and exposed in the lab. `rgb` is also exposed again as an explicit experimental option so the UI matches the implemented engine path.
- The prep stage provides blur and sharpen with early-return passthrough on top of a true 3x3 box filter.
- The palette path is texture-backed and ready to grow toward imported palettes and higher-cardinality ramps.
- The route shell no longer eagerly bundles the renderer stack. `LabViewport` lazy-loads `ChromaticEngine`, and Vite splits `three` and `postprocessing` into vendor chunks.
- The current realtime-safe GPU dither set is:
  - `bayer4` — ordered, 4x4 matrix
  - `bayer8` — ordered, 8x8 matrix
  - `clustered-dot` — screened, radial clusters
  - `interleaved-noise` — stochastic, hash-based
  - `line-screen` — screened, sine-wave halftone stripes at 45 degrees
  - `crosshatch` — ordered, layered diagonal lines that accumulate with tone
  - `concentric` — screened, concentric rings radiating from tile centers
- The lab shell now supports:
  - viewport-pinned layout
  - sidebar-only scrolling
  - collapsible controls
  - zoom/pan inspection in the viewport wrapper

## What Changed This Session

1. **Review corrections** — Mono preview now stays binary when dithering is disabled, instead of stepping through intermediate swatches. The prep kernel now matches the documented 3x3 box filter instead of averaging only the eight neighbors.

2. **Palette interpolation fix** — The dither pass now receives the interpolation mode and applies it to the inter-level fraction before the threshold comparison. Linear = smooth dithering, Step = banded with dithered edges, Contrast = concentrated transitions. Previously, interpolation was invisible when dithering was active.

3. **Prep stage** — New `PrepEffect` pass sits between scene render and tone. Single-pass 3x3 box filter. Blur mixes toward low-pass, sharpen adds back high-frequency detail relative to the original. Both default to 0 (passthrough). The `PrepSettings` type, validation, schema, and UI controls are wired.

4. **Color modes** — `PaletteSettings` now includes a `colorMode` field. Mono thresholds between first/last palette colors (1-bit look). Tonal is the existing ramp behavior. Indexed does per-fragment RGB distance search against the full palette — finds the two nearest colors and dithers between them. The palette pass passes through original RGB in indexed mode so the dither pass can compute distances. `rgb` is exposed in the UI again as an experimental mode.

5. **Presets updated** — Newsprint Draft now uses `mono` to exercise both shader paths. All other presets use `tonal`.

6. **Bundle review** — The page entry chunk is no longer bloated by Three/postprocessing. The engine now loads behind `onMount()`, and Vite emits separate `vendor-three` and `vendor-postprocessing` chunks. Current build inspection shows roughly 101 kB of route-shell JS on first load, with the renderer path deferred to an additional roughly 561 kB after mount. The only remaining build warning is a standalone Three chunk at roughly 501.6 kB, which is acceptable for now because it is no longer part of first-route hydration.

7. **Lazy-load regression fix** — Control changes stopped applying after the engine was moved behind an async import. Root cause: the viewport `$effect` short-circuited on `engine?.setSettings(settings)` while `engine` was still `null`, so `settings` was never tracked as a dependency on the first run. The effect now reads `settings` before the null-guard, which restores live control updates.

8. **RGB selector restored** — `rgb` is visible in the color-mode selector again, labeled experimental so the current palette/control mismatch stays explicit instead of disappearing from the product.

9. **Tests updated** — 14 unit tests pass. Type checking and production build pass clean.

## Immediate Next Work

Deepen shader quality and expand the pipeline:

1. **Iterate on art direction** with the new interpolation fix and mono mode.
   The interpolation modes should now produce visibly different dither patterns. Confirm this in practice and tune preset values.

2. **Add the next dither family.**
   Likely modulation or screen-flow rather than another Bayer variant. This should demonstrate that the algorithm-pluggable architecture works for a genuinely different pattern type.

3. **Settle `rgb` mode semantics before re-exposing it.**
   Right now the engine path quantizes per channel by palette size, which is not yet a coherent match for the palette-editing UI. Decide whether it should use palette-derived channel ramps, a separate settings shape, or stay engine-only.

4. **Update Playwright baselines.**
   The interpolation fix and review corrections may have changed rendered output. Baselines need regeneration and review once Chromium can run outside the current sandbox restriction.

## Review / Refactor Notes

- The prep pass uses a 3x3 box filter. If stronger blur is needed later, add a radius parameter or switch to separable Gaussian passes. Don't over-engineer now.
- `rgb` color mode has an engine path and is exposed in the UI again, but the current palette controls still imply semantics it does not fully honor yet. Treat it as experimental until that model is cleaned up.
- The `encodeInterpolation` and `encodeColorMode` functions are duplicated between `palette-effect.ts` and `dither-effect.ts`. If a third consumer appears, extract to `shader-common.ts`. Two copies is fine.
- The UI template in `LabControls.svelte` uses hardcoded field paths for each control. This is intentional for product control — auto-generated UI from schema metadata is a future decision, not a current need.
- The remaining chunk warning is not a page-entry regression anymore. Avoid importing Three internals just to shave a few kilobytes unless bundle pressure becomes a demonstrated product problem.
- An experiment aliasing `three` to `three/src/Three.js` increased both module count and final vendor size. Keep using the public `three` entry unless there is a stronger reason to trade maintainability for custom bundling.
- When using Svelte runes with lazy-loaded objects, avoid optional-chaining away reactive reads inside `$effect`; otherwise the intended dependency may never be tracked on the first run.

## Known User Priorities

- Modulation dithering is a priority once the pipeline base is ready.
- The product should stay highly modular and customizable.
- Future controls may include:
  - transparency-aware processing
  - text mode / text overlays
  - mask mode
  - 2x sampling / edge-preservation
  - bleed / rounding / stylization controls
- Those should land as stage-level modules, not as ad hoc flags scattered through existing shaders.

## Constraints

- Do not revive the old ASCII architecture.
- Keep the engine framework-agnostic where practical.
- Keep settings serializable and typed.
- Prefer test coverage for pure logic and stable regression coverage for render output.
