<script lang="ts">
	import { onMount } from 'svelte';

	import { ChromaticEngine } from '$lib/engine/chromatic-engine';
	import type { LabSettings } from '$lib/engine/settings';

	const MIN_ZOOM = 1;
	const MAX_ZOOM = 12;
	const ZOOM_FACTOR = 1.2;

	let {
		settings,
		captureMode = false
	}: {
		settings: LabSettings;
		captureMode?: boolean;
	} = $props();

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let surface: HTMLDivElement;
	let status = $state<'booting' | 'live'>('booting');
	let engine: ChromaticEngine | null = null;
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let activePointerId: number | null = null;
	let lastPointerX = 0;
	let lastPointerY = 0;

	function clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	function clampPan(nextPanX: number, nextPanY: number, nextZoom = zoom): { x: number; y: number } {
		if (!surface || nextZoom <= MIN_ZOOM) {
			return { x: 0, y: 0 };
		}

		const rect = surface.getBoundingClientRect();
		const minX = rect.width - rect.width * nextZoom;
		const minY = rect.height - rect.height * nextZoom;

		return {
			x: clamp(nextPanX, minX, 0),
			y: clamp(nextPanY, minY, 0)
		};
	}

	function setZoomAt(nextZoom: number, anchorX: number, anchorY: number): void {
		const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
		if (!surface || Math.abs(clampedZoom - zoom) < 0.001) {
			return;
		}

		const localX = (anchorX - panX) / zoom;
		const localY = (anchorY - panY) / zoom;
		const nextPan = clampPan(
			anchorX - localX * clampedZoom,
			anchorY - localY * clampedZoom,
			clampedZoom
		);

		zoom = clampedZoom;
		panX = nextPan.x;
		panY = nextPan.y;
	}

	function zoomFromCenter(direction: 'in' | 'out'): void {
		if (!surface) return;

		const rect = surface.getBoundingClientRect();
		const factor = direction === 'in' ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
		setZoomAt(zoom * factor, rect.width / 2, rect.height / 2);
	}

	function resetView(): void {
		zoom = 1;
		panX = 0;
		panY = 0;
	}

	function handleWheel(event: WheelEvent): void {
		if (!surface) return;

		event.preventDefault();

		const rect = surface.getBoundingClientRect();
		const anchorX = event.clientX - rect.left;
		const anchorY = event.clientY - rect.top;
		const factor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
		setZoomAt(zoom * factor, anchorX, anchorY);
	}

	function handlePointerDown(event: PointerEvent): void {
		if (!surface || event.button !== 0 || zoom <= MIN_ZOOM) return;

		activePointerId = event.pointerId;
		lastPointerX = event.clientX;
		lastPointerY = event.clientY;
		isDragging = true;
		surface.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent): void {
		if (activePointerId !== event.pointerId) return;

		const deltaX = event.clientX - lastPointerX;
		const deltaY = event.clientY - lastPointerY;
		const nextPan = clampPan(panX + deltaX, panY + deltaY);
		panX = nextPan.x;
		panY = nextPan.y;
		lastPointerX = event.clientX;
		lastPointerY = event.clientY;
	}

	function endPointerDrag(event: PointerEvent): void {
		if (!surface || activePointerId !== event.pointerId) return;

		surface.releasePointerCapture(event.pointerId);
		activePointerId = null;
		isDragging = false;
	}

	function handleDoubleClick(event: MouseEvent): void {
		if (!surface) return;

		const rect = surface.getBoundingClientRect();
		setZoomAt(zoom * ZOOM_FACTOR, event.clientX - rect.left, event.clientY - rect.top);
	}

	onMount(() => {
		engine = new ChromaticEngine(settings);
		engine.mount(canvas);
		engine.start();
		status = 'live';

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry || !engine) return;

			engine.resize(entry.contentRect.width, entry.contentRect.height, window.devicePixelRatio);
			const clampedPan = clampPan(panX, panY);
			panX = clampedPan.x;
			panY = clampedPan.y;
		});

		observer.observe(container);

		return () => {
			observer.disconnect();
			engine?.dispose();
			engine = null;
		};
	});

	$effect(() => {
		engine?.setSettings(settings);
	});
