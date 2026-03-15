<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { PerspectiveCamera, type Object3D } from 'three';

	const { invalidate } = useThrelte();

	// Scrolling window scenery
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

	// Table
	const TABLE_W = 0.7;
	const TABLE_L = 0.5;
	const TABLE_H = 0.72;
	const TABLE_THICK = 0.04;

	// Seat dimensions
	const SEAT_H = 0.45;
	const SEAT_D = 0.5;
	const BACK_H = 0.6;
</script>

<!-- Camera — visitor's POV, sitting across the table -->
<T.PerspectiveCamera
	makeDefault
	position={[0, 1.15, 1.1]}
	fov={55}
	oncreate={(ref) => lookAtTarget(ref)}
/>

<!-- ==================== LIGHTING ==================== -->

<!-- Strong warm ambient — ensures all surfaces are visible through braille -->
<T.AmbientLight intensity={1.4} color="#ffeedd" />

<!-- Window sunlight — key light -->
<T.DirectionalLight position={[-2, 2.5, 0]} intensity={2.5} color="#fff8ee" />

<!-- Fill from the right to illuminate the opposite wall -->
<T.DirectionalLight position={[2, 1.5, 0.5]} intensity={1.0} color="#eeddcc" />

<!-- Overhead compartment light -->
<T.PointLight position={[0, H - 0.3, -0.2]} intensity={1.5} color="#ffeecc" distance={5} />

<!-- Fill from visitor's side -->
<T.PointLight position={[0.3, 1.2, 1.0]} intensity={0.8} color="#ddeeff" distance={4} />

<!-- ==================== FLOOR ==================== -->
<T.Mesh rotation.x={-Math.PI / 2} position={[0, 0, 0]}>
	<T.PlaneGeometry args={[W, L]} />
	<T.MeshLambertMaterial color="#7a6b5a" />
</T.Mesh>

<!-- ==================== CEILING ==================== -->
<T.Mesh rotation.x={Math.PI / 2} position={[0, H, 0]}>
	<T.PlaneGeometry args={[W, L]} />
	<T.MeshLambertMaterial color="#9a8d7d" />
</T.Mesh>

<!-- ==================== WALLS ==================== -->

<!-- Back wall (behind character) -->
<T.Mesh position={[0, H / 2, -HALF_L]}>
	<T.PlaneGeometry args={[W, H]} />
	<T.MeshLambertMaterial color="#a08d7a" />
</T.Mesh>

<!-- Right wall (solid) -->
<T.Mesh position={[HALF_W, H / 2, 0]} rotation.y={-Math.PI / 2}>
	<T.PlaneGeometry args={[L, H]} />
	<T.MeshLambertMaterial color="#9a877a" />
</T.Mesh>

<!-- Left wall — upper section (above window) -->
<T.Mesh position={[-HALF_W, H - 0.4, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[L, 0.8]} />
	<T.MeshLambertMaterial color="#9a877a" />
</T.Mesh>

<!-- Left wall — lower section (below window) -->
<T.Mesh position={[-HALF_W, 0.35, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[L, 0.7]} />
	<T.MeshLambertMaterial color="#9a877a" />
</T.Mesh>

<!-- Left wall — window frame left pillar -->
<T.Mesh position={[-HALF_W, 1.1, -1.0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.1, 1.1]} />
	<T.MeshLambertMaterial color="#8a7766" />
</T.Mesh>

<!-- Left wall — window frame right pillar -->
<T.Mesh position={[-HALF_W, 1.1, 0.8]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.1, 1.1]} />
	<T.MeshLambertMaterial color="#8a7766" />
</T.Mesh>

<!-- ==================== WINDOW ==================== -->

<!-- Window glass — bright, the main light source visually -->
<T.Mesh position={[-HALF_W + 0.01, 1.15, -0.1]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[1.7, 1.0]} />
	<T.MeshBasicMaterial color="#aaccdd" />
</T.Mesh>

<!-- Scenery layer 1 — distant sky/mountains (slow drift) -->
<T.Mesh position={[-HALF_W - 0.3, 1.3, -0.1 + Math.sin(sceneryOffset * 0.3) * 0.15]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[2.5, 0.4]} />
	<T.MeshBasicMaterial color="#99bbcc" />
</T.Mesh>

<!-- Scenery layer 2 — hills (medium scroll) -->
<T.Mesh position={[-HALF_W - 0.15, 0.9, ((sceneryOffset * 0.8) % 3) - 1.5]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.5, 0.5]} />
	<T.MeshBasicMaterial color="#668866" />
</T.Mesh>

<T.Mesh position={[-HALF_W - 0.15, 0.9, (((sceneryOffset * 0.8) + 1.5) % 3) - 1.5]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[0.4, 0.45]} />
	<T.MeshBasicMaterial color="#557755" />
</T.Mesh>

<!-- ==================== TABLE ==================== -->

<!-- Table top -->
<T.Mesh position={[0, TABLE_H, -0.2]}>
	<T.BoxGeometry args={[TABLE_W, TABLE_THICK, TABLE_L]} />
	<T.MeshLambertMaterial color="#b09070" />
</T.Mesh>

