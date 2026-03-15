import { type ArtStyle, ART_STYLE_CONFIGS, type ArtStyleConfig } from '$lib/types/art-style';

let currentStyle = $state<ArtStyle>('braille');

export function getArtStyle(): ArtStyle {
	return currentStyle;
}

export function getArtStyleConfig(): ArtStyleConfig {
	return ART_STYLE_CONFIGS[currentStyle];
}

export function setArtStyle(style: ArtStyle): void {
	currentStyle = style;
}
