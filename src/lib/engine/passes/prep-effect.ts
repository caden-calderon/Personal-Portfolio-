import { Effect } from 'postprocessing';
import { Uniform } from 'three';

import type { PrepSettings } from '../settings';

const fragmentShader = /* glsl */ `
uniform float uBlur;
uniform float uSharpen;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	if (uBlur <= 0.0 && uSharpen <= 0.0) {
		outputColor = inputColor;
		return;
	}

	vec2 texel = 1.0 / resolution;
	vec3 center = inputColor.rgb;

	vec3 samples = center;
	samples += texture2D(inputBuffer, uv + vec2(-texel.x, -texel.y)).rgb;
	samples += texture2D(inputBuffer, uv + vec2( 0.0,    -texel.y)).rgb;
	samples += texture2D(inputBuffer, uv + vec2( texel.x, -texel.y)).rgb;
	samples += texture2D(inputBuffer, uv + vec2(-texel.x,  0.0   )).rgb;
	samples += texture2D(inputBuffer, uv + vec2( texel.x,  0.0   )).rgb;
	samples += texture2D(inputBuffer, uv + vec2(-texel.x,  texel.y)).rgb;
	samples += texture2D(inputBuffer, uv + vec2( 0.0,     texel.y)).rgb;
	samples += texture2D(inputBuffer, uv + vec2( texel.x,  texel.y)).rgb;
	vec3 lowPass = samples / 9.0;

	vec3 blurred = mix(center, lowPass, uBlur);
	vec3 highPass = center - lowPass;
	vec3 result = blurred + uSharpen * highPass;

	outputColor = vec4(clamp(result, 0.0, 1.0), inputColor.a);
}
`;

export class PrepEffect extends Effect {
	constructor(settings: PrepSettings) {
		const uniforms = new Map<string, Uniform>([
			['uBlur', new Uniform(settings.blur)],
			['uSharpen', new Uniform(settings.sharpen)]
		]);

		super('PrepEffect', fragmentShader, { uniforms });
	}

	applySettings(settings: PrepSettings): void {
		this.uniforms.get('uBlur')!.value = settings.blur;
		this.uniforms.get('uSharpen')!.value = settings.sharpen;
	}
}
