import { describe, expect, it } from 'vitest';

import {
	DITHER_ALGORITHMS,
	DITHER_ALGORITHM_IDS,
	getDitherAlgorithmDefinition,
	isDitherAlgorithmId
} from './dither-algorithms';

describe('DITHER_ALGORITHMS', () => {
	it('exposes unique ids with explicit capability metadata', () => {
		const ids = new Set(DITHER_ALGORITHMS.map((entry) => entry.id));
		expect(ids.size).toBe(DITHER_ALGORITHMS.length);

		for (const algorithm of DITHER_ALGORITHMS) {
			expect(algorithm.capabilities.realtimeSafe).toBe(true);
			expect(algorithm.capabilities.paletteSafe).toBe(true);
		}
	});

	it('has a definition for every registered id', () => {
		for (const id of DITHER_ALGORITHM_IDS) {
			const definition = getDitherAlgorithmDefinition(id);
			expect(definition.id).toBe(id);
			expect(definition.label).toBeTruthy();
			expect(definition.description).toBeTruthy();
		}
	});

	it('guards ids and resolves known definitions', () => {
		expect(isDitherAlgorithmId('bayer4')).toBe(true);
		expect(isDitherAlgorithmId('bayer8')).toBe(true);
		expect(isDitherAlgorithmId('clustered-dot')).toBe(true);
		expect(isDitherAlgorithmId('line-screen')).toBe(true);
		expect(isDitherAlgorithmId('crosshatch')).toBe(true);
		expect(isDitherAlgorithmId('concentric')).toBe(true);
		expect(isDitherAlgorithmId('bogus')).toBe(false);
		expect(getDitherAlgorithmDefinition('interleaved-noise').family).toBe('stochastic');
		expect(getDitherAlgorithmDefinition('clustered-dot').family).toBe('screened');
		expect(getDitherAlgorithmDefinition('line-screen').family).toBe('screened');
		expect(getDitherAlgorithmDefinition('crosshatch').family).toBe('ordered');
		expect(getDitherAlgorithmDefinition('concentric').family).toBe('screened');
	});

	it('covers all three algorithm families', () => {
		const families = new Set(DITHER_ALGORITHMS.map((entry) => entry.family));
		expect(families.has('ordered')).toBe(true);
		expect(families.has('screened')).toBe(true);
		expect(families.has('stochastic')).toBe(true);
	});
});
