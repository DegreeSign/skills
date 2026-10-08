export interface Marker {
	version: string;
	source: string;
	origin: string;
	root: string;
	skills: string[];
}

export interface Options {
	help: boolean;
	list: boolean;
	link: boolean;
	force: boolean;
	dryRun: boolean;
	project: boolean;
	target: string | null;
	agents: boolean;
	skip: string[];
}

export interface AgentContext {
	target: string;
	dryRun: boolean;
}

export interface Agent {
	name: string;
	label: string;
	detect: () => boolean;
	apply: (context: AgentContext) => string;
	noop?: boolean;
}

export interface PackageManifest {
	name: string;
}

export type ReportRow = [string, string];

export interface Report {
	title: string;
	rows: ReportRow[];
}
