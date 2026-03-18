# Dither Reboot Plan

## Goal

Reboot the current one-day ASCII prototype into a dither-first visual system for Chromatic.

The base must be:

- modular
- testable
- strongly typed
- easy to tune visually
- organized for long-term growth without premature abstraction

The immediate objective is not "the final portfolio site". The immediate objective is a durable rendering foundation and a visual proving ground for the art direction.

## Core Product Decision

The rendering pipeline is the product. The website, conversation layer, and train interaction system are downstream consumers of that pipeline.

This means the reboot should be centered on a rendering engine with a configurable dither pipeline, not on a route-level scene component tree.

## Architecture Decision

### Chosen direction

Use:

- SvelteKit + Svelte 5 for the app shell, controls, presets UI, and future website layer
- raw Three.js for the render engine
- `postprocessing` `EffectComposer` for pass orchestration

Do not use Threlte as the core rendering abstraction for the reboot.

### Why

The previous prototype mixed scene ownership, render ownership, and Svelte lifecycle in the same components. That is acceptable for a one-day test and wrong for a long-lived render lab.

For a dither-first project, the hard problems are:

- pass ordering
- render targets
- palette quantization
- shader variants
- CPU versus GPU algorithm families
- deterministic parameter control
- future export paths

Those are better served by an explicit engine module than by declarative scene composition.

Three.js also keeps the render core portable if we later want:

- offline exporters
- a non-Svelte preview tool
- worker-based or headless utilities
- isolated render regression testing

### Tradeoff

This increases imperative boilerplate for scene setup and asset wiring.

That trade is worth it because most of the long-term complexity is in the render pipeline, not in authoring dozens of interactive scene components.

## Guiding Design Principles

1. Separate tonal styling from dithering.
2. Separate realtime algorithms from offline or experimental algorithms.
3. Keep the render engine framework-agnostic.
4. Keep all visual controls typed and schema-driven.
5. Make presets first-class.
6. Optimize for artistic iteration, not early feature breadth.

## What We Are Building First

A dither lab with:

- a canvas-based render viewport
- a simple test scene
- typed controls for palette, exposure, pixel size, algorithm, and related parameters
- multiple dither algorithms behind a stable interface
- a preset system
- test coverage for math/config code
- screenshot-based render regression coverage

No LLM.
No website layer.
No final laptop transition.
No full content system.

Those only come after the visual pipeline is proven.

## Pipeline Model

The intended image pipeline is:

1. Render scene to a framebuffer.
2. Apply optional image-prep adjustments.
3. Convert to the intended working color space.
4. Apply tonal shaping.
5. Map into the chosen color mode and palette model.
6. Apply the selected dither algorithm.
7. Apply optional finishing passes.
8. Present to screen or export.

Current concrete runtime pipeline:

`Scene -> Tone Pass -> Palette Pass -> Dither Pass -> Finish Pass -> Output`

Near-term target pipeline:

`Scene -> Prep Pass -> Tone Pass -> Color Mode / Palette Pass -> Dither Pass -> Finish Pass -> Output`

The current implementation already uses a texture-backed palette transport rather than a tiny uniform array.
That decision is intentionally foundational because it makes larger palette sizes, curated packs, imported palettes,
and indexed/full-color modes practical without another rewrite of the shader transport.

### Prep Pass

Responsible for image conditioning before tone and palette mapping.

Initial candidates:

- blur
- sharpen
- denoise
- edge-preserving cleanup where useful
- future 2x sampling / edge-preservation strategies

This stage should remain optional and modular. It exists to support art direction, not to force a Photoshop-style stack into the engine.

### Tone Pass

Responsible for:

- exposure
- contrast
- gamma
- brightness
- blacks and whites
- optional posterization
- optional edge emphasis or normal/depth accenting later

This pass exists so the dither stage receives a controllable tonal field instead of raw scene color.

### Palette Pass

Responsible for:

- texture-backed palette lookup
- curated palette packs
- custom user palettes
- palette interpolation mode
- quantization amount
- highlight/shadow bias
- future palette import from images
- future higher-cardinality palettes up to at least 64 colors

This is the artistic heart of the system. Dithering is not enough on its own. The palette model has to be explicit and independently tunable.

### Color Modes

The current tonal path should evolve into explicit color modes rather than accreting one-off flags.

Planned initial modes:

- `Mono`
- `Tonal`
- `Indexed`
- `RGB`

This keeps future features composable:

- retro monochrome looks
- richer tonal ramps
- palette-extracted indexed color
- full-color channel-driven dithering

The important design choice is that color-mode selection should sit above algorithm choice.
The same dither family should be able to operate on different palette/color strategies where it makes artistic and technical sense.

### Dither Pass

Responsible for thresholding or diffusion.

This must be algorithm-pluggable.

The current realtime-safe set already validates the shape of this layer:

- Bayer 4x4
- Bayer 8x8
- clustered-dot screening
- interleaved noise

The next family should likely be a modulation or screened-flow style algorithm rather than just another Bayer variant.

### Finish Pass

Reserved for:

- grain
- vignette
- subtle bloom if desired
- scanline or print texture
- temporal effects if intentionally stylized
- future bleed / rounding controls where they support the look

### Masking And Precision

Transparency, text overlays, and local masking are not immediate build targets, but the engine should leave room for them cleanly.

That means:

- serialized settings should remain stage-oriented
- masks should compose as data inputs to passes, not route-specific hacks
- transparency/text rendering should be able to reuse the same palette and dither logic
- precision-oriented controls should be added as isolated modules, not by entangling the base shader graph

