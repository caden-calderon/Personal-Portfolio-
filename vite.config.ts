import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('/node_modules/three/')) {
						return 'vendor-three';
					}

					if (id.includes('/node_modules/postprocessing/')) {
						return 'vendor-postprocessing';
					}
				}
			}
		}
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
