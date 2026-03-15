export type AnimationState =
	| 'idle'
	| 'talking'
	| 'reaching'
	| 'reacting'
	| 'transitioning';

export interface AnimationClip {
	id: string;
	state: AnimationState;
	duration: number;
	loop: boolean;
	keyframes: Keyframe[];
}

export interface Keyframe {
	time: number;
	pose: PoseLandmarks;
	face?: FaceLandmarks;
}

export interface PoseLandmarks {
	landmarks: Float32Array;
}

export interface FaceLandmarks {
	landmarks: Float32Array;
	blendshapes?: Record<string, number>;
}
