const {join, resolve} = require('path');
const {DefinePlugin} = require('webpack');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const RtlCssPlugin = require('./rtl-css');

const EMPTY_MODULE = require.resolve('../src/stub/empty-module');

function config({isServer, isDev, analyze = false}) {
    const mode = isServer ? 'server' : 'client';
    const root = (...path) => resolve(__dirname, join('..', ...path));
    const src = (...path) => root(join('src', ...path));
    const valuable = (object) =>
        Object.entries(object)
            .filter(([, value]) => value)
            .reduce((acc, [key, value]) => Object.assign(acc, {[key]: value}), {});

    return {
        mode: isDev ? 'development' : 'production',
        target: isServer ? 'node' : 'web',
        devtool: 'source-map',
        entry: valuable({
            app: isServer ? src('index.server.tsx') : src('index.tsx'),
            search: isServer ? null : src('search.tsx'),
        }),
        cache: isDev && {
            type: 'filesystem',
            cacheDirectory: root(`cache`, mode),
        },
        output: valuable({
            path: root('build', mode),
            filename: `[name].js`,
            libraryTarget: isServer ? 'commonjs2' : null,
        }),
        resolve: {
            alias: valuable({
                'react/jsx-runtime': require.resolve('react/jsx-runtime'),
                react: require.resolve('react'),
                'react-player': EMPTY_MODULE,
            }),
            fallback: {
                stream: false,
                crypto: false,
                url: require.resolve('url/'),
            },
            extensions: (isServer ? ['.server.tsx', '.server.ts', '.server.js'] : []).concat([
                '.tsx',
                '.ts',
                '.js',
                '.scss',
            ]),
        },
        optimization: {
            minimize: !isServer,
            splitChunks: {
                chunks: 'async',
                cacheGroups: {
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        priority: 10,
                        name: 'react',
                        chunks: 'all',
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'initial',
                    },
                },
            },
        },
        plugins: [
            new DefinePlugin({
                'process.env': {
                    BROWSER: !isServer,
                },
            }),
            analyze &&
                new BundleAnalyzerPlugin({
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
                    const not =
                        (actor) =>
                        (...args) =>
                            !actor(...args);
                    const allOf =
                        (...actors) =>
                        (...args) =>
                            actors.every((actor) => actor(...args));
                    const oneOf =
                        (...actors) =>
                        (...args) =>
                            actors.some((actor) => actor(...args));
                    const isInitial = ({isInitial}) => isInitial;
                    const endsWith =
                        (tail) =>
                        ({name}) =>
                            name.endsWith(tail);
                    const byRuntime = (runtime) => (file) => {
                        if (!file.chunk || !file.chunk.runtime) {
                            return true;
                        }

                        if (file.chunk.runtime.size) {
                            return file.chunk.runtime.has(runtime);
                        }

                        return file.chunk?.runtime === runtime;
                    };
                    const runtimeLast = (a, b) => b.chunk?.id - a.chunk?.id;
                    const appLast = (a, b) =>
                        a.chunk?.name.includes('app') - b.chunk?.name.includes('app');

                    const runtimes = {};
                    for (const runtime of ['search', 'app']) {
                        runtimes[runtime] = {
                            async: files
                                .filter(
                                    allOf(
                                        not(isInitial),
                                        not(oneOf(endsWith('.rtl.css'), endsWith('.rtl.js'))),
                                    ),
                                )
                                .filter(oneOf(endsWith('.css'), endsWith('.js')))
                                .map(name),
                            js: files
                                .filter(oneOf(isInitial, endsWith('.rtl.js')))
                                .filter(endsWith('.js'))
                                .filter(byRuntime(runtime))
                                .sort(runtimeLast)
                                .map(name),
                            css: files
                                .filter(oneOf(isInitial, endsWith('.rtl.css')))
                                .filter(endsWith('.css'))
                                .filter(byRuntime(runtime))
                                .sort(appLast)
                                .map(name),
                        };
                    }

                    return runtimes;
                },
            }),
            new RtlCssPlugin({
                filename: '[name].rtl.css',
                hooks: {
                    pre: function (root, postcss) {
                        root.nodes.forEach((node) => {
                            if (
                                node.selector &&
                                node.selector.match(
                                    /(?:\[dir=(?:"|')?(rtl|ltr|auto)(?:"|')?\]|:dir\((rtl|ltr|auto)\))/,
                                )
                            ) {
                                node.nodes.unshift(postcss.comment({text: 'rtl:begin:ignore'}));
                                node.nodes.push(postcss.comment({text: 'rtl:end:ignore'}));
                            }
                        });
                    },
                },
            }),
        ].filter(Boolean),
        module: {
            rules: [
                {
                    test: /\.[tj]sx?$/,
                    use: ['babel-loader'],
                    include: [src(), require.resolve('@diplodoc/mermaid-extension')],
                },
                {
                    test: /\.s?css$/,
                    use: [
                        {
                            loader: MiniCSSExtractPlugin.loader,
                            options: {
                                emit: !isServer,
                            },
                        },
                        {loader: 'css-loader'},
                        {loader: 'sass-loader'},
                    ],
                },
                {
                    test: /\.svg$/,
                    loader: 'react-svg-loader',
                },
            ],
        },
    };
}

module.exports = [
    config({isServer: false, isDev: process.env.NODE_ENV === 'development'}),
    config({isServer: true, isDev: process.env.NODE_ENV === 'development'}),
];
