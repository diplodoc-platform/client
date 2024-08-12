const {join, resolve} = require('path');
const {DefinePlugin} = require('webpack');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const RtlCssPlugin = require('./rtl-css');

function config({isServer, isDev, analyze = false}) {
    const mode = isServer ? 'server' : 'client';
    const root = (...path) => resolve(__dirname, join('..', ...path));
    const src = (...path) => root(join('src', ...path));

    return {
        mode: isDev ? 'development' : 'production',
        target: isServer ? 'node' : 'web',
        devtool: 'source-map',
        entry: {
            app: isServer ? src('index.server.tsx') : src('index.tsx'),
        },
        cache: isDev && {
            type: 'filesystem',
            cacheDirectory: root(`cache`, mode)
        },
        output: {
            path: root('build', mode),
            filename: `[name].js`,
            ...(isServer ? {
                libraryTarget: 'commonjs2'
            } : {})
        },
        resolve: {
            alias: {
                'react': require.resolve('react'),
                'react-player': require.resolve('../src/stub/empty-module'),
            },
            fallback: {
                stream: false,
                crypto: false,
                url: require.resolve("url/"),
            },
            extensions: (isServer
                ? ['.server.tsx', '.server.ts', '.server.js']
                : []
            ).concat(['.tsx', '.ts', '.js', '.scss']),
        },
        externals: isServer ? [
            '@diplodoc/transform/dist/js/yfm'
        ] : [],
        optimization: {
            minimize: !isServer,
            splitChunks: {
                chunks: 'async',
                cacheGroups: {
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: 'react',
                        chunks: 'all',
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all',
                    },
                },
            }
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
                reportFilename: `stats.html`,
            }),
            new MiniCSSExtractPlugin({
                filename: `[name].css`,
            }),
            new WebpackManifestPlugin({
                generate: (seed, files) => {
                    const name = ({name}) => name;
                    const endsWith = (tail) => ({name}) => name.endsWith(tail);
                    const runtimeLast = (a, b) => b.chunk?.id - a.chunk?.id;
                    const appLast = (a, b) => a.chunk?.name.includes('app') - b.chunk?.name.includes('app')

                    return {
                        js: files.filter(endsWith('.js')).sort(runtimeLast).map(name),
                        css: files.filter(endsWith('.css')).sort(appLast).map(name),
                    };
                }
            }),
            new RtlCssPlugin({
                filename: '[name].rtl.css',
                hooks: {
                    pre:function(root, postcss){
                        root.nodes.forEach((node) => {
                            if(node.selector && node.selector.match(/(?:\[dir=(?:"|')?(rtl|ltr|auto)(?:"|')?\]|:dir\((rtl|ltr|auto)\))/)){
                                node.nodes.unshift(postcss.comment({text: 'rtl:begin:ignore'}))
                                node.nodes.push(postcss.comment({text: 'rtl:end:ignore'}))
                            }
                        })
                    }
                }
            }),
        ].filter(Boolean),
        module: {
            rules: [
                {
                    test: /\.[tj]sx?$/,
                    use: ['babel-loader'],
                    include: [
                        src(),
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
    config({ isServer: false, isDev: process.env.NODE_ENV === 'development' }),
    config({ isServer: true, isDev: process.env.NODE_ENV === 'development' }),
];
