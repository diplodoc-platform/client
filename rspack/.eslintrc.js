module.exports = {
    extends: require.resolve('@diplodoc/infra/eslint-config/node'),
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: true,
    },
};
