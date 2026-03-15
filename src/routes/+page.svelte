<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import TrainScene from '$lib/components/scene/TrainScene.svelte';
	import GpuAsciiRenderer from '$lib/components/scene/GpuAsciiRenderer.svelte';
	import FpsCounter from '$lib/components/ui/FpsCounter.svelte';
	import { initDeviceContext, getDeviceContext } from '$lib/stores/device.svelte';
	import { getArtStyle, setArtStyle } from '$lib/stores/art-style.svelte';
	import { ART_STYLES } from '$lib/types/art-style';

	let mounted = $state(false);

	onMount(() => {
		const cleanup = initDeviceContext();
		mounted = true;
		return cleanup;
	});

	const device = $derived(getDeviceContext());
	const artStyle = $derived(getArtStyle());
</script>

{#if mounted}
	<div class="relative h-screen w-screen overflow-hidden bg-black">
		<!-- Threlte Canvas — GPU ASCII shader renders directly to this -->
		<Canvas renderMode="always">
			<TrainScene />
			<GpuAsciiRenderer style={artStyle} />
		</Canvas>

		<!-- FPS counter -->
		<FpsCounter />

		<!-- Art style selector -->
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
			<div>{device.isMobile ? 'mobile' : 'desktop'} | {device.orientation}</div>
			<div>{device.viewportWidth}x{device.viewportHeight}</div>
		</div>
	</div>
{/if}
