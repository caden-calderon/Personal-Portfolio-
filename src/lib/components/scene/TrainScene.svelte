<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { PerspectiveCamera, type Object3D } from 'three';

	const { invalidate } = useThrelte();

	let sceneryOffset = $state(0);

	useTask((delta) => {
		sceneryOffset += delta * 0.3;
		invalidate();
	});

	function lookAtTarget(ref: Object3D) {
		if (ref instanceof PerspectiveCamera) {
			ref.lookAt(0, 0.9, -1.2);
		}
	}

	// Compartment dimensions
	const W = 2.2;
	const L = 3.0;
	const H = 2.4;
	const WALL = 0.08;
	const HALF_W = W / 2;
	const HALF_L = L / 2;

	const TABLE_W = 0.7;
	const TABLE_L = 0.5;
	const TABLE_H = 0.72;
	const TABLE_THICK = 0.04;

	const SEAT_H = 0.45;
	const SEAT_D = 0.5;
	const BACK_H = 0.6;
</script>

<!-- Camera — visitor's POV -->
<T.PerspectiveCamera
	makeDefault
	position={[0, 1.15, 1.1]}
	fov={55}
	oncreate={(ref) => lookAtTarget(ref)}
/>

<!-- ==================== LIGHTING ==================== -->

<T.AmbientLight intensity={1.2} color="#ffe8d0" />

<!-- Key light — warm sunlight through window -->
<T.DirectionalLight
	position={[-2, 2.5, 0]}
	intensity={2.5}
	color="#fff0d0"
	castShadow
	shadow.mapSize.width={512}
	shadow.mapSize.height={512}
	shadow.camera.near={0.1}
	shadow.camera.far={8}
	shadow.camera.left={-2}
	shadow.camera.right={2}
	shadow.camera.top={3}
	shadow.camera.bottom={-1}
/>

<!-- Fill from right -->
<T.DirectionalLight position={[2, 1.5, 0.5]} intensity={0.8} color="#eeddcc" />

<!-- Overhead warm light -->
<T.PointLight position={[0, H - 0.3, -0.2]} intensity={1.5} color="#ffddaa" distance={5} />

<!-- Cool fill from visitor's side -->
<T.PointLight position={[0.3, 1.2, 1.0]} intensity={0.6} color="#ccddef" distance={4} />

<!-- ==================== FLOOR ==================== -->
<T.Mesh rotation.x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
	<T.PlaneGeometry args={[W, L]} />
	<T.MeshLambertMaterial color="#8a7058" />
</T.Mesh>

<!-- ==================== CEILING ==================== -->
<T.Mesh rotation.x={Math.PI / 2} position={[0, H, 0]}>
	<T.PlaneGeometry args={[W, L]} />
	<T.MeshLambertMaterial color="#c0aa90" />
</T.Mesh>

<!-- ==================== WALLS — warm wood paneling ==================== -->

<!-- Back wall -->
<T.Mesh position={[0, H / 2, -HALF_L]} receiveShadow>
	<T.PlaneGeometry args={[W, H]} />
	<T.MeshLambertMaterial color="#a08060" />
</T.Mesh>

<!-- Right wall -->
<T.Mesh position={[HALF_W, H / 2, 0]} rotation.y={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[L, H]} />
	<T.MeshLambertMaterial color="#a08060" />
</T.Mesh>

