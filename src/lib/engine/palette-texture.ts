import {
	Color,
	DataTexture,
	NearestFilter,
	RGBAFormat,
	SRGBColorSpace,
	UnsignedByteType,
	ClampToEdgeWrapping
} from 'three';

import { buildPaletteRamp, MAX_PALETTE_COLORS, type PaletteSettings } from './settings';

export function createPaletteTexture(): DataTexture {
	const data = new Uint8Array(MAX_PALETTE_COLORS * 4);
	const texture = new DataTexture(data, MAX_PALETTE_COLORS, 1, RGBAFormat, UnsignedByteType);
	texture.minFilter = NearestFilter;
	texture.magFilter = NearestFilter;
	texture.wrapS = ClampToEdgeWrapping;
	texture.wrapT = ClampToEdgeWrapping;
	texture.generateMipmaps = false;
	texture.colorSpace = SRGBColorSpace;
	texture.needsUpdate = true;
	return texture;
}

export function updatePaletteTexture(texture: DataTexture, palette: PaletteSettings): number {
	const data = texture.image.data as Uint8Array;
	const ramp = buildPaletteRamp(palette).slice(0, MAX_PALETTE_COLORS);
	const fill = new Color(ramp.at(-1) ?? '#ffffff');

	for (let index = 0; index < MAX_PALETTE_COLORS; index += 1) {
		const color = new Color(ramp[index] ?? fill);
		const offset = index * 4;
		data[offset] = Math.round(color.r * 255);
		data[offset + 1] = Math.round(color.g * 255);
		data[offset + 2] = Math.round(color.b * 255);
		data[offset + 3] = 255;
	}

	texture.needsUpdate = true;
	return ramp.length;
}
