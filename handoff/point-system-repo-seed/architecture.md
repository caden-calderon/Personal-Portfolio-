# Point-System Architecture

## Guiding Principle

Do not build one giant pipeline for every medium.

Build:

- one canonical point model
- several ingest pipelines
- several output adapters

This is the only sane way to support 2D, 3D, live media, scans, and future XR without turning the codebase into source-specific conditionals.

## Likely Stack Direction

The implementation details may move into a new monorepo, but the likely technical direction is:

- SvelteKit for app shells and tooling UIs
- raw Three.js for the point renderer/runtime
- Blender and glTF for authored 3D assets
- TypeScript for core/runtime code
- native iOS capture later for LiDAR-specific workflows

The important rule is that the point core should not depend on Svelte component lifecycle or route ownership.

## Canonical Runtime Model

The core primitive should be closer to a surfel than a minimal point.

Suggested fields:

- `id`
- `position`
- `normal`
- `color`
- `size`
- `opacity`
- `sourceUv`
- `sourceType`
- `confidence`
- `groupId`
- `time`

Optional deformation/binding fields:

- `triangleId`
- `barycentric`
- `boneIndices`
- `boneWeights`
- `bindPosition`
- `bindNormal`

Not every source needs every field.
The model needs to be expressive enough that the runtime does not have to fork for each source family.

## System Layers

### 1. Ingest

Source-specific importers produce canonical point data.

Examples:

- `gltf/blender` importer
- `image` sampler
- `video/webcam` particle sampler
- `lidar/scan` importer
- `depth/rgbd` importer

### 2. Processing

Transforms points before render.

Examples:

- normalization and bounds
- density control
- decimation
- clustering
- culling
- color transforms
- temporal smoothing
- LOD generation

### 3. Binding / Animation

Updates points over time.

This is where animated 3D assets either succeed or fail.

Preferred strategies:

- bind points to mesh triangles using barycentric coordinates
- or skin points directly using bone weights
- or use baked caches for heavily art-directed offline motion

Avoid any approach that re-scatters points every frame.

### 4. Rendering

The renderer should support at least:

- `THREE.Points` for cheap dense clouds
- instanced discs/splats for higher-quality surfel-like rendering
- depth-aware compositing
- additive or restrained bloom
- size and opacity modulation
- source-aware materials later

### 5. Application Adapters

Different apps consume the same runtime:

- studio/lab app
- portfolio site
- live media demo
- capture/export tooling
- future XR adapters

## Source Families

### 3D Assets

This is the most important path.

Targets:

- Blender-authored environments
- props and objects
- skinned characters
- camera-composed scenes

This should be the highest-quality path because it carries the main Chromatic world.

### 2D Images And Video

These should use a screen-space particle field or layered depth approximation.

This path is good for:

- project thumbnails
- editorial treatments
- live video experiments
- homepage hero interactions

This path is not a substitute for stable 3D character/world rendering.

### LiDAR / Spatial Scans

This is strategically interesting but should not define the initial architecture.

For Apple devices, native capture is the realistic path.
The web runtime should consume exported data rather than assume browser-first LiDAR APIs.

### XR

VR/AR is an adapter concern, not a foundation concern.
The point runtime should be compatible with XR later, but XR support should not distort early decisions.

## Repo Shape

If Chromatic stays on this path, the likely long-term shape is a monorepo:

```text
apps/
  site/
  studio/
  capture-ios/
packages/
  point-core/
  point-renderer-three/
  point-import-gltf/
  point-import-image-video/
  point-effects/
  point-webxr/
```

This current repo may either:

- become the seed of that monorepo
- or remain a transition/prototype repo and later be replaced by a new dedicated repo

The docs are intentionally written so either outcome is possible.

## Design Constraints

- engine-first, app-second
- framework-agnostic point core
- serializable data and settings
- stable IDs for temporal coherence
- source adapters separated from render runtime
- no Svelte-specific logic inside the core rendering model
- no product-layer hacks inside ingest pipelines

## Risks

### Over-generalization

Trying to support every source type equally on day one will stall the project.

### Under-modeling

If the point primitive is too minimal, skinned animation and scan workflows will force a redesign later.

### Mistaking Effects For Foundation

Bloom, jitter, and shaders are not the architecture.
The hard problem is stable point identity and animation binding.

### Repeating The Previous Mistake

The dither reboot over-invested in a rendering direction before the final visual target was stable.
The point pivot should prove the look with a narrow prototype before broader product work resumes.
