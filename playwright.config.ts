import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
	testDir: './tests',
	timeout: 30_000,
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.02
		}
	},
	use: {
		baseURL,
		trace: 'retain-on-failure'
	},
	...(useExternalServer
		? {}
		: {
				webServer: {
					command: 'pnpm run preview --host 127.0.0.1 --port 4173',
					port: 4173,
					reuseExistingServer: true
				}
			}),
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1440, height: 960 }
			}
		}
	]
});
