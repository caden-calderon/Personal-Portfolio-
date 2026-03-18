import {
	DITHER_ALGORITHMS,
	DEFAULT_DITHER_ALGORITHM_ID,
	type DitherAlgorithmId,
	isDitherAlgorithmId
} from './dither-algorithms';
import { getCuratedPaletteById } from './palette-library';

export const MAX_PALETTE_COLORS = 64;
export const MAX_PALETTE_SWATCHES = MAX_PALETTE_COLORS - 1;
export const CUSTOM_PRESET_ID = 'custom';
export const DEFAULT_PRESET_ID = 'amber-bayer';
export const PALETTE_INTERPOLATION_MODES = ['linear', 'step', 'contrast'] as const;

export type PaletteInterpolationMode = (typeof PALETTE_INTERPOLATION_MODES)[number];

export interface SceneSettings {
	spin: number;
	float: number;
}

export interface ToneSettings {
	exposure: number;
	contrast: number;
	brightness: number;
	gamma: number;
	posterize: number;
}

export interface PaletteSettings {
	background: string;
	swatches: string[];
	interpolation: PaletteInterpolationMode;
	quantize: number;
	bias: number;
}

export interface DitherSettings {
	enabled: boolean;
	algorithm: DitherAlgorithmId;
	pixelSize: number;
	intensity: number;
}

export interface FinishSettings {
	vignette: number;
	grain: number;
}

export interface LabSettings {
	scene: SceneSettings;
	tone: ToneSettings;
	palette: PaletteSettings;
	dither: DitherSettings;
	finish: FinishSettings;
}

export interface LabPreset {
	id: string;
	label: string;
	description: string;
	settings: LabSettings;
}

export interface NumericFieldDefinition {
	kind: 'number';
	path: string;
	label: string;
	min: number;
	max: number;
	step: number;
}

export interface BooleanFieldDefinition {
	kind: 'boolean';
	path: string;
	label: string;
}

export interface EnumFieldDefinition {
	kind: 'enum';
	path: string;
	label: string;
	options: readonly { value: string; label: string }[];
}

export type ControlFieldDefinition =
	| NumericFieldDefinition
	| BooleanFieldDefinition
	| EnumFieldDefinition;

export interface ControlSectionDefinition {
	id: string;
	label: string;
	fields: readonly ControlFieldDefinition[];
}

export interface LabSettingsInput {
	scene?: Partial<SceneSettings>;
	tone?: Partial<ToneSettings>;
	palette?: Partial<PaletteSettings>;
	dither?: Omit<Partial<DitherSettings>, 'algorithm'> & { algorithm?: string };
	finish?: Partial<FinishSettings>;
}

const retroAmberPalette = requireCuratedPalette('retro-amber');
const oxideCopperPalette = requireCuratedPalette('oxide-copper');
const pastelFogPalette = requireCuratedPalette('pastel-fog');
const vibrantSignalPalette = requireCuratedPalette('vibrant-signal');
const newsprintGrayPalette = requireCuratedPalette('newsprint-gray');

export const DEFAULT_LAB_SETTINGS: LabSettings = {
	scene: {
		spin: 0.45,
		float: 0.18
	},
	tone: {
		exposure: 0.1,
		contrast: 1.18,
		brightness: 0,
		gamma: 1.05,
		posterize: 0
	},
	palette: {
		background: retroAmberPalette.background,
		swatches: [...retroAmberPalette.swatches],
		interpolation: 'linear',
		quantize: 0.08,
		bias: 0.06
	},
	dither: {
		enabled: true,
		algorithm: DEFAULT_DITHER_ALGORITHM_ID,
		pixelSize: 2,
		intensity: 0.92
	},
	finish: {
		vignette: 0.22,
		grain: 0.02
	}
};

