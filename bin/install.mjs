#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the repo and its payload.
const
	root = resolve(dirname(fileURLToPath(import.meta.url)), `..`),
	skillsDir = join(root, `skills`),
	skillName = `degreesign`,
	payload = [`SKILL.md`, `check.mjs`, `skills`],
	markerName = `.degreesign-skills.json`,
	packageName = JSON.parse(readFileSync(join(root, `package.json`), `utf8`)).name,
	version = readFileSync(join(root, `VERSION`), `utf8`).trim(),
	namePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/,
	argv = process.argv.slice(2),
	flagIndex = (flag) => argv.indexOf(flag);

const options = {
	help: flagIndex(`--help`) !== -1 || flagIndex(`-h`) !== -1,
	list: flagIndex(`--list`) !== -1,
	link: flagIndex(`--link`) !== -1,
	force: flagIndex(`--force`) !== -1,
	dryRun: flagIndex(`--dry-run`) !== -1,
	project: flagIndex(`--project`) !== -1,
	target: flagIndex(`--target`) === -1 ? null : argv[flagIndex(`--target`) + 1],
};

const usage = [
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
].join(`\n`);

const fail = (message) => {
	console.error(`error: ${message}`);
	process.exit(1);
};

const resolveTarget = () => {
	if (options.target) return resolve(options.target);
	if (options.project) return resolve(`.agents`, `skills`);
	return resolve(homedir(), `.agents`, `skills`);
};

const readSkills = () => {
	const
		names = [],
		entries = readdirSync(skillsDir, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const file = join(skillsDir, entry.name, `SKILL.md`);
		if (!namePattern.test(entry.name)) fail(`invalid sub-skill name: ${entry.name}`);
		if (!existsSync(file)) fail(`missing SKILL.md in sub-skill: ${entry.name}`);
		names.push(entry.name);
	}
	return names.sort();
};

const descriptionOf = (file) => {
	const match = readFileSync(file, `utf8`).match(/^---[^]*?\ndescription:\s*(.+)$/m);
	return match ? match[1].trim().replace(/^["']|["']$/g, ``) : ``;
};

const listSkills = () => {
	for (const name of readSkills()) {
		console.log(`${name}\t${descriptionOf(join(skillsDir, name, `SKILL.md`))}`);
	}
};

const readMarker = (target) => {
	try {
		return JSON.parse(readFileSync(join(target, markerName), `utf8`));
	} catch {
		return null;
	}
};

const install = (target) => {
	const
		destination = join(target, skillName),
		owned = Array.isArray(readMarker(target)?.skills);
	if (!destination.startsWith(target + sep)) fail(`destination escapes the target: ${destination}`);
	if (existsSync(destination) && !owned && !options.force) fail(`${destination} already exists and was not installed here; use --force to replace it`);
	if (options.dryRun) {
		console.log(`${options.link ? `link` : `copy`} ${root} to ${destination}`);
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
		for (const item of payload) cpSync(join(root, item), join(tempDir, item), { recursive: true });
		rmSync(destination, { recursive: true, force: true });
		renameSync(tempDir, destination);
	}
	writeFileSync(join(target, markerName), `${JSON.stringify({ version, source: packageName, origin: root, root: skillName, skills: readSkills() }, null, 2)}\n`);
	console.log(`installed ${skillName} ${version} to ${destination}`);
};

if (options.help) {
	console.log(usage);
} else if (options.list) {
	listSkills();
} else {
	install(resolveTarget());
}
