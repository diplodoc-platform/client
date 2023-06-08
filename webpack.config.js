const {resolve} = require('path');
const {DefinePlugin} = require('webpack');
// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

function config({isServer}) {
    return {
        mode: 'production',
        target: isServer ? 'node' : 'web',
        devtool: 'inline-source-map',
        entry: './src/index.tsx',
        output: {
            path: resolve(__dirname, 'build'),
            filename: isServer ? 'app.server.js' : 'app.client.js',
            ...(isServer ? {
                libraryTarget: 'commonjs2'
            } : {})
        },
        resolve: {
            alias: isServer ? {} : {
                react: require.resolve('react'),
            },
            extensions: ['.tsx', '.ts', '.js', '.scss'],
        },
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
            // })
        ],
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
                            loader: 'style-loader',
                            options: {
                                insert: function insertBeforeAt(element) {
                                    /* eslint-env browser */
                                    const parent = document.querySelector('head');
                                    const target = document.querySelector('#custom-style');

                                    const lastInsertedElement =
                                        window._lastElementInsertedByStyleLoader;

                                    if (!lastInsertedElement) {
                                        parent.insertBefore(element, target);
                                    } else if (lastInsertedElement.nextSibling) {
                                        parent.insertBefore(
                                            element,
                                            lastInsertedElement.nextSibling,
                                        );
                                    } else {
                                        parent.appendChild(element);
                                    }

                                    window._lastElementInsertedByStyleLoader = element;
                                },
                            },
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
