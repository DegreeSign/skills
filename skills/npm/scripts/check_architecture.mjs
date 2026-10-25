#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';

// Check one architecture map against the package it documents.
// Usage: node check_architecture.mjs [package-root-or-html] [--allow-empty]

const
    allowedKinds = [`build`, `call`, `event`, `store`, `type`, `inner`],
    sourceExtensions = [`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css`],
    args = process.argv.slice(2),
    allowEmpty = args.includes(`--allow-empty`),
    target = args.find(arg => !arg.startsWith(`-`)) || process.cwd(),
    docPath = resolve(target),
    docFile = existsSync(docPath) && statSync(docPath).isDirectory()
        ? join(docPath, `docs`, `architecture.html`)
        : docPath,
    packageRoot = findPackageRoot(dirname(docFile)),
    problems = [],
    warnings = [];

const fail = message => problems.push(message);
const warn = message => warnings.push(message);
const rel = path => relative(packageRoot, path).split(sep).join(`/`);
const text = value => `${value ?? ``}`.trim();

function findPackageRoot(start) {
    const origin = resolve(start);
    let dir = origin;
    while (true) {
        if (existsSync(join(dir, `package.json`))) return dir;
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return dirname(origin) || origin;
}

function lineCount(file) {
    const content = readFileSync(file, `utf8`);
    if (!content) return 0;
    return content.endsWith(`\n`)
        ? content.split(`\n`).length - 1
        : content.split(`\n`).length;
}

function extractData(html) {
    const begin = html.indexOf(`// DATA BEGIN`);
    const end = html.indexOf(`// DATA END`, begin);
    if (begin === -1 || end === -1) {
        fail(`missing the "// DATA BEGIN" and "// DATA END" markers`);
        return null;
    }
    const block = html.slice(begin + `// DATA BEGIN`.length, end);
    try {
        return new Function(
            `${block}
            return { MAP, BANDS, FILES, NODES, EDGES, STATES, FLOWS };`
        )();
    } catch (error) {
        fail(`the data block does not run: ${error.message}`);
        return null;
    }
}

function checkUnique(list, name) {
    const seen = new Set();
    for (const item of list) {
        const id = text(item?.id);
        if (!id) {
            fail(`${name} entry without an id`);
            continue;
        }
        if (seen.has(id)) fail(`duplicate ${name} id "${id}"`);
        seen.add(id);
    }
}

function checkSelfContained(html) {
    if (/<script\b[^>]*\bsrc\s*=/i.test(html)) fail(`loads an external script`);
    if (/<link\b[^>]*\brel\s*=\s*["']?stylesheet/i.test(html)) {
        fail(`loads an external stylesheet`);
    }
    if (/@import\b/i.test(html)) fail(`uses @import`);
    if (/url\(\s*["']?https?:/i.test(html)) fail(`loads a remote url()`);
}

function walkSources(dir, base, ignore, out) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(`.`) || entry.name === `node_modules`) continue;
        const file = join(dir, entry.name);
        const path = relative(base, file).split(sep).join(`/`);
        if (ignore.some(item => path.includes(item))) continue;
        if (entry.isDirectory()) {
            walkSources(file, base, ignore, out);
            continue;
        }
        if (!sourceExtensions.includes(extname(entry.name))) continue;
        if (entry.name.endsWith(`.d.ts`)) continue;
        out.push(path);
    }
    return out;
}

function main() {
    if (!existsSync(docFile)) {
        console.error(`architecture: missing ${docFile}`);
        process.exit(1);
    }
    const html = readFileSync(docFile, `utf8`);
    checkSelfContained(html);
    const data = extractData(html);
    if (!data) return report();

    const { MAP, BANDS, FILES, NODES, EDGES, STATES, FLOWS } = data;
    const lists = { BANDS, FILES, NODES, EDGES, STATES, FLOWS };
    for (const [name, value] of Object.entries(lists)) {
        const isArray = Array.isArray(value);
        const valid = name === `FLOWS`
            ? !isArray && typeof value === `object` && value !== null
            : isArray;
        if (!valid) fail(`${name} must be an array`);
    }
    if (MAP === null || typeof MAP !== `object` || Array.isArray(MAP)) {
        fail(`MAP must be an object`);
    }
    if (problems.length) return report();

    checkUnique(BANDS, `band`);
    checkUnique(FILES, `file`);
    checkUnique(NODES, `node`);

    const bandIds = new Set(BANDS.map(band => text(band.id)));
    const fileById = new Map(FILES.map(file => [text(file.id), file]));
    const nodeById = new Map(NODES.map(node => [text(node.id), node]));
    const short = new Map();
    for (const node of NODES) {
        const key = text(node.id).split(`.`).pop();
        if (!key) continue;
        short.set(key, short.has(key) ? null : node);
    }
    const find = key => nodeById.get(text(key)) || short.get(text(key)) || null;

    if (!allowEmpty) {
        for (const key of [`name`, `root`, `flow`]) {
            if (!text(MAP[key])) fail(`MAP.${key} is required`);
        }
        if (!text(MAP.intro)) warn(`MAP.intro is empty`);
        if (MAP.ignore !== undefined && !Array.isArray(MAP.ignore)) {
            fail(`MAP.ignore must be an array`);
        }
        if (!BANDS.length) fail(`no bands`);
        if (!FILES.length) fail(`no files`);
        if (!NODES.length) fail(`no nodes`);
    }

    for (const band of BANDS) {
        if (!text(band.title)) fail(`band "${band.id}" has no title`);
        if (!text(band.hint)) warn(`band "${band.id}" has no hint`);
        if (!text(band.color)) warn(`band "${band.id}" has no color`);
    }

    for (const file of FILES) {
        if (!bandIds.has(text(file.band))) {
            fail(`file "${file.id}" uses unknown band "${file.band}"`);
        }
        if (!text(file.label)) fail(`file "${file.id}" has no label`);
        if (!text(file.path)) fail(`file "${file.id}" has no path`);
        if (file.external) continue;
        const path = resolve(packageRoot, text(file.path));
        if (!existsSync(path) || !statSync(path).isFile()) {
            fail(`file "${file.id}" path does not exist: ${file.path}`);
            continue;
        }
        const actual = lineCount(path);
        if (Number(file.loc) !== actual) {
            fail(`file "${file.id}": loc ${file.loc}, actual ${actual}`);
        }
    }

    for (const node of NODES) {
        const file = fileById.get(text(node.file));
        if (!file) {
            fail(`node "${node.id}" references unknown file "${node.file}"`);
            continue;
        }
        const line = Number(node.line);
        if (!Number.isInteger(line) || line < 0) {
            fail(`node "${node.id}" has an invalid line`);
        } else if (!file.external && (line < 1 || line > Number(file.loc))) {
            fail(`node "${node.id}": line ${line} is outside ${file.path}`);
        } else if (file.external && line !== 0) {
            warn(`external node "${node.id}" should use line 0`);
        }
        if (!text(node.label)) fail(`node "${node.id}" has no label`);
        if (!text(node.sig)) fail(`node "${node.id}" has no signature`);
    }

    for (const edge of EDGES) {
        if (!allowedKinds.includes(text(edge.kind))) {
            fail(`edge "${edge.from} -> ${edge.to}" has unknown kind "${edge.kind}"`);
        }
        if (!find(edge.from)) fail(`edge starts at unknown node "${edge.from}"`);
        if (!find(edge.to)) fail(`edge ends at unknown node "${edge.to}"`);
        if (text(edge.from) === text(edge.to)) warn(`edge "${edge.from}" points at itself`);
    }

    for (const machine of STATES) {
        if (!text(machine.title)) fail(`state machine without a title`);
        if (!text(machine.viewBox)) fail(`state machine "${machine.title}" has no viewBox`);
        if (!Array.isArray(machine.boxes) || !machine.boxes.length) {
            fail(`state machine "${machine.title}" has no boxes`);
        } else {
            for (const box of machine.boxes) {
                if (!text(box.label)) fail(`state machine "${machine.title}" has an empty box`);
                if (![box.x, box.y, box.w].every(value => Number.isFinite(Number(value)))) {
                    fail(`state machine "${machine.title}" box "${box.label}" needs x, y and w`);
                }
            }
        }
        if (machine.arrows && !Array.isArray(machine.arrows)) {
            fail(`state machine "${machine.title}" arrows must be an array`);
        } else {
            for (const arrow of machine.arrows || []) {
                if (!text(arrow.d)) fail(`state machine "${machine.title}" has an arrow without d`);
            }
        }
    }

    if (!allowEmpty) {
        const root = find(MAP.root);
        if (!root) fail(`MAP.root "${MAP.root}" does not resolve to a node`);
        if (!FLOWS[text(MAP.flow)]) {
            fail(`MAP.flow "${MAP.flow}" does not exist in FLOWS`);
        }
        for (const [name, flow] of Object.entries(FLOWS)) {
            if (!text(flow.title)) fail(`flow "${name}" has no title`);
            if (!Array.isArray(flow.steps) || !flow.steps.length) {
                fail(`flow "${name}" has no steps`);
                continue;
            }
            for (const step of flow.steps) {
                if (!Array.isArray(step.ids) || !step.ids.length) {
                    fail(`flow "${name}" has a step without node ids`);
                    continue;
                }
                for (const id of step.ids) {
                    if (!find(id)) fail(`flow "${name}" references unknown node "${id}"`);
                }
                if (!text(step.text)) warn(`flow "${name}" has a step without text`);
            }
        }
        const ignore = Array.isArray(MAP.ignore)
            ? MAP.ignore.map(text).filter(Boolean)
            : [];
        const sourceDir = join(packageRoot, `src`);
        if (existsSync(sourceDir) && statSync(sourceDir).isDirectory()) {
            const covered = new Set(FILES.filter(file => !file.external).map(file => text(file.path)));
            const missing = walkSources(sourceDir, packageRoot, ignore, [])
                .filter(path => !covered.has(path));
            for (const path of missing) fail(`source file is not in the map: ${path}`);
        }
    }

    report();
}

function report() {
    for (const message of warnings) console.error(`architecture: warning: ${message}`);
    for (const message of problems) console.error(`architecture: ${message}`);
    if (problems.length) {
        console.error(`architecture: ${problems.length} problem(s)`);
        process.exit(1);
    }
    console.log(`architecture: ok`);
}

main();
