const { build } = require("esbuild");
const { globPlugin } = require("esbuild-plugin-glob");

build({
	entryPoints: ["src/**/!(*.test).*"],
	format: "cjs",
	minify: true,
	outdir: "dist",
	platform: "node",
	plugins: [globPlugin()],
	target: "node14",
}).catch(() => process.exit(1));
