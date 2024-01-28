import fs from "node:fs";
import path from "node:path";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import * as esbuild from "esbuild";
import svgBundlePlugin from "esbuild-plugin-svg-bundle";
import { sassPlugin } from "esbuild-sass-plugin";
import { rimrafSync } from "rimraf";
import pkg from "../package.json" assert { type: "json" };

const cmdArgs = new Set(process.argv.slice(2));
const production = cmdArgs.has("--mode=production");
const targetDir = "public";

rimrafSync(targetDir);

// Copy API data
const apiFileTargetPath = path.join(targetDir, "data/api.json");
fs.mkdirSync(path.join(targetDir, "data"), { recursive: true });
fs.copyFileSync("data/api.json", apiFileTargetPath);
console.log(`  ${apiFileTargetPath}\n   └ data/api.json`);

// ESBuild
const baseConfig = {
  bundle: true,
  minify: production,
  sourcemap: true,
  target: ["es2022"],
  metafile: true,
  define: {
    __DEBUG__: JSON.stringify(!production),
    __VERSION__: JSON.stringify(production ? pkg.version : `${pkg.version}-dev`)
  },
  banner: {
    js: `// Extension Inspector ${new Date().getFullYear()}`
  }
};

// watch: cmdArgs.has("--watch")

const configs = [
  {
    ...baseConfig,
    entryPoints: ["src/html/index.html"],
    assetNames: "assets/[name]",
    chunkNames: "[ext]/[name]",
    outdir: targetDir,
    jsx: "automatic",
    plugins: [
      svgBundlePlugin({
        bundleFile: "assets/svg-bundle.svg",
        bundleUrl: "../assets/svg-bundle.svg"
      }),
      htmlPlugin(),
      sassPlugin()
    ]
  },
  {
    ...baseConfig,
    entryPoints: {
      "env-setup": "src/runner/environment/setup.ts",
      background: "src/main/background.ts"
    },
    outdir: path.join(targetDir, "js", "worker")
  }
];

if (cmdArgs.has("--watch")) {
  console.log("Watching for changes...");
  await Promise.all(configs.map((c) => esbuild.context(c)).map((c) => c.watch()));
} else {
  const results = await Promise.all(configs.map((c) => esbuild.build(c)));
  results.forEach((result) => console.log(esbuild.analyzeMetafileSync(result.metafile)));
}
