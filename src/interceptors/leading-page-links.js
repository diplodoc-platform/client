(function () {
    /**
     * Element.matches() polyfill.
     * @link https://developer.mozilla.org/ru/docs/Web/API/Element/matches
     */
    if (typeof Element !== 'undefined') {
        (function (e) {
            const matches =
                e.matches ||
                e.matchesSelector ||
                e.webkitMatchesSelector ||
                e.mozMatchesSelector ||
                e.msMatchesSelector ||
                e.oMatchesSelector;

            if (matches) {
                e.matches = e.matchesSelector = matches;
            } else {
                e.matches = e.matchesSelector = function (selector) {
                    const th = this;
                    return Array.prototype.some.call(document.querySelectorAll(selector), (el) => {
                        return el === th;
                    });
                };
            }
        })(Element.prototype);
    }
})();