export const LAB_PRESETS: readonly LabPreset[] = [
	{
		id: 'amber-bayer',
		label: 'Amber Bayer',
		description: 'Warm ramp with structured ordered dither for a print-like screen feel.',
		settings: DEFAULT_LAB_SETTINGS
	},
	{
		id: 'night-signal',
		label: 'Night Signal',
		description: 'Cool shadows with noise dithering and slightly harder contrast.',
		settings: {
			scene: {
				spin: 0.3,
				float: 0.14
			},
			tone: {
				exposure: -0.05,
				contrast: 1.32,
				brightness: -0.02,
				gamma: 0.92,
				posterize: 0
			},
			palette: {
				background: vibrantSignalPalette.background,
				swatches: [...vibrantSignalPalette.swatches],
				interpolation: 'contrast',
				quantize: 0.18,
				bias: -0.14
			},
			dither: {
				enabled: true,
				algorithm: 'interleaved-noise',
				pixelSize: 2,
				intensity: 0.88
			},
			finish: {
				vignette: 0.28,
				grain: 0.035
			}
		}
	},
	{
		id: 'oxide-screen',
		label: 'Oxide Screen',
		description: 'Burnt copper ramp with clustered screening for a halftone print feel.',
		settings: {
			scene: {
				spin: 0.22,
				float: 0.1
			},
			tone: {
				exposure: 0.12,
				contrast: 1.28,
				brightness: -0.01,
				gamma: 1.04,
				posterize: 0
			},
			palette: {
				background: oxideCopperPalette.background,
				swatches: [...oxideCopperPalette.swatches],
				interpolation: 'step',
				quantize: 0.46,
				bias: 0.1
			},
			dither: {
				enabled: true,
				algorithm: 'clustered-dot',
				pixelSize: 2,
				intensity: 0.86
			},
			finish: {
				vignette: 0.24,
				grain: 0.012
			}
		}
	},
	{
		id: 'newsprint-draft',
		label: 'Newsprint Draft',
		description: 'Lower-key monochrome ramp for harsher tonal testing.',
		settings: {
			scene: {
				spin: 0.56,
				float: 0.2
			},
			tone: {
				exposure: 0.22,
				contrast: 1.36,
				brightness: -0.03,
				gamma: 1.1,
				posterize: 4
			},
			palette: {
				background: newsprintGrayPalette.background,
				swatches: [...newsprintGrayPalette.swatches],
				interpolation: 'step',
				quantize: 1,
				bias: -0.08
			},
			dither: {
				enabled: true,
				algorithm: 'bayer8',
				pixelSize: 2,
				intensity: 0.94
			},
			finish: {
				vignette: 0.18,
				grain: 0.015
			}
		}
	}
] as const;

export const LAB_CONTROL_SCHEMA: readonly ControlSectionDefinition[] = [
	{
		id: 'palette',
		label: 'Palette',
		fields: [
			{
				kind: 'enum',
				path: 'palette.interpolation',
				label: 'Interpolation',
				options: [
					{ value: 'linear', label: 'Linear' },
					{ value: 'step', label: 'Step' },
					{ value: 'contrast', label: 'Contrast' }
				]
			},
			{ kind: 'number', path: 'palette.quantize', label: 'Quantize', min: 0, max: 1, step: 0.01 },
			{ kind: 'number', path: 'palette.bias', label: 'Bias', min: -1, max: 1, step: 0.01 }
		]
	},
	{
		id: 'tone',
		label: 'Tone',
		fields: [
			{ kind: 'number', path: 'tone.exposure', label: 'Exposure', min: -2, max: 2, step: 0.01 },
			{ kind: 'number', path: 'tone.contrast', label: 'Contrast', min: 0.5, max: 2, step: 0.01 },
			{ kind: 'number', path: 'tone.brightness', label: 'Brightness', min: -0.5, max: 0.5, step: 0.01 },
			{ kind: 'number', path: 'tone.gamma', label: 'Gamma', min: 0.5, max: 2, step: 0.01 },
			{ kind: 'number', path: 'tone.posterize', label: 'Posterize', min: 0, max: 8, step: 1 }
		]
	},
	{
		id: 'dither',
		label: 'Dither',
		fields: [
			{ kind: 'boolean', path: 'dither.enabled', label: 'Enabled' },
			{
				kind: 'enum',
				path: 'dither.algorithm',
				label: 'Algorithm',
				options: DITHER_ALGORITHMS.map((algorithm) => ({
					value: algorithm.id,
					label: algorithm.label
				}))
			},
			{ kind: 'number', path: 'dither.pixelSize', label: 'Pixel Size', min: 1, max: 8, step: 1 },
			{ kind: 'number', path: 'dither.intensity', label: 'Intensity', min: 0, max: 1, step: 0.01 }
		]
	},
	{
		id: 'finish',
		label: 'Finish',
		fields: [
			{ kind: 'number', path: 'finish.vignette', label: 'Vignette', min: 0, max: 1, step: 0.01 },
			{ kind: 'number', path: 'finish.grain', label: 'Grain', min: 0, max: 0.1, step: 0.005 }
		]
	}
] as const;

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function normalizeHexColor(value: string, fallback: string): string {
	const normalized = value.trim();

	if (!/^#([\da-f]{3}|[\da-f]{6})$/i.test(normalized)) {
		return fallback;
	}

	if (normalized.length === 4) {
		const [, r, g, b] = normalized;
		return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
	}

	return normalized.toLowerCase();
}

function isPaletteInterpolationMode(value: string): value is PaletteInterpolationMode {
	return PALETTE_INTERPOLATION_MODES.includes(value as PaletteInterpolationMode);
}

