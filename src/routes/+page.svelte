<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import TrainScene from '$lib/components/scene/TrainScene.svelte';
	import AsciiRenderer from '$lib/components/scene/AsciiRenderer.svelte';
	import FpsCounter from '$lib/components/ui/FpsCounter.svelte';
	import { initDeviceContext, getDeviceContext } from '$lib/stores/device.svelte';
	import { getArtStyle, setArtStyle } from '$lib/stores/art-style.svelte';
	import { ART_STYLES, type ArtStyle } from '$lib/types/art-style';

	let mounted = $state(false);
	let asciiCanvas = $state<HTMLCanvasElement>(null!);

	onMount(() => {
		const cleanup = initDeviceContext();
		mounted = true;
		return cleanup;
	});

	const device = $derived(getDeviceContext());
	const artStyle = $derived(getArtStyle());

	// Grid dimensions derived from device context
	const cols = $derived(device.gridCols);
	const rows = $derived(device.gridRows);

	// Sync output canvas size with viewport
	$effect(() => {
		if (asciiCanvas) {
			asciiCanvas.width = device.viewportWidth;
			asciiCanvas.height = device.viewportHeight;
		}
	});
</script>

{#if mounted}
	<div class="relative h-screen w-screen overflow-hidden bg-black">
		<!-- Hidden WebGL canvas — renders 3D scene to offscreen framebuffer -->
		<div class="absolute inset-0 opacity-0" aria-hidden="true">
			<Canvas renderMode="always">
				<TrainScene />
				<AsciiRenderer {cols} {rows} style={artStyle} outputCanvas={asciiCanvas} />
			</Canvas>
		</div>

		<!-- Visible ASCII output canvas -->
		<canvas bind:this={asciiCanvas} class="absolute inset-0 h-full w-full"></canvas>

		<!-- FPS counter -->
		<FpsCounter />

		<!-- Controls panel -->
		<div class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 font-mono text-xs">
			{#each ART_STYLES as style}
				<button
					class="rounded border px-2 py-1 transition-colors {artStyle === style
						? 'border-green-400 bg-green-400/20 text-green-400'
						: 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/60'}"
					onclick={() => setArtStyle(style)}
				>
					{style}
				</button>
			{/each}
		</div>

		<!-- Debug info -->
		<div class="fixed right-3 top-3 z-50 text-right font-mono text-xs text-white/30">
			<div>{cols}x{rows} cells</div>
			<div>{device.cellSize}px/cell</div>
			<div>{device.isMobile ? 'mobile' : 'desktop'}</div>
		</div>
	</div>
{/if}
