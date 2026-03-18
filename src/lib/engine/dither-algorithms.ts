export const DITHER_ALGORITHM_IDS = [
	'bayer4',
	'bayer8',
	'clustered-dot',
	'interleaved-noise',
	'line-screen',
	'crosshatch',
	'concentric'
] as const;

export type DitherAlgorithmId = (typeof DITHER_ALGORITHM_IDS)[number];

export interface DitherAlgorithmCapabilities {
	realtimeSafe: boolean;
	animatedSafe: boolean;
	deterministic: boolean;
	paletteSafe: boolean;
	experimental: boolean;
}

export interface DitherAlgorithmDefinition {
	id: DitherAlgorithmId;
	label: string;
	description: string;
	family: 'ordered' | 'screened' | 'stochastic';
	capabilities: DitherAlgorithmCapabilities;
}

export const DEFAULT_DITHER_ALGORITHM_ID: DitherAlgorithmId = 'bayer4';

export const DITHER_ALGORITHMS: readonly DitherAlgorithmDefinition[] = [
	{
		id: 'bayer4',
		label: 'Bayer 4x4',
		description: 'Classic ordered dithering with crisp structure and stable motion.',
		family: 'ordered',
		capabilities: {
			realtimeSafe: true,
			animatedSafe: true,
			deterministic: true,
			paletteSafe: true,
			experimental: false
		}
	},
	{
		id: 'bayer8',
		label: 'Bayer 8x8',
		description: 'Finer ordered dithering with a denser matrix and softer grid repetition.',
		family: 'ordered',
		capabilities: {
			realtimeSafe: true,
			animatedSafe: true,
			deterministic: true,
			paletteSafe: true,
			experimental: false
		}
	},
	{
		id: 'clustered-dot',
		label: 'Clustered Dot',
		description: 'Screen-like thresholding that grows rounded clusters instead of isolated pixels.',
		family: 'screened',
		capabilities: {
			realtimeSafe: true,
			animatedSafe: true,
			deterministic: true,
			paletteSafe: true,
			experimental: false
		}
	},
	{
		id: 'interleaved-noise',
		label: 'Interleaved Noise',
		description: 'Static stochastic thresholding with less visible grid repetition.',
		family: 'stochastic',
		capabilities: {
			realtimeSafe: true,
			animatedSafe: true,
			deterministic: true,
			paletteSafe: true,
			experimental: false
		}
	},
	{
		id: 'line-screen',
		label: 'Line Screen',
		description: 'Parallel halftone stripes whose width modulates with tone. Woodcut feel.',
		family: 'screened',
		capabilities: {
			realtimeSafe: true,
			animatedSafe: true,
			deterministic: true,
			paletteSafe: true,
			experimental: false
		}
	},
	{
		id: 'crosshatch',
		label: 'Crosshatch',
		description: 'Layered diagonal lines that accumulate as tone darkens. Pen-and-ink feel.',
		family: 'ordered',
		capabilities: {
			realtimeSafe: true,
			animatedSafe: true,
			deterministic: true,
			paletteSafe: true,
			experimental: false
		}
	},
	{
		id: 'concentric',
		label: 'Concentric Screen',
		description: 'Concentric rings radiating from tile centers. Interference pattern feel.',
		family: 'screened',
		capabilities: {
			realtimeSafe: true,
			animatedSafe: true,
			deterministic: true,
			paletteSafe: true,
			experimental: false
		}
	}
] as const;

export function isDitherAlgorithmId(value: string): value is DitherAlgorithmId {
	return DITHER_ALGORITHM_IDS.includes(value as DitherAlgorithmId);
}

export function getDitherAlgorithmDefinition(id: DitherAlgorithmId): DitherAlgorithmDefinition {
	const definition = DITHER_ALGORITHMS.find((entry) => entry.id === id);

	if (!definition) {
		throw new Error(`Unsupported dither algorithm: ${id}`);
	}

	return definition;
}