## Algorithm Families

The architecture must support two different execution classes.

### 1. Realtime GPU algorithms

These are the default runtime path.

Candidates:

- Bayer ordered dithering
- clustered-dot ordered dithering
- blue-noise threshold dithering
- AM screening variants
- FM screening variants based on threshold textures or stochastic masks
- hybrid threshold approaches

These fit a fragment-shader pipeline well and are the right default for an animated interactive scene.

### 2. Experimental or offline CPU algorithms

These include classic error-diffusion styles:

- Floyd-Steinberg
- Atkinson
- Jarvis-Judice-Ninke
- Sierra and related kernels later

These should not dictate the base render architecture because they have different execution characteristics.

They are still valuable:

- as experimental preview modes
- as still-image modes
- as recorded-loop export modes
- as "imperfect" art modes where shimmer is acceptable or desirable

### Critical implication

We should not pretend that all algorithms are equal at runtime.

The system should expose algorithm capabilities explicitly:

- realtime-safe
- animated-safe
- export-only
- supports color palette
- supports grayscale only
- deterministic
- temporally unstable by design

That keeps the UI honest and prevents the engine from being designed around false symmetry.

## Parameter System

Customizability is a core product requirement, so parameters must be treated as data.

Each algorithm and pass should expose:

- stable id
- default values
- validation constraints
- UI metadata
- serialization format

We should define a small schema model, not a huge framework.

Example categories:

- global render settings
- prep settings
- tone settings
- color mode settings
- palette settings
- algorithm settings
- debug settings

This schema should power:

- UI controls
- preset serialization
- URL sharing later
- validation
- default generation

## Preset Model

Presets should be first-class from the start.

Each preset should capture:

- scene id
- camera preset
- palette preset
- tone settings
- algorithm id
- algorithm parameters
- finish settings

Future use:

- user-facing style selection
- saved creative looks
- per-project website themes
- A/B testing for art direction

## Engine / UI Boundary

The render engine should be pure TypeScript and own:

- renderer
- scene
- camera
- composer
- passes
- asset loading
- animation playback
- timing
- frame stats hooks

Svelte should own:

- layout
- controls
- preset selection
- future route transitions
- future website presentation

Svelte talks to the engine through a small controller API.

## Character Strategy

Do not attempt "video to full 3D person reconstruction" as the base plan.

Base plan:

- build a simple seated stylized character rig in Blender
- record a small clip library
- extract pose and face data from prerecorded video
- retarget onto the rig
- clean only the places that need cleanup
- render through the same pipeline as the environment

This gives the right balance of:

- natural motion
- low manual animation burden
- unified visual treatment
- controllable runtime asset format

The project explicitly allows imperfections. We should embrace that, but the runtime representation still needs to be a manageable rig or animation asset, not an ad hoc reconstruction experiment.

## Repo Layout Proposal

```text
dev/
  active/
    dither-reboot/
      plan.md
      context.md
      tasks.md

src/
  routes/
    +layout.svelte
    +page.svelte

  lib/
    app/
      presets/
      stores/
      state/

    engine/
      core/
        engine.ts
        renderer.ts
        lifecycle.ts
      scene/
        test-scene.ts
        loaders/
      pipeline/
        composer.ts
        registry.ts
        passes/
        algorithms/
        palettes/
        params/
      character/
        rig/
        clips/
        retarget/
      debug/
        stats.ts
        probes.ts

    components/
      viewport/
      controls/
      panels/
      layout/

    types/
    utils/

tests/
  unit/
  render/
  integration/

tools/
  capture/
  palette/
  mocap/
```

## Testing Strategy

### Unit tests

Use Vitest for pure logic:

- palette interpolation
- threshold matrix generation
- diffusion kernel definitions
- config validation
- preset serialization
- parameter normalization

### Render regression tests

Use Playwright screenshot tests for:

- representative preset renders
- algorithm switching
- palette correctness
- viewport resizing

These should run against deterministic scenes and seeded parameters.

### Manual perf checks

Use an internal debug panel for:

- frame time
- draw calls
- render resolution
- selected algorithm
- current preset

Formal performance budgets can come after the lab is stable.

## Phased Build Sequence

### Phase 1: Foundation reboot

- strip the ASCII-specific architecture
- add test infrastructure
- build engine shell
- build parameter schema
- build minimal control UI

### Phase 2: Realtime dither lab

- primitive scene
- tone pass
- palette pass
- first GPU algorithms
- preset save/load
- screenshot regression tests

### Phase 3: Experimental diffusion modes

- worker-based CPU processing path
- Atkinson/Floyd-Steinberg/JJN prototypes
- still/export workflow if realtime is poor

### Phase 4: Blender integration

- glTF train compartment
- asset loader and scene slots
- camera composition pass tuning

### Phase 5: Character integration

- seated rig
- clip library
- retargeting pipeline
- first idle and interaction clips

### Phase 6: Website and public-facing controls

- transition architecture
- website layer
- optional user customization surface

## Non-Goals Right Now

- deciding the final "hero" dither algorithm before visual testing
- building the LLM character system
- implementing portfolio content infrastructure
- solving audio, transitions, and mobile polish now

## First Concrete Deliverable

The first implementation milestone should be:

"A primitive 3D scene rendered through a configurable palette + dither pipeline with at least two GPU algorithms, strongly typed controls, presets, and screenshot tests."

If that does not look compelling in motion, nothing else should be built on top of it.