<!-- Left wall — above window -->
<T.Mesh position={[-HALF_W, H - 0.4, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[L, 0.8]} />
	<T.MeshLambertMaterial color="#a08060" />
</T.Mesh>

<!-- Left wall — below window -->
<T.Mesh position={[-HALF_W, 0.35, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[L, 0.7]} />
	<T.MeshLambertMaterial color="#a08060" />
</T.Mesh>

<!-- Window frame pillars -->
<T.Mesh position={[-HALF_W, 1.1, -1.0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.12, 1.1]} />
	<T.MeshLambertMaterial color="#705040" />
</T.Mesh>
<T.Mesh position={[-HALF_W, 1.1, 0.8]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.12, 1.1]} />
	<T.MeshLambertMaterial color="#705040" />
</T.Mesh>

<!-- ==================== WINDOW ==================== -->

<!-- Bright window — main visual anchor -->
<T.Mesh position={[-HALF_W + 0.01, 1.15, -0.1]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[1.7, 1.0]} />
	<T.MeshBasicMaterial color="#ccddbb" />
</T.Mesh>

<!-- Scenery — distant layer -->
<T.Mesh position={[-HALF_W - 0.3, 1.3, -0.1 + Math.sin(sceneryOffset * 0.3) * 0.15]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[2.5, 0.4]} />
	<T.MeshBasicMaterial color="#aabbaa" />
</T.Mesh>

<!-- Scenery — trees scrolling -->
<T.Mesh position={[-HALF_W - 0.15, 0.9, ((sceneryOffset * 0.8) % 3) - 1.5]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.5, 0.5]} />
	<T.MeshBasicMaterial color="#7a9970" />
</T.Mesh>
<T.Mesh position={[-HALF_W - 0.15, 0.9, (((sceneryOffset * 0.8) + 1.5) % 3) - 1.5]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.4, 0.45]} />
	<T.MeshBasicMaterial color="#6a8860" />
</T.Mesh>

<!-- ==================== TABLE — warm polished wood ==================== -->

<T.Mesh position={[0, TABLE_H, -0.2]} castShadow receiveShadow>
	<T.BoxGeometry args={[TABLE_W, TABLE_THICK, TABLE_L]} />
	<T.MeshLambertMaterial color="#c0a060" />
</T.Mesh>

