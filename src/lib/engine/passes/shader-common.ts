import { MAX_PALETTE_COLORS } from '../settings';

export const SHADER_COMMON = /* glsl */ `
const vec3 LUMA_WEIGHTS = vec3(0.2126, 0.7152, 0.0722);
const int MAX_PALETTE_COLORS = ${MAX_PALETTE_COLORS};

float luminance(vec3 color) {
	return dot(color, LUMA_WEIGHTS);
}

vec3 paletteIndexColor(float index, sampler2D paletteTexture, int paletteSize) {
	float clampedIndex = clamp(index, 0.0, float(max(paletteSize - 1, 0)));
	float u = (clampedIndex + 0.5) / float(MAX_PALETTE_COLORS);
	return texture2D(paletteTexture, vec2(u, 0.5)).rgb;
}

float paletteBiasTone(float tone, float bias) {
	float clampedTone = clamp(tone, 0.0, 1.0);

	if (bias > 0.0) {
		return mix(clampedTone, sqrt(clampedTone), bias);
	}

	if (bias < 0.0) {
		return mix(clampedTone, clampedTone * clampedTone, -bias);
	}

	return clampedTone;
}

float contrastBlend(float value) {
	return clamp((value - 0.5) * 1.45 + 0.5, 0.0, 1.0);
}

vec3 paletteColorMode(float tone, sampler2D paletteTexture, int paletteSize, int mode) {
	if (paletteSize <= 1) {
		return paletteIndexColor(0.0, paletteTexture, paletteSize);
	}

	float clampedTone = clamp(tone, 0.0, 1.0);
	float levels = float(paletteSize - 1);

	if (mode == 1) {
		float steppedIndex = floor(clampedTone * levels + 0.5);
		return paletteIndexColor(steppedIndex, paletteTexture, paletteSize);
	}

	float scaled = clampedTone * levels;
	float blend = fract(scaled);

	if (mode == 2) {
		blend = contrastBlend(blend);
	}

	float lower = floor(scaled);
	float upper = min(lower + 1.0, levels);
	vec3 a = paletteIndexColor(lower, paletteTexture, paletteSize);
	vec3 b = paletteIndexColor(upper, paletteTexture, paletteSize);

	return mix(a, b, blend);
}

vec3 paletteNearestColor(vec3 pixel, sampler2D paletteTexture, int paletteSize) {
	float bestDist = 1e10;
	vec3 nearest = paletteIndexColor(0.0, paletteTexture, paletteSize);

	for (int i = 0; i < MAX_PALETTE_COLORS; i++) {
		if (i >= paletteSize) break;
		vec3 c = paletteIndexColor(float(i), paletteTexture, paletteSize);
		vec3 diff = pixel - c;
		float d = dot(diff, diff);

		if (d < bestDist) {
			bestDist = d;
			nearest = c;
		}
	}

	return nearest;
}

float bayer4Threshold(vec2 cell) {
	vec2 p = mod(cell, 4.0);

	if (p.y < 0.5) {
		if (p.x < 0.5) return 0.0 / 16.0;
		if (p.x < 1.5) return 8.0 / 16.0;
		if (p.x < 2.5) return 2.0 / 16.0;
		return 10.0 / 16.0;
	}

	if (p.y < 1.5) {
		if (p.x < 0.5) return 12.0 / 16.0;
		if (p.x < 1.5) return 4.0 / 16.0;
		if (p.x < 2.5) return 14.0 / 16.0;
		return 6.0 / 16.0;
	}

	if (p.y < 2.5) {
		if (p.x < 0.5) return 3.0 / 16.0;
		if (p.x < 1.5) return 11.0 / 16.0;
		if (p.x < 2.5) return 1.0 / 16.0;
		return 9.0 / 16.0;
	}

	if (p.x < 0.5) return 15.0 / 16.0;
	if (p.x < 1.5) return 7.0 / 16.0;
	if (p.x < 2.5) return 13.0 / 16.0;
	return 5.0 / 16.0;
}

float bayer8Threshold(vec2 cell) {
	vec2 p = mod(cell, 8.0);

	if (p.y < 0.5) {
		if (p.x < 0.5) return 0.0 / 64.0;
		if (p.x < 1.5) return 32.0 / 64.0;
		if (p.x < 2.5) return 8.0 / 64.0;
		if (p.x < 3.5) return 40.0 / 64.0;
		if (p.x < 4.5) return 2.0 / 64.0;
		if (p.x < 5.5) return 34.0 / 64.0;
		if (p.x < 6.5) return 10.0 / 64.0;
		return 42.0 / 64.0;
	}

	if (p.y < 1.5) {
		if (p.x < 0.5) return 48.0 / 64.0;
		if (p.x < 1.5) return 16.0 / 64.0;
		if (p.x < 2.5) return 56.0 / 64.0;
		if (p.x < 3.5) return 24.0 / 64.0;
		if (p.x < 4.5) return 50.0 / 64.0;
		if (p.x < 5.5) return 18.0 / 64.0;
		if (p.x < 6.5) return 58.0 / 64.0;
		return 26.0 / 64.0;
	}

	if (p.y < 2.5) {
		if (p.x < 0.5) return 12.0 / 64.0;
		if (p.x < 1.5) return 44.0 / 64.0;
		if (p.x < 2.5) return 4.0 / 64.0;
		if (p.x < 3.5) return 36.0 / 64.0;
		if (p.x < 4.5) return 14.0 / 64.0;
		if (p.x < 5.5) return 46.0 / 64.0;
		if (p.x < 6.5) return 6.0 / 64.0;
		return 38.0 / 64.0;
	}

	if (p.y < 3.5) {
		if (p.x < 0.5) return 60.0 / 64.0;
		if (p.x < 1.5) return 28.0 / 64.0;
		if (p.x < 2.5) return 52.0 / 64.0;
		if (p.x < 3.5) return 20.0 / 64.0;
		if (p.x < 4.5) return 62.0 / 64.0;
		if (p.x < 5.5) return 30.0 / 64.0;
		if (p.x < 6.5) return 54.0 / 64.0;
		return 22.0 / 64.0;
	}

	if (p.y < 4.5) {
		if (p.x < 0.5) return 3.0 / 64.0;
		if (p.x < 1.5) return 35.0 / 64.0;
		if (p.x < 2.5) return 11.0 / 64.0;
		if (p.x < 3.5) return 43.0 / 64.0;
		if (p.x < 4.5) return 1.0 / 64.0;
		if (p.x < 5.5) return 33.0 / 64.0;
		if (p.x < 6.5) return 9.0 / 64.0;
		return 41.0 / 64.0;
	}

	if (p.y < 5.5) {
		if (p.x < 0.5) return 51.0 / 64.0;
		if (p.x < 1.5) return 19.0 / 64.0;
		if (p.x < 2.5) return 59.0 / 64.0;
		if (p.x < 3.5) return 27.0 / 64.0;
		if (p.x < 4.5) return 49.0 / 64.0;
		if (p.x < 5.5) return 17.0 / 64.0;
		if (p.x < 6.5) return 57.0 / 64.0;
		return 25.0 / 64.0;
	}

	if (p.y < 6.5) {
		if (p.x < 0.5) return 15.0 / 64.0;
		if (p.x < 1.5) return 47.0 / 64.0;
		if (p.x < 2.5) return 7.0 / 64.0;
		if (p.x < 3.5) return 39.0 / 64.0;
		if (p.x < 4.5) return 13.0 / 64.0;
		if (p.x < 5.5) return 45.0 / 64.0;
		if (p.x < 6.5) return 5.0 / 64.0;
		return 37.0 / 64.0;
	}

	if (p.x < 0.5) return 63.0 / 64.0;
	if (p.x < 1.5) return 31.0 / 64.0;
	if (p.x < 2.5) return 55.0 / 64.0;
	if (p.x < 3.5) return 23.0 / 64.0;
	if (p.x < 4.5) return 61.0 / 64.0;
	if (p.x < 5.5) return 29.0 / 64.0;
	if (p.x < 6.5) return 53.0 / 64.0;
	return 21.0 / 64.0;
}

float clusteredDotThreshold(vec2 cell) {
	vec2 tile = mod(cell, 6.0) - 2.5;
	tile.x += mod(cell.y, 2.0) * 0.6 - 0.3;

	float angle = atan(tile.y, tile.x);
	float radial = clamp(length(tile) / 3.4, 0.0, 1.0);
	float lobe = sin(angle * 4.0) * 0.08;

	return clamp(radial + lobe, 0.0, 1.0);
}

float interleavedNoise(vec2 cell) {
	return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));
}
`;
