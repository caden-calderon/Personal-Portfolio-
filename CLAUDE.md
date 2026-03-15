# Chromatic V2

Dual-world interactive portfolio: ASCII-rendered train scene + functional website layer.

## Stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes mode enforced)
- **3D**: Threlte 8 (Three.js + Svelte)
- **Styling**: Tailwind CSS 4 (CSS-native config via `@theme`)
- **Post-processing**: `postprocessing` lib with Threlte's `useTask`
- **Audio**: Howler.js
- **LLM**: Claude API (server-side proxy via SvelteKit API routes)
- **Deployment**: Vercel (`@sveltejs/adapter-vercel`)
- **Package manager**: pnpm

## Architecture

See `CHROMATIC_V2_HANDOFF.md` for full design doc.

### Key patterns

- **DeviceContext store** (`$lib/stores/device.svelte.ts`) — single source of truth for responsive behavior
- **ArtStyle store** (`$lib/stores/art-style.svelte.ts`) — global style coupling between train scene and website
- **StyleProcessor interface** (`$lib/services/style-processor.ts`) — abstract CPU/GPU ASCII rendering
- **Manifest-driven projects** — `$lib/data/projects.manifest.json` drives both train objects and website pages

### Directory structure

```
src/lib/
├── components/
│   ├── scene/      # Train scene (Threlte 3D components)
│   ├── website/    # Website layer components
│   └── ui/         # Shared UI (conversation, overlays)
├── stores/         # Svelte 5 runes stores (.svelte.ts)
├── services/       # LLM, StyleProcessor, VoiceProvider
├── types/          # TypeScript interfaces
├── data/           # Manifests, animation clips, system prompt
└── utils/          # Art style mappers, grid math, shaders
```

## Commands

```bash
pnpm dev              # Dev server
pnpm dev --host       # Dev server exposed on LAN (mobile testing)
pnpm build            # Production build
pnpm check            # Type checking
pnpm preview          # Preview production build
```

## Conventions

- All Svelte components use runes (`$state`, `$derived`, `$effect`, `$props`)
- Stores use `.svelte.ts` extension for runes reactivity
- Types live in `$lib/types/`, exported via barrel `$lib/index.ts`
- Threlte components: callback props (`onclick`), not event directives (`on:click`)
- Threlte snippets (`{#snippet}`), not slots
- No `export let` — use `let { prop } = $props()`
