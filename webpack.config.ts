import * as path from 'path';
import * as webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

const
	// Common configuration
	commonConfig: webpack.Configuration = {
		entry: `./src/install.mts`,
		resolve: {
			extensions: [`.mts`, `.ts`, `.js`],
		},
		module: {
			parser: {
				javascript: {
					importMeta: false,
				},
			},
			rules: [
				{
					test: /\.mts?$/,
					use: `ts-loader`,
					exclude: /node_modules/,
				},
			],
		},
		plugins: [
			new webpack.BannerPlugin({
				banner: `#!/usr/bin/env node\n/*! MIT License. DegreeSign Skills installer. https://opensource.org/licenses/MIT */`,
				raw: true,
			}),
		],
		optimization: {
			minimize: true,
			minimizer: [new TerserPlugin({ extractComments: false })],
			usedExports: true,
			sideEffects: false,
		},
		mode: `production`,
	},
	// Node.js configuration
	nodeConfig: webpack.Configuration = {
		...commonConfig,
		target: `node`,
		experiments: {
			outputModule: true,
		},
		output: {
			path: path.resolve(__dirname, `bin`),
			filename: `install.mjs`,
			module: true,
			chunkFormat: `module`,
		},
		node: {
			__dirname: false,
			__filename: false,
		},
	};

module.exports = nodeConfig;