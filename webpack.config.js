module.exports = [
    {
        entry: './blockly-toolkit/blocklyToolkit.ts',
        module: {
            rules: [
                { test: /\.ts$/, use: 'ts-loader' },
            ],
        },
        output: {
            path: __dirname,
            filename: "blockly-toolkit/blocklyToolkit.js",
            library:{
                name: 'BlocklyToolkit',
                type: 'var',
                export: 'default',
            },
        },
    },
];