</script>

<div
	class="viewport"
	bind:this={container}
	data-testid="lab-viewport"
	data-engine-ready={status === 'live'}
	data-zoomed={zoom > MIN_ZOOM}
>
	{#if !captureMode}
		<div class="viewport__toolbar">
			<button type="button" onclick={() => zoomFromCenter('out')} disabled={zoom <= MIN_ZOOM}>
				-
			</button>
			<button type="button" onclick={resetView}>{zoom.toFixed(2)}x</button>
			<button type="button" onclick={() => zoomFromCenter('in')} disabled={zoom >= MAX_ZOOM}>
				+
			</button>
		</div>
	{/if}

	<div
		class="viewport__surface"
		bind:this={surface}
		role="application"
		aria-label="Interactive render viewport"
		data-dragging={isDragging}
		onwheel={handleWheel}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={endPointerDrag}
		onpointercancel={endPointerDrag}
		ondblclick={handleDoubleClick}
	>
		<div
			class="viewport__canvas-transform"
			style={`transform: matrix(${zoom}, 0, 0, ${zoom}, ${panX}, ${panY});`}
		>
			<canvas bind:this={canvas}></canvas>
		</div>
	</div>

	<div class="viewport__overlay">
		<div>
			<p class="viewport__label">Pipeline</p>
			<p class="viewport__value">
				{captureMode ? 'Tone → Palette → Dither → Finish' : 'Tone → Palette → Dither → Finish / wheel = zoom'}
			</p>
		</div>
		<div class="viewport__status" data-testid="engine-status">{status}</div>
	</div>
</div>

<style>
	.viewport {
		position: relative;
		height: 100%;
		min-height: 0;
		border: 1px solid var(--canvas-border);
		border-radius: 1.75rem;
		overflow: hidden;
		background:
			radial-gradient(circle at top, rgba(255, 255, 255, 0.06), transparent 35%),
			linear-gradient(160deg, rgba(5, 10, 14, 0.95), rgba(3, 6, 8, 0.98));
		box-shadow: var(--shadow);
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.viewport__surface,
	.viewport__canvas-transform {
		position: absolute;
		inset: 0;
	}

	.viewport__surface {
		overflow: hidden;
		touch-action: none;
	}

	.viewport__canvas-transform {
		transform-origin: 0 0;
		will-change: transform;
	}

	.viewport[data-zoomed='true'] .viewport__surface {
		cursor: grab;
	}

	.viewport__surface[data-dragging='true'] {
		cursor: grabbing;
	}

	.viewport__toolbar {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 3;
		display: flex;
		gap: 0.5rem;
	}

	.viewport__toolbar button {
		min-width: 3rem;
		padding: 0.65rem 0.8rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 999px;
		background: rgba(7, 11, 16, 0.82);
		backdrop-filter: blur(12px);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: 0.76rem;
	}

	.viewport__toolbar button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.viewport__overlay {
		position: absolute;
		inset: auto 1rem 1rem 1rem;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		pointer-events: none;
		font-family: var(--font-mono);
	}

	.viewport__label,
	.viewport__value,
	.viewport__status {
		margin: 0;
	}

	.viewport__label {
		font-size: 0.74rem;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}

	.viewport__value,
	.viewport__status {
		padding: 0.5rem 0.7rem;
		border-radius: 999px;
		background: rgba(7, 11, 16, 0.76);
		backdrop-filter: blur(12px);
		color: var(--text);
	}

	.viewport__status {
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	@media (max-width: 960px) {
		.viewport {
			height: 100%;
		}

		.viewport__overlay {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
