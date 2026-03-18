import { describe, expect, it } from 'vitest';

import {
	DITHER_ALGORITHMS,
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

	it('guards ids and resolves known definitions', () => {
		expect(isDitherAlgorithmId('bayer4')).toBe(true);
		expect(isDitherAlgorithmId('bayer8')).toBe(true);
		expect(isDitherAlgorithmId('clustered-dot')).toBe(true);
		expect(isDitherAlgorithmId('bogus')).toBe(false);
		expect(getDitherAlgorithmDefinition('interleaved-noise').family).toBe('stochastic');
		expect(getDitherAlgorithmDefinition('clustered-dot').family).toBe('screened');
	});
});
