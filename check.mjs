#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Locate the install, marker and cache.
const
	hereDir = dirname(fileURLToPath(import.meta.url)),
	targetArgIndex = process.argv.indexOf(`--target`),
	target = targetArgIndex === -1 ? dirname(hereDir) : process.argv[targetArgIndex + 1],
	markerFile = join(target, `.degreesign-skills.json`),
	cacheDir = join(process.env.XDG_CACHE_HOME || join(homedir(), `.cache`), `degreesign-skills`),
	cacheFile = join(cacheDir, `check.json`),
	checkInterval = 24 * 60 * 60 * 1000;

const readJson = (file) => {
	try {
		return JSON.parse(readFileSync(file, `utf8`));
	} catch {
		return null;
	}
};

const main = async () => {
	const
		marker = readJson(markerFile),
		cache = readJson(cacheFile),
		cacheFresh = Boolean(cache?.checkedAt) && Date.now() - Date.parse(cache.checkedAt) < checkInterval;
	if (!marker?.source || !marker?.version) return;
	let latest = cacheFresh ? cache?.latestVersion : null;
	if (!latest) {
		const response = await fetch(`https://registry.npmjs.org/${marker.source.replace(/\//g, `%2f`)}/latest`, { signal: AbortSignal.timeout(5000) }).catch(() => null);
		const data = response?.ok ? await response.json().catch(() => null) : null;
		latest = data?.version || null;
		if (!latest) return;
		mkdirSync(cacheDir, { recursive: true });
		writeFileSync(cacheFile, `${JSON.stringify({ checkedAt: new Date().toISOString(), latestVersion: latest }, null, 2)}\n`);
	}
	const
		installed = `${marker.version}`.split(`.`).map(Number),
		published = `${latest}`.split(`.`).map(Number);
	for (let index = 0; index < 3; index++) {
		if ((published[index] || 0) > (installed[index] || 0)) {
			console.log(`A newer version is available: ${marker.version} to ${latest}`);
			console.log(`Update with: npx ${marker.source} --target ${target}`);
			return;
		}
		if ((published[index] || 0) < (installed[index] || 0)) return;
	}
};

main();
