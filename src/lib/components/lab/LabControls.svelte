	<script lang="ts">
	import { DITHER_ALGORITHMS } from '$lib/engine/dither-algorithms';
	import {
		CURATED_PALETTES,
		findCuratedPaletteIdForPalette,
		getCuratedPaletteById
	} from '$lib/engine/palette-library';
	import {
		CUSTOM_PRESET_ID,
		LAB_CONTROL_SCHEMA,
		type LabPreset,
		type LabSettings
	} from '$lib/engine/settings';

	const MAX_VISIBLE_SWATCHES = 8;

	let {
		settings,
		selectedPresetId,
		presets,
		applySettings,
		selectPreset
	}: {
		settings: LabSettings;
		selectedPresetId: string;
		presets: readonly LabPreset[];
		applySettings: (settings: LabSettings) => void;
		selectPreset: (presetId: string) => void;
	} = $props();

	function updateScene(key: keyof LabSettings['scene'], value: number): void {
		applySettings({
			...settings,
			scene: {
				...settings.scene,
				[key]: value
			}
		});
	}

	function updatePrep(key: keyof LabSettings['prep'], value: number): void {
		applySettings({
			...settings,
			prep: {
				...settings.prep,
				[key]: value
			}
		});
	}

	function updateTone(key: keyof LabSettings['tone'], value: number): void {
		applySettings({
			...settings,
			tone: {
				...settings.tone,
				[key]: value
			}
		});
	}

	function updateDither<K extends keyof LabSettings['dither']>(
		key: K,
		value: LabSettings['dither'][K]
	): void {
		applySettings({
			...settings,
			dither: {
				...settings.dither,
				[key]: value
			}
		});
	}

	function updateFinish(key: keyof LabSettings['finish'], value: number): void {
		applySettings({
			...settings,
			finish: {
				...settings.finish,
				[key]: value
			}
		});
	}

	function updatePalette(index: number, value: string): void {
		if (index === 0) {
			applySettings({
				...settings,
				palette: {
					...settings.palette,
					background: value
				}
			});
			return;
		}

		const swatches = [...settings.palette.swatches];
		swatches[index - 1] = value;
		applySettings({
			...settings,
			palette: {
				...settings.palette,
				swatches
			}
		});
	}

	function applyCuratedPalette(paletteId: string): void {
		if (paletteId === CUSTOM_PRESET_ID) {
			return;
		}

		const curatedPalette = getCuratedPaletteById(paletteId);
		if (!curatedPalette) {
			return;
		}

		applySettings({
			...settings,
			palette: {
				...settings.palette,
				background: curatedPalette.background,
				swatches: [...curatedPalette.swatches]
			}
		});
	}

	function updatePaletteSetting<K extends Exclude<keyof LabSettings['palette'], 'background' | 'swatches'>>(
		key: K,
		value: LabSettings['palette'][K]
	): void {
		applySettings({
			...settings,
			palette: {
				...settings.palette,
				[key]: value
			}
		});
	}

	const activeDitherAlgorithm = $derived(
		DITHER_ALGORITHMS.find((algorithm) => algorithm.id === settings.dither.algorithm)
	);
	const activeCuratedPaletteId = $derived(findCuratedPaletteIdForPalette(settings.palette));
	const paletteSection = $derived(LAB_CONTROL_SCHEMA.find((section) => section.id === 'palette'));
</script>

