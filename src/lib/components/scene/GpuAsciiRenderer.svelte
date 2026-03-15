<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import {
		WebGLRenderTarget,
		NearestFilter,
		ShaderMaterial,
		Uniform,
		Vector2,
		Color,
		CanvasTexture,
		RepeatWrapping,
		Texture,
		OrthographicCamera,
		BufferGeometry,
		Float32BufferAttribute,
		Mesh
	} from 'three';
	import type { ArtStyle } from '$lib/types/art-style';

	const ATLAS_SIZE = 1024;
	const ATLAS_GRID = 16;

	const STYLE_CONFIGS: Record<
		ArtStyle,
		{ chars: string; cellSize: number; color: string | null; font: string }
	> = {
		braille: { chars: '⠀⠁⠃⠇⡇⣇⣧⣷⣿', cellSize: 6, color: null, font: 'monospace' },
		halftone: { chars: ' .·•●', cellSize: 10, color: null, font: 'serif' },
		ascii: { chars: ' .:-=+*#%@', cellSize: 10, color: '#33ff33', font: 'monospace' },
		block: { chars: ' ░▒▓█', cellSize: 8, color: '#33ff33', font: 'monospace' },
		ansi: { chars: ' .:-=+*#%@', cellSize: 10, color: null, font: 'monospace' },
		stipple: { chars: ' ·∙•◦○●', cellSize: 8, color: null, font: 'monospace' }
	};

	let { style }: { style: ArtStyle } = $props();

	const { scene, renderer, camera, size, autoRender, renderStage } = useThrelte();

	function createFontAtlas(characters: string, font: string, fontSize = 54): CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = ATLAS_SIZE;
		const ctx = canvas.getContext('2d')!;
		const cellPx = ATLAS_SIZE / ATLAS_GRID;

		ctx.clearRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);
		ctx.font = `${fontSize}px ${font}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#ffffff';

		for (let i = 0; i < characters.length; i++) {
			const x = i % ATLAS_GRID;
			const y = Math.floor(i / ATLAS_GRID);
			ctx.fillText(characters[i], x * cellPx + cellPx / 2, y * cellPx + cellPx / 2);
		}

		const tex = new CanvasTexture(canvas);
		tex.minFilter = NearestFilter;
		tex.magFilter = NearestFilter;
		tex.wrapS = RepeatWrapping;
		tex.wrapT = RepeatWrapping;
		tex.needsUpdate = true;
		return tex;
	}

	// Scene render target — tiny, matching ASCII grid resolution
	// This is the key optimization: scene renders at ~320x180 instead of 1920x1080
	const sceneRT = new WebGLRenderTarget(1, 1, {
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		generateMipmaps: false,
		depthBuffer: true,
		stencilBuffer: false
	});

	const initCfg = STYLE_CONFIGS.braille;

	const asciiMaterial = new ShaderMaterial({
		uniforms: {
			tScene: new Uniform(sceneRT.texture),
			uCharacters: new Uniform(createFontAtlas(initCfg.chars, initCfg.font)),
			uCharactersCount: new Uniform(initCfg.chars.length),
			uCellSize: new Uniform(initCfg.cellSize),
			uGamma: new Uniform(0.35),
			uColor: new Uniform(new Color(initCfg.color ?? '#ffffff')),
			uUseColor: new Uniform(initCfg.color !== null),
			uResolution: new Uniform(new Vector2(1, 1))
		},
		vertexShader: /* glsl */ `
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform sampler2D tScene;
			uniform sampler2D uCharacters;
			uniform float uCharactersCount;
			uniform float uCellSize;
			uniform float uGamma;
			uniform vec3 uColor;
			uniform bool uUseColor;
			uniform vec2 uResolution;

			varying vec2 vUv;

			const float GRID = ${ATLAS_GRID}.0;
			const float INV_GRID = 1.0 / GRID;

			void main() {
				vec2 pixelCoord = vUv * uResolution;
				vec2 cellCount = ceil(uResolution / uCellSize);
				vec2 cell = floor(pixelCoord / uCellSize);

				// Sample scene (rendered at cell resolution — one pixel per cell)
				vec2 sceneUV = (cell + 0.5) / cellCount;
				vec4 sceneColor = texture2D(tScene, sceneUV);

				// Brightness with gamma correction for ASCII visibility
				float brightness = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));
				brightness = pow(clamp(brightness, 0.0, 1.0), uGamma);

				// Map brightness to character index
				float charIdx = floor((uCharactersCount - 1.0) * brightness);

				// Atlas lookup
				vec2 charPos = vec2(mod(charIdx, GRID), floor(charIdx / GRID));
				vec2 atlasOffset = vec2(charPos.x, -charPos.y) * INV_GRID;

				// Position within cell → position within atlas glyph
				vec2 cellUV = fract(pixelCoord / uCellSize);
				vec2 charUV = cellUV * INV_GRID + atlasOffset;
				charUV.y -= INV_GRID;

				float glyph = texture2D(uCharacters, charUV).r;

				// Color output with brightness boost
				vec3 outColor = uUseColor ? uColor : sceneColor.rgb;
				outColor = pow(outColor, vec3(0.6));
				gl_FragColor = vec4(outColor * glyph, 1.0);
			}
		`
	});

	// Fullscreen triangle (more efficient than a quad — 3 vertices, no overdraw)
	const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
	const quadGeo = new BufferGeometry();
	quadGeo.setAttribute(
		'position',
		new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
	);
	quadGeo.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
	const quadMesh = new Mesh(quadGeo, asciiMaterial);
	quadMesh.frustumCulled = false;

	function resizeSceneRT(width: number, height: number, cellSz: number) {
		const cols = Math.ceil(width / cellSz);
		const rows = Math.ceil(height / cellSz);
		sceneRT.setSize(cols, rows);
		asciiMaterial.uniforms.uResolution.value.set(width, height);
	}

	// React to size changes
	$effect(() => {
		const s = size.current;
		if (s.width > 0 && s.height > 0) {
			resizeSceneRT(s.width, s.height, STYLE_CONFIGS[style].cellSize);
		}
	});

	// React to style changes
	$effect(() => {
		const cfg = STYLE_CONFIGS[style];
		const oldTex = asciiMaterial.uniforms.uCharacters.value;
		if (oldTex instanceof Texture) oldTex.dispose();
		asciiMaterial.uniforms.uCharacters.value = createFontAtlas(cfg.chars, cfg.font);
		asciiMaterial.uniforms.uCharactersCount.value = cfg.chars.length;
		asciiMaterial.uniforms.uCellSize.value = cfg.cellSize;
		(asciiMaterial.uniforms.uColor.value as Color).set(cfg.color ?? '#ffffff');
		asciiMaterial.uniforms.uUseColor.value = cfg.color !== null;

		const s = size.current;
		if (s.width > 0 && s.height > 0) {
			resizeSceneRT(s.width, s.height, cfg.cellSize);
		}
	});

	onMount(() => {
		const prev = autoRender.current;
		autoRender.set(false);
		return () => {
			autoRender.set(prev);
			sceneRT.dispose();
			asciiMaterial.dispose();
			quadGeo.dispose();
			const charTex = asciiMaterial.uniforms.uCharacters.value;
			if (charTex instanceof Texture) charTex.dispose();
		};
	});

	useTask(
		() => {
			// Pass 1: Render 3D scene to tiny FBO (grid resolution, e.g., 320x180)
			renderer.setRenderTarget(sceneRT);
			renderer.render(scene, camera.current);
			renderer.setRenderTarget(null);

			// Pass 2: Render ASCII fullscreen shader to screen (full resolution)
			renderer.render(quadMesh, quadCam);
		},
		{ stage: renderStage, autoInvalidate: false }
	);
</script>
