<script lang="ts">
	import { page } from '$app/state';

	import LabControls from '$lib/components/lab/LabControls.svelte';
	import LabViewport from '$lib/components/lab/LabViewport.svelte';
	import { isDitherAlgorithmId } from '$lib/engine/dither-algorithms';
	import {
		CUSTOM_PRESET_ID,
		DEFAULT_PRESET_ID,
		LAB_PRESETS,
		getPresetById,
		serializeLabSettings,
		type LabSettings,
		validateLabSettings
	} from '$lib/engine/settings';

	const captureMode = page.url.searchParams.has('capture');
	const requestedPresetId = page.url.searchParams.get('preset') ?? DEFAULT_PRESET_ID;
	const requestedAlgorithmId = page.url.searchParams.get('algorithm');
	const initialPreset = getPresetById(requestedPresetId) ?? getPresetById(DEFAULT_PRESET_ID);

	if (!initialPreset) {
		throw new Error(`Missing default preset: ${DEFAULT_PRESET_ID}`);
	}

	const defaultPreset = initialPreset;

	function createInitialSettings(): LabSettings {
		const next = validateLabSettings(defaultPreset.settings);

		if (requestedAlgorithmId && isDitherAlgorithmId(requestedAlgorithmId)) {
			next.dither.algorithm = requestedAlgorithmId;
		}

		if (!captureMode) {
			return next;
		}

		return {
			...next,
			scene: {
				spin: 0,
				float: 0
			},
			prep: {
				blur: 0,
				sharpen: 0
			},
			finish: {
				...next.finish,
				grain: 0
			}
		};
	}

	let selectedPresetId = $state(
		requestedAlgorithmId && isDitherAlgorithmId(requestedAlgorithmId)
			? CUSTOM_PRESET_ID
			: defaultPreset.id
	);
	let settings = $state<LabSettings>(createInitialSettings());

	function applySettings(next: LabSettings): void {
		settings = validateLabSettings(next);
		selectedPresetId = CUSTOM_PRESET_ID;
	}

	function selectPreset(nextPresetId: string): void {
		const preset = getPresetById(nextPresetId);
		if (!preset) return;

		settings = validateLabSettings(preset.settings);
		selectedPresetId = preset.id;
	}

	const serializedSettings = $derived(serializeLabSettings(settings));
	let sidebarCollapsed = $state(false);
	let sidebarWidth = $state(384);
	let isDragging = $state(false);

	const MIN_SIDEBAR = 280;
	const MAX_SIDEBAR = 520;

	function toggleSidebar(): void {
		sidebarCollapsed = !sidebarCollapsed;
	}

	function startDrag(e: MouseEvent): void {
		if ((e.target as HTMLElement).closest('.lab-divider__btn')) return;
		e.preventDefault();
		isDragging = true;
		const startX = e.clientX;
		const startWidth = sidebarWidth;

		function onMove(ev: MouseEvent): void {
			const shellPadding = 24;
			const raw = startWidth + (ev.clientX - startX);
			sidebarWidth = Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, raw));
		}

		function onUp(): void {
			isDragging = false;
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		}

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	}
</script>

<svelte:head>
	<title>Chromatic Dither Lab</title>
	<meta
		name="description"
		content="Dither-first render lab for Chromatic with typed presets and realtime postprocess experimentation."
	/>
</svelte:head>

<div
	class="lab-shell"
	class:lab-shell--collapsed={sidebarCollapsed}
	class:lab-shell--dragging={isDragging}
	style:--sidebar-w="{sidebarWidth}px"