function requireCuratedPalette(id: string) {
	const palette = getCuratedPaletteById(id);
	if (!palette) {
		throw new Error(`Missing curated palette: ${id}`);
	}

	return palette;
}

function cloneDefaultSettings(): LabSettings {
	return {
		scene: { ...DEFAULT_LAB_SETTINGS.scene },
		tone: { ...DEFAULT_LAB_SETTINGS.tone },
		palette: {
			background: DEFAULT_LAB_SETTINGS.palette.background,
			swatches: [...DEFAULT_LAB_SETTINGS.palette.swatches],
			interpolation: DEFAULT_LAB_SETTINGS.palette.interpolation,
			quantize: DEFAULT_LAB_SETTINGS.palette.quantize,
			bias: DEFAULT_LAB_SETTINGS.palette.bias
		},
		dither: { ...DEFAULT_LAB_SETTINGS.dither },
		finish: { ...DEFAULT_LAB_SETTINGS.finish }
	};
}

export function buildPaletteRamp(palette: PaletteSettings): string[] {
	return [palette.background, ...palette.swatches];
}

export function validateLabSettings(input: LabSettingsInput | LabSettings = {}): LabSettings {
	const defaults = cloneDefaultSettings();
	const source = input as LabSettingsInput;
	const next = cloneDefaultSettings();

	next.scene.spin = clamp(source.scene?.spin ?? defaults.scene.spin, 0, 2);
	next.scene.float = clamp(source.scene?.float ?? defaults.scene.float, 0, 1);

	next.tone.exposure = clamp(source.tone?.exposure ?? defaults.tone.exposure, -2, 2);
	next.tone.contrast = clamp(source.tone?.contrast ?? defaults.tone.contrast, 0.5, 2);
	next.tone.brightness = clamp(source.tone?.brightness ?? defaults.tone.brightness, -0.5, 0.5);
	next.tone.gamma = clamp(source.tone?.gamma ?? defaults.tone.gamma, 0.5, 2);
	next.tone.posterize = clamp(Math.round(source.tone?.posterize ?? defaults.tone.posterize), 0, 8);

	next.palette.background = normalizeHexColor(
		source.palette?.background ?? defaults.palette.background,
		defaults.palette.background
	);

	const candidateSwatches = source.palette?.swatches ?? defaults.palette.swatches;
	const normalizedSwatches = candidateSwatches
		.slice(0, MAX_PALETTE_SWATCHES)
		.map((swatch, index) =>
			normalizeHexColor(swatch, defaults.palette.swatches[index] ?? defaults.palette.swatches.at(-1)!)
		);

	next.palette.swatches =
		normalizedSwatches.length >= 2 ? normalizedSwatches : [...defaults.palette.swatches];
	next.palette.interpolation = isPaletteInterpolationMode(
		source.palette?.interpolation ?? defaults.palette.interpolation
	)
		? (source.palette?.interpolation ?? defaults.palette.interpolation)
		: defaults.palette.interpolation;
	next.palette.quantize = clamp(source.palette?.quantize ?? defaults.palette.quantize, 0, 1);
	next.palette.bias = clamp(source.palette?.bias ?? defaults.palette.bias, -1, 1);

	const algorithmCandidate = source.dither?.algorithm ?? defaults.dither.algorithm;
	next.dither.enabled = source.dither?.enabled ?? defaults.dither.enabled;
	next.dither.algorithm = isDitherAlgorithmId(algorithmCandidate)
		? algorithmCandidate
		: defaults.dither.algorithm;
	next.dither.pixelSize = clamp(
		Math.round(source.dither?.pixelSize ?? defaults.dither.pixelSize),
		1,
		8
	);
	next.dither.intensity = clamp(source.dither?.intensity ?? defaults.dither.intensity, 0, 1);

	next.finish.vignette = clamp(source.finish?.vignette ?? defaults.finish.vignette, 0, 1);
	next.finish.grain = clamp(source.finish?.grain ?? defaults.finish.grain, 0, 0.1);

	return next;
}

export function serializeLabSettings(settings: LabSettings): string {
	return JSON.stringify(validateLabSettings(settings), null, 2);
}

export function parseLabSettings(serialized: string): LabSettings {
	try {
		const parsed = JSON.parse(serialized) as LabSettingsInput;
		return validateLabSettings(parsed);
	} catch {
		return cloneDefaultSettings();
	}
}

export function getPresetById(id: string): LabPreset | undefined {
	const preset = LAB_PRESETS.find((entry) => entry.id === id);
	if (!preset) return undefined;

	return {
		...preset,
		settings: validateLabSettings(preset.settings)
	};
}
