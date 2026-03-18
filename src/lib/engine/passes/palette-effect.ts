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
uniform int uColorMode;

${SHADER_COMMON}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	if (uColorMode == 2 || uColorMode == 3) {
		outputColor = vec4(inputColor.rgb, luminance(inputColor.rgb));
		return;
	}

	float tone = luminance(inputColor.rgb);
	float biasedTone = paletteBiasTone(tone, uBias);
	float levels = max(float(uPaletteSize - 1), 1.0);
	float quantizedTone = floor(biasedTone * levels + 0.5) / levels;
	float paletteTone = mix(biasedTone, quantizedTone, uQuantize);

	vec3 mapped;
	if (uColorMode == 0) {
		mapped = paletteColorMode(paletteTone, uPaletteTexture, uPaletteSize, 1);
	} else {
		mapped = paletteColorMode(paletteTone, uPaletteTexture, uPaletteSize, uInterpolation);
	}

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

function encodeColorMode(colorMode: PaletteSettings['colorMode']): number {
	switch (colorMode) {
		case 'mono':
			return 0;
		case 'tonal':
			return 1;
		case 'indexed':
			return 2;
		case 'rgb':
			return 3;
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
			['uBias', new Uniform(settings.bias)],
			['uColorMode', new Uniform(encodeColorMode(settings.colorMode))]
		]);

		super('PaletteEffect', fragmentShader, { uniforms });
	}

	applySettings(settings: PaletteSettings): void {
		const texture = this.uniforms.get('uPaletteTexture')!.value;
		this.uniforms.get('uPaletteSize')!.value = updatePaletteTexture(texture, settings);
		this.uniforms.get('uInterpolation')!.value = encodeInterpolation(settings.interpolation);
		this.uniforms.get('uQuantize')!.value = settings.quantize;
		this.uniforms.get('uBias')!.value = settings.bias;
		this.uniforms.get('uColorMode')!.value = encodeColorMode(settings.colorMode);
	}

	dispose(): void {
		this.uniforms.get('uPaletteTexture')?.value.dispose();
		super.dispose();
	}
}
