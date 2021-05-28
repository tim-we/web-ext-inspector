const webpack = require("webpack");
const path = require("path");

module.exports = {
    mode: "production",
    entry: {
        main: path.join(__dirname, "src", "ts", "main.tsx"),
        worker: path.join(
            __dirname,
            "src",
            "ts",
            "inspector",
            "worker",
            "worker.ts"
        ),
    },
    target: "web",
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    onlyCompileBundledFiles: true,
                },
            },
        ],
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "public"),
    },
};
