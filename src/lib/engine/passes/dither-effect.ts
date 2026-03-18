import { Effect } from 'postprocessing';
import { Uniform } from 'three';

import { createPaletteTexture, updatePaletteTexture } from '../palette-texture';
import { type DitherSettings, type PaletteSettings } from '../settings';
import { SHADER_COMMON } from './shader-common';

const fragmentShader = /* glsl */ `
uniform sampler2D uPaletteTexture;
uniform int uPaletteSize;
uniform bool uEnabled;
uniform int uAlgorithm;
uniform float uPixelSize;
uniform float uIntensity;

${SHADER_COMMON}

float resolveThreshold(vec2 cell) {
	if (uAlgorithm == 0) {
		return bayer4Threshold(cell);
	}

	if (uAlgorithm == 1) {
		return bayer8Threshold(cell);
	}

	if (uAlgorithm == 2) {
		return clusteredDotThreshold(cell);
	}

	return interleavedNoise(cell);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	if (!uEnabled || uPaletteSize <= 1) {
		outputColor = vec4(inputColor.rgb, 1.0);
		return;
	}

	float tone = clamp(inputColor.a, 0.0, 1.0);
	float levels = float(uPaletteSize - 1);
	float scaled = tone * levels;
	float baseIndex = floor(scaled);
	float fraction = fract(scaled);
	vec2 cell = floor(gl_FragCoord.xy / max(uPixelSize, 1.0));
	float threshold = clamp(mix(0.5, resolveThreshold(cell), uIntensity), 0.0, 1.0);
	float index = min(baseIndex + step(threshold, fraction), levels);
	vec3 color = paletteIndexColor(index, uPaletteTexture, uPaletteSize);

	outputColor = vec4(color, 1.0);
}
`;

function encodeAlgorithm(algorithm: DitherSettings['algorithm']): number {
	switch (algorithm) {
		case 'bayer4':
			return 0;
		case 'bayer8':
			return 1;
		case 'clustered-dot':
			return 2;
		case 'interleaved-noise':
			return 3;
	}
}

export class DitherEffect extends Effect {
	constructor(palette: PaletteSettings, settings: DitherSettings) {
		const paletteTexture = createPaletteTexture();
		const paletteSize = updatePaletteTexture(paletteTexture, palette);
		const uniforms = new Map<string, Uniform>([
			['uPaletteTexture', new Uniform(paletteTexture)],
			['uPaletteSize', new Uniform(paletteSize)],
			['uEnabled', new Uniform(settings.enabled)],
			['uAlgorithm', new Uniform(encodeAlgorithm(settings.algorithm))],
			['uPixelSize', new Uniform(settings.pixelSize)],
			['uIntensity', new Uniform(settings.intensity)]
		]);

		super('DitherEffect', fragmentShader, { uniforms });
	}

	applySettings(palette: PaletteSettings, settings: DitherSettings): void {
		const texture = this.uniforms.get('uPaletteTexture')!.value;
		this.uniforms.get('uPaletteSize')!.value = updatePaletteTexture(texture, palette);
		this.uniforms.get('uEnabled')!.value = settings.enabled;
		this.uniforms.get('uAlgorithm')!.value = encodeAlgorithm(settings.algorithm);
		this.uniforms.get('uPixelSize')!.value = settings.pixelSize;
		this.uniforms.get('uIntensity')!.value = settings.intensity;
	}

	dispose(): void {
		this.uniforms.get('uPaletteTexture')?.value.dispose();
		super.dispose();
	}
}
