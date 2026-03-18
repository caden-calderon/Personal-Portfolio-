import { expect, test } from '@playwright/test';

const CAPTURE_CASES = [
	{
		name: 'amber-bayer stays visually stable',
		query: '?capture=1&preset=amber-bayer',
		snapshot: 'amber-bayer-lab-viewport.png'
	},
	{
		name: 'oxide-screen stays visually stable',
		query: '?capture=1&preset=oxide-screen',
		snapshot: 'oxide-screen-lab-viewport.png'
	},
	{
		name: 'night-signal noise stays visually stable',
		query: '?capture=1&preset=night-signal',
		snapshot: 'night-signal-lab-viewport.png'
	},
	{
		name: 'newsprint bayer8 stays visually stable',
		query: '?capture=1&preset=newsprint-draft',
		snapshot: 'newsprint-bayer8-lab-viewport.png'
	}
] as const;

for (const captureCase of CAPTURE_CASES) {
	test(captureCase.name, async ({ page }) => {
		await page.goto(`/${captureCase.query}`);
		await expect(page.getByTestId('engine-status')).toHaveText('live');
		await expect(page.getByTestId('lab-viewport')).toHaveScreenshot(captureCase.snapshot, {
			animations: 'disabled'
		});
	});
}
