# Point-System Architecture

## Guiding Principle

Do not build one giant pipeline for every medium.

Build:

- one point core
- source-specific ingest paths
- app-specific consumers

## Likely Stack

- SvelteKit for app shells and tooling
- raw Three.js for rendering
- Blender and glTF for authored 3D assets
- TypeScript for core/runtime code

The point core should not depend on Svelte component lifecycle or route ownership.

## Point Model

### Phase 1 Core

Keep the first payload minimal:

- `position`
- `color`
- `size`
- `normal`
- `opacity`

### Future Fields

Add later only when needed:

- `id`
- `sourceUv`
- `sourceType`
- `confidence`
- `groupId`
- `time`
- `triangleId`
- `barycentric`
- `boneIndices`
- `boneWeights`
- `bindPosition`
- `bindNormal`

## System Layers

### 1. Ingest

Source-specific importers produce point data.

Examples:

- `gltf/blender`
- `image`
- `video/webcam`
- `scan`

### 2. Processing

Processing handles:

- normalization
- density control
- culling
- decimation
- color transforms

### 3. Binding / Animation

Animated assets should not re-scatter points every frame.

Preferred later options:

- triangle + barycentric binding
- direct point skinning
- baked caches when needed

### 4. Rendering

#### Phase 1 Recommendation

Start with `THREE.Points`.

Why:

- fastest route to a working proof
- low implementation overhead
- sufficient for points-on-black with glow

Phase 1 target:

- per-point color
- per-point size
- size attenuation
- black clear color
- restrained bloom

#### Later Options

Upgrade later only if needed:

- instanced discs
- splats/surfels
- more advanced point materials
- depth-aware compositing

## Phase 1 Asset Workflow

Do not invent a custom point format yet.

For the first proof:

1. author the asset in Blender
2. export a normal mesh as glTF
3. load the mesh
4. sample persistent points from the mesh at runtime

Only move to a custom export format if runtime mesh sampling becomes an actual bottleneck or blocks the art workflow.

## Design Constraints

- engine-first, app-second
- framework-agnostic point core
- source adapters separated from render runtime
- preserve stable correspondence for temporal coherence
- no product-layer hacks in ingest paths

## Main Risk

The biggest technical risk is not shaders.
It is stable point identity and animation binding.
