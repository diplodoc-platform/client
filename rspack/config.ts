import type {FileDescriptor} from 'rspack-manifest-plugin';

import {join, resolve} from 'path';
import {rspack} from '@rspack/core';
import {RspackManifestPlugin} from 'rspack-manifest-plugin';
import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';
import {TsCheckerRspackPlugin} from 'ts-checker-rspack-plugin';

import {RtlCssPlugin} from './rtl-css';

const EMPTY_MODULE = require.resolve('../src/stub/empty-module');

const getSwcOptions = (isDev: boolean) => ({
    jsc: {
        parser: {
            syntax: 'typescript',
            tsx: true,
        },
        externalHelpers: true,
        transform: {
            react: {
                runtime: 'automatic',
                development: isDev,
            },
        },
    },
});

type ConfigFactoryOptions = {
    isServer: boolean;
    isDev: boolean;
    analyze?: boolean;
};

function config({isServer, isDev, analyze = false}: ConfigFactoryOptions) {
    const mode = isServer ? 'server' : 'client';
    const root = (...path: string[]) => resolve(__dirname, join('..', ...path));
    const src = (...path: string[]) => root(join('src', ...path));
    const valuable = <T extends Record<string, unknown>>(object: T): T =>
        Object.entries(object)
            .filter(([, value]) => value)
            .reduce((acc, [key, value]) => Object.assign(acc, {[key]: value}), {} as T);

    return {
        experiments: {
            css: true,
        },

        ignoreWarnings: [/starts with '~'/, /Conflicting order/],

        mode: isDev ? 'development' : 'production',
        target: isServer ? 'node' : 'web',
        devtool: 'source-map',
        entry: valuable({
            app: isServer ? src('index.server.tsx') : src('index.tsx'),
            search: isServer ? null : src('search.tsx'),
        }),
        cache: {
            type: 'filesystem',
            cacheDirectory: root(`cache`, mode),
        },
        output: valuable({
            clean: true,
            path: root('build', mode),
            filename: isServer ? `[name].js` : `[name]-[contenthash].js`,
            libraryTarget: isServer ? 'commonjs2' : null,
            cssFilename: `[name]-[contenthash].css`,
        }),
        resolve: {
            alias: valuable({
                'react/jsx-runtime': require.resolve('react/jsx-runtime'),
                react: require.resolve('react'),
                'react-player': EMPTY_MODULE,
                'highlight.js': EMPTY_MODULE,
            }),
            fallback: {
                bufferutil: false,
                canvas: false,
                crypto: false,
                stream: false,
                url: require.resolve('url/'),
                'utf-8-validate': false,
            },
            extensions: ['.tsx', '.ts', '.js', '.scss'],
        },
        resolveLoader: {
            modules: [resolve(__dirname, './loaders'), 'node_modules'],
            extensions: ['.ts', '.js'],
        },
        optimization: {
            minimize: !isServer && !isDev,
            minimizer: [
                new rspack.SwcJsMinimizerRspackPlugin({
                    minimizerOptions: {
                        format: {
                            comments: false,
                        },
                    },
                }),
            ],
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
            new rspack.DefinePlugin({
                'process.env': {
                    BROWSER: !isServer,
                },
            }),
            new TsCheckerRspackPlugin(),
            analyze && new RsdoctorRspackPlugin(),
            new RspackManifestPlugin({
                generate: (_seed, files) => {
                    const pages = ['search', 'app'];
                    const name = ({path}: FileDescriptor) => {
                        return path.replace(/^auto\//, '');
                    };
                    const not =
                        <F extends (...args: [FileDescriptor]) => boolean>(actor: F) =>
                        (...args: [FileDescriptor]) =>
                            !actor(...args);
                    const allOf =
                        <F extends (...args: [FileDescriptor]) => boolean>(...actors: F[]) =>
                        (...args: [FileDescriptor]) =>
                            actors.every((actor) => actor(...args));
                    const oneOf =
                        <F extends (...args: [FileDescriptor]) => boolean>(...actors: F[]) =>
                        (...args: [FileDescriptor]) =>
                            actors.some((actor) => actor(...args));
                    const isInitial = ({isInitial}: FileDescriptor) => isInitial;
                    const endsWith =
                        (tail: string) =>
                        ({path}: FileDescriptor) =>
                            path.endsWith(tail);
                    const byRuntime = (runtime: string) => (file: FileDescriptor) => {
                        // For RTL CSS files, determine runtime based on filename
                        // This ensures that runtime-specific RTL files are only included in their corresponding runtime
                        // Example: search.rtl.css should only be in "search" runtime, not in "app" runtime
                        if (file.path && file.path.endsWith('.rtl.css')) {
                            // Extract base name (without .rtl.css)
                            const baseName = file.path.replace('.rtl.css', '');

                            // If filename matches one of our page runtimes (app or search),
                            // include it only in its corresponding runtime
                            if (pages.includes(baseName)) {
                                return baseName === runtime;
                            }
                        }

                        // Стандартная логика для остальных файлов
                        if (!file.chunk || !file.chunk.runtime) {
                            return true;
                        }

                        if (file.chunk.runtime.size) {
                            return file.chunk.runtime.has(runtime);
                        }

                        return false;
                    };
                    const runtimeLast = (a: FileDescriptor, b: FileDescriptor) =>
                        Number(b.chunk?.id) - Number(a.chunk?.id);
                    const appLast = (a: FileDescriptor, b: FileDescriptor) =>
                        Number(a.chunk?.name?.includes('app')) -
                        Number(b.chunk?.name?.includes('app'));

                    const runtimes = {} as Record<
                        string,
                        {async: string[]; js: string[]; css: string[]}
                    >;
                    for (const runtime of pages) {
                        runtimes[runtime] = {
                            async: files
                                .filter(not(endsWith('.map')))
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
                filename: '[name]-[contenthash].rtl.css',
                hooks: {
                    pre: function (root, postcss) {
                        root.nodes.forEach((node) => {
                            if (
                                //@ts-ignore
                                node.selector &&
                                //@ts-ignore
                                node.selector.match(
                                    /(?:\[dir=(?:"|')?(rtl|ltr|auto)(?:"|')?\]|:dir\((rtl|ltr|auto)\))/,
                                )
                            ) {
                                //@ts-ignore
                                node.nodes.unshift(postcss.comment({text: 'rtl:begin:ignore'}));
                                //@ts-ignore
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
                    loader: 'builtin:swc-loader',
                    options: getSwcOptions(isDev),
                    include: [/@diplodoc[\\/]mdx-extension/],
                    resolve: {
                        fullySpecified: false,
                    },
                },
                {
                    test: /\.[tj]sx?$/,
                    loader: 'builtin:swc-loader',
                    options: getSwcOptions(isDev),
                    include: [src(), require.resolve('@diplodoc/mermaid-extension')],
                },
                {
                    test: /\.s?css$/,
                    type: 'css',
                    use: isServer
                        ? ['noop-loader']
                        : [
                              {
                                  loader: 'postcss-loader',
                                  options: {
                                      postcssOptions: {
                                          plugins: [
                                              require('postcss-preset-env')({
                                                  browsers: ['defaults', 'not ie <= 11'],
                                                  features: {
                                                      'logical-properties-and-values': false,
                                                      'dir-pseudo-class': false,
                                                  },
                                              }),
                                          ],
                                      },
                                  },
                              },
                              {
                                  loader: 'sass-loader',
                                  options: {
                                      // Use sass (Dart Sass) instead of sass-embedded
                                      // sass-embedded requires native binaries and fails in pure JS mode
                                      implementation: require('sass'),
                                  },
                              },
                          ],
                },
                {
                    test: /\.svg$/,
                    use: [
                        {loader: 'builtin:swc-loader', options: getSwcOptions(isDev)},
                        'react-svg-loader',
                    ],
                },
            ],
        },
    };
}

const isDev = process.env.NODE_ENV === 'development';
const analyze = process.env.ANALYZE === 'true';

module.exports = [
    config({isServer: false, isDev, analyze}),
    config({isServer: true, isDev, analyze}),
];

/*
    https://webpack.js.org/configuration/configuration-types/#parallelism
    1 = parallel compilation for >1 configs (example: server, client)
    made for twice speed boost
*/
module.exports.parallelism = 1;
