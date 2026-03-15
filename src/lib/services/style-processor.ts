import type { ArtStyle } from '$lib/types/art-style';

/**
 * Interface for rendering a framebuffer through a text-art style.
 * Two implementations planned: CpuStyleProcessor (prototype) and GpuStyleProcessor (production).
 */
export interface StyleProcessor {
	readonly type: 'cpu' | 'gpu';

	/** Initialize with target dimensions and art style */
	init(width: number, height: number, style: ArtStyle): void;

	/** Update art style without reinitializing */
	setStyle(style: ArtStyle): void;

	/** Resize the processing target */
	resize(width: number, height: number): void;

	/** Clean up resources */
	dispose(): void;
}
