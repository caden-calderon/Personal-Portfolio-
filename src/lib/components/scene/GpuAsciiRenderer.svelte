<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';
	import { AsciiEffect } from '$lib/effects/ascii-effect';
	import type { ArtStyle } from '$lib/types/art-style';

	// Character sets sorted by visual density (light to dark)
	// Braille and halftone get smaller cells for higher detail
	const STYLE_CONFIGS: Record<
		ArtStyle,
		{ chars: string; cellSize: number; color: string | null; font: string }
	> = {
		braille: { chars: '⠀⠁⠃⠇⡇⣇⣧⣷⣿', cellSize: 6, color: null, font: 'monospace' },
		halftone: { chars: ' .·•●', cellSize: 10, color: null, font: 'serif' },
		ascii: { chars: ' .:-=+*#%@', cellSize: 10, color: '#33ff33', font: 'monospace' },
		block: { chars: ' ░▒▓█', cellSize: 8, color: '#33ff33', font: 'monospace' },
		ansi: { chars: ' .:-=+*#%@', cellSize: 10, color: null, font: 'monospace' },
		stipple: { chars: ' ·∙•◦○●', cellSize: 8, color: null, font: 'monospace' }
	};

	let { style }: { style: ArtStyle } = $props();

	const { scene, renderer, camera, size, autoRender, renderStage } = useThrelte();

	const asciiEffect = new AsciiEffect({
		characters: STYLE_CONFIGS.braille.chars,
		cellSize: STYLE_CONFIGS.braille.cellSize,
		color: STYLE_CONFIGS.braille.color,
		font: STYLE_CONFIGS.braille.font
	});

	const composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene);
	const asciiPass = new EffectPass(undefined, asciiEffect);

	composer.addPass(renderPass);
	composer.addPass(asciiPass);

	// React to camera changes
	$effect(() => {
		const cam = camera.current;
		renderPass.mainCamera = cam;
		asciiPass.mainCamera = cam;
	});

	// React to size changes
	$effect(() => {
		const s = size.current;
		if (s.width > 0 && s.height > 0) {
			composer.setSize(s.width, s.height);
		}
	});

	// React to style changes
	$effect(() => {
		const cfg = STYLE_CONFIGS[style];
		asciiEffect.setCharacters(cfg.chars, cfg.font);
		asciiEffect.cellSize = cfg.cellSize;
		asciiEffect.setColor(cfg.color);
	});

	onMount(() => {
		const prev = autoRender.current;
		autoRender.set(false);
		return () => {
			autoRender.set(prev);
			composer.dispose();
		};
	});

	useTask(
		(delta) => {
			composer.render(delta);
		},
		{ stage: renderStage, autoInvalidate: false }
	);
</script>
