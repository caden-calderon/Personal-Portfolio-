# Chromatic

Chromatic is in the middle of a direction shift.

The old direction was:

- ASCII/text-art train scene
- dither-first render lab

The active direction is:

- point-system-first rendering
- persistent points and surfels
- train/world concept preserved
- website and future tools built around the same point runtime

## Read Order

Start here, then read:

1. `README.md`
2. `docs/vision.md`
3. `docs/architecture.md`
4. `docs/roadmap.md`
5. `dev/active/point-system-pivot/plan.md`
6. `dev/active/point-system-pivot/context.md`
7. `dev/active/point-system-pivot/tasks.md`
8. `dev/active/point-system-pivot/handoff.md`

Historical references:

- `CHROMATIC_V2_HANDOFF.md`
- `dev/active/dither-reboot/*`

## Current Repo Reality

- `src/` still contains the dither-lab prototype from the previous direction.
- The documentation now treats that implementation as transitional, not final.
- Do not deepen the dither architecture by default unless explicitly asked.

## Project Intent

Chromatic should become a point-system platform capable of supporting:

- Blender/glTF assets
- animated/skinned characters
- image and video particle treatments
- future LiDAR/scan inputs
- future XR adapters
- a portfolio site that consumes the same runtime

## Architectural Rules

- The rendering/runtime layer is the product.
- The website and train scene are consumers, not the foundation.
- Build one canonical point model, multiple ingest pipelines, and multiple app adapters.
- Keep the point core framework-agnostic where practical.
- Keep source ingestion separate from rendering and separate from site/UI concerns.
- Preserve accessibility for text and controls instead of forcing all UI into point rendering.

## Commands

```bash
pnpm dev
pnpm build
pnpm check
pnpm test:unit
pnpm test:e2e
pnpm preview
```

## Current Conventions

- Svelte components use runes (`$state`, `$derived`, `$effect`, `$props`)
- TypeScript and strongly typed settings/data are preferred
- The repo is still a SvelteKit workspace today, even though the likely long-term shape is a monorepo
- Documentation for multi-session work lives under `dev/active/`
