#!/usr/bin/env node
/**
 * Check an llms.txt file against the v2 proposal.
 *
 * Usage:
 *   node check_llms.mjs <path-or-url> [options]
 *
 * Options:
 *   --check-links      Request every absolute http(s) link
 *   --strict           Exit non-zero on warnings too
 *   --max-bytes=<n>    Size warning threshold (default 102400)
 *   --timeout=<ms>     Per-link timeout in milliseconds (default 10000)
 *   -h, --help         Show this help
 *
 * Exit codes: 0 clean, 1 findings, 2 usage or read failure.
 */

import { readFile } from 'node:fs/promises';

const USER_AGENT = 'llms-txt-check/1.0 (+https://llmstxt.org/)';
const DEFAULT_MAX_BYTES = 102400;
const DEFAULT_TIMEOUT = 10000;
const CONCURRENCY = 8;

const HELP = `Check an llms.txt file against the v2 proposal.

Usage: node check_llms.mjs <path-or-url> [options]

Options:
  --check-links      Request every absolute http(s) link
  --strict           Exit non-zero on warnings too
  --max-bytes=<n>    Size warning threshold (default ${DEFAULT_MAX_BYTES})
  --timeout=<ms>     Per-link timeout in milliseconds (default ${DEFAULT_TIMEOUT})
  -h, --help         Show this help`;

function parseArgs(argv) {
	const options = {
		checkLinks: false,
		strict: false,
		maxBytes: DEFAULT_MAX_BYTES,
		timeout: DEFAULT_TIMEOUT,
		source: null,
	};

	for (const arg of argv) {
		if (arg === '-h' || arg === '--help') {
			console.log(HELP);
			process.exit(0);
		} else if (arg === '--check-links') {
			options.checkLinks = true;
		} else if (arg === '--strict') {
			options.strict = true;
		} else if (arg.startsWith('--max-bytes=')) {
			options.maxBytes = Number(arg.slice('--max-bytes='.length));
		} else if (arg.startsWith('--timeout=')) {
			options.timeout = Number(arg.slice('--timeout='.length));
		} else if (arg.startsWith('-')) {
			fail(`Unknown option: ${arg}`);
		} else if (options.source) {
			fail('Pass exactly one file or URL.');
		} else {
			options.source = arg;
		}
	}

	if (!options.source) fail('Pass a file or URL.');
	if (!Number.isFinite(options.maxBytes) || options.maxBytes <= 0) {
		fail('--max-bytes must be a positive number.');
	}
	if (!Number.isFinite(options.timeout) || options.timeout <= 0) {
		fail('--timeout must be a positive number.');
	}
	return options;
}

function fail(message) {
	console.error(`${message}\n\n${HELP}`);
	process.exit(2);
}

function isUrl(source) {
	return /^https?:\/\//i.test(source);
}