<div class="controls" data-testid="lab-controls">
	<section class="controls__section">
		<div class="controls__section-header">
			<h2>Presets</h2>
			<p>Serializable starting points, not hidden component state.</p>
		</div>

		<label class="controls__field">
			<span>Preset</span>
			<select
				data-testid="preset-select"
				value={selectedPresetId}
				onchange={(event) => selectPreset((event.currentTarget as HTMLSelectElement).value)}
			>
				<option value={CUSTOM_PRESET_ID}>Custom</option>
				{#each presets as preset}
					<option value={preset.id}>{preset.label}</option>
				{/each}
			</select>
		</label>

		{#if selectedPresetId !== CUSTOM_PRESET_ID}
			<p class="controls__description">
				{presets.find((preset) => preset.id === selectedPresetId)?.description}
			</p>
		{/if}
	</section>

	<section class="controls__section">
		<div class="controls__section-header">
			<h2>Palette</h2>
			<p>
				Color mode selects how the palette is used. Interpolation shapes the dither
				transition curve. Quantize and bias control tonal mapping before thresholding.
			</p>
		</div>

		<label class="controls__field">
			<span>Palette Pack</span>
			<select
				value={activeCuratedPaletteId ?? CUSTOM_PRESET_ID}
				onchange={(event) => applyCuratedPalette((event.currentTarget as HTMLSelectElement).value)}
			>
				<option value={CUSTOM_PRESET_ID}>Custom</option>
				{#each CURATED_PALETTES as palette}
					<option value={palette.id}>{palette.label}</option>
				{/each}
			</select>
		</label>

		<p class="controls__description">
			{settings.palette.swatches.length + 1} colors loaded. The editor shows the first
			{Math.min(settings.palette.swatches.length + 1, MAX_VISIBLE_SWATCHES + 1)} slots.
		</p>

		<div class="controls__swatches">
			{#each [settings.palette.background, ...settings.palette.swatches.slice(0, MAX_VISIBLE_SWATCHES)] as swatch, index}
				<label class="controls__swatch">
					<span>{index === 0 ? 'BG' : `S${index}`}</span>
					<input type="color" value={swatch} onchange={(event) => updatePalette(index, (event.currentTarget as HTMLInputElement).value)} />
				</label>
			{/each}
		</div>

		{#if paletteSection}
			{#each paletteSection.fields as field}
				{#if field.kind === 'enum' && field.path === 'palette.colorMode'}
					<label class="controls__field">
						<span>{field.label}</span>
						<select
							value={settings.palette.colorMode}
							onchange={(event) =>
								updatePaletteSetting(
									'colorMode',
									(event.currentTarget as HTMLSelectElement).value as LabSettings['palette']['colorMode']
								)}
						>
							{#each field.options as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</label>
				{:else if field.kind === 'enum' && field.path === 'palette.interpolation'}
					<label class="controls__field">
						<span>{field.label}</span>
						<select
							value={settings.palette.interpolation}
							onchange={(event) =>
								updatePaletteSetting(
									'interpolation',
									(event.currentTarget as HTMLSelectElement).value as LabSettings['palette']['interpolation']
								)}
						>
							{#each field.options as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</label>
				{:else if field.kind === 'number' && field.path === 'palette.quantize'}
					<label class="controls__field">
						<span>{field.label}</span>
						<input
							type="range"
							min={field.min}
							max={field.max}
							step={field.step}
							value={settings.palette.quantize}
							oninput={(event) =>
								updatePaletteSetting('quantize', Number((event.currentTarget as HTMLInputElement).value))}
						/>
						<output>{settings.palette.quantize.toFixed(2)}</output>
					</label>
				{:else if field.kind === 'number' && field.path === 'palette.bias'}
					<label class="controls__field">
						<span>{field.label}</span>
						<input
							type="range"
							min={field.min}
							max={field.max}
							step={field.step}
							value={settings.palette.bias}
							oninput={(event) =>
								updatePaletteSetting('bias', Number((event.currentTarget as HTMLInputElement).value))}
						/>
						<output>{settings.palette.bias.toFixed(2)}</output>
					</label>
				{/if}
			{/each}
		{/if}
	</section>

	<section class="controls__section">
		<div class="controls__section-header">
			<h2>Scene</h2>
			<p>Keep the demo simple so the pipeline can be read clearly.</p>
		</div>

		<label class="controls__field">
			<span>Spin</span>
			<input
				type="range"
				min="0"
				max="2"
				step="0.01"
				value={settings.scene.spin}
				oninput={(event) => updateScene('spin', Number((event.currentTarget as HTMLInputElement).value))}
			/>
			<output>{settings.scene.spin.toFixed(2)}</output>
		</label>

		<label class="controls__field">
			<span>Float</span>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={settings.scene.float}
				oninput={(event) => updateScene('float', Number((event.currentTarget as HTMLInputElement).value))}
			/>
			<output>{settings.scene.float.toFixed(2)}</output>
		</label>
	</section>

	{#each LAB_CONTROL_SCHEMA.filter((section) => section.id !== 'palette') as section}
		<section class="controls__section">
			<div class="controls__section-header">
				<h2>{section.label}</h2>
				<p>
					{section.id === 'prep'
						? 'Image conditioning before tone mapping. Both off by default.'
						: section.id === 'dither'
							? 'Realtime-safe algorithm families with explicit artistic tradeoffs.'
						: 'Typed control metadata is ready for a future generated UI.'}
				</p>
			</div>

			{#each section.fields as field}
				{#if field.path === 'dither.algorithm'}
					<label class="controls__field">
						<span>{field.label}</span>
						<select
							value={settings.dither.algorithm}
							onchange={(event) =>
								updateDither(
									'algorithm',
									(event.currentTarget as HTMLSelectElement).value as LabSettings['dither']['algorithm']
								)}
						>
							{#each DITHER_ALGORITHMS as algorithm}
								<option value={algorithm.id}>{algorithm.label}</option>
							{/each}
						</select>
					</label>
					{#if activeDitherAlgorithm}
						<p class="controls__description">
							{activeDitherAlgorithm.label} / {activeDitherAlgorithm.family}:
							{activeDitherAlgorithm.description}
						</p>
					{/if}
				{:else if field.path === 'dither.enabled'}
					<label class="controls__toggle">
						<input
							type="checkbox"
							checked={settings.dither.enabled}
							onchange={(event) => updateDither('enabled', (event.currentTarget as HTMLInputElement).checked)}
						/>
						<span>{field.label}</span>
					</label>
				{:else if field.kind === 'number'}
					<label class="controls__field">
						<span>{field.label}</span>

						{#if field.path === 'prep.blur'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.prep.blur}
								oninput={(event) => updatePrep('blur', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.prep.blur.toFixed(2)}</output>
						{:else if field.path === 'prep.sharpen'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.prep.sharpen}
								oninput={(event) => updatePrep('sharpen', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.prep.sharpen.toFixed(2)}</output>
						{:else if field.path === 'tone.exposure'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.tone.exposure}
								oninput={(event) => updateTone('exposure', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.tone.exposure.toFixed(2)}</output>
						{:else if field.path === 'tone.contrast'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.tone.contrast}
								oninput={(event) => updateTone('contrast', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.tone.contrast.toFixed(2)}</output>
						{:else if field.path === 'tone.brightness'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.tone.brightness}
								oninput={(event) => updateTone('brightness', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.tone.brightness.toFixed(2)}</output>
						{:else if field.path === 'tone.gamma'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.tone.gamma}
								oninput={(event) => updateTone('gamma', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.tone.gamma.toFixed(2)}</output>
						{:else if field.path === 'tone.posterize'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.tone.posterize}
								oninput={(event) => updateTone('posterize', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.tone.posterize.toFixed(0)}</output>
						{:else if field.path === 'dither.pixelSize'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.dither.pixelSize}
								oninput={(event) => updateDither('pixelSize', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.dither.pixelSize.toFixed(0)}</output>
						{:else if field.path === 'dither.intensity'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.dither.intensity}
								oninput={(event) => updateDither('intensity', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.dither.intensity.toFixed(2)}</output>
						{:else if field.path === 'finish.vignette'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.finish.vignette}
								oninput={(event) => updateFinish('vignette', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.finish.vignette.toFixed(2)}</output>
						{:else if field.path === 'finish.grain'}
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={settings.finish.grain}
								oninput={(event) => updateFinish('grain', Number((event.currentTarget as HTMLInputElement).value))}
							/>
							<output>{settings.finish.grain.toFixed(3)}</output>
						{/if}
					</label>
				{/if}
			{/each}
		</section>
	{/each}
</div>

<style>
	.controls {
		display: grid;
		gap: 1rem;
	}

	.controls__section {
		display: grid;
		gap: 0.9rem;
		padding: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 1.15rem;
		background: rgba(255, 255, 255, 0.02);
	}

	.controls__section-header {
		display: grid;
		gap: 0.3rem;
	}

	.controls__section-header h2,
	.controls__section-header p,
	.controls__description {
		margin: 0;
	}

	.controls__section-header h2 {
		font-size: 0.95rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-family: var(--font-mono);
	}

	.controls__section-header p,
	.controls__description {
		line-height: 1.45;
		color: var(--muted);
		font-size: 0.92rem;
	}

	.controls__field {
		display: grid;
		grid-template-columns: minmax(6rem, 8rem) minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.8rem;
		font-family: var(--font-mono);
		font-size: 0.83rem;
	}

	.controls__field select,
	.controls__field input[type='range'] {
		width: 100%;
	}

	.controls__field select {
		grid-column: 2 / 4;
		padding: 0.65rem 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 0.85rem;
		background: rgba(0, 0, 0, 0.25);
		color: var(--text);
	}

	.controls__field output {
		min-width: 3.5rem;
		text-align: right;
		color: var(--muted);
	}

	.controls__toggle {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		font-family: var(--font-mono);
		font-size: 0.83rem;
	}

	.controls__swatches {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(4.4rem, 1fr));
		gap: 0.75rem;
	}

	.controls__swatch {
		display: grid;
		gap: 0.45rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.controls__swatch input {
		width: 100%;
		height: 2.75rem;
		padding: 0;
		border: 0;
		border-radius: 0.9rem;
		background: transparent;
	}
</style>
