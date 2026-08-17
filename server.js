/* ══════════════════════════════════════════════════════════════════════════
   THE STATIC SERVER. Zero dependencies, on purpose.

   This project used to declare `live-server` in devDependencies and launch
   with it. That works on a machine where `npm install` has been run and
   nowhere else: Targz Launchpad does not install anything, it spawns
   `sh -c "<dev script>"` with node_modules/.bin prepended to PATH. With no
   node_modules the shell answers "command not found", the process dies in
   milliseconds, and startProject returns {ok:true} regardless and opens a
   dead page. A checkout with no install step cannot fail that way.

   PORT PRECEDENCE, in the order the launcher needs it:
     1. --port <n> or --port=<n>   the launcher rewrites the flag to the =
                                   spelling when it assigns a port, so both
                                   spellings have to work
     2. PORT                       set in the spawned env alongside the flag
     3. DEFAULT_PORT               what it is when a human runs npm run dev
   ══════════════════════════════════════════════════════════════════════════ */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT         = __dirname;
const DEFAULT_PORT = 2860;

/* THE LANDING PAGE. `/` is the one URL the launcher opens, and the home is now
   the root document, so there is nothing to redirect to and the directory
   branch serves it. Point this at a subfolder and `/` becomes a 302 to it
   rather than a silent rewrite, so the address bar keeps reading the page's
   real path. One line either way. */
const HOME = '/';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  /* A PAPER IS READ IN THE BROWSER. text/markdown makes Chrome download the
     file instead of showing it, which turns every link in the papers well into
     a download prompt. text/plain shows it. */
  '.md':   'text/plain; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
};

const port =
  (() => {
    const m = process.argv.join(' ').match(/--port[= ](\d+)/);
    if (m) return parseInt(m[1], 10);
    if (process.env.PORT) return parseInt(process.env.PORT, 10);
    return DEFAULT_PORT;
  })();

const send = (res, code, body, type = 'text/plain; charset=utf-8') => {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, '400 bad request');
  }

  /* HOME === '/' means the home already IS the root document, so there is
     nothing to redirect to and the directory branch below serves it. Guarding
     this is not defensive noise: the constant is one line and the day it moves
     to '/' an unguarded redirect points at itself. */
  if (urlPath === '/' && HOME !== '/') {
    res.writeHead(302, { Location: HOME });
    return res.end();
  }

  /* path.normalize collapses ../ before the prefix test, so a request for
     /../../.ssh/id_rsa resolves and then fails to start with ROOT. */
  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) return send(res, 403, '403 forbidden');

  fs.stat(file, (err, st) => {
    if (err) return send(res, 404, `404 ${urlPath}`);

    /* a directory is its index.html, and a directory URL without the trailing
       slash is redirected rather than served: relative hrefs inside the page
       resolve against the wrong parent otherwise */
    if (st.isDirectory()) {
      if (!urlPath.endsWith('/')) {
        res.writeHead(301, { Location: urlPath + '/' });
        return res.end();
      }
      const idx = path.join(file, 'index.html');
      if (!fs.existsSync(idx)) return send(res, 404, `404 no index in ${urlPath}`);
      return stream(res, idx);
    }
    stream(res, file);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`targz-design-system  http://localhost:${port}${HOME}`);
}).on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error(`port ${port} is already in use. Something else is on it, or a previous run did not exit.`);
    process.exit(1);
  }
  throw e;
});

function stream(res, file) {
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  fs.createReadStream(file)
    .on('error', () => { res.destroy(); })
    .pipe(res);
}
