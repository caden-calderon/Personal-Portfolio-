import {
	AmbientLight,
	BoxGeometry,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DirectionalLight,
	Group,
	IcosahedronGeometry,
	Mesh,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SphereGeometry,
	TorusKnotGeometry,
	Vector3
} from 'three';

import type { SceneSettings } from './settings';

export interface SceneBundle {
	scene: Scene;
	camera: PerspectiveCamera;
	applySettings(settings: SceneSettings): void;
	resize(aspect: number): void;
	update(elapsed: number): void;
	dispose(): void;
}

export function createDemoScene(initialSettings: SceneSettings): SceneBundle {
	const scene = new Scene();
	scene.background = new Color('#0b0f12');

	const camera = new PerspectiveCamera(42, 1, 0.1, 100);
	camera.position.set(0.25, 1.55, 5.8);
	camera.lookAt(0, 1.1, -0.35);

	const ambient = new AmbientLight('#ffffff', 0.85);
	const keyLight = new DirectionalLight('#ffd7a1', 2.8);
	keyLight.position.set(3.4, 4.8, 2.6);

	const rimLight = new DirectionalLight('#7db6ff', 1.45);
	rimLight.position.set(-4.1, 2.9, -2.5);

	const fillLight = new DirectionalLight('#d1f3ff', 0.55);
	fillLight.position.set(0.3, 1.8, 4.2);

	const stage = new Group();
	const orbit = new Group();
	const bobTarget = new Group();
	const evaluators = new Group();

	const floor = new Mesh(
		new PlaneGeometry(12, 12),
		new MeshStandardMaterial({
			color: '#221911',
			roughness: 0.98,
			metalness: 0.02
		})
	);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -0.4;

	const backdrop = new Mesh(
		new PlaneGeometry(10.5, 5.8),
		new MeshStandardMaterial({
			color: '#1c1f25',
			roughness: 0.92,
			metalness: 0
		})
	);
	backdrop.position.set(0, 2.1, -3.6);

	const sideFlag = new Mesh(
		new PlaneGeometry(2.2, 4.2),
		new MeshStandardMaterial({
			color: '#12171e',
			roughness: 1,
			metalness: 0
		})
	);
	sideFlag.position.set(2.9, 1.7, -2.25);
	sideFlag.rotation.y = -0.48;

	const plinth = new Mesh(
		new BoxGeometry(4.6, 0.32, 2.6),
		new MeshStandardMaterial({
			color: '#241c16',
			roughness: 0.88,
			metalness: 0.03
		})
	);
	plinth.position.set(0, -0.24, -0.1);

	const knot = new Mesh(
		new TorusKnotGeometry(0.9, 0.28, 220, 36),
		new MeshPhysicalMaterial({
			color: '#d3a566',
			roughness: 0.22,
			metalness: 0.12,
			clearcoat: 0.35,
			clearcoatRoughness: 0.2
		})
	);
	knot.position.set(0, 1.15, -0.2);

	const glossySphere = new Mesh(
		new SphereGeometry(0.56, 44, 44),
		new MeshPhysicalMaterial({
			color: '#8ab7d9',
			roughness: 0.08,
			metalness: 0.18,
			clearcoat: 0.8,
			clearcoatRoughness: 0.06
		})
	);
	glossySphere.position.set(-1.92, 0.56, 0.35);

	const matteStone = new Mesh(
		new IcosahedronGeometry(0.62, 1),
		new MeshStandardMaterial({
			color: '#9ca5b0',
			roughness: 0.98,
			metalness: 0
		})
	);
	matteStone.position.set(1.95, 0.76, -0.68);
	matteStone.rotation.set(0.36, 0.42, 0.12);

	const silhouetteSpire = new Mesh(
		new ConeGeometry(0.26, 1.9, 7),
		new MeshStandardMaterial({
			color: '#f1e2b8',
			roughness: 0.7,
			metalness: 0.04
		})
	);
	silhouetteSpire.position.set(2.72, 0.6, -1.2);

	const shadowColumn = new Mesh(
		new CylinderGeometry(0.18, 0.24, 1.9, 24),
		new MeshStandardMaterial({
			color: '#43352b',
			roughness: 0.72,
			metalness: 0.05
		})
	);
	shadowColumn.position.set(-2.85, 0.55, -1.45);

	const lightSlab = new Mesh(
		new BoxGeometry(2.1, 1.25, 0.06),
		new MeshPhysicalMaterial({
			color: '#ffe2ad',
			emissive: '#cf8b47',
			emissiveIntensity: 0.45,
			roughness: 0.32,
			metalness: 0
		})
	);
	lightSlab.position.set(0, 1.75, -2.95);

	const warmChip = new Mesh(
		new SphereGeometry(0.18, 26, 26),
		new MeshStandardMaterial({
			color: '#ffde9d',
			emissive: '#ff9b42',
			emissiveIntensity: 0.9,
			roughness: 0.15,
			metalness: 0
		})
	);
	warmChip.position.set(1.35, 0.08, 0.92);

	const coolChip = new Mesh(
		new BoxGeometry(0.42, 0.42, 0.42),
		new MeshStandardMaterial({
			color: '#91c2ff',
			roughness: 0.42,
			metalness: 0.22
		})
	);
	coolChip.position.set(-1.12, -0.03, 1.02);

	const toneSteps = Array.from({ length: 4 }, (_, index) => {
		const swatches = ['#1b1b1b', '#555555', '#a4a4a4', '#efebe2'] as const;
		const step = new Mesh(
			new BoxGeometry(0.38, 1.2 + index * 0.18, 0.22),
			new MeshStandardMaterial({
				color: swatches[index],
				roughness: 0.86,
				metalness: 0.02
			})
		);
		step.position.set(-0.92 + index * 0.44, 0.2 + index * 0.09, -2.48);
		return step;
	});

	scene.add(ambient, keyLight, rimLight, fillLight, floor, backdrop, sideFlag, plinth, lightSlab);
	evaluators.add(glossySphere, matteStone, silhouetteSpire, shadowColumn, warmChip, coolChip);
	for (const step of toneSteps) {
		evaluators.add(step);
	}
	stage.add(knot, evaluators);
	orbit.add(stage);
	bobTarget.add(orbit);
	scene.add(bobTarget);

	const origin = new Vector3(0, 0.92, -0.3);
	let settings = { ...initialSettings };
	const disposableMeshes = [
		floor,
		backdrop,
		sideFlag,
		plinth,
		knot,
		glossySphere,
		matteStone,
		silhouetteSpire,
		shadowColumn,
		lightSlab,
		warmChip,
		coolChip,
		...toneSteps
	];

	return {
		scene,
		camera,
		applySettings(next: SceneSettings) {
			settings = { ...next };
		},
		resize(aspect: number) {
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
		},
		update(elapsed: number) {
			const motion = settings.spin + settings.float;
			orbit.rotation.y = elapsed * settings.spin;
			stage.rotation.x = Math.sin(elapsed * 0.43) * 0.05 * motion;
			bobTarget.position.y = Math.sin(elapsed * 0.9) * settings.float;
			glossySphere.position.x = -1.92 + Math.sin(elapsed * 0.55) * 0.18 * motion;
			glossySphere.position.y = 0.56 + Math.cos(elapsed * 0.72) * 0.08 * motion;
			matteStone.rotation.y = 0.42 + elapsed * 0.16 * motion;
			matteStone.rotation.z = 0.12 + Math.sin(elapsed * 0.4) * 0.12 * motion;
			silhouetteSpire.rotation.z = Math.sin(elapsed * 0.35) * 0.04 * motion;
			warmChip.position.y = 0.08 + Math.sin(elapsed * 1.5) * 0.04 * motion;
			coolChip.rotation.x = elapsed * 0.25 * motion;
			coolChip.rotation.y = elapsed * 0.22 * motion;
			camera.lookAt(origin);
		},
		dispose() {
			for (const mesh of disposableMeshes) {
				mesh.geometry.dispose();
				if (Array.isArray(mesh.material)) {
					for (const material of mesh.material) {
						material.dispose();
					}
				} else {
					mesh.material.dispose();
				}
			}
		}
	};
}
