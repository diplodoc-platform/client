const {resolve} = require('path');
const {DefinePlugin} = require('webpack');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

function config({isServer}) {
    return {
        mode: 'production',
        target: isServer ? 'node' : 'web',
        devtool: 'source-map',
        entry: './src/index.tsx',
        output: {
            path: resolve(__dirname, 'build'),
            filename: `app.${isServer ? 'server' : 'client'}.js`,
            ...(isServer ? {
                libraryTarget: 'commonjs2'
            } : {})
        },
        resolve: {
            alias: {
                'react': require.resolve('react'),
            },
            extensions: ['.tsx', '.ts', '.js', '.scss'],
        },
        externals: isServer ? ['@doc-tools/transform/dist/js/yfm'] : [],
        plugins: [
            new DefinePlugin({
                'process.env': {
                    BROWSER: !isServer
                }
            }),
            // new BundleAnalyzerPlugin({
            //     analyzerMode: 'static',
            //     openAnalyzer: false,
            //     reportFilename: (isServer ? 'server-' : 'client-') + 'stats.html',
            // }),
            new MiniCSSExtractPlugin({
                filename: 'app.client.css',
                chunkFilename: 'app.client.css',
            }),
        ].filter(Boolean),
        module: {
            rules: [
                {
                    test: /\.[tj]sx?$/,
                    use: ['babel-loader'],
                    include: [
                        resolve(__dirname, 'src'),
                        require.resolve('@diplodoc/mermaid-extension'),
                    ],
                }, {
                    test: /\.s?css$/,
                    use:  [
                        MiniCSSExtractPlugin.loader,
                        {loader: 'css-loader'},
                        {loader: 'sass-loader'},
                    ],
                }, {
                    test: /\.svg$/,
                    loader: 'react-svg-loader',
                },
            ],
        },
    };
}

module.exports = [
    config({ isServer: false }),
    config({ isServer: true }),
];
