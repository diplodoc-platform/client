process.env.ESLINT_ENV = 'client';

module.exports = {
    root: true,
    extends: [
        '@diplodoc/eslint-config',
    ],
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        'no-implicit-globals': 'off',
        'callback-return': 'off',
        'consistent-return': 'off'
    }
};
