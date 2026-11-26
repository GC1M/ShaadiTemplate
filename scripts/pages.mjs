// Serves dist/ the way GitHub Pages does, to check a production build locally (vite preview answers every path with
// index.html, which hides a missing page): files as they are, <dir>/index.html for a folder (after a redirect to
// the trailing slash), <path>.html for a path without an extension, and 404.html with a 404 status for the rest.
// Usage: npm run build && node scripts/pages.mjs [port]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const DIST = join(import.meta.dirname, '../dist')
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2' }
const isFile = (p) => stat(p).then((s) => s.isFile(), () => false)

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  const send = async (file, status = 200) => res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(await readFile(file))
  const file = join(DIST, path)
  if (path.endsWith('/')) return (await isFile(join(file, 'index.html'))) ? send(join(file, 'index.html')) : send(join(DIST, '404.html'), 404)
  if (await isFile(file)) return send(file)
  if (await isFile(`${file}.html`)) return send(`${file}.html`)
  if (await isFile(join(file, 'index.html'))) return res.writeHead(301, { Location: `${path}/` }).end()
  send(join(DIST, '404.html'), 404)
}).listen(Number(process.argv[2] ?? 4173), () => console.log(`dist/ on http://localhost:${process.argv[2] ?? 4173}`))