>
	{#if !sidebarCollapsed}
		<section class="lab-sidebar" id="lab-sidebar">
			<div class="lab-sidebar__header">
				<p class="lab-sidebar__eyebrow">Chromatic / Render Lab</p>
				<h1>Dither-first pipeline sandbox</h1>
				<p class="lab-sidebar__summary">
					Phase 1 establishes the engine boundary, typed settings, presets, and the first
					realtime GPU dither passes. The website layer stays out of the renderer.
				</p>
			</div>

			<div class="lab-sidebar__scroll">
				<LabControls
					{settings}
					{selectedPresetId}
					presets={LAB_PRESETS}
					{applySettings}
					{selectPreset}
				/>

				<section class="lab-sidebar__serialization">
					<div class="lab-sidebar__section-title">
						<span>Serialized Settings</span>
						<span>{serializedSettings.length} chars</span>
					</div>
					<textarea readonly value={serializedSettings}></textarea>
				</section>
			</div>
		</section>
	{/if}

	{#if !captureMode}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="lab-divider"
			onmousedown={startDrag}
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize sidebar"
		>
			<div class="lab-divider__line"></div>
			<button
				type="button"
				class="lab-divider__btn"
				onclick={toggleSidebar}
				aria-controls="lab-sidebar"
				aria-expanded={!sidebarCollapsed}
				aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				<span class="lab-divider__chevron" class:lab-divider__chevron--collapsed={sidebarCollapsed}></span>
			</button>
			<div class="lab-divider__line"></div>
		</div>
	{/if}

	<section class="lab-stage">
		<LabViewport {settings} {captureMode} />
	</section>
</div>

<style>
	.lab-shell {
		display: grid;
		grid-template-columns: var(--sidebar-w, 24rem) auto minmax(0, 1fr);
		height: 100vh;
		padding: 1.5rem;
		overflow: hidden;
	}

	.lab-shell--collapsed {
		grid-template-columns: auto minmax(0, 1fr);
	}

	.lab-shell--dragging {
		cursor: col-resize;
		user-select: none;
	}

	/* ---- Sidebar ---- */

	.lab-sidebar {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: 1rem;
		min-height: 0;
		padding: 1.25rem;
		border: 1px solid var(--panel-border);
		border-radius: 1.5rem;
		background: var(--panel);
		backdrop-filter: blur(18px);
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	.lab-sidebar__scroll {
		display: grid;
		gap: 1.25rem;
		min-height: 0;
		overflow: auto;
		padding-right: 0.35rem;
	}

	.lab-sidebar__header {
		display: grid;
		gap: 0.65rem;
	}

	.lab-sidebar__eyebrow {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.lab-sidebar__header h1 {
		margin: 0;
		font-size: clamp(2rem, 4vw, 3.4rem);
		line-height: 0.96;
		letter-spacing: -0.04em;
	}

	.lab-sidebar__summary {
		margin: 0;
		max-width: 34rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.lab-sidebar__serialization {
		display: grid;
		gap: 0.65rem;
		padding-top: 0.25rem;
	}

	.lab-sidebar__section-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.lab-sidebar__serialization textarea {
		min-height: 9rem;
		padding: 0.9rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		background: rgba(0, 0, 0, 0.25);
		color: var(--text);
		resize: vertical;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		line-height: 1.4;
	}

	/* ---- Divider ---- */

	.lab-divider {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		cursor: col-resize;
		user-select: none;
		gap: 0;
	}

	.lab-divider__line {
		flex: 1;
		width: 1px;
		background: var(--panel-border);
	}

	.lab-divider__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 2.5rem;
		padding: 0;
		border: 1px solid var(--panel-border);
		border-radius: 0.4rem;
		background: var(--panel);
		backdrop-filter: blur(12px);
		color: var(--muted);
		cursor: pointer;
		flex-shrink: 0;
		transition: border-color 0.15s, color 0.15s;
	}

	.lab-divider__btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.lab-divider__chevron {
		display: block;
		width: 5px;
		height: 5px;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: rotate(135deg);
		margin-left: 1px;
		transition: transform 0.2s;
	}

	.lab-divider__chevron--collapsed {
		transform: rotate(-45deg);
		margin-left: -1px;
	}

	/* ---- Stage ---- */

	.lab-stage {
		position: relative;
		min-width: 0;
		min-height: 0;
	}

	/* ---- Mobile ---- */

	@media (max-width: 960px) {
		.lab-shell {
			grid-template-columns: 1fr;
			padding: 1rem;
		}

		.lab-shell:not(.lab-shell--collapsed) {
			grid-template-columns: 1fr;
		}

		.lab-sidebar {
			position: absolute;
			inset: 1rem auto 1rem 1rem;
			width: min(24rem, calc(100vw - 2rem));
			z-index: 8;
		}

		.lab-divider {
			position: absolute;
			left: min(25rem, calc(100vw - 1rem));
			top: 1rem;
			bottom: 1rem;
			z-index: 9;
		}

		.lab-shell--collapsed .lab-divider {
			left: 0;
		}
	}
</style>
