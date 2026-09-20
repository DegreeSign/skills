#!/usr/bin/env node
// Generate the published well-known skills copy from this repo.
// Usage: node scripts/sync.mjs <target-dir>
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), `..`);
const target = process.argv[2];

if (!target) {
	console.error('usage: node scripts/sync.mjs <target-dir>');
	process.exit(1);
}

const
	skillsDir = join(root, `skills`),
	outDir = resolve(target),
	version = readFileSync(join(root, `VERSION`), `utf8`).trim(),
	listFiles = (dir, base = dir) => {
		const files = [];
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, entry.name);
			if (entry.isDirectory()) files.push(...listFiles(full, base));
			else files.push(relative(base, full).split(sep).join(`/`));
		}
		return files;
	},
	descriptionOf = (file) => {
		const match = readFileSync(file, `utf8`).match(/^---[^]*?\ndescription:\s*(.+)$/m);
		return match ? match[1].trim().replace(/^["']|["']$/g, ``) : ``;
	};

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const entries = [];
for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;
	const
		name = entry.name,
		source = join(skillsDir, name);
	cpSync(source, join(outDir, name), { recursive: true });
	entries.push({
		name,
		description: descriptionOf(join(source, `SKILL.md`)),
		files: listFiles(source),
		version,
	});
}

writeFileSync(join(outDir, `index.json`), `${JSON.stringify({ skills: entries }, null, 2)}\n`);
console.log(`synced ${entries.length} skill(s) to ${outDir}`);
