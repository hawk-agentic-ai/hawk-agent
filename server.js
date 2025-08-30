// Minimal Node.js static server for production build
// Serves files from dist/hedge-accounting-sfx with SPA fallback to index.html
// No external dependencies required.

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
  // Cache policy: HTML is never cached; hashed assets are cached aggressively
  if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  } else if (['.js', '.mjs', '.css', '.woff', '.woff2', '.ttf', '.eot', '.svg'].includes(ext)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  }

  fs.createReadStream(filePath)
    .on('open', () => {
      res.writeHead(statusCode, headers);
    })
    .on('error', (err) => {
      if (statusCode !== 404) {
        // On error while streaming a known file, try fallback
        return serveIndex(res);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    })
    .pipe(res);
}

function serveIndex(res) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return sendFile(res, indexPath, 200);
  }
  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('index.html not found. Did you run the production build?');
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let safePath = path.normalize(parsed.pathname || '/').replace(/^\\|\/+/, '/');
  // Default to index for root
  if (safePath === '/') {
    return serveIndex(res);
  }

  const requestedPath = path.join(DIST_DIR, safePath);

  // If the path points to a directory, try index.html in it
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()) {
    const dirIndex = path.join(requestedPath, 'index.html');
    if (fs.existsSync(dirIndex)) {
      return sendFile(res, dirIndex);
    }
  }

  // If a file exists, serve it; otherwise SPA fallback
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    return sendFile(res, requestedPath);
  }

  // SPA fallback to index.html for client-routed URLs
  return serveIndex(res);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Serving dist from ${DIST_DIR} on http://localhost:${PORT}`);
});
