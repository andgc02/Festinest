const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const filePath = path.resolve(__dirname, 'artist-studio.html');

function send(res, code, body, type = 'text/html; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html' || req.url.startsWith('/artist-studio.html')) {
    try {
      const html = fs.readFileSync(filePath, 'utf8');
      return send(res, 200, html);
    } catch (e) {
      return send(res, 500, `<pre>Failed to read tool file.\n${e.message}</pre>`);
    }
  }
  send(res, 404, '<h1>Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`Artist JSON Studio running at http://localhost:${PORT}`);
});

