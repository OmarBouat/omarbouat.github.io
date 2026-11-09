import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'src');
const assets = path.join(root, 'public');
const port = Number(process.env.PORT || 3000);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.pdf':'application/pdf', '.txt':'text/plain; charset=utf-8' };

export async function respond(req, res) {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    let selected;
    for (const base of [source, assets]) {
      const candidate = path.resolve(base, relative);
      if (!candidate.startsWith(base + path.sep)) continue;
      try { if ((await stat(candidate)).isFile()) { selected = candidate; break; } }
      catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error; }
    }
    if (!selected) { res.writeHead(404); res.end('Not found'); return; }
    const body = await readFile(selected);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(selected)] || 'application/octet-stream',
      'Content-Length': body.length,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache'
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(400); res.end('Bad request'); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createServer(respond);
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + port));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
