const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const {resolve} = require("path");

module.exports = ({config}) => {
    config.module.rules.push({
        test: /\.[tj]sx?$/,
        use: ['babel-loader'],
        include: [
            resolve(__dirname, '../src'),
            resolve(__dirname, '../node_modules/@diplodoc'),
        ]
    }, {
        test: /\.scss$/,
        use: [
            MiniCSSExtractPlugin.loader,
            {loader: 'css-loader'},
            {loader: 'sass-loader'},
        ]
    }, {
        test: /\.svg(\?.*)?$/,
        use: [
            {
                loader: "react-svg-loader"
            }
        ],
        include: [
            resolve(__dirname, '../src'),
            resolve(__dirname, '../node_modules/@diplodoc'),
            resolve(__dirname, '../node_modules/@doc-tools'),
        ]
    });

    const svgRule = config.module.rules.find((rule) => rule.test.toString().includes('svg|ico|jpg'));
    svgRule.exclude = [
        resolve(__dirname, '../src'),
        resolve(__dirname, '../node_modules/@diplodoc'),
        resolve(__dirname, '../node_modules/@doc-tools'),
    ];

    config.plugins.push(new MiniCSSExtractPlugin());

    return config;
};
