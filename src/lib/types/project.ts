export type ProjectType = 'interactive' | 'walkthrough' | 'terminal';
export type ProjectRuntime = 'threejs' | 'svelte' | 'slides' | 'sandbox';

export interface ProjectManifestEntry {
	id: string;
	title: string;
	description: string;
	type: ProjectType;
	runtime: ProjectRuntime;
	entry: string;
	trainObject: string;
	thumbnail: string;
	demoAvailable: boolean;
	tags: string[];
}
