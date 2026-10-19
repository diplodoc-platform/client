const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join, win32} = require('node:path');
const {test} = require('node:test');
const ts = require('typescript');

const contractPath = join(__dirname, '../src/components/ConstructorPage/navigationTypes.ts');
const fixtureRoot = join(__dirname, 'virtual-navigation-types');

// Separate unique symbols model React declarations from two dependency trees.
function declarations(brand) {
    return `
declare const ${brand}: unique symbol;
type Element = {readonly [${brand}]: never};
interface Item {type: 'link'; url: string; icon?: () => Element}
interface Header {leftItems: Item[]; rightItems?: Item[]; withBorder?: boolean}
interface Logo {icon: string; text?: string}
export interface CustomNavigationProps {data: Header; logo: Logo}
export type NavigationItemModel = Item;
export interface NavigationData {
    header: Header;
    logo: Logo;
    footer?: {copyright?: string};
    renderNavigation?: () => Element;
}
`;
}

function compile(legacy = false, windowsPaths = false) {
    const fixturePath = (name) =>
        windowsPaths ? win32.join('C:\\navigation-type-fixture', name) : join(fixtureRoot, name);
    const consumer = fixturePath('consumer.ts');
    const components = fixturePath('components.d.ts');
    const pageConstructor = fixturePath('page-constructor.d.ts');
    const files = new Map(
        [
            [components, declarations('componentsReact')],
            [pageConstructor, declarations('clientReact')],
            [
                contractPath,
                legacy
                    ? "export type {NavigationData, NavigationItemModel} from '@gravity-ui/page-constructor';"
                    : readFileSync(contractPath, 'utf8'),
            ],
            [
                consumer,
                `
import type {CustomNavigationProps} from '@diplodoc/components';
import type {NavigationData as RootNavigationData} from '@gravity-ui/page-constructor';
import type {NavigationData, NavigationItemModel} from './navigationTypes';
declare const navigation: NavigationData;
declare const item: NavigationItemModel;
declare const rootNavigation: RootNavigationData;
const header: CustomNavigationProps['data'] = navigation.header;
const items: CustomNavigationProps['data']['leftItems'] = [item];
const logo: CustomNavigationProps['logo'] = navigation.logo;
const footer: RootNavigationData['footer'] = navigation.footer;
const renderer: RootNavigationData['renderNavigation'] = navigation.renderNavigation;
// @ts-expect-error Distinct dependency-tree React symbols must remain incompatible.
const wrongTree: CustomNavigationProps['data'] = rootNavigation.header;
// @ts-expect-error Component URL validation must not become any or unknown.
const invalidItem: NavigationItemModel = {type: 'link', url: 42};
`,
            ],
        ].map(([file, contents]) => [ts.normalizePath(file), contents]),
    );
    const options = {
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: [],
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        target: ts.ScriptTarget.ES2022,
    };
    const host = ts.createCompilerHost(options);
    const originalSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (file, languageVersion, ...args) => {
        const normalized = ts.normalizePath(file);
        return files.has(normalized)
            ? ts.createSourceFile(normalized, files.get(normalized), languageVersion, true)
            : originalSourceFile(file, languageVersion, ...args);
    };
    const modules = {
        '@diplodoc/components': components,
        '@gravity-ui/page-constructor': pageConstructor,
        './navigationTypes': contractPath,
    };
    host.resolveModuleNames = (names, containingFile) =>
        names.map((name) =>
            modules[name]
                ? {resolvedFileName: modules[name]}
                : ts.resolveModuleName(name, containingFile, options, host).resolvedModule,
        );
    return ts.getPreEmitDiagnostics(ts.createProgram([consumer], options, host));
}

test('navigation follows the component contract across duplicate dependency type trees', () => {
    const diagnostics = compile();
    assert.deepEqual(
        diagnostics.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')),
        [],
    );
});

test('the legacy independent page-constructor types reproduce the assignment failure', () => {
    const diagnostics = compile(true);
    assert.ok(diagnostics.some((item) => item.code === 2322));
    assert.ok(
        diagnostics.some((item) =>
            ts.flattenDiagnosticMessageText(item.messageText, '\n').includes('componentsReact'),
        ),
    );
    assert.ok(!diagnostics.some((item) => item.code === 2307), 'No missing-module false positive');
});

test('virtual compiler files use TypeScript-normalized Windows paths', () => {
    assert.equal(compile(false, true).length, 0);
    assert.ok(compile(true, true).some((item) => item.code === 2322));
});