async function load(source) {
	if (!isUrl(source)) {
		return { text: await readFile(source, 'utf8') };
	}

	const response = await fetch(source, {
		redirect: 'follow',
		headers: {
			'user-agent': USER_AGENT,
			accept: 'text/markdown, text/plain;q=0.9, text/html;q=0.5, */*;q=0.1',
		},
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
	}
	return {
		text: await response.text(),
		url: response.url,
		contentType: response.headers.get('content-type') || '',
	};
}

function record(issues, level, line, message) {
	issues.push({ level, line, message });
}

function analyse(text, options) {
	const issues = [];
	const sections = [];
	const links = [];
	let bom = false;

	if (text.charCodeAt(0) === 0xfeff) {
		bom = true;
		text = text.slice(1);
	}
	if (/^<!doctype html|<html[\s>]/i.test(text.trimStart())) {
		record(issues, 'error', 1, 'body is HTML, not Markdown');
	}

	const lines = text.replace(/\r\n?/g, '\n').split('\n');
	const fenced = [];
	let inFence = false;
	for (const line of lines) {
		fenced.push(inFence);
		if (/^\s{0,3}(?:`{3,}|~{3,})/.test(line)) inFence = !inFence;
	}

	const headings = [];
	lines.forEach((line, index) => {
		if (fenced[index]) return;
		const match = /^(#{1,6})\s+(.*)$/.exec(line);
		if (!match) return;
		headings.push({ level: match[1].length, title: match[2].trim(), line: index + 1 });
	});

	const h1s = headings.filter((heading) => heading.level === 1);
	if (!h1s.length) record(issues, 'error', 1, 'missing H1 title');
	if (h1s.length > 1) {
		record(issues, 'warn', h1s[1].line, 'more than one H1 title');
	}

	if (h1s.length) {
		const firstH1 = h1s[0].line;
		const before = lines.findIndex((line, index) => index < firstH1 - 1 && !fenced[index] && line.trim());
		if (before !== -1) {
			record(issues, 'error', before + 1, 'content appears before the H1');
		}

		let index = firstH1;
		while (index < lines.length && !lines[index].trim()) index++;
		if (!/^\s*>\s*\S/.test(lines[index] || '')) {
			record(issues, 'warn', h1s[0].line + 1, 'no blockquote summary after the H1');
		}
	}

	let section = null;
	lines.forEach((line, index) => {
		if (fenced[index] || !line.trim()) return;
		const heading = /^(#{1,6})\s+(.*)$/.exec(line);
		if (heading) {
			if (heading[1].length > 2) {
				record(issues, 'error', index + 1, `H${heading[1].length} heading is not allowed`);
			}
			if (heading[1].length === 1) {
				section = null;
			} else if (heading[1].length === 2) {
				section = { title: heading[2].trim(), line: index + 1, items: [], text: false };
				sections.push(section);
			}
			return;
		}
		if (!section) return;

		const item = /^\s{0,3}[-*+]\s+(.*)$/.exec(line);
		if (!item) {
			section.text = true;
			return;
		}
		const link = /^\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*(.*)$/.exec(item[1].trim());
		if (!link) {
			record(issues, 'error', index + 1, 'list item has no [name](url) link');
			return;
		}
		const name = link[1].trim();
		const url = link[2].trim();
		const note = link[3].trim();
		if (!name) record(issues, 'error', index + 1, 'link name is empty');
		if (note && !note.startsWith(':')) {
			record(issues, 'warn', index + 1, 'notes should follow the link after a colon');
		}
		section.items.push({ name, url, line: index + 1 });
	});

	for (const item of sections) {
		if (!item.items.length) {
			record(issues, 'error', item.line, `section "${item.title}" has no file list`);
		}
		if (item.text) {
			record(issues, 'warn', item.line, `section "${item.title}" has text outside its file list`);
		}
	}

	const seen = new Map();
	for (const item of sections) {
		for (const entry of item.items) {
			links.push(entry);
			if (!/^https?:\/\//i.test(entry.url)) {
				record(issues, 'warn', entry.line, `link is not an absolute http(s) URL: ${entry.url}`);
			}
			if (/example\.(?:com|org|net)|\bTODO\b|\byour-domain\b|\blocalhost\b|<[^>]+>/i.test(entry.url)) {
				record(issues, 'warn', entry.line, `placeholder URL: ${entry.url}`);
			}
			const key = entry.url.replace(/#.*$/, '');
			if (seen.has(key)) {
				record(issues, 'warn', entry.line, `duplicate URL, also on line ${seen.get(key)}`);
			} else {
				seen.set(key, entry.line);
			}
		}
	}

	const bytes = Buffer.byteLength(text, 'utf8');
	if (bytes > options.maxBytes) {
		record(issues, 'warn', 1, `file is ${bytes} bytes, above the ${options.maxBytes} byte warning limit`);
	}

	return { issues, sections, links, bytes, bom };
}

async function probe(entry, timeout) {
	let response;
	try {
		response = await fetch(entry.url, {
			redirect: 'follow',
			signal: AbortSignal.timeout(timeout),
			headers: {
				'user-agent': USER_AGENT,
				accept: 'text/markdown, text/plain;q=0.9, */*;q=0.1',
			},
		});
		await response.body?.cancel();
	} catch {
		return { entry, level: 'error', message: 'request failed' };
	}

	if (response.status >= 200 && response.status < 300) {
		return { entry, level: 'ok' };
	}
	const level = [401, 403, 429].includes(response.status) ? 'warn' : 'error';
	const moved = response.url && response.url !== entry.url ? ` -> ${response.url}` : '';
	return { entry, level, message: `HTTP ${response.status}${moved}` };
}

async function checkLinks(links, timeout) {
	const queue = links.slice();
	const results = [];
	const worker = async () => {
		while (queue.length) {
			const entry = queue.shift();
			results.push(await probe(entry, timeout));
		}
	};
	await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
	return results.sort((a, b) => a.entry.line - b.entry.line);
}

function printIssue(issue) {
	const line = String(issue.line).padStart(4);
	const label = issue.level === 'error' ? 'error' : 'warn ';
	console.log(`${line}  ${label}  ${issue.message}`);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const result = await load(options.source);
	const analysis = analyse(result.text, options);

	console.log(`Source  ${options.source}`);
	if (result.url) console.log(`Final   ${result.url}`);
	if (result.contentType) console.log(`Type    ${result.contentType}`);
	console.log(`Size    ${analysis.bytes} bytes${analysis.bom ? ', with a BOM' : ''}`);
	console.log(
		`Shape   ${analysis.sections.length} H2 section(s), ${analysis.links.length} link(s)`,
	);

	if (result.contentType && /text\/html/i.test(result.contentType)) {
		analysis.issues.push({
			level: 'warn',
			line: 1,
			message: 'served as text/html; use a text media type for the file',
		});
	}

	for (const issue of analysis.issues.sort((a, b) => a.line - b.line)) {
		printIssue(issue);
	}

	let linkResults = [];
	if (options.checkLinks && analysis.links.length) {
		const reachable = analysis.links.filter((entry) => /^https?:\/\//i.test(entry.url));
		linkResults = await checkLinks(reachable, options.timeout);
		for (const link of linkResults) {
			if (link.level !== 'ok') {
				printIssue({
					level: link.level,
					line: link.entry.line,
					message: `${link.message}: ${link.entry.url}`,
				});
			}
		}
		console.log(`Links   ${linkResults.filter((link) => link.level === 'ok').length} reachable`);
	}

	const errors =
		analysis.issues.filter((issue) => issue.level === 'error').length +
		linkResults.filter((link) => link.level === 'error').length;
	const warnings =
		analysis.issues.filter((issue) => issue.level === 'warn').length +
		linkResults.filter((link) => link.level === 'warn').length;

	console.log(`\n${errors} error(s), ${warnings} warning(s)`);
	process.exit(errors > 0 || (options.strict && warnings > 0) ? 1 : 0);
}

main().catch((error) => {
	console.error(`Cannot check ${process.argv[2] || 'the source'}: ${error.message}`);
	process.exit(2);
});
