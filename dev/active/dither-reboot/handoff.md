# Dither Reboot Handoff

## Current Baseline

- The repo is on the new dither-first SvelteKit + raw Three.js base.
- The active render pipeline is `Prep -> Tone -> Palette -> Dither -> Finish`.
- Palette interpolation now works: modes shape the dither threshold curve, not just preview RGB.
- Color modes (`mono`, `tonal`, `indexed`) are implemented in the shader pipeline. `rgb` is typed but hidden from the UI until implemented.
- The prep stage provides blur and sharpen with early-return passthrough.
- The palette path is texture-backed and ready to grow toward imported palettes and higher-cardinality ramps.
- The current realtime-safe GPU dither set is:
  - `bayer4`
  - `bayer8`
  - `clustered-dot`
  - `interleaved-noise`
- The lab shell now supports:
  - viewport-pinned layout
  - sidebar-only scrolling
  - collapsible controls
  - zoom/pan inspection in the viewport wrapper

## What Changed This Session

1. **Palette interpolation fix** — The dither pass now receives the interpolation mode and applies it to the inter-level fraction before the threshold comparison. Linear = smooth dithering, Step = banded with dithered edges, Contrast = concentrated transitions. Previously, interpolation was invisible when dithering was active.

2. **Prep stage** — New `PrepEffect` pass sits between scene render and tone. Single-pass 3x3 box filter. Blur mixes toward low-pass, sharpen adds back high-frequency detail relative to the original. Both default to 0 (passthrough). The `PrepSettings` type, validation, schema, and UI controls are wired.

3. **Color modes** — `PaletteSettings` now includes a `colorMode` field. Mono thresholds between first/last palette colors (1-bit look). Tonal is the existing ramp behavior. Indexed does per-fragment RGB distance search against the full palette — finds the two nearest colors and dithers between them. The palette pass passes through original RGB in indexed mode so the dither pass can compute distances. `rgb` (per-channel dithering) is typed but hidden from the UI.

4. **Presets updated** — Newsprint Draft now uses `mono` to exercise both shader paths. All other presets use `tonal`.

5. **Tests updated** — 13 unit tests pass. New coverage for prep validation, color mode enum, and serialization round-trips. Type checking and production build pass clean.

## Immediate Next Work

Deepen shader quality and expand the pipeline:

1. **Iterate on art direction** with the new interpolation fix and mono mode.
   The interpolation modes should now produce visibly different dither patterns. Confirm this in practice and tune preset values.

2. **Add the next dither family.**
   Likely modulation or screen-flow rather than another Bayer variant. This should demonstrate that the algorithm-pluggable architecture works for a genuinely different pattern type.

4. **Update Playwright baselines.**
   The interpolation fix and new pipeline shape will have changed rendered output. Baselines need regeneration and review.

## Review / Refactor Notes

- The prep pass uses a 3x3 box filter. If stronger blur is needed later, add a radius parameter or switch to separable Gaussian passes. Don't over-engineer now.
- `rgb` color mode falls back to `tonal` in the shaders. It's hidden from the UI — a future implementation.
- The `encodeInterpolation` and `encodeColorMode` functions are duplicated between `palette-effect.ts` and `dither-effect.ts`. If a third consumer appears, extract to `shader-common.ts`. Two copies is fine.
- The UI template in `LabControls.svelte` uses hardcoded field paths for each control. This is intentional for product control — auto-generated UI from schema metadata is a future decision, not a current need.

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
