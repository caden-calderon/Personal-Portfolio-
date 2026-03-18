import { Clock, NoToneMapping, SRGBColorSpace, WebGLRenderer } from 'three';
import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';

import { createDemoScene, type SceneBundle } from './scene';
import { DitherEffect } from './passes/dither-effect';
import { FinishEffect } from './passes/finish-effect';
import { PaletteEffect } from './passes/palette-effect';
import { PrepEffect } from './passes/prep-effect';
import { ToneEffect } from './passes/tone-effect';
import { type LabSettings, validateLabSettings } from './settings';

export class ChromaticEngine {
	private settings: LabSettings;
	private renderer: WebGLRenderer | null = null;
	private composer: EffectComposer | null = null;
	private renderPass: RenderPass | null = null;
	private sceneBundle: SceneBundle | null = null;
	private prepEffect: PrepEffect | null = null;
	private toneEffect: ToneEffect | null = null;
	private paletteEffect: PaletteEffect | null = null;
	private ditherEffect: DitherEffect | null = null;
	private finishEffect: FinishEffect | null = null;
	private clock = new Clock();
	private frameHandle = 0;

	constructor(initialSettings: LabSettings) {
		this.settings = validateLabSettings(initialSettings);
	}

	mount(canvas: HTMLCanvasElement): void {
		if (this.renderer) return;

		this.renderer = new WebGLRenderer({
			canvas,
			antialias: false,
			alpha: false,
			powerPreference: 'high-performance'
		});
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = NoToneMapping;
		this.renderer.setClearColor(this.settings.palette.background, 1);

		this.sceneBundle = createDemoScene(this.settings.scene);
		this.prepEffect = new PrepEffect(this.settings.prep);
		this.toneEffect = new ToneEffect(this.settings.tone);
		this.paletteEffect = new PaletteEffect(this.settings.palette);
		this.ditherEffect = new DitherEffect(this.settings.palette, this.settings.dither);
		this.finishEffect = new FinishEffect(this.settings.finish);
		this.renderPass = new RenderPass(this.sceneBundle.scene, this.sceneBundle.camera);

		this.composer = new EffectComposer(this.renderer, { multisampling: 0 });
		this.composer.addPass(this.renderPass);
		this.composer.addPass(new EffectPass(this.sceneBundle.camera, this.prepEffect));
		this.composer.addPass(new EffectPass(this.sceneBundle.camera, this.toneEffect));
		this.composer.addPass(new EffectPass(this.sceneBundle.camera, this.paletteEffect));
		this.composer.addPass(new EffectPass(this.sceneBundle.camera, this.ditherEffect));
		this.composer.addPass(new EffectPass(this.sceneBundle.camera, this.finishEffect));

		this.resize(canvas.clientWidth || 1, canvas.clientHeight || 1, window.devicePixelRatio || 1);
	}

	start(): void {
		if (!this.renderer || this.frameHandle) return;

		this.clock.start();
		const tick = () => {
			if (!this.composer || !this.sceneBundle) return;

			this.sceneBundle.update(this.clock.getElapsedTime());
			this.composer.render();
			this.frameHandle = window.requestAnimationFrame(tick);
		};

		this.frameHandle = window.requestAnimationFrame(tick);
	}

	stop(): void {
		if (!this.frameHandle) return;

		window.cancelAnimationFrame(this.frameHandle);
		this.frameHandle = 0;
		this.clock.stop();
	}

	setSettings(nextSettings: LabSettings): void {
		this.settings = validateLabSettings(nextSettings);
		this.renderer?.setClearColor(this.settings.palette.background, 1);
		this.sceneBundle?.applySettings(this.settings.scene);
		this.prepEffect?.applySettings(this.settings.prep);
		this.toneEffect?.applySettings(this.settings.tone);
		this.paletteEffect?.applySettings(this.settings.palette);
		this.ditherEffect?.applySettings(this.settings.palette, this.settings.dither);
		this.finishEffect?.applySettings(this.settings.finish);
	}

	resize(width: number, height: number, devicePixelRatio = 1): void {
		if (!this.renderer || !this.composer || !this.sceneBundle) return;

		const safeWidth = Math.max(1, Math.floor(width));
		const safeHeight = Math.max(1, Math.floor(height));
		const pixelRatio = Math.min(Math.max(devicePixelRatio, 1), 2);

		this.renderer.setPixelRatio(pixelRatio);
		this.renderer.setSize(safeWidth, safeHeight, false);
		this.composer.setSize(safeWidth, safeHeight);
		this.sceneBundle.resize(safeWidth / safeHeight);
	}

	dispose(): void {
		this.stop();
		this.composer?.dispose();
		this.sceneBundle?.dispose();
		this.renderer?.dispose();
		this.renderPass = null;
		this.sceneBundle = null;
		this.prepEffect = null;
		this.toneEffect = null;
		this.paletteEffect = null;
		this.ditherEffect = null;
		this.finishEffect = null;
		this.composer = null;
		this.renderer = null;
	}
}
