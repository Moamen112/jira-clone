const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const http = require('http');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo while preserving defaults
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Let phones reach the local API through the Expo development server. The API
// still receives localhost as its Host header, so no backend changes are needed.
const originalEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const enhanced = originalEnhanceMiddleware(middleware, server);

  return (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return enhanced(req, res, next);

    const proxy = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: 'localhost:5000' },
      },
      (response) => {
        res.writeHead(response.statusCode || 502, response.headers);
        response.pipe(res);
      }
    );

    proxy.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ detail: 'Local API is unavailable on port 5000.' }));
    });
    req.pipe(proxy);
  };
};

module.exports = config;
