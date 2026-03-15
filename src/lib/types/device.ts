export interface DeviceContext {
	isMobile: boolean;
	orientation: 'landscape' | 'portrait';
	inputMethod: 'mouse' | 'touch' | 'gyro';
	gridCols: number;
	gridRows: number;
	cellSize: number;
	pixelRatio: number;
	hasGyroscope: boolean;
	pointerType: 'fine' | 'coarse';
	viewportWidth: number;
	viewportHeight: number;
}
