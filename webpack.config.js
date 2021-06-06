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
            {
                test: /\.(less|css)$/i,
                use: [
                    { loader: "style-loader" }, //  creates style nodes from JS strings
                    { loader: "css-loader" }, //    translates CSS into a JS module (CommonJS)
                    { loader: "less-loader" }, //   compiles Less to CSS
                ],
            },
            {
                test: /\.svg/,
                loader: "svg-url-loader"
            }
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
