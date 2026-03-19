# Point-System Plan

## Goal

Build a point-based rendering runtime that can become the visual foundation for Chromatic.

## Product Decision

The runtime is the platform.
The website, train experience, studio, and future source adapters are consumers.

## Phase 1 Build Target

Build the smallest proof that can validate the direction:

- one static 3D asset
- `THREE.Points`
- Blender -> glTF mesh export
- runtime point sampling
- black-background presentation
- density/size/glow controls

## Success Criteria

- the look is strong enough to justify the pivot
- the implementation is simple enough to extend
- the next session produces code, not more strategy docs
