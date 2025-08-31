// Minimal Node.js static server for production build
// Serves files from dist/hedge-accounting-sfx with SPA fallback to index.html
// No proxies or external dependencies.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist', 'hedge-accounting-sfx');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function sendFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
  const headers = { 'Content-Type': contentType };
  if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  } else if (['.js', '.mjs', '.css', '.woff', '.woff2', '.ttf', '.eot', '.svg'].includes(ext)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  }

  fs.createReadStream(filePath)
    .on('open', () => res.writeHead(statusCode, headers))
    .on('error', () => serveIndex(res))
    .pipe(res);
}

function serveIndex(res) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) return sendFile(res, indexPath, 200);
  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('index.html not found. Did you run the production build?');
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const safePath = path.normalize(parsed.pathname || '/').replace(/^\\|\/+/, '/');

  if (safePath === '/') return serveIndex(res);

  const requestedPath = path.join(DIST_DIR, safePath);
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()) {
    const dirIndex = path.join(requestedPath, 'index.html');
    if (fs.existsSync(dirIndex)) return sendFile(res, dirIndex);
  }
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    return sendFile(res, requestedPath);
  }
  return serveIndex(res);
});

server.listen(PORT, () => {
  console.log(`Serving dist from ${DIST_DIR} on http://localhost:${PORT}`);
});

