const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8000;

// CORS pre-flight
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Internal-Service');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Route prefix → target service map (order matters — more specific first)
const routes = [
    { prefix: '/api/v1/auth', target: 'http://127.0.0.1:8001' },
    { prefix: '/api/v1/users', target: 'http://127.0.0.1:8002' },
    { prefix: '/api/v1/items', target: 'http://127.0.0.1:8003' },
    { prefix: '/api/v1/places', target: 'http://127.0.0.1:8003' },
    { prefix: '/api/v1/cupboards', target: 'http://127.0.0.1:8003' },
    { prefix: '/api/v1/stats', target: 'http://127.0.0.1:8003' },
    { prefix: '/api/v1/borrow-records', target: 'http://127.0.0.1:8004' },
    { prefix: '/api/v1/audit-logs', target: 'http://127.0.0.1:8005' },
    { prefix: '/api/v1/events', target: 'http://127.0.0.1:8005' },
];

// Mount a SINGLE proxy at `/` that picks the target via the router function.
// This preserves the full request path (no prefix stripping).
app.use(
    '/',
    createProxyMiddleware({
        changeOrigin: true,
        router: (req) => {
            for (const { prefix, target } of routes) {
                if (req.url.startsWith(prefix)) {
                    return target;
                }
            }
            return null; // will result in 404 from the proxy
        },
        on: {
            error: (err, req, res) => {
                console.error(`[Gateway] Proxy error for ${req.url}:`, err.message);
                if (!res.headersSent) {
                    res.status(502).json({ message: 'Service Unavailable' });
                }
            },
            proxyReq: (proxyReq, req) => {
                console.log(`[Gateway] ${req.method} ${req.url} → ${proxyReq.host}`);
            },
        },
    })
);

app.listen(PORT, () => {
    console.log(`[Local API Gateway] Running on http://127.0.0.1:${PORT}`);
    console.log(`Proxying ${routes.length} route groups to PHP artisan services...`);
    routes.forEach(({ prefix, target }) =>
        console.log(`  ${prefix.padEnd(30)} → ${target}`)
    );
});
