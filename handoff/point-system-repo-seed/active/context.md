# Point-System Pivot Context

## Current State

The repository still contains the dither-lab implementation under `src/`, but that is no longer the intended long-term rendering foundation.

Active direction:

- point-system-first rendering
- engine-first architecture
- preserve the Chromatic train/world concept
- defer further dither-specific investment unless explicitly requested

## Why The Shift Happened

The strongest visual references landed on:

- persistent colored points on black
- point-cloud or surfel-like image construction
- more spatial depth than flat dithering
- stronger still-image appeal
- better alignment with future 3D assets and animated scenes

The biggest technical reason for the shift is temporal coherence.
Persistent points attached to geometry are a better foundation for motion than re-evaluated 2D stippling or post-processed dither patterns.

## Product Direction

Chromatic is still a portfolio experience with:

- a world layer
- a functional site layer
- shared content across both

But the new visual language should extend across:

- scenes
- transitions
- project showcases
- thumbnails
- possibly selected interface moments

## Repository Position

This repo is now serving as transition ground.

It may become:

- the seed for a future monorepo

or:

- a documentation/prototype repo that later hands off to a fresh dedicated point-system repository

The docs are written to support either outcome.

## Active Documentation Set

The current source of truth is:

- `README.md`
- `CLAUDE.md`
- `docs/vision.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `dev/active/point-system-pivot/*`

Historical references:

- `CHROMATIC_V2_HANDOFF.md`
- `dev/active/dither-reboot/*`

## What Should Happen Next

- stop deepening the dither stack by default
- decide whether this repo remains the implementation home
- prove the point-rendering look on one static 3D asset
- then prove animated point binding

