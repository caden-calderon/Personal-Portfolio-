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
uniform int uInterpolation;
uniform int uColorMode;

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

float applyInterpolation(float fraction) {
	if (uInterpolation == 1) {
		return step(0.5, fraction);
	}

	if (uInterpolation == 2) {
		return contrastBlend(fraction);
	}

	return fraction;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	if (!uEnabled || uPaletteSize <= 1) {
		if (uColorMode == 2 && uPaletteSize > 1) {
			outputColor = vec4(paletteNearestColor(inputColor.rgb, uPaletteTexture, uPaletteSize), 1.0);
			return;
		}

		if (uColorMode == 3 && uPaletteSize > 1) {
			float levels = float(uPaletteSize - 1);
			vec3 quantized = floor(inputColor.rgb * levels + 0.5) / levels;
			outputColor = vec4(clamp(quantized, 0.0, 1.0), 1.0);
			return;
		}

		outputColor = vec4(inputColor.rgb, 1.0);
		return;
	}

	vec2 cell = floor(gl_FragCoord.xy / max(uPixelSize, 1.0));
	float threshold = clamp(mix(0.5, resolveThreshold(cell), uIntensity), 0.0, 1.0);

	if (uColorMode == 2) {
		vec3 pixel = inputColor.rgb;
		float bestDist = 1e10;
		float secondDist = 1e10;
		float bestIdx = 0.0;
		float secondIdx = 0.0;

		for (int i = 0; i < MAX_PALETTE_COLORS; i++) {
			if (i >= uPaletteSize) break;
			vec3 c = paletteIndexColor(float(i), uPaletteTexture, uPaletteSize);
			vec3 diff = pixel - c;
			float d = dot(diff, diff);

			if (d < bestDist) {
				secondDist = bestDist;
				secondIdx = bestIdx;
				bestDist = d;
				bestIdx = float(i);
			} else if (d < secondDist) {
				secondDist = d;
				secondIdx = float(i);
			}
		}

		float totalDist = bestDist + secondDist;
		float fraction = totalDist > 0.0 ? bestDist / totalDist : 0.0;
		fraction = applyInterpolation(fraction);
		float chosen = mix(bestIdx, secondIdx, step(threshold, fraction));
		outputColor = vec4(paletteIndexColor(chosen, uPaletteTexture, uPaletteSize), 1.0);
		return;
	}

	if (uColorMode == 3) {
		vec3 pixel = inputColor.rgb;
		float levels = float(uPaletteSize - 1);
		vec3 scaled = pixel * levels;
		vec3 base = floor(scaled);
		vec3 frac = vec3(
			applyInterpolation(fract(scaled.r)),
			applyInterpolation(fract(scaled.g)),
			applyInterpolation(fract(scaled.b))
		);
		vec3 dithered = min(base + step(vec3(threshold), frac), vec3(levels));
		outputColor = vec4(dithered / levels, 1.0);
		return;
	}

	float tone = clamp(inputColor.a, 0.0, 1.0);
	float levels = float(uPaletteSize - 1);

	if (uColorMode == 0) {
		float shaped = applyInterpolation(tone);
		float index = step(threshold, shaped) * levels;
		outputColor = vec4(paletteIndexColor(index, uPaletteTexture, uPaletteSize), 1.0);
		return;
	}

	float scaled = tone * levels;
	float baseIndex = floor(scaled);
	float fraction = applyInterpolation(fract(scaled));
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
			['uIntensity', new Uniform(settings.intensity)],
			['uInterpolation', new Uniform(encodeInterpolation(palette.interpolation))],
			['uColorMode', new Uniform(encodeColorMode(palette.colorMode))]
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
		this.uniforms.get('uInterpolation')!.value = encodeInterpolation(palette.interpolation);
		this.uniforms.get('uColorMode')!.value = encodeColorMode(palette.colorMode);
	}

	dispose(): void {
		this.uniforms.get('uPaletteTexture')?.value.dispose();
		super.dispose();
	}
}
