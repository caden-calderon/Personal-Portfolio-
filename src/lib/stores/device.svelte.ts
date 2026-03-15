import type { DeviceContext } from '$lib/types/device';

const MOBILE_BREAKPOINT = 768;
const CELL_SIZE_MOBILE = 8;
const CELL_SIZE_DESKTOP = 6;
const MAX_PIXEL_RATIO = 2;

function detectPointerType(): 'fine' | 'coarse' {
	if (typeof window === 'undefined') return 'fine';
	return window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
}

function detectGyroscope(): boolean {
	if (typeof window === 'undefined') return false;
	return 'DeviceOrientationEvent' in window;
}

function createDeviceContext(): DeviceContext {
	if (typeof window === 'undefined') {
		return {
			isMobile: false,
			orientation: 'landscape',
			inputMethod: 'mouse',
			gridCols: 160,
			gridRows: 90,
			cellSize: CELL_SIZE_DESKTOP,
			pixelRatio: 1,
			hasGyroscope: false,
			pointerType: 'fine',
			viewportWidth: 1920,
			viewportHeight: 1080
		};
	}

	const w = window.innerWidth;
	const h = window.innerHeight;
	const pointerType = detectPointerType();
	const isMobile = w < MOBILE_BREAKPOINT || pointerType === 'coarse';
	const cellSize = isMobile ? CELL_SIZE_MOBILE : CELL_SIZE_DESKTOP;

	return {
		isMobile,
		orientation: w >= h ? 'landscape' : 'portrait',
		inputMethod: isMobile ? 'touch' : 'mouse',
		gridCols: Math.floor(w / cellSize),
		gridRows: Math.floor(h / cellSize),
		cellSize,
		pixelRatio: Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO),
		hasGyroscope: detectGyroscope(),
		pointerType,
		viewportWidth: w,
		viewportHeight: h
	};
}

let deviceContext = $state<DeviceContext>(createDeviceContext());

export function getDeviceContext(): DeviceContext {
	return deviceContext;
}

export function initDeviceContext(): () => void {
	const update = () => {
		deviceContext = createDeviceContext();
	};

	window.addEventListener('resize', update);
	window.addEventListener('orientationchange', update);

	const pointerQuery = window.matchMedia('(pointer: coarse)');
	pointerQuery.addEventListener('change', update);

	update();

	return () => {
		window.removeEventListener('resize', update);
		window.removeEventListener('orientationchange', update);
		pointerQuery.removeEventListener('change', update);
	};
}
