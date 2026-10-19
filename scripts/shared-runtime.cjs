const {createRequire} = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

// Constructor providers and components must share one React Context instance.
// Keep the constructor selected by components, including its private locked tree.
function resolvePageConstructor(componentsEntry = require.resolve('@diplodoc/components')) {
    const entry = createRequire(componentsEntry).resolve('@gravity-ui/page-constructor');
    let directory = path.dirname(entry);
    while (directory !== path.dirname(directory)) {
        const manifest = path.join(directory, 'package.json');
        if (fs.existsSync(manifest)) {
            const metadata = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            if (metadata.name === '@gravity-ui/page-constructor') {
                // Its ESM entry imports layout CSS; the CJS entry deliberately does not.
                if (!metadata.module) return entry;
                const browserEntry = path.resolve(directory, metadata.module);
                if (!fs.statSync(browserEntry).isFile()) {
                    throw new Error('The selected page-constructor browser entry is not a file');
                }
                return browserEntry;
            }
        }
        directory = path.dirname(directory);
    }
    throw new Error('Cannot locate the selected page-constructor manifest');
}

module.exports = {resolvePageConstructor};
