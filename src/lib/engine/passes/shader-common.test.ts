import { describe, expect, it } from 'vitest';

import { SHADER_COMMON } from './shader-common';

describe('SHADER_COMMON', () => {
	it('uses paletteSize consistently in palette helpers', () => {
		expect(SHADER_COMMON).toContain('if (paletteSize <= 1)');
		expect(SHADER_COMMON).toContain('float levels = float(paletteSize - 1);');
		expect(SHADER_COMMON).not.toContain('rampSize');
	});
});
