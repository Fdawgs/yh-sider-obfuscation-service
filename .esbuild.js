const esbuild = require("esbuild");
const { globPlugin } = require("esbuild-plugin-glob");

esbuild.build({
	entryPoints: ["src/**/!(*.test).js"],
	format: "cjs",
	logLevel: "info",
	minify: true,
	outdir: "dist",
	packages: "external",
	platform: "node",
	plugins: [globPlugin()],
	target: "node18",
});
