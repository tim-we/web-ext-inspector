const webpack = require("webpack");
const path = require("path");

module.exports = {
    mode: "development",
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
    devtool: "eval-cheap-module-source-map",
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
    devServer: {
        contentBase: path.join(__dirname, "public"),
    },
};
