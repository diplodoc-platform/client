const {createRequire} = require('node:module');

// Constructor providers and components must share one React Context instance.
// Keep the constructor selected by components, including its private locked tree.
function resolvePageConstructor(componentsEntry = require.resolve('@diplodoc/components')) {
    return createRequire(componentsEntry).resolve('@gravity-ui/page-constructor');
}

module.exports = {resolvePageConstructor};
