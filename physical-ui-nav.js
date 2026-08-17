/* ══════════════════════════════════════════════════════════════════════════
   THE NAV — one registry, one bar, every page.

   Loaded as the first thing inside <body> on all four documents. It writes
   the skip link, the scroll sentinel and the dock itself, so a page adds a
   nav by adding a script tag and nothing else. Adding a DOCUMENT is adding an
   entry to PAGES below: the bar and the home's card grid both read it, which
   is what stops the two from disagreeing about what exists.

   Scoped in an IIFE because physical-ui-kit.js owns `el`, `svg` and `ICON` at
   the window level and this file loads before it.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── THE REGISTRY ─────────────────────────────────────────────────────────
     `nav` is the legend on the key. `no`, `kick`, `line` and `parts` are only
     read by the home's cards; the bar ignores them. */
  const PAGES = [
    {
      file: 'index.html',
      nav:  'HOME',
      name: 'HOME',
      no:   '·',
      kick: 'this page',
      line: 'The door.',
      parts: ['registry'],
      inGrid: false,
    },
    {
      file: 'physical-ui-system.html',
      nav:  'SYSTEM',
      name: 'SYSTEM',
      no:   '00',
      kick: 'the language',
      line: 'The <b>parts</b>, and the rules that make them one language.',
      parts: ['tokens', 'the light', 'primitives', 'factories', 'nav bar', 'traps'],
    },
    {
      file: 'physical-ui-layers.html',
      nav:  'LAYERS',
      name: 'LAYERS',
      no:   '01',
      kick: 'exploration 01 · an app',
      line: 'The <b>drawing</b> side. Portrait-Typo rebuilt as hardware, down to a hatch bay that '
          + 'plots in real millimetres.',
      parts: ['layer dock', 'viewport', 'launchpad', 'hatch bay', 'drawer', 'windows'],
    },
    {
      file: 'physical-ui-machine.html',
      nav:  'MACHINE',
      name: 'MACHINE',
      no:   '02',
      kick: 'exploration 02 · an app',
      line: 'The <b>machine</b> side. TargzPenPlotterCtrl rebuilt, jog by keys against jog by '
          + 'stick.',
      parts: ['DRO', 'jog', 'pen bank', 'guard', 'e-stop', 'annunciator', 'meter', 'tape'],
    },
  ];

  /* NOT A PAGE, AND NOT A DESTINATION. The old light-palette document is
     discontinued: Skew replaces it. It stays reachable because deleting the
     thing a decision was made against loses the decision, but it is a line at
     the foot of the home and never a key on the bar. */
  const ARCHIVE = {
    file: 'old/index.html',
    name: 'targz Design System',
    line: 'discontinued · the light-palette document Skew replaces',
  };

  window.SKEW_PAGES   = PAGES;
  window.SKEW_ARCHIVE = ARCHIVE;

  const HERE = location.pathname.split('/').pop() || 'index.html';

  const mk = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ── THE BAR, IN TWO MODES ────────────────────────────────────────────────
     Same object, same metal, two different mechanisms underneath, and which
     one you get is decided by ONE question: is the thing behind a key a
     DOCUMENT or a VIEW of the page you are already on?

       mode:'doc'   loads documents. Anchors, aria-current, no tablist.
       mode:'view'  swaps a view inside one page. Buttons, a real tablist,
                    roving tabindex, and nothing navigates.

     Getting this backwards is the common bug in both directions: a router
     that fakes links with click handlers, or a single-page switcher that
     reloads the document to change a panel. */
  function navBar({ current = HERE, dock = true, mode = 'doc',
                    items = PAGES, onSelect } = {}) {
    const strip = mk('div', 'strip nav-strip');
    strip.append(mk('span', 'demo-etch nav-mark', 'SKEW'), mk('span', 'chan'));

    const bar = mk('div', 'piano nav-pages');
    const view = mode === 'view';
    const keys = [];

    items.forEach((p, i) => {
      const sel = view ? i === 0 : p.file === current;

      if (!view) {
        /* THE PAGE YOU ARE ON IS A SPAN. Everything else is an anchor and only
           an anchor: no click handler, no location assignment, so middle-click,
           cmd-click, the status bar preview and copy-link all keep working.
           .pkey is a look; the anchor is the mechanism. */
        const k = mk(sel ? 'span' : 'a', 'pkey nav-link' + (sel ? ' is-down' : ''), p.nav);
        if (sel) k.setAttribute('aria-current', 'page');
        else { k.href = p.file; k.title = p.name; }
        bar.append(k);
        return;
      }

      /* A VIEW SWITCHER IS A TABLIST, and here that is not a contradiction of
         the rule above but the other half of it: these keys reveal panels that
         are already in the document, so they are tabs and they get everything
         tabs get. No href, because there is nowhere to go. */
      const k = mk('button', 'pkey nav-link' + (sel ? ' is-down' : ''), p.nav);
      k.type = 'button';
      k.setAttribute('role', 'tab');
      k.setAttribute('aria-selected', String(sel));
      k.tabIndex = sel ? 0 : -1;          // roving: one stop for the whole bar
      k.addEventListener('click', () => select(i));
      keys.push(k);
      bar.append(k);
    });

    function select(n) {
      keys.forEach((k, i) => {
        const on = i === n;
        k.classList.toggle('is-down', on);
        k.setAttribute('aria-selected', String(on));
        k.tabIndex = on ? 0 : -1;
      });
      onSelect?.(n, items[n]);
    }

    if (view) {
      bar.setAttribute('role', 'tablist');
      /* ARROWS MOVE, because a tablist is one tab stop and the arrows are how
         you get around inside it. The doc mode deliberately has none of this:
         four links are four tab stops and that is already correct. */
      bar.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key];
        if (d === undefined) return;
        e.preventDefault();
        const at = keys.findIndex(k => k.tabIndex === 0);
        const to = d === -99 ? 0 : d === 99 ? keys.length - 1
                 : (at + d + keys.length) % keys.length;
        select(to);
        keys[to].focus();
      });
    }

    strip.append(bar, mk('span', 'chan'));

    const ver = mk('div', 'lcd nav-ver dim', 'v—');
    strip.append(ver);

    /* THE VERSION IS READ, NOT TYPED. A number written into two files drifts
       on the first commit that only remembers one of them. Dynamic import, so
       a failure is a dim window rather than a dead script. */
    import('./version.js')
      .then(m => { ver.textContent = 'v' + m.version; ver.classList.remove('dim'); })
      .catch(() => {});

    if (!dock) return strip;
    const nav = mk('nav', 'navdock');
    nav.setAttribute('aria-label', view ? 'Views' : 'Documents');
    nav.append(strip);
    return nav;
  }
  window.navBar = navBar;

  /* ── MOUNT ────────────────────────────────────────────────────────────────
     The script sits at the top of <body>, so body exists and everything goes
     in before the page's own markup. */
  const skip = mk('a', 'skip', 'Skip to content');
  skip.href = '#main';

  const sentinel = mk('div', 'nav-sentinel');
  const dock = navBar();

  document.body.prepend(skip, sentinel, dock);

  /* SEATED — one IntersectionObserver on a 1px sentinel, not a scroll
     listener: two callbacks in the life of the page instead of sixty a
     second. */
  new IntersectionObserver(
    ([e]) => dock.classList.toggle('seated', !e.isIntersecting),
    { threshold: 0 },
  ).observe(sentinel);
})();
