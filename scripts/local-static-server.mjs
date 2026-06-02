import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const rootArg = process.argv.find((arg) => arg.startsWith('--root='));
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const hostArg = process.argv.find((arg) => arg.startsWith('--host='));

const root = resolve(rootArg ? rootArg.slice('--root='.length) : process.cwd());
const preferredPort = Number(portArg ? portArg.slice('--port='.length) : process.env.PORT || 5173);
const host = hostArg ? hostArg.slice('--host='.length) : '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function insideRoot(filePath) {
  const relative = normalize(filePath).slice(root.length);
  return filePath === root || (relative.startsWith(sep) && !relative.includes(`..${sep}`));
}

function resolveRequest(url) {
  const parsed = new URL(url, 'http://localhost');
  const decodedPath = decodeURIComponent(parsed.pathname);
  let filePath = resolve(join(root, decodedPath));

  if (!insideRoot(filePath)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  return filePath;
}

function makeServer() {
  return createServer(async (req, res) => {
    const filePath = resolveRequest(req.url || '/');

    if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    try {
      await readFile(filePath);
      res.writeHead(200, {
        'content-type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store'
      });
      createReadStream(filePath).pipe(res);
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error instanceof Error ? error.message : String(error));
    }
  });
}

const backupPorts = [preferredPort, 3000, 4173, 8080, 8000, 9000, 0];
const uniquePorts = [...new Set(backupPorts.filter((port) => Number.isInteger(port) && port >= 0))];

for (const port of uniquePorts) {
  const server = makeServer();
  try {
    await new Promise((resolveListen, rejectListen) => {
      server.once('error', rejectListen);
      server.listen(port, host, resolveListen);
    });
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Serving ${root}`);
    console.log(`Local URL: http://${host}:${actualPort}/`);
    break;
  } catch (error) {
    server.close();
    if (error?.code !== 'EADDRINUSE' && error?.code !== 'EACCES') {
      throw error;
    }
  }
}

