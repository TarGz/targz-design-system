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

/* ── WHERE A URL IS LOOKED FOR, AND WHY IT IS TWO PLACES ───────────────────
   The documentation site lives in docs/ and the language lives in src/, which
   is the layout every library of this shape uses. But the site is what `/`
   should serve, and a 302 to /docs/ would put a build directory in the address
   bar of the thing a reader was sent to look at.

   So a request is resolved against docs/ FIRST and the repo root SECOND. `/`
   and `/skew-system.html` come out of docs/; `/src/skew.css`, `/dist/skew.css`
   and `/HATCH-API.md` fall through to the root and are found there. The pages'
   own hrefs are ordinary relative paths either way — `../src/skew.css` from
   docs/ resolves to /src/skew.css, which the fallback serves.

   ORDER MATTERS AND ONLY IN ONE CASE: a name that exists in both. There is
   none today, and docs/ winning is the right answer if there ever is, because
   docs/ is what the site is. */
const ROOTS = [path.join(__dirname, 'docs'), __dirname];

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

  /* path.normalize collapses ../ before the prefix test, so a request for
     /../../.ssh/id_rsa resolves and then fails to start with ROOT. The guard
     is against ROOT rather than against each root in turn: docs/ is inside it,
     so one test covers both and cannot be passed by a path that climbs out of
     docs/ into the repo, which is allowed anyway. */
  const candidates = ROOTS
    .map(r => path.normalize(path.join(r, urlPath)))
    .filter(f => f.startsWith(ROOT));
  if (!candidates.length) return send(res, 403, '403 forbidden');

  const found = candidates.find(f => fs.existsSync(f));
  if (!found) return send(res, 404, `404 ${urlPath}`);

  fs.stat(found, (err, st) => {
    if (err) return send(res, 404, `404 ${urlPath}`);

    /* a directory is its index.html, and a directory URL without the trailing
       slash is redirected rather than served: relative hrefs inside the page
       resolve against the wrong parent otherwise. `/` is the exception and it
       is not a special case here — it already ends in a slash, so it falls
       straight through to docs/index.html. */
    if (st.isDirectory()) {
      if (!urlPath.endsWith('/')) {
        res.writeHead(301, { Location: urlPath + '/' });
        return res.end();
      }
      const idx = path.join(found, 'index.html');
      if (!fs.existsSync(idx)) return send(res, 404, `404 no index in ${urlPath}`);
      return stream(res, idx);
    }
    stream(res, found);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`targz-design-system  http://localhost:${port}/`);
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
