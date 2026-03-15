<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';

	const { invalidate } = useThrelte();

	let rotationY = $state(0);
	let rotationX = $state(0);

	useTask((delta) => {
		rotationY += delta * 0.5;
		rotationX += delta * 0.3;
		invalidate();
	});
</script>

<!-- Camera -->
<T.PerspectiveCamera makeDefault position={[0, 2, 5]} fov={60} rotation.x={-0.3} />

<!-- Lighting -->
<T.AmbientLight intensity={0.3} />
<T.DirectionalLight position={[3, 5, 2]} intensity={0.8} />
<T.PointLight position={[-2, 3, -1]} intensity={0.4} color="#ff9944" />

<!-- Rotating box (train compartment placeholder) -->
<T.Mesh rotation.y={rotationY} rotation.x={rotationX} position={[0, 0.5, 0]}>
	<T.BoxGeometry args={[1.5, 1.5, 1.5]} />
	<T.MeshStandardMaterial color="#4488cc" roughness={0.4} metalness={0.2} />
</T.Mesh>

<!-- Floor plane for depth -->
<T.Mesh rotation.x={-Math.PI / 2} position={[0, -0.5, 0]}>
	<T.PlaneGeometry args={[8, 8]} />
	<T.MeshStandardMaterial color="#222222" roughness={0.8} />
</T.Mesh>

<!-- Second smaller box for depth/variety -->
<T.Mesh position={[-1.5, 0, -1]} rotation.y={rotationY * 0.7}>
	<T.BoxGeometry args={[0.6, 0.6, 0.6]} />
	<T.MeshStandardMaterial color="#cc4444" roughness={0.3} metalness={0.5} />
</T.Mesh>

<!-- Sphere -->
<T.Mesh position={[1.8, 0.2, -0.5]}>
	<T.SphereGeometry args={[0.4, 16, 16]} />
	<T.MeshStandardMaterial color="#44cc88" roughness={0.5} metalness={0.3} />
</T.Mesh>
