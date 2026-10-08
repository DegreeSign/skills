#!/usr/bin/env node
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	symlinkSync,
	writeFileSync
} from 'node:fs';
import { homedir } from 'node:os';
import {
	dirname,
	join,
	resolve,
	sep
} from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
	Marker,
	Options,
	PackageManifest,
	Report
} from './types.mjs';

// Resolve repo and payload.
const
	root = resolve(dirname(fileURLToPath(import.meta.url)), `..`),
	skillsDir = join(root, `skills`),
	skillName = `degreesign`,
	payload = [`SKILL.md`, `check.mjs`, `skills`],
	markerName = `.degreesign-skills.json`,
	packageName = (JSON.parse(
		readFileSync(join(root, `package.json`), `utf8`)
	) as PackageManifest).name,
	version = readFileSync(join(root, `VERSION`), `utf8`).trim(),
	namePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/,
	argv = process.argv.slice(2),
	flagIndex = (flag: string): number => argv.indexOf(flag),
	options: Options = {
		help: flagIndex(`--help`) !== -1 || flagIndex(`-h`) !== -1,
		list: flagIndex(`--list`) !== -1,
		link: flagIndex(`--link`) !== -1,
		force: flagIndex(`--force`) !== -1,
		dryRun: flagIndex(`--dry-run`) !== -1,
		project: flagIndex(`--project`) !== -1,
		target: flagIndex(`--target`) === -1 ? null
			: argv[flagIndex(`--target`) + 1] ?? null,
	},
	usage = [
		`Usage: degreesign-skills [options]`,
		``,
		`Install the degreesign skill into an agent skills directory.`,
		``,
		`Options:`,
		`  --project         install into ./.agents/skills`,
		`  --target <dir>    install into a custom directory`,
		`  --link            symlink the repo instead of copying`,
		`  --force           replace a foreign degreesign folder`,
		`  --dry-run         print actions without writing`,
		`  --list            list the bundled sub-skills`,
		`  --help            show this help`,
	].join(`\n`),
	fail = (message: string): never => {
		console.error(`${packageName}: ${message}`);
		process.exit(1);
	},
	resolveTarget = (): string => {
		if (options.target) return resolve(options.target);
		if (options.project) return resolve(`.agents`, `skills`);
		return resolve(homedir(), `.agents`, `skills`);
	},
	readSkills = (): string[] => {
		const
			names: string[] = [],
			entries = readdirSync(skillsDir, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			const file = join(skillsDir, entry.name, `SKILL.md`);
			if (!namePattern.test(entry.name)) fail(`invalid sub-skill name: ${entry.name}`);
			if (!existsSync(file)) fail(`missing SKILL.md in sub-skill: ${entry.name}`);
			names.push(entry.name);
		}
		return names.sort();
	},
	descriptionOf = (file: string): string => {
		const match = readFileSync(file, `utf8`).match(/^---[^]*?\ndescription:\s*(.+)$/m);
		return match ? match[1].trim().replace(/^["']|["']$/g, ``) : ``;
	},
	listSkills = (): void => {
		for (const name of readSkills()) {
			console.log(`${name}\t${descriptionOf(join(skillsDir, name, `SKILL.md`))}`);
		}
	},
	readMarker = (target: string): Marker | null => {
		try {
			return JSON.parse(readFileSync(join(target, markerName), `utf8`)) as Marker;
		} catch {
			return null;
		};
	},
	report = ({ title, rows }: Report): void => {
		console.log(title);
		const width = Math.max(...rows.map(([label]) => label.length));
		for (const [label, value] of rows) console.log(`  ${label.padEnd(width)}  ${value}`);
	},
	install = (target: string): void => {
		const
			destination = join(target, skillName),
			owned = Array.isArray(readMarker(target)?.skills);
		if (!destination.startsWith(target + sep))
			fail(`destination escapes the target: ${destination}`);
		if (existsSync(destination) && !owned && !options.force)
			fail(`${destination} already exists and was not installed here; use --force to replace it`);
		const subSkills = readSkills();
		if (options.dryRun) {
			report({
				title: `Dry run: ${packageName} ${version}`,
				rows: [
					[`Action`, options.link ? `link ${root}` : `copy ${root}`],
					[`Location`, destination],
					[`Skills`, subSkills.join(`, `)],
				],
			});
			return;
		}
		mkdirSync(target, { recursive: true });
		if (options.link) {
			rmSync(destination, { recursive: true, force: true });
			symlinkSync(root, destination, `dir`);
		} else {
			const tempDir = join(target, `${skillName}.tmp-${process.pid}`);
			rmSync(tempDir, { recursive: true, force: true });
			mkdirSync(tempDir, { recursive: true });
			for (const item of payload)
				cpSync(
					join(root, item),
					join(tempDir, item),
					{ recursive: true }
				);
			rmSync(destination, { recursive: true, force: true });
			renameSync(tempDir, destination);
		}
		const marker: Marker = {
			version,
			source: packageName,
			origin: root,
			root: skillName,
			skills: subSkills
		};
		writeFileSync(
			join(target, markerName),
			`${JSON.stringify(marker, null, 2)}\n`
		);
		report({
			title: `Installed ${packageName} ${version}`,
			rows: [
				[`Method`, options.link ? `symlink` : `copy`],
				[`Location`, destination],
				[`Skills`, subSkills.join(`, `)],
			],
		});
		console.log(`Start a new agent session to load the skill.`);
	};

if (options.help) {
	console.log(usage);
} else if (options.list) {
	listSkills();
} else {
	install(resolveTarget());
};