const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Content-Length');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Proxy: POST /api/claude → Anthropic
  if (req.method === 'POST' && req.url === '/api/claude') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      // Use Buffer.concat to handle binary-safe large bodies (PDFs in base64)
      const bodyBuf = Buffer.concat(chunks);

      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': bodyBuf.length,
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'pdfs-2024-09-25',
        }
      };

      const apiReq = https.request(options, apiRes => {
        const respChunks = [];
        apiRes.on('data', d => respChunks.push(d));
        apiRes.on('end', () => {
          const respBuf = Buffer.concat(respChunks);
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(respBuf);
        });
      });

      apiReq.on('error', e => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: e.message } }));
      });

      apiReq.write(bodyBuf);
      apiReq.end();
    });
    req.on('error', e => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'Request error: ' + e.message } }));
    });
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath.split('?')[0]);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

// Increase max body size for large PDF uploads
server.maxHeadersCount = 0;

server.listen(PORT, () => {
  console.log(`✅ Commercial Pro → http://localhost:${PORT}`);
  if (!API_KEY) console.warn('⚠️  ANTHROPIC_API_KEY manquante — les fonctions IA ne marcheront pas');
});
