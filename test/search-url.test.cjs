const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(
    path.join(__dirname, '../src/components/Search/searchParams.ts'),
    'utf8',
);
const {outputText} = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
});
const context = {exports: {}, URLSearchParams};
vm.runInNewContext(outputText, context);

for (const pathname of ['/product/v1/_search/en/index.html', '/product/v1/_search/en/']) {
    test(`pagination preserves ${pathname} with a documentation-root base href`, () => {
        const result = context.exports.buildSearchUrl(pathname, 'guide & api', 2, ['guide']);
        const resolved = new URL(result, 'https://docs.example.test/product/v1/');
        assert.equal(resolved.pathname, pathname);
        assert.equal(resolved.searchParams.get('query'), 'guide & api');
        assert.equal(resolved.searchParams.get('page'), '2');
        assert.equal(resolved.searchParams.get('tags'), 'guide');
    });
}

test('clearing a query keeps the search page path and removes stale parameters', () => {
    assert.equal(
        context.exports.buildSearchUrl('/product/v1/_search/en/index.html', '', 1, []),
        '/product/v1/_search/en/index.html',
    );
});
