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
import {
	createInterface,
	emitKeypressEvents
} from 'node:readline';
import { fileURLToPath } from 'node:url';
import type {
	Agent,
	AgentContext,
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
	home = homedir(),
	agentsRoot = join(home, `.agents`),
	skipAgents = [`opencode`, `claude`, `codex`, `cursor`, `copilot`, `gemini`],
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
		agents: flagIndex(`--no-agents`) === -1,
		skip: skipAgents.filter((name) => flagIndex(`--no-${name}`) !== -1),
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
		`  --no-agents       skip configuring detected agents`,
		`  --no-opencode     skip OpenCode`,
		`  --no-claude       skip Claude Code`,
		`  --no-codex        skip Codex`,
		`  --no-cursor       skip Cursor`,
		`  --no-copilot      skip GitHub Copilot`,
		`  --no-gemini       skip Gemini CLI`,
		`  --help            show this help`,
	].join(`\n`),
	fail = (message: string): never => {
		console.error(`${packageName}: ${message}`);
		process.exit(1);
	},
	resolveTarget = (): string => {
		if (options.target) return resolve(options.target);
		if (options.project) return resolve(`.agents`, `skills`);
		return resolve(home, `.agents`, `skills`);
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
	isUnderAgents = (target: string): boolean => {
		const resolved = resolve(target);
		return resolved === agentsRoot || resolved.startsWith(agentsRoot + sep);
	},
	permissionPattern = (target: string): string => isUnderAgents(target)
		? `~/.agents/**`
		: `${resolve(target).split(sep).join(`/`)}/**`,
	noopAgent = (): string => `reads ~/.agents/skills natively, no change needed`,
	configureOpenCode = ({ target, dryRun }: AgentContext): string => {
		const
			dir = join(home, `.config`, `opencode`),
			json = join(dir, `opencode.json`),
			jsonc = join(dir, `opencode.jsonc`),
			file = existsSync(json) ? json : existsSync(jsonc) ? jsonc : json,
			pattern = permissionPattern(target),
			manual = (reason: string): string =>
				`${reason} in ${file}; add "${pattern}": "allow" under permission.external_directory by hand`;
		let config: Record<string, unknown> = {};
		if (existsSync(file)) {
			try {
				config = JSON.parse(readFileSync(file, `utf8`));
			} catch {
				return manual(`could not parse`);
			}
		}
		const permission = config.permission;
		if (permission === `allow`) return `permission already allows all in ${file}`;
		if (
			permission !== undefined &&
			(typeof permission !== `object` || permission === null || Array.isArray(permission))
		) return manual(`permission is not an object`);
		const next = { ...(permission as Record<string, unknown>) };
		let rule = next.external_directory;
		if (rule === `allow`) return `external_directory already allows all in ${file}`;
		if (rule === undefined) rule = {};
		else if (typeof rule === `string`) rule = { '*': rule };
		else if (typeof rule !== `object` || rule === null || Array.isArray(rule))
			return manual(`external_directory is not an object`);
		else rule = { ...(rule as Record<string, unknown>) };
		const rules = rule as Record<string, unknown>;
		if (rules[pattern] === `allow`) return `already allows ${pattern} in ${file}`;
		delete rules[pattern];
		rules[pattern] = `allow`;
		next.external_directory = rules;
		config.permission = next;
		if (dryRun) return `would allow ${pattern} in ${file}`;
		mkdirSync(dir, { recursive: true });
		writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
		return `allowed ${pattern} in ${file}`;
	},
	configureClaude = ({ target, dryRun }: AgentContext): string => {
		const
			dir = process.env.CLAUDE_CONFIG_DIR || join(home, `.claude`),
			file = join(dir, `settings.json`),
			skills = resolve(target),
			manual = (reason: string): string =>
				`${reason} in ${file}; add ${skills} to permissions.additionalDirectories by hand`;
		let config: Record<string, unknown> = {};
		if (existsSync(file)) {
			try {
				config = JSON.parse(readFileSync(file, `utf8`));
			} catch {
				return manual(`could not parse`);
			}
		}
		const permissions = config.permissions;
		if (
			permissions !== undefined &&
			(typeof permissions !== `object` || permissions === null || Array.isArray(permissions))
		) return manual(`permissions is not an object`);
		const next = { ...(permissions as Record<string, unknown>) };
		const dirs = Array.isArray(next.additionalDirectories)
			? [...next.additionalDirectories] : [];
		if (dirs.indexOf(skills) !== -1) return `already lists ${skills} in ${file}`;
		dirs.push(skills);
		next.additionalDirectories = dirs;
		config.permissions = next;
		if (dryRun) return `would add ${skills} to ${file}`;
		mkdirSync(dir, { recursive: true });
		writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
		return `added ${skills} to ${file}`;
	},
	selectAgents = (agents: Agent[]): Promise<string[]> =>
		new Promise((resolveSelection) => {
			const
				out = process.stdout,
				input = process.stdin,
				selected = agents.map(() => true),
				header = `Select agents to configure (space toggles, enter confirms):`,
				lines = agents.length + 1;
			let
				index = 0,
				rendered = false;
			const
				row = (agent: Agent, i: number): string => {
					const cursor = i === index ? `\x1b[36m>\x1b[0m` : ` `;
					const box = selected[i] ? `\x1b[32m■\x1b[0m` : `\x1b[2m□\x1b[0m`;
					const suffix = agent.noop ? `\x1b[2m (no change needed)\x1b[0m` : ``;
					return `${cursor} ${box} ${agent.label}${suffix}`;
				},
				draw = (): void => {
					if (rendered) out.write(`\x1b[${lines}A`);
					for (const line of [header, ...agents.map(row)]) out.write(`\x1b[2K${line}\n`);
					rendered = true;
				},
				cleanup = (): void => {
					out.write(`\x1b[?25h`);
					input.setRawMode(false);
					input.removeListener(`keypress`, onKey);
					input.pause();
				},
				finish = (): void => {
					cleanup();
					resolveSelection(agents.filter((_, i) => selected[i]).map((agent) => agent.name));
				},
				onKey = (str: string, key: { name?: string; ctrl?: boolean }): void => {
					if (key.ctrl && key.name === `c`) {
						cleanup();
						process.exit(130);
					}
					if (key.name === `up` || str === `k`) index = (index + agents.length - 1) % agents.length;
					else if (key.name === `down` || str === `j`) index = (index + 1) % agents.length;
					else if (key.name === `space`) selected[index] = !selected[index];
					else if (str === `a`) {
						const value = !selected.every(Boolean);
						selected.fill(value);
					} else if (key.name === `return` || key.name === `enter`) return finish();
					else return;
					draw();
				};
			out.write(`\x1b[?25l`);
			emitKeypressEvents(input as unknown as NodeJS.ReadableStream);
			input.setRawMode(true);
			input.resume();
			input.on(`keypress`, onKey);
			draw();
		}),
	askAgents = (): Promise<boolean> =>
		new Promise((resolveAnswer) => {
			const
				rl = createInterface({
					input: process.stdin as unknown as NodeJS.ReadableStream,
					output: process.stdout
				}),
				finish = (() => {
					let done = false;
					return (value: boolean): void => {
						if (done) return;
						done = true;
						resolveAnswer(value);
					};
				})();
			rl.question(`Update agent configs? [y/n] `, (answer) => {
				const value = answer.trim().toLowerCase();
				finish(value === `` || value === `y` || value === `yes`);
				rl.close();
			});
			rl.on(`close`, () => finish(true));
		}),
	configureAgents = async (target: string): Promise<void> => {
		if (!options.agents) return;
		const detected = agentRegistry.filter(
			(agent) => options.skip.indexOf(agent.name) === -1 && agent.detect()
		);
		if (!detected.length) return;
		if (options.dryRun) {
			for (const agent of detected)
				console.log(`${agent.label}: ${agent.apply({ target, dryRun: true })}`);
			return;
		}
		let chosen: Agent[] = [];
		if (process.stdin.isTTY && process.stdout.isTTY) {
			const names = await selectAgents(detected);
			chosen = detected.filter((agent) => names.indexOf(agent.name) !== -1);
		} else if (await askAgents()) {
			chosen = detected;
		}
		for (const agent of chosen)
			console.log(`${agent.label}: ${agent.apply({ target, dryRun: false })}`);
	},
	install = async (target: string): Promise<void> => {
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
			await configureAgents(target);
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
		await configureAgents(target);
	},

	// Agent registry.
	agentRegistry: Agent[] = [{
		name: `opencode`,
		label: `OpenCode`,
		detect: (): boolean => existsSync(join(home, `.config`, `opencode`)),
		apply: (context: AgentContext): string => configureOpenCode(context)
	}, {
		name: `claude`,
		label: `Claude Code`,
		detect: (): boolean =>
			existsSync(process.env.CLAUDE_CONFIG_DIR || join(home, `.claude`)),
		apply: (context: AgentContext): string => configureClaude(context)
	}, {
		name: `codex`,
		label: `Codex`,
		detect: (): boolean =>
			existsSync(process.env.CODEX_HOME || join(home, `.codex`)),
		apply: noopAgent,
		noop: true
	}, {
		name: `cursor`,
		label: `Cursor`,
		detect: (): boolean => existsSync(join(home, `.cursor`)),
		apply: noopAgent,
		noop: true
	}, {
		name: `copilot`,
		label: `GitHub Copilot`,
		detect: (): boolean => existsSync(join(home, `.copilot`)),
		apply: noopAgent,
		noop: true
	}, {
		name: `gemini`,
		label: `Gemini CLI`,
		detect: (): boolean => existsSync(join(home, `.gemini`)),
		apply: noopAgent,
		noop: true
	}];

if (options.help) {
	console.log(usage);
} else if (options.list) {
	listSkills();
} else {
	await install(resolveTarget());
};
