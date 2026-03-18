import { Effect } from 'postprocessing';
import { Uniform } from 'three';

import type { FinishSettings } from '../settings';
import { SHADER_COMMON } from './shader-common';

const fragmentShader = /* glsl */ `
uniform float uVignette;
uniform float uGrain;

${SHADER_COMMON}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	float vignetteMask = smoothstep(0.9, 0.2, distance(uv, vec2(0.5)));
	float grain = (interleavedNoise(gl_FragCoord.xy) - 0.5) * uGrain;
	vec3 color = inputColor.rgb * mix(1.0, vignetteMask, uVignette);
	color = clamp(color + grain, 0.0, 1.0);
	outputColor = vec4(color, 1.0);
}
`;

export class FinishEffect extends Effect {
	constructor(settings: FinishSettings) {
		const uniforms = new Map<string, Uniform>([
			['uVignette', new Uniform(settings.vignette)],
			['uGrain', new Uniform(settings.grain)]
		]);

		super('FinishEffect', fragmentShader, { uniforms });
	}

	applySettings(settings: FinishSettings): void {
		this.uniforms.get('uVignette')!.value = settings.vignette;
		this.uniforms.get('uGrain')!.value = settings.grain;
	}
}
