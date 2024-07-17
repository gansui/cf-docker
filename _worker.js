addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.hostname === 'hub.docker.com' || url.hostname === 'quay.io') { // 只代理指定域名
    try {
      // 代理请求到原始 Docker Hub 或 Quay.io 服务器
      const proxyUrl = new URL(request.url);
      proxyUrl.hostname = url.hostname;
      const response = await fetch(proxyUrl, {
        method: request.method,
        headers: request.headers
      });
      return new Response(response.body, response);
    } catch (error) {
      console.error("Error proxying request:", error);
      return new Response('Failed to proxy request', { status: 500 });
    }
  } else {
    // 其他请求直接返回 404
    return new Response('Not Found', { status: 404 });
  }
}
