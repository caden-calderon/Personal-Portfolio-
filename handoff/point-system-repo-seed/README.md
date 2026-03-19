# Chromatic

Chromatic is shifting from an ASCII/dither-first portfolio prototype into a point-system visual engine and portfolio experience.

The long-term product is still the same broad idea:

- a stylized train-compartment portfolio
- a cinematic experiential layer
- a functional website layer
- shared content across both

What changed is the rendering foundation.
The current direction is persistent points, surfels, and point-cloud-like rendering rather than text-art post-processing.

## Status

This repository is in transition.

- The current `src/` app still contains the dither-lab prototype from the previous direction.
- The active documentation now defines the point-system pivot.
- The next substantial implementation step is to build a narrow point-rendering proof of concept rather than continue deepening the dither stack.

## Read This First

If you are a new engineer or agent, read these in order:

1. `CLAUDE.md`
2. `docs/vision.md`
3. `docs/architecture.md`
4. `docs/roadmap.md`
5. `dev/active/point-system-pivot/plan.md`
6. `dev/active/point-system-pivot/context.md`
7. `dev/active/point-system-pivot/tasks.md`
8. `dev/active/point-system-pivot/handoff.md`

Historical reference:

- `CHROMATIC_V2_HANDOFF.md` documents the original train + ASCII/text-art concept and still matters for product/worldbuilding context.
- `dev/active/dither-reboot/` captures the dither-first reboot that is now being treated as an intermediate experiment rather than the final rendering direction.

## What This Repo Is For

Right now this repo serves three purposes:

1. preserve the Chromatic product vision and worldbuilding
2. document the point-system pivot clearly enough to hand off to a new Codex/Claude agent
3. provide a place to prototype the first point-based runtime decisions before deciding whether to split into a dedicated new monorepo

## Commands

These commands reflect the current SvelteKit prototype in this repo:

```bash
pnpm dev
pnpm build
pnpm check
pnpm test:unit
pnpm test:e2e
pnpm preview
```

## Immediate Next Step

Do not keep extending the dither engine by default.

The next meaningful implementation target is a point-system proof of concept with:

- one Blender/glTF asset
- one persistent point renderer
- one animation path
- one black-background art-direction pass
- enough controls to tune density, size, color, and glow

