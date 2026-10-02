const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
let failCloud = true;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ogg': 'audio/ogg',
};
http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname.replace(/^\/check\//, '/');
    if (pathname === '/assets/menu/cloud.png' && failCloud) {
      failCloud = false;
      res.writeHead(503, { 'Cache-Control': 'no-store' });
      res.end('Test: temporary asset failure');
      return;
    }
    const target = path.resolve(
      root,
      '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname),
    );
    if (!target.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!fs.existsSync(target)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(target).pipe(res);
  })
  .listen(4175, '127.0.0.1', () => console.log('Build verification: http://127.0.0.1:4175/check/'));