<!-- Table legs -->
{#each [[-1, 1], [1, 1], [-1, -1], [1, -1]] as [lx, lz]}
	<T.Mesh position={[lx * (TABLE_W / 2 - 0.04), TABLE_H / 2, -0.2 + lz * (TABLE_L / 2 - 0.04)]}>
		<T.BoxGeometry args={[0.04, TABLE_H, 0.04]} />
		<T.MeshLambertMaterial color="#9a7a60" />
	</T.Mesh>
{/each}

<!-- ==================== SEATS ==================== -->

<!-- Character's seat (far side) — seat cushion -->
<T.Mesh position={[0, SEAT_H / 2, -HALF_L + SEAT_D / 2 + WALL]}>
	<T.BoxGeometry args={[W - 0.3, SEAT_H, SEAT_D]} />
	<T.MeshLambertMaterial color="#aa7755" />
</T.Mesh>

<!-- Character's seat — backrest -->
<T.Mesh position={[0, SEAT_H + BACK_H / 2, -HALF_L + WALL / 2 + 0.05]}>
	<T.BoxGeometry args={[W - 0.3, BACK_H, 0.1]} />
	<T.MeshLambertMaterial color="#bb8866" />
</T.Mesh>

<!-- Visitor's seat (near side) — seat cushion -->
<T.Mesh position={[0, SEAT_H / 2, HALF_L - SEAT_D / 2 - WALL]}>
	<T.BoxGeometry args={[W - 0.3, SEAT_H, SEAT_D]} />
	<T.MeshLambertMaterial color="#aa7755" />
</T.Mesh>

<!-- Visitor's seat — backrest -->
<T.Mesh position={[0, SEAT_H + BACK_H / 2, HALF_L - WALL / 2 - 0.05]}>
	<T.BoxGeometry args={[W - 0.3, BACK_H, 0.1]} />
	<T.MeshLambertMaterial color="#bb8866" />
</T.Mesh>

<!-- ==================== TABLE OBJECTS ==================== -->

<!-- Laptop (closed) -->
<T.Mesh position={[0.05, TABLE_H + 0.015, -0.15]} rotation.y={0.1}>
	<T.BoxGeometry args={[0.3, 0.02, 0.2]} />
	<T.MeshLambertMaterial color="#556666" />
</T.Mesh>

<!-- Tea cup -->
<T.Mesh position={[-0.2, TABLE_H + 0.04, -0.05]}>
	<T.CylinderGeometry args={[0.03, 0.025, 0.07, 12]} />
	<T.MeshLambertMaterial color="#eeddcc" />
</T.Mesh>

<!-- Tea liquid -->
<T.Mesh position={[-0.2, TABLE_H + 0.065, -0.05]} rotation.x={-Math.PI / 2}>
	<T.CircleGeometry args={[0.028, 12]} />
	<T.MeshLambertMaterial color="#aa7744" />
</T.Mesh>

<!-- Stack of cards -->
<T.Mesh position={[0.22, TABLE_H + 0.01, -0.3]} rotation.y={-0.2}>
	<T.BoxGeometry args={[0.06, 0.015, 0.09]} />
	<T.MeshLambertMaterial color="#ffffee" />
</T.Mesh>

<!-- Newspaper on the far seat -->
<T.Mesh position={[0.3, SEAT_H + 0.01, -HALF_L + SEAT_D / 2 + WALL]} rotation.y={0.3}>
	<T.BoxGeometry args={[0.15, 0.008, 0.22]} />
	<T.MeshLambertMaterial color="#eeddcc" />
</T.Mesh>

<!-- ==================== OVERHEAD LUGGAGE RACK ==================== -->

<!-- Right side rack -->
<T.Mesh position={[HALF_W - 0.15, H - 0.5, 0]}>
	<T.BoxGeometry args={[0.25, 0.03, L - 0.2]} />
	<T.MeshLambertMaterial color="#aa9977" />
</T.Mesh>

<!-- Left side rack -->
<T.Mesh position={[-HALF_W + 0.15, H - 0.5, 0]}>
	<T.BoxGeometry args={[0.25, 0.03, L - 0.2]} />
	<T.MeshLambertMaterial color="#aa9977" />
</T.Mesh>

<!-- ==================== TRIM / DETAILS ==================== -->

<!-- Floor trim -->
<T.Mesh position={[HALF_W - 0.02, 0.04, 0]}>
	<T.BoxGeometry args={[0.04, 0.08, L]} />
	<T.MeshLambertMaterial color="#887766" />
</T.Mesh>

<T.Mesh position={[-HALF_W + 0.02, 0.04, 0]}>
	<T.BoxGeometry args={[0.04, 0.08, L]} />
	<T.MeshLambertMaterial color="#887766" />
</T.Mesh>

<!-- Ceiling light fixture -->
<T.Mesh position={[0, H - 0.05, -0.2]}>
	<T.BoxGeometry args={[0.15, 0.03, 0.15]} />
	<T.MeshLambertMaterial color="#ddcc99" emissive="#aa8844" emissiveIntensity={0.8} />
</T.Mesh>

<!-- ==================== CHARACTER PLACEHOLDER ==================== -->

<!-- Head -->
<T.Mesh position={[0, SEAT_H + 0.65, -HALF_L + SEAT_D / 2 + WALL + 0.1]}>
	<T.SphereGeometry args={[0.1, 12, 12]} />
	<T.MeshLambertMaterial color="#ccaa88" />
</T.Mesh>

<!-- Torso -->
<T.Mesh position={[0, SEAT_H + 0.35, -HALF_L + SEAT_D / 2 + WALL + 0.1]}>
	<T.BoxGeometry args={[0.3, 0.4, 0.15]} />
	<T.MeshLambertMaterial color="#bb9977" />
</T.Mesh>

<!-- Shoulders -->
<T.Mesh position={[0, SEAT_H + 0.5, -HALF_L + SEAT_D / 2 + WALL + 0.1]}>
	<T.BoxGeometry args={[0.4, 0.08, 0.12]} />
	<T.MeshLambertMaterial color="#bb9977" />
</T.Mesh>
