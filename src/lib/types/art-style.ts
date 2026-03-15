export const ART_STYLES = [
	'ascii',
	'braille',
	'block',
	'halftone',
	'ansi',
	'stipple'
] as const;

export type ArtStyle = (typeof ART_STYLES)[number];

export interface ArtStyleConfig {
	name: string;
	charset: string;
	cellWidth: number;
	cellHeight: number;
	monochrome: boolean;
}

export const ART_STYLE_CONFIGS: Record<ArtStyle, ArtStyleConfig> = {
	ascii: {
		name: 'Classic ASCII',
		charset: ' .:-=+*#%@',
		cellWidth: 1,
		cellHeight: 1,
		monochrome: true
	},
	braille: {
		name: 'Braille',
		charset: '⠀⠁⠃⠇⡇⣇⣧⣷⣿',
		cellWidth: 2,
		cellHeight: 4,
		monochrome: true
	},
	block: {
		name: 'Block Drawing',
		charset: ' ░▒▓█',
		cellWidth: 1,
		cellHeight: 1,
		monochrome: true
	},
	halftone: {
		name: 'Halftone',
		charset: ' .·•●',
		cellWidth: 1,
		cellHeight: 1,
		monochrome: false
	},
	ansi: {
		name: 'ANSI',
		charset: ' .:-=+*#%@',
		cellWidth: 1,
		cellHeight: 1,
		monochrome: false
	},
	stipple: {
		name: 'Stipple',
		charset: ' ·∙•◦○●',
		cellWidth: 1,
		cellHeight: 1,
		monochrome: true
	}
};
