<script lang="ts">
	import { onMount } from 'svelte';
	import { initDeviceContext, getDeviceContext, getArtStyle } from '$lib';

	let mounted = $state(false);

	onMount(() => {
		const cleanup = initDeviceContext();
		mounted = true;
		return cleanup;
	});

	const device = $derived(getDeviceContext());
	const artStyle = $derived(getArtStyle());
</script>

<div class="flex h-screen w-screen items-center justify-center bg-bg font-mono text-fg">
	{#if mounted}
		<div class="text-center">
			<pre class="mb-4 text-xs leading-tight opacity-60">
 ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ███╗ █████╗ ████████╗██╗ ██████╗
██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝██║██╔════╝
██║     ███████║██████╔╝██║   ██║██╔████╔██║███████║   ██║   ██║██║
██║     ██╔══██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║   ██║   ██║██║
╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║   ██║   ██║╚██████╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝</pre>
			<p class="mb-2 text-sm opacity-40">
				{device.gridCols}x{device.gridRows} cells | {device.isMobile ? 'mobile' : 'desktop'} | {device.orientation}
				| {artStyle}
			</p>
			<p class="text-xs opacity-20">scaffold ready</p>
		</div>
	{/if}
</div>
