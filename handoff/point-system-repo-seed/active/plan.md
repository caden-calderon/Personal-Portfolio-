# Point-System Pivot Plan

## Goal

Reframe Chromatic around a point-system rendering engine that can support:

- Blender/glTF scenes
- animated characters
- images
- video and webcam sources
- future LiDAR/scan sources
- future VR/AR adapters

without tying the architecture to any single source type or app shell.

## Core Decision

The renderer/runtime is the platform.
The website, train scene, studio, and future capture/XR work are consumers of that platform.

## What Carries Forward

From the original Chromatic vision:

- train-compartment worldbuilding
- content mirroring between experiential and functional layers
- cinematic atmosphere
- interactive project presentation
- portfolio as an authored experience rather than a plain site

## What Changes

The rendering foundation is no longer:

- ASCII
- braille
- text-art post-processing
- dither-first tone pipeline

It is now:

- persistent points
- surfels
- point-cloud-like rendering
- stable temporal identity
- source ingestion into a canonical point runtime

## Architectural Direction

Build:

1. a canonical point representation
2. importers for specific source families
3. a Three.js-based renderer/runtime
4. app adapters on top

Do not build one giant source-specific pipeline.

## Immediate Build Target

The next meaningful prototype is a narrow proof of concept:

- one static 3D asset
- one persistent point renderer
- one black-background visual presentation
- point size/density/glow tuning

Then prove animated surface binding before any broader product work.

## Success Criteria

- the look is compelling enough to justify the pivot
- animated points remain coherent
- the runtime feels reusable across multiple source types
- the docs are clear enough that a new agent can pick up work quickly

