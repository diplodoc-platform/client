const {resolve} = require('path');
const {DefinePlugin} = require('webpack');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

function config({isServer, analyze = false}) {
    const mode = isServer ? 'server' : 'client';

    return {
        mode: 'production',
        target: isServer ? 'node' : 'web',
        devtool: 'source-map',
        entry: {
            app: isServer ? './src/index.server.tsx' : './src/index.tsx',
        },
        cache: {
            type: 'filesystem',
            cacheDirectory: resolve(`cache/${mode}`)
        },
        output: {
            path: resolve(__dirname, 'build'),
            filename: `[name].${mode}.js`,
            ...(isServer ? {
                libraryTarget: 'commonjs2'
            } : {})
        },
        resolve: {
            alias: {
                'react': require.resolve('react'),
            },
            extensions: (isServer
                ? ['.server.tsx', '.server.ts', '.server.js']
                : []
            ).concat(['.tsx', '.ts', '.js', '.scss']),
        },
        externals: isServer ? [
            '@diplodoc/transform/dist/js/yfm'
        ] : [],
        },
        plugins: [
            new DefinePlugin({
                'process.env': {
                    BROWSER: !isServer
                }
            }),
            analyze && new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
                reportFilename: `stats.${mode}.html`,
            }),
            new MiniCSSExtractPlugin({
                filename: `[name].${mode}.css`,
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
                        {
                            loader: MiniCSSExtractPlugin.loader,
                            options: {
                                emit: !isServer
                            }
                        },
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
