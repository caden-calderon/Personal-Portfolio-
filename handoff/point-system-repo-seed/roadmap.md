# Roadmap

## Current Position

The repo contains a dither-lab prototype from the previous direction, but the active product direction is now point-system-first.

The immediate goal is not a polished website.
The immediate goal is proving that the point runtime can carry:

- the look
- animated coherence
- enough performance headroom
- enough flexibility to justify becoming the platform for the rest of Chromatic

## Phase 0: Documentation And Direction Lock

Goals:

- lock the product/technical direction
- preserve the useful train/worldbuilding ideas
- stop accidental drift back into dither-first work

Exit criteria:

- a clean doc set exists
- a new agent can understand repo purpose in one pass
- the next build target is explicit

## Phase 1: Point Rendering Proof Of Concept

Build one narrow vertical slice:

- import one static Blender/glTF asset
- sample persistent points from surfaces
- render on black
- tune density, size, opacity, and bloom
- validate art direction

Exit criteria:

- the look is compelling in motion and stills
- the renderer is stable and debuggable
- the result is clearly stronger than the dither prototype

## Phase 2: Animated Surface Binding

This is the make-or-break phase.

Build:

- one animated/skinned model path
- point binding to a deforming surface
- stable motion without frame-to-frame re-scatter

Preferred technical options:

- triangle + barycentric binding
- direct point skinning

Exit criteria:

- motion reads as coherent and intentional
- silhouettes survive animation
- no obvious swimming or temporal breakup

## Phase 3: Studio / Authoring Tool

Build the tuning environment before the full site.

Needed capabilities:

- load asset/source
- switch render presets
- adjust density, size, glow, culling, color treatment
- inspect performance
- save/load settings

Exit criteria:

- studio is useful as a real look-development tool
- settings are serializable
- renderer can be iterated without site/UI coupling

## Phase 4: Website Consumer

Once the engine is real, build the site around it.

Targets:

- point-based homepage/hero
- point-native project cards/transitions
- DOM-based readable content where accessibility matters
- gradual reintroduction of the train/world concept

Exit criteria:

- site and engine boundaries are clean
- site uses the point runtime instead of owning it

## Phase 5: Additional Source Types

After the core is proven:

- image importer
- video/webcam particle field
- scan/LiDAR ingest
- export/capture tooling
- XR adapters if still strategically valuable

## Immediate Next Work

1. Decide whether to continue in this repo or start a fresh monorepo immediately.
2. If staying here short-term, scaffold the first point renderer rather than extending the dither lab.
3. Choose the canonical point data model before writing importers.
4. Pick the first proof asset from Blender/glTF.
5. Define the minimum controls for the proof of concept.

## Questions To Resolve Early

- Should this repo become the seed of the future monorepo, or should a new repo start clean?
- Are the first rendered points true GL points, instanced discs, or splats?
- What is the first animated asset that can prove temporal coherence?
- Which fields belong in the canonical point model from day one?
- How much of the website should actually render as points versus use the point language more selectively?

