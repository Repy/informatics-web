module.exports = [
    {
        entry: './blockly-toolkit/index.ts',
        resolve: {
            extensions: ['.ts', '.js', '.css']
        },
        module: {
            rules: [
                { test: /\.ts$/, use: 'ts-loader' },
//                { test: /\.css$/, use: ["style-loader", "css-loader"], exclude: ["/fonts"] },
            ],
        },
        devtool: 'source-map',
        output: {
            path: __dirname,
            filename: "blockly-toolkit/index.js",
            library: {
                type: 'window',
            },
        },
    },
    {
        entry: './blockly/janken/janken.ts',
        resolve: {
            extensions: ['.ts', '.js', '.css']
        },
        module: {
            rules: [
                { test: /\.ts$/, use: 'ts-loader' },
//                { test: /\.css$/, use: ["style-loader", "css-loader"], exclude: ["/fonts"] },
            ],
        },
        devtool: 'source-map',
        output: {
            path: __dirname,
            filename: "./blockly/janken/janken.js",
            library: {
                type: 'window',
            },
        },
    },
];