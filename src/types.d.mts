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
}

export interface PackageManifest {
	name: string;
}

export type ReportRow = [string, string];

export interface Report {
	title: string;
	rows: ReportRow[];
}
