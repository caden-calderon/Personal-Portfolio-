export interface CuratedPaletteDefinition {
	id: string;
	label: string;
	description: string;
	background: string;
	swatches: string[];
}

export const CURATED_PALETTES: readonly CuratedPaletteDefinition[] = [
	{
		id: 'retro-amber',
		label: 'Retro Amber',
		description: 'Warm phosphor-like amber ramp with deep brown shadows.',
		background: '#081018',
		swatches: ['#5b4026', '#a87438', '#e6bc72', '#fff0c8']
	},
	{
		id: 'oxide-copper',
		label: 'Oxide Copper',
		description: 'Burnt copper palette for screen-print and metallic halftone looks.',
		background: '#0a0907',
		swatches: ['#3a2417', '#8f4b2a', '#d68a4c', '#f4dfb3']
	},
	{
		id: 'pastel-fog',
		label: 'Pastel Fog',
		description: 'Low-contrast powder colors for softer diffusion and bloomier ramps.',
		background: '#11121d',
		swatches: ['#6d6fa9', '#a98fc9', '#d6badc', '#f6d8c7', '#fff0e1']
	},
	{
		id: 'vibrant-signal',
		label: 'Vibrant Signal',
		description: 'Higher-chroma digital palette for louder color experiments.',
		background: '#060a12',
		swatches: ['#124b82', '#157f94', '#2cc36b', '#ffd166', '#ff7a59', '#f4f7ff']
	},
	{
		id: 'newsprint-gray',
		label: 'Newsprint Gray',
		description: 'Neutral monochrome for harsher structure and tonal evaluation.',
		background: '#060606',
		swatches: ['#303030', '#727272', '#b8b8b8', '#f1efe8']
	}
] as const;

export function getCuratedPaletteById(id: string): CuratedPaletteDefinition | undefined {
	return CURATED_PALETTES.find((palette) => palette.id === id);
}

export function findCuratedPaletteIdForPalette(palette: {
	background: string;
	swatches: string[];
}): string | null {
	const match = CURATED_PALETTES.find(
		(entry) =>
			entry.background === palette.background &&
			entry.swatches.length === palette.swatches.length &&
			entry.swatches.every((swatch, index) => swatch === palette.swatches[index])
	);

	return match?.id ?? null;
}
