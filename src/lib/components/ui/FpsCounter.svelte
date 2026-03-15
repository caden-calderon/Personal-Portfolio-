<script lang="ts">
	let fps = $state(0);
	let frameCount = 0;
	let lastTime = performance.now();
	let animationFrameId: number;

	function tick() {
		frameCount++;
		const now = performance.now();
		const elapsed = now - lastTime;

		if (elapsed >= 1000) {
			fps = Math.round((frameCount * 1000) / elapsed);
			frameCount = 0;
			lastTime = now;
		}

		animationFrameId = requestAnimationFrame(tick);
	}

	$effect(() => {
		animationFrameId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(animationFrameId);
	});
</script>

<div class="fixed left-3 top-3 z-50 font-mono text-xs">
	<span class={fps >= 30 ? 'text-green-400' : fps >= 20 ? 'text-yellow-400' : 'text-red-400'}>
		{fps} fps
	</span>
</div>