{#each [[-1, 1], [1, 1], [-1, -1], [1, -1]] as [lx, lz]}
	<T.Mesh position={[lx * (TABLE_W / 2 - 0.04), TABLE_H / 2, -0.2 + lz * (TABLE_L / 2 - 0.04)]} castShadow>
		<T.BoxGeometry args={[0.04, TABLE_H, 0.04]} />
		<T.MeshLambertMaterial color="#a08850" />
	</T.Mesh>
{/each}

<!-- ==================== SEATS — deep burgundy velvet ==================== -->

<!-- Character's seat cushion -->
<T.Mesh position={[0, SEAT_H / 2, -HALF_L + SEAT_D / 2 + WALL]} castShadow receiveShadow>
	<T.BoxGeometry args={[W - 0.3, SEAT_H, SEAT_D]} />
	<T.MeshLambertMaterial color="#aa4444" />
</T.Mesh>

<!-- Character's seat backrest -->
<T.Mesh position={[0, SEAT_H + BACK_H / 2, -HALF_L + WALL / 2 + 0.05]} receiveShadow>
	<T.BoxGeometry args={[W - 0.3, BACK_H, 0.1]} />
	<T.MeshLambertMaterial color="#cc5555" />
</T.Mesh>

<!-- Visitor's seat cushion -->
<T.Mesh position={[0, SEAT_H / 2, HALF_L - SEAT_D / 2 - WALL]} castShadow receiveShadow>
	<T.BoxGeometry args={[W - 0.3, SEAT_H, SEAT_D]} />
	<T.MeshLambertMaterial color="#aa4444" />
</T.Mesh>

<!-- Visitor's seat backrest -->
<T.Mesh position={[0, SEAT_H + BACK_H / 2, HALF_L - WALL / 2 - 0.05]}>
	<T.BoxGeometry args={[W - 0.3, BACK_H, 0.1]} />
	<T.MeshLambertMaterial color="#cc5555" />
</T.Mesh>

<!-- ==================== TABLE OBJECTS ==================== -->

<!-- Laptop -->
<T.Mesh position={[0.05, TABLE_H + 0.015, -0.15]} rotation.y={0.1} castShadow>
	<T.BoxGeometry args={[0.3, 0.02, 0.2]} />
	<T.MeshLambertMaterial color="#667777" />
</T.Mesh>

<!-- Tea cup -->
<T.Mesh position={[-0.2, TABLE_H + 0.04, -0.05]} castShadow>
	<T.CylinderGeometry args={[0.03, 0.025, 0.07, 12]} />
	<T.MeshLambertMaterial color="#f0e0d0" />
</T.Mesh>

<!-- Tea liquid -->
<T.Mesh position={[-0.2, TABLE_H + 0.065, -0.05]} rotation.x={-Math.PI / 2}>
	<T.CircleGeometry args={[0.028, 12]} />
	<T.MeshLambertMaterial color="#bb8844" />
</T.Mesh>

<!-- Cards -->
<T.Mesh position={[0.22, TABLE_H + 0.01, -0.3]} rotation.y={-0.2} castShadow>
	<T.BoxGeometry args={[0.06, 0.015, 0.09]} />
	<T.MeshLambertMaterial color="#fffff0" />
</T.Mesh>

<!-- Newspaper -->
<T.Mesh position={[0.3, SEAT_H + 0.01, -HALF_L + SEAT_D / 2 + WALL]} rotation.y={0.3}>
	<T.BoxGeometry args={[0.15, 0.008, 0.22]} />
	<T.MeshLambertMaterial color="#f0e8d8" />
</T.Mesh>

<!-- ==================== OVERHEAD RACKS ==================== -->

<T.Mesh position={[HALF_W - 0.15, H - 0.5, 0]}>
	<T.BoxGeometry args={[0.25, 0.03, L - 0.2]} />
	<T.MeshLambertMaterial color="#b09060" />
</T.Mesh>
<T.Mesh position={[-HALF_W + 0.15, H - 0.5, 0]}>
	<T.BoxGeometry args={[0.25, 0.03, L - 0.2]} />
	<T.MeshLambertMaterial color="#b09060" />
</T.Mesh>

<!-- ==================== TRIM ==================== -->

<T.Mesh position={[HALF_W - 0.02, 0.04, 0]}>
	<T.BoxGeometry args={[0.04, 0.08, L]} />
	<T.MeshLambertMaterial color="#806040" />
</T.Mesh>
<T.Mesh position={[-HALF_W + 0.02, 0.04, 0]}>
	<T.BoxGeometry args={[0.04, 0.08, L]} />
	<T.MeshLambertMaterial color="#806040" />
</T.Mesh>

<!-- Ceiling light -->
<T.Mesh position={[0, H - 0.05, -0.2]}>
	<T.BoxGeometry args={[0.15, 0.03, 0.15]} />
	<T.MeshLambertMaterial color="#eebb66" emissive="#cc9933" emissiveIntensity={0.8} />
</T.Mesh>

<!-- ==================== CHARACTER PLACEHOLDER ==================== -->

<!-- Head -->
<T.Mesh position={[0, SEAT_H + 0.65, -HALF_L + SEAT_D / 2 + WALL + 0.1]} castShadow>
	<T.SphereGeometry args={[0.1, 12, 12]} />
	<T.MeshLambertMaterial color="#ddbb88" />
</T.Mesh>

<!-- Torso -->
<T.Mesh position={[0, SEAT_H + 0.35, -HALF_L + SEAT_D / 2 + WALL + 0.1]} castShadow>
	<T.BoxGeometry args={[0.3, 0.4, 0.15]} />
	<T.MeshLambertMaterial color="#cc9977" />
</T.Mesh>

<!-- Shoulders -->
<T.Mesh position={[0, SEAT_H + 0.5, -HALF_L + SEAT_D / 2 + WALL + 0.1]} castShadow>
	<T.BoxGeometry args={[0.4, 0.08, 0.12]} />
	<T.MeshLambertMaterial color="#cc9977" />
</T.Mesh>
