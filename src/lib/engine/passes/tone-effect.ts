import { Effect } from 'postprocessing';
import { Uniform } from 'three';

import type { ToneSettings } from '../settings';

const fragmentShader = /* glsl */ `
uniform float uExposure;
uniform float uContrast;
uniform float uBrightness;
uniform float uGamma;
uniform float uPosterize;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec3 color = inputColor.rgb * exp2(uExposure);
	color = (color - 0.5) * uContrast + 0.5;
	color += uBrightness;
	color = clamp(color, 0.0, 1.0);
	color = pow(color, vec3(1.0 / max(uGamma, 0.0001)));

	if (uPosterize > 1.0) {
		color = floor(color * uPosterize) / max(uPosterize - 1.0, 1.0);
	}

	outputColor = vec4(color, inputColor.a);
}
`;

export class ToneEffect extends Effect {
	constructor(settings: ToneSettings) {
		const uniforms = new Map<string, Uniform>([
			['uExposure', new Uniform(settings.exposure)],
			['uContrast', new Uniform(settings.contrast)],
			['uBrightness', new Uniform(settings.brightness)],
			['uGamma', new Uniform(settings.gamma)],
			['uPosterize', new Uniform(settings.posterize)]
		]);

		super('ToneEffect', fragmentShader, { uniforms });
	}

	applySettings(settings: ToneSettings): void {
		this.uniforms.get('uExposure')!.value = settings.exposure;
		this.uniforms.get('uContrast')!.value = settings.contrast;
		this.uniforms.get('uBrightness')!.value = settings.brightness;
		this.uniforms.get('uGamma')!.value = settings.gamma;
		this.uniforms.get('uPosterize')!.value = settings.posterize;
	}
}
