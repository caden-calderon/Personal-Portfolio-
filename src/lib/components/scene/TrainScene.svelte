<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { PerspectiveCamera, type Object3D } from 'three';

	const { invalidate } = useThrelte();

	let rotationY = $state(0);
	let rotationX = $state(0);

	useTask((delta) => {
		rotationY += delta * 0.5;
		rotationX += delta * 0.2;
		invalidate();
	});

	function lookAtOrigin(ref: Object3D) {
		if (ref instanceof PerspectiveCamera) {
			ref.lookAt(0, 0, 0);
		}
	}
</script>

<!-- Camera — 3/4 view -->
<T.PerspectiveCamera
	makeDefault
	position={[3, 2.5, 4]}
	fov={50}
	oncreate={(ref) => lookAtOrigin(ref)}
/>

<!-- Lighting — bright enough for ASCII readability -->
<T.AmbientLight intensity={1.0} />
<T.DirectionalLight position={[4, 6, 3]} intensity={2.0} />
<T.DirectionalLight position={[-3, 4, -2]} intensity={0.8} />
<T.PointLight position={[-2, 3, 2]} intensity={1.2} color="#ffcc88" />
<T.PointLight position={[3, 1, -1]} intensity={0.6} color="#88ccff" />

<!-- Rotating box -->
<T.Mesh rotation.y={rotationY} rotation.x={rotationX} position={[0, 0.8, 0]}>
	<T.BoxGeometry args={[1.5, 1.5, 1.5]} />
	<T.MeshStandardMaterial color="#88bbee" roughness={0.3} metalness={0.1} />
</T.Mesh>

<!-- Floor plane -->
<T.Mesh rotation.x={-Math.PI / 2} position={[0, -0.3, 0]}>
	<T.PlaneGeometry args={[10, 10]} />
	<T.MeshStandardMaterial color="#555555" roughness={0.8} />
</T.Mesh>

<!-- Smaller box -->
<T.Mesh position={[-1.8, 0.2, -1]} rotation.y={rotationY * 0.7}>
	<T.BoxGeometry args={[0.7, 0.7, 0.7]} />
	<T.MeshStandardMaterial color="#ee7777" roughness={0.3} metalness={0.3} />
</T.Mesh>

<!-- Sphere -->
<T.Mesh position={[2, 0.1, -0.5]}>
	<T.SphereGeometry args={[0.5, 24, 24]} />
	<T.MeshStandardMaterial color="#77ee99" roughness={0.3} metalness={0.2} />
</T.Mesh>

<!-- Cylinder -->
<T.Mesh position={[-0.5, 0.5, -2]}>
	<T.CylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
	<T.MeshStandardMaterial color="#eeee77" roughness={0.3} metalness={0.2} />
</T.Mesh>
