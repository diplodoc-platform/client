const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');

const {resolvePageConstructor} = require('../scripts/shared-runtime.cjs');

function packageAt(directory, name, version) {
    fs.mkdirSync(directory, {recursive: true});
    fs.writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({name, version, main: 'index.js'}),
    );
    fs.writeFileSync(
        path.join(directory, 'index.js'),
        'throw new Error("Resolution must not execute package code");',
    );
    return fs.realpathSync(path.join(directory, 'index.js'));
}

test('navigation uses the components-owned constructor rather than a different hoisted context', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'client-constructor-context-'));
    try {
        const components = path.join(root, 'node_modules/@diplodoc/components');
        const entry = packageAt(components, '@diplodoc/components', '5.24.1');
        const hoisted = packageAt(
            path.join(root, 'node_modules/@gravity-ui/page-constructor'),
            '@gravity-ui/page-constructor',
            '8.23.2',
        );
        const selected = packageAt(
            path.join(components, 'node_modules/@gravity-ui/page-constructor'),
            '@gravity-ui/page-constructor',
            '8.23.1',
        );
        assert.equal(resolvePageConstructor(entry), selected);
        assert.notEqual(resolvePageConstructor(entry), hoisted);
        const config = fs.readFileSync(path.join(__dirname, '../rspack/config.ts'), 'utf8');
        assert.match(config, /'@gravity-ui\/page-constructor\$': resolvePageConstructor\(\)/);
    } finally {
        fs.rmSync(root, {recursive: true, force: true});
    }
});

test('flat installations keep the shared hoisted constructor', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'client-constructor-flat-'));
    try {
        const entry = packageAt(
            path.join(root, 'node_modules/@diplodoc/components'),
            '@diplodoc/components',
            '5.24.1',
        );
        const selected = packageAt(
            path.join(root, 'node_modules/@gravity-ui/page-constructor'),
            '@gravity-ui/page-constructor',
            '8.23.2',
        );
        assert.equal(resolvePageConstructor(entry), selected);
    } finally {
        fs.rmSync(root, {recursive: true, force: true});
    }
});
