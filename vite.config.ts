import process from "node:process";
import { defineConfig } from "vite";

// https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json
const CHROME_VERSION = process.env.CHROME_VERSION ?? "133.0.6943.126";

export default defineConfig({
    server: {
        port: 3000,
    },
    build: {
        target: "esnext",
    },
    define: {
        __VERSION__: JSON.stringify(process.env.npm_package_version),
        __DEBUG__: JSON.stringify(true),
        __CHROME_VERSION__: JSON.stringify(CHROME_VERSION),
    },
    css: {
        modules: {
            localsConvention: "camelCaseOnly"
        }
    }
});