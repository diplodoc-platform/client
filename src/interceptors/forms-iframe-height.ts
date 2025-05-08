/* eslint-disable no-var */
function findIframe(frameElement: MessageEventSource | null): HTMLIFrameElement | void {
    var iframeList = document.querySelectorAll('iframe');

    for (var i = 0; i < iframeList.length; ++i) {
        if (iframeList[i].contentWindow === frameElement) {
            return iframeList[i];
        }
    }
}

function receiveMessage(e: MessageEvent) {
    try {
        var data = JSON.parse(e.data);
        var height = data['iframe-height'];
        var iframe;

        if (height && (iframe = findIframe(e.source))) {
            iframe.style.height = height + 'px';
        }
    } catch (err) {}
}

(function () {
    if (typeof window !== 'undefined') {
        window.addEventListener('message', receiveMessage, false);
    }
})();
