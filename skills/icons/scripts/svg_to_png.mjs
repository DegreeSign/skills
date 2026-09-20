#!/usr/bin/env node
// Convert an SVG icon to PNG on any platform (Windows, macOS, Linux).
// Usage: node svg_to_png.mjs input.svg [output.png] [size]
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, renameSync } from 'node:fs';
import path from 'node:path';

const [input, outputArg, sizeArg] = process.argv.slice(2);
if (!input) {
	console.error('usage: node svg_to_png.mjs input.svg [output.png] [size]');
	process.exit(1);
}

const
	output = outputArg || `${input.replace(/\.svg$/i, ``)}.png`,
	size = String(sizeArg || 24),
	dir = path.dirname(output),
	base = path.basename(input).replace(/\.svg$/i, ``),
	isWin = process.platform === `win32`,
	run = (cmd, args, options = {}) => spawnSync(cmd, args, { stdio: `inherit`, ...options }),
	works = (cmd, args, options = {}) => {
		const result = spawnSync(cmd, args, { stdio: `ignore`, ...options });
		return !result.error && result.status === 0;
	};

const done = () => {
	if (existsSync(output)) {
		console.log(`wrote ${output} (${size}px)`);
		process.exit(0);
	}
};

// 1. project-local sharp
const require = createRequire(path.join(process.cwd(), `index.js`));
let sharp;
try {
	sharp = require(`sharp`);
} catch {
	sharp = undefined;
}
if (sharp) {
	await sharp(input).resize(Number(size), Number(size)).png().toFile(output).then(done).catch(() => {});
}

// 2. native rsvg-convert
if (works(`rsvg-convert`, [`--version`])) {
	run(`rsvg-convert`, [`-w`, size, `-h`, size, `-o`, output, input]);
	done();
}

// 3. native inkscape
if (works(`inkscape`, [`--version`])) {
	run(`inkscape`, [input, `--export-type=png`, `--export-filename=${output}`, `--export-width=${size}`]);
	done();
}

// 4. ImageMagick 7 (magick) then ImageMagick 6 (convert, not on Windows)
for (const cmd of isWin ? [`magick`] : [`magick`, `convert`]) {
	if (works(cmd, [`-version`])) {
		run(cmd, [input, `-background`, `none`, `-resize`, `${size}x${size}`, output]);
		done();
	}
}

// 5. sharp-cli through npx (cross-platform, needs Node)
// shell:true lets Windows resolve npx.cmd; safe here as args carry no metacharacters.
const shell = { shell: true };
if (works(`npx`, [`--version`], shell)) {
	run(`npx`, [`--yes`, `sharp-cli`, `-i`, input, `-o`, dir, `-f`, `png`, `resize`, size, size], shell);
	const generated = path.join(dir, `${base}.png`);
	if (generated !== output && existsSync(generated)) renameSync(generated, output);
	done();
}

console.error('no SVG rasterizer found (tried sharp, rsvg-convert, inkscape, ImageMagick, npx sharp-cli)');
process.exit(1);
