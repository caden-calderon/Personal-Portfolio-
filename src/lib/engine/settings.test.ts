import { describe, expect, it } from 'vitest';

import {
	DEFAULT_PRESET_ID,
	LAB_PRESETS,
	buildPaletteRamp,
	getPresetById,
	type LabSettingsInput,
	parseLabSettings,
	serializeLabSettings,
	validateLabSettings
} from './settings';

describe('validateLabSettings', () => {
	it('clamps numeric ranges and normalizes the palette', () => {
		const manySwatches = Array.from({ length: 70 }, (_, index) =>
			`#${((index + 1) * 123457).toString(16).padStart(6, '0').slice(0, 6)}`
		);

		const settings = validateLabSettings({
			scene: { spin: 99, float: -1 },
			tone: {
				exposure: -9,
				contrast: 9,
				brightness: 1,
				gamma: 0.1,
				posterize: 99
			},
			palette: {
				background: 'invalid',
				swatches: ['#123', '#abcDEF', 'broken', ...manySwatches],
				interpolation: 'broken',
				quantize: 9,
				bias: -9
			},
			dither: {
				enabled: true,
				algorithm: 'not-real',
				pixelSize: 99,
				intensity: -1
			},
			finish: {
				vignette: 5,
				grain: -2
			}
		} as unknown as LabSettingsInput);

		expect(settings.scene).toEqual({ spin: 2, float: 0 });
		expect(settings.tone).toEqual({
			exposure: -2,
			contrast: 2,
			brightness: 0.5,
			gamma: 0.5,
			posterize: 8
		});
		expect(settings.palette.background).toBe('#081018');
		expect(settings.palette).toEqual({
			background: '#081018',
			swatches: ['#112233', '#abcdef', '#e6bc72', ...manySwatches].slice(0, 63),
			interpolation: 'linear',
			quantize: 1,
			bias: -1
		});
		expect(settings.dither.algorithm).toBe('bayer4');
		expect(settings.dither.pixelSize).toBe(8);
		expect(settings.dither.intensity).toBe(0);
		expect(settings.finish).toEqual({ vignette: 1, grain: 0 });
	});

	it('exposes presets that exercise distinct dither families', () => {
		const algorithms = new Set(LAB_PRESETS.map((preset) => preset.settings.dither.algorithm));
		expect(algorithms.has('bayer4')).toBe(true);
		expect(algorithms.has('bayer8')).toBe(true);
		expect(algorithms.has('clustered-dot')).toBe(true);
		expect(algorithms.has('interleaved-noise')).toBe(true);
	});

	it('exposes presets that exercise distinct palette interpolation modes', () => {
		const modes = new Set(LAB_PRESETS.map((preset) => preset.settings.palette.interpolation));
		expect(modes.has('linear')).toBe(true);
		expect(modes.has('step')).toBe(true);
		expect(modes.has('contrast')).toBe(true);
	});
});

describe('settings serialization', () => {
	it('round-trips a valid preset through JSON', () => {
		const preset = getPresetById(DEFAULT_PRESET_ID);
		expect(preset).toBeDefined();

		const serialized = serializeLabSettings(preset!.settings);
		const parsed = parseLabSettings(serialized);

		expect(parsed).toEqual(preset!.settings);
		expect(buildPaletteRamp(parsed.palette)).toEqual([
			parsed.palette.background,
			...parsed.palette.swatches
		]);
	});
});
