module.exports = {
    extends: require.resolve('@diplodoc/lint/eslint-config/node'),
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: true,
    },
};
