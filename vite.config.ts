import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 3000,
    },
    build: {
        target: "esnext",
    },
    define: {
        __VERSION__: JSON.stringify(process.env.npm_package_version),
        __DEBUG__: JSON.stringify(true)
    },
    css: {
        modules: {
            localsConvention: "camelCaseOnly"
        }
    }
});