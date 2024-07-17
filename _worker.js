const PROXY_TARGETS = {
    “docker.io”: “https://registry-1.docker.io”,
    “quay.io”: “https://quay.io”
};

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    let targetBase = null;

    for (const [prefix, target] of Object.entries(PROXY_TARGETS)) {
        if (path.startsWith(/${prefix}/)) {
            targetBase = target;
            break;
        }
    }

    if (!targetBase) {
        return new Response(“Target registry not supported.”, { status: 400 });
    }

    const proxyUrl = targetBase + path.replace(new RegExp(^/[^/]+), ‘’);
    const proxyRequest = new Request(proxyUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
    });

    const response = await fetch(proxyRequest);
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
}

addEventListener(“fetch”, event => {
    event.respondWith(handleRequest(event.request));
});
