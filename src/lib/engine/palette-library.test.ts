import { describe, expect, it } from 'vitest';

import {
	CURATED_PALETTES,
	findCuratedPaletteIdForPalette,
	getCuratedPaletteById
} from './palette-library';

describe('CURATED_PALETTES', () => {
	it('exposes named built-in palettes and can resolve them by id', () => {
		expect(CURATED_PALETTES.length).toBeGreaterThanOrEqual(4);
		expect(getCuratedPaletteById('retro-amber')?.label).toBe('Retro Amber');
		expect(getCuratedPaletteById('missing')).toBeUndefined();
	});

	it('can match an exact palette back to a curated preset id', () => {
		const palette = getCuratedPaletteById('vibrant-signal');
		expect(palette).toBeDefined();

		expect(
			findCuratedPaletteIdForPalette({
				background: palette!.background,
				swatches: [...palette!.swatches]
			})
		).toBe('vibrant-signal');

		expect(
			findCuratedPaletteIdForPalette({
				background: '#000000',
				swatches: ['#ffffff']
			})
		).toBeNull();
	});
});
