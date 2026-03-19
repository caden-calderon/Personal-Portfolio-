# Chromatic

Point-system portfolio and visual engine.

## Read Order

1. `README.md`
2. `vision.md`
3. `architecture.md`
4. `roadmap.md`
5. `active/plan.md`
6. `active/context.md`
7. `active/tasks.md`
8. `active/handoff.md`

## Core Rules

- The renderer/runtime is the product.
- The website and train experience are consumers of that runtime.
- Keep the core independent of Svelte route/component ownership.
- Keep readable text, forms, and navigation in the DOM.
- Build code next. Do not spend the next session expanding docs.

## Phase 1 Defaults

- Start with `THREE.Points`.
- Export a normal mesh/glTF from Blender.
- Sample points from the mesh at load time.
- Keep the Phase 1 point payload minimal.

## Commands

```bash
pnpm dev
pnpm build
pnpm check
pnpm test:unit
pnpm test:e2e
pnpm preview
```
