# Roadmap

## Current Position

Phase 0 is complete.
The direction is locked and the next job is implementation.

## Phase 1: Point Rendering Proof Of Concept

Build one narrow vertical slice:

- one static Blender/glTF asset
- runtime point sampling from the mesh
- `THREE.Points`
- black background
- density, size, opacity, and bloom controls

Exit criteria:

- compelling stills
- compelling motion
- stable rendering
- enough promise to justify Phase 2

## Phase 2: Animated Surface Binding

Build:

- one animated/skinned asset path
- stable point motion attached to a deforming surface

Exit criteria:

- no obvious swimming
- silhouettes survive animation
- motion reads as intentional

## Phase 3: Studio / Authoring Tool

Build a small tuning environment:

- load asset
- adjust density, size, glow, culling, color treatment
- inspect performance
- save/load settings

## Phase 4: Website Consumer

Once the runtime is real:

- build the site around it
- introduce point-based heroes, previews, and transitions
- keep core content readable and accessible
- reintroduce the train/world concept deliberately

## Later

- image importer
- video/webcam path
- scan/LiDAR ingest
- export/capture tooling
- XR adapters if still strategically valuable

## Immediate Next Work

1. Choose the first Blender/glTF proof asset.
2. Implement a minimal `THREE.Points` renderer.
3. Sample points from the mesh at load time.
4. Add the minimum controls.
5. Evaluate the look before broadening scope.
