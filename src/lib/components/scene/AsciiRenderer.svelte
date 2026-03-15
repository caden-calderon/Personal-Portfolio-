<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import { WebGLRenderTarget, NearestFilter, RGBAFormat, UnsignedByteType } from 'three';
	import { type ArtStyle, ART_STYLE_CONFIGS } from '$lib/types/art-style';

	let {
		cols,
		rows,
		style,
		outputCanvas
	}: {
		cols: number;
		rows: number;
		style: ArtStyle;
		outputCanvas: HTMLCanvasElement;
	} = $props();

	const { renderer, scene, camera, renderStage, autoRender, invalidate } = useThrelte();

	const renderTarget = new WebGLRenderTarget(1, 1, {
		format: RGBAFormat,
		type: UnsignedByteType,
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		generateMipmaps: false,
		depthBuffer: true,
		stencilBuffer: false
	});

	let pixelBuffer = new Uint8Array(4);

	// Resize render target when grid dimensions change
	$effect(() => {
		renderTarget.setSize(cols, rows);
		pixelBuffer = new Uint8Array(cols * rows * 4);
		invalidate();
	});

	onMount(() => {
		const prevAutoRender = autoRender.current;
		autoRender.set(false);
		invalidate();

		return () => {
			autoRender.set(prevAutoRender);
			renderTarget.dispose();
		};
	});

	useTask(
		() => {
			const config = ART_STYLE_CONFIGS[style];
			const charset = config.charset;
			const maxIdx = charset.length - 1;

			// 1. Render scene to offscreen framebuffer
			renderer.setRenderTarget(renderTarget);
			renderer.render(scene, camera.current);
			renderer.setRenderTarget(null);

			// 2. Read pixels back to CPU
			renderer.readRenderTargetPixels(renderTarget, 0, 0, cols, rows, pixelBuffer);

			// 3. Map brightness to characters and draw to output canvas
			const ctx = outputCanvas.getContext('2d');
			if (!ctx) return;

			const canvasW = outputCanvas.width;
			const canvasH = outputCanvas.height;
			const charW = canvasW / cols;
			const charH = canvasH / rows;

			ctx.clearRect(0, 0, canvasW, canvasH);
			ctx.font = `${charH}px monospace`;
			ctx.textBaseline = 'top';

			// Build and render one row at a time for performance
			for (let y = 0; y < rows; y++) {
				let row = '';
				// WebGL pixel buffer is bottom-to-top, flip y
				const srcY = rows - 1 - y;

				for (let x = 0; x < cols; x++) {
					const i = (srcY * cols + x) * 4;
					const r = pixelBuffer[i];
					const g = pixelBuffer[i + 1];
					const b = pixelBuffer[i + 2];

					// ITU-R BT.601 perceived brightness
					const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
					const charIdx = Math.round(brightness * maxIdx);
					row += charset[charIdx];
				}

				ctx.fillStyle = '#33ff33';
				ctx.fillText(row, 0, y * charH);
			}
		},
		{ stage: renderStage, autoInvalidate: false }
	);
</script>
