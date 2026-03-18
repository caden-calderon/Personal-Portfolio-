import { Effect } from 'postprocessing';
import { Uniform } from 'three';

import { createPaletteTexture, updatePaletteTexture } from '../palette-texture';
import type { PaletteSettings } from '../settings';
import { SHADER_COMMON } from './shader-common';

const fragmentShader = /* glsl */ `
uniform sampler2D uPaletteTexture;
uniform int uPaletteSize;
uniform int uInterpolation;
uniform float uQuantize;
uniform float uBias;

${SHADER_COMMON}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	float tone = luminance(inputColor.rgb);
	float biasedTone = paletteBiasTone(tone, uBias);
	float levels = max(float(uPaletteSize - 1), 1.0);
	float quantizedTone = floor(biasedTone * levels + 0.5) / levels;
	float paletteTone = mix(biasedTone, quantizedTone, uQuantize);
	vec3 mapped = paletteColorMode(paletteTone, uPaletteTexture, uPaletteSize, uInterpolation);
	outputColor = vec4(mapped, paletteTone);
}
`;

function encodeInterpolation(interpolation: PaletteSettings['interpolation']): number {
	switch (interpolation) {
		case 'linear':
			return 0;
		case 'step':
			return 1;
		case 'contrast':
			return 2;
	}
}

export class PaletteEffect extends Effect {
	constructor(settings: PaletteSettings) {
		const paletteTexture = createPaletteTexture();
		const paletteSize = updatePaletteTexture(paletteTexture, settings);
		const uniforms = new Map<string, Uniform>([
			['uPaletteTexture', new Uniform(paletteTexture)],
			['uPaletteSize', new Uniform(paletteSize)],
			['uInterpolation', new Uniform(encodeInterpolation(settings.interpolation))],
			['uQuantize', new Uniform(settings.quantize)],
			['uBias', new Uniform(settings.bias)]
		]);

		super('PaletteEffect', fragmentShader, { uniforms });
	}

	applySettings(settings: PaletteSettings): void {
		const texture = this.uniforms.get('uPaletteTexture')!.value;
		this.uniforms.get('uPaletteSize')!.value = updatePaletteTexture(texture, settings);
		this.uniforms.get('uInterpolation')!.value = encodeInterpolation(settings.interpolation);
		this.uniforms.get('uQuantize')!.value = settings.quantize;
		this.uniforms.get('uBias')!.value = settings.bias;
	}

	dispose(): void {
		this.uniforms.get('uPaletteTexture')?.value.dispose();
		super.dispose();
	}
}
