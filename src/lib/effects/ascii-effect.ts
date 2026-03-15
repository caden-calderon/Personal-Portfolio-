import {
	CanvasTexture,
	Color,
	NearestFilter,
	RepeatWrapping,
	Texture,
	Uniform
} from 'three';
import { Effect } from 'postprocessing';

const ATLAS_SIZE = 1024;
const ATLAS_GRID = 16;

const fragmentShader = /* glsl */ `
uniform sampler2D uCharacters;
uniform float uCharactersCount;
uniform float uCellSize;
uniform bool uInvert;
uniform vec3 uColor;
uniform bool uUseColor;

const float GRID = ${ATLAS_GRID}.0;
const float INV_GRID = 1.0 / GRID;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 cellCount = resolution / uCellSize;
    vec2 cellUvSize = 1.0 / cellCount;

    // Pixelize: sample scene at cell center
    vec2 cellCenter = cellUvSize * (0.5 + floor(uv / cellUvSize));
    vec4 sceneColor = texture2D(inputBuffer, cellCenter);

    // Perceived brightness (ITU-R BT.601)
    float brightness = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
    brightness = clamp(brightness, 0.0, 1.0);

    if (uInvert) brightness = 1.0 - brightness;

    // Map brightness to character index
    float charIdx = floor((uCharactersCount - 1.0) * brightness);

    // Character position in atlas grid
    vec2 charPos = vec2(
        mod(charIdx, GRID),
        floor(charIdx / GRID)
    );
    vec2 atlasOffset = vec2(charPos.x, -charPos.y) * INV_GRID;

    // Fragment position within character cell
    vec2 charUV = mod(uv * cellCount * INV_GRID, INV_GRID);
    charUV = charUV - vec2(0.0, INV_GRID) + atlasOffset;

    // Sample glyph from atlas
    float glyph = texture2D(uCharacters, charUV).r;

    // Output
    vec3 outColor = uUseColor ? uColor : sceneColor.rgb;
    outputColor = vec4(outColor * glyph, inputColor.a);
}
`;

export interface AsciiEffectOptions {
	characters?: string;
	font?: string;
	fontSize?: number;
	cellSize?: number;
	color?: string | null;
	invert?: boolean;
}

export class AsciiEffect extends Effect {
	constructor(options: AsciiEffectOptions = {}) {
		const {
			characters = ' .:-=+*#%@',
			font = 'monospace',
			fontSize = 54,
			cellSize = 8,
			color = null,
			invert = false
		} = options;

		const useColor = color !== null;
		const colorValue = new Color(color ?? '#ffffff');

		const uniforms = new Map<string, Uniform>([
			['uCharacters', new Uniform(new Texture())],
			['uCellSize', new Uniform(cellSize)],
			['uCharactersCount', new Uniform(characters.length)],
			['uColor', new Uniform(colorValue)],
			['uInvert', new Uniform(invert)],
			['uUseColor', new Uniform(useColor)]
		]);

		super('AsciiEffect', fragmentShader, { uniforms });

		this.updateCharacterTexture(characters, font, fontSize);
	}

	private updateCharacterTexture(characters: string, font: string, fontSize: number): void {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = ATLAS_SIZE;
		const ctx = canvas.getContext('2d')!;
		const cellSize = ATLAS_SIZE / ATLAS_GRID;

		ctx.clearRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);
		ctx.font = `${fontSize}px ${font}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#ffffff';

		for (let i = 0; i < characters.length; i++) {
			const x = i % ATLAS_GRID;
			const y = Math.floor(i / ATLAS_GRID);
			ctx.fillText(characters[i], x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
		}

		const texture = new CanvasTexture(canvas);
		texture.minFilter = NearestFilter;
		texture.magFilter = NearestFilter;
		texture.wrapS = RepeatWrapping;
		texture.wrapT = RepeatWrapping;
		texture.needsUpdate = true;

		const uniform = this.uniforms.get('uCharacters');
		if (uniform) {
			if (uniform.value instanceof Texture) {
				uniform.value.dispose();
			}
			uniform.value = texture;
		}
	}

	get cellSize(): number {
		return this.uniforms.get('uCellSize')!.value as number;
	}

	set cellSize(value: number) {
		this.uniforms.get('uCellSize')!.value = value;
	}

	setCharacters(characters: string, font = 'monospace', fontSize = 54): void {
		this.uniforms.get('uCharactersCount')!.value = characters.length;
		this.updateCharacterTexture(characters, font, fontSize);
	}

	setColor(color: string | null): void {
		this.uniforms.get('uUseColor')!.value = color !== null;
		if (color) {
			(this.uniforms.get('uColor')!.value as Color).set(color);
		}
	}

	dispose(): void {
		const tex = this.uniforms.get('uCharacters')?.value;
		if (tex instanceof Texture) {
			tex.dispose();
		}
		super.dispose();
	}
}
