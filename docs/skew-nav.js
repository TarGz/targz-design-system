/* ══════════════════════════════════════════════════════════════════════════
   THE NAV — one registry, one bar, every page.

   Loaded as the first thing inside <body> on all four documents. It writes
   the skip link, the scroll sentinel and the dock itself, so a page adds a
   nav by adding a script tag and nothing else. Adding a DOCUMENT is adding an
   entry to PAGES below: the bar and the home's card grid both read it, which
   is what stops the two from disagreeing about what exists.

   Scoped in an IIFE because skew-kit.js owns `el`, `svg` and `ICON` at
   the window level and this file loads before it.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── THE REGISTRY ─────────────────────────────────────────────────────────
     `nav` is the legend on the key. `no` and `line` are read by the home's
     cards; the bar ignores them.

     `kick` AND `parts` ARE READ BY NOBODY, and are kept rather than deleted.
     The cards carried both until the previews replaced them — a kick line over
     a description over a wrapped list of part names was the same claim in three
     registers, and the list was the table of contents rendered as confetti.
     They stay because they are accurate, they cost nothing, and the day a card
     wants a subtitle again the words are already written and already true. */
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
      /* AND NOT IN THE BAR EITHER. The wordmark is the way home — every site
         with a logo in the corner has taught that for thirty years — so a HOME
         key beside it is the same door twice, and the one that costs a slot in
         a bar that has to fit on a phone. `inGrid` was already here for the
         home's own card grid; this is the same idea for the other reader. */
      inBar: false,
    },
    {
      file: 'skew-system.html',
      nav:  'SYSTEM',
      name: 'SYSTEM',
      no:   '00',
      kick: 'the language',
      line: 'The <b>parts</b>, and the rules that make them one language.',
      parts: ['factories', 'surfaces', 'tokens', 'primitives', 'knob layouts', 'toggle',
              'interlock', 'nav bar', 'app dock', 'settings', 'the room', 'traps'],
    },
    {
      file: 'skew-panels.html',
      nav:  'PANELS',
      name: 'PANELS',
      no:   '01',
      kick: 'exploration 01 · an app',
      line: 'The <b>drawing</b> side. Portrait-Typo rebuilt as hardware, down to a hatch bay that '
          + 'plots in real millimetres.',
      parts: ['layer dock', 'layer editor', 'viewport', 'hatch bay',
              'windows', 'launchpad'],
    },
    {
      file: 'skew-machine.html',
      nav:  'MACHINE',
      name: 'MACHINE',
      no:   '02',
      kick: 'exploration 02 · an app',
      line: 'The <b>machine</b> side. TargzPenPlotterCtrl rebuilt, jog by keys against jog by '
          + 'stick.',
      parts: ['DRO', 'jog', 'pen bank', 'guard', 'e-stop', 'annunciator', 'meter', 'tape'],
    },
    /* NOT AN EXPLORATION, WHICH IS WHY IT HAS NO `exploration NN` KICKER. The
       other three pages are a language and two apps drawn in it; this is the
       one piece of the language that is an ENGINE, and the only one meant to
       keep growing. It is `src/skew-hatch.js` plus the argument for it. */
    {
      file: 'skew-hatch.html',
      nav:  'HATCH',
      name: 'HATCH',
      no:   '03',
      kick: 'the engine',
      line: 'The <b>fill</b> engine. One contract, three layers, and two specimens at 1:1 — '
          + 'what is on screen is what a pen would put on paper, at size.',
      parts: ['the contract', 'KIT', 'HANDS', 'HATCH', 'by hand', 'by machine',
              'the API', 'growing it'],
    },
  ];

  /* NOT A PAGE, AND NOT A DESTINATION. The old light-palette document is
     discontinued: Skew replaces it. It stays reachable because deleting the
     thing a decision was made against loses the decision, but it is a line at
     the foot of the home and never a key on the bar. */
  const ARCHIVE = {
    file: '../old/index.html',
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

  /* ── THE PRESS IS THE CLICK, ON EVERY PAGE OF THE SITE ────────────────────
     A DUPLICATE, AND THE COMMENT IS THE POINT OF IT. `pressFix` lives in
     skew-kit.js and installs itself, which covers an adopting app and covers
     SYSTEM, HATCH and MACHINE. It does NOT cover index.html or skew-panels.html
     — those two carry their own inline copies of `el` and `pkey` and never load
     the kit at all. This file is on all five pages, so it is the only place a
     site-wide rule can go.

     The flag is shared with the kit's copy, so whichever loads first wins and
     the second one does nothing. If those two pages are ever made to load the
     kit properly, this block deletes and nothing else changes. The kit's
     version is the canonical one — read the reasoning there, not here. */
  if (!document.__skewPressFix) {
    document.__skewPressFix = true;
    const SEL  = '.key, .pkey, .chip, .sw, .chev, .menu-row, .tab-demo, .act';
    const SLOP = 12;
    let armed = null, fired = false;
    document.addEventListener('pointerdown', e => {
      if (e.button) return;
      const t = e.target.closest && e.target.closest(SEL);
      if (!t || t.disabled) return;
      armed = t; fired = false;
      try { t.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    }, true);
    document.addEventListener('click', e => {
      if (armed && (e.target === armed || armed.contains(e.target))) fired = true;
    }, true);
    document.addEventListener('pointerup', e => {
      const t = armed;
      if (!t) return;
      const r = t.getBoundingClientRect();
      if (e.clientX < r.left - SLOP || e.clientX > r.right  + SLOP
       || e.clientY < r.top  - SLOP || e.clientY > r.bottom + SLOP) { armed = null; return; }
      /* disarmed in the timeout, not here — see the kit's copy for why */
      setTimeout(() => { if (!fired) t.click(); if (armed === t) armed = null; });
    }, true);
    document.addEventListener('pointercancel', () => { armed = null; }, true);
  }

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
  /* THE ROWS ARE THE PAGE'S OWN HEADINGS, so the menu cannot disagree with
     what is on the page — the same rule the fold below uses for a spec table's
     label. `<h2>09 <span>/</span> The app dock</h2>` is a number and a name in
     one node; the number is the chip on the right of the row, where a menu
     puts a shortcut, because that is what you actually aim at when you know
     the page. An id is written only if the heading has none, so a hand-written
     anchor already in the markup keeps working and keeps its name. */
  function sectionsKey() {
    const GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" '
                + 'stroke="currentColor" stroke-width="1.7" stroke-linecap="round">'
                + '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/>'
                + '<line x1="9" y1="18" x2="20" y2="18"/><line x1="4" y1="6" x2="4.01" y2="6"/>'
                + '<line x1="4" y1="12" x2="4.01" y2="12"/><line x1="4" y1="18" x2="4.01" y2="18"/></svg>';

    const b = mk('button', 'key skirt nav-sections', GLYPH);
    b.type = 'button';
    b.title = 'Sections';
    b.setAttribute('aria-label', 'Sections');
    b.setAttribute('aria-haspopup', 'menu');
    b.setAttribute('aria-expanded', 'false');

    let plate = null;

    const shut = () => {
      if (!plate) return;
      plate.remove(); plate = null;
      b.classList.remove('is-down');
      b.setAttribute('aria-expanded', 'false');
      removeEventListener('resize', place, true);
      removeEventListener('scroll', place, true);
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', onKey, true);
    };
    const outside = e => {
      if (!plate.contains(e.target) && !b.contains(e.target)) shut();
    };

    /* THE WALK IS ARROWS, and Escape puts the focus back on the key that
       opened it — a menu you can only reach with a pointer is a menu the
       keyboard has to scroll past twelve sections to get around. */
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); shut(); b.focus(); return; }
      const d = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (d === undefined) { if (e.key === 'Tab') shut(); return; }
      e.preventDefault();
      const rows = [...plate.querySelectorAll('.menu-row')];
      const at = rows.indexOf(document.activeElement);
      rows[at < 0 ? (d > 0 ? 0 : rows.length - 1)
                  : (at + d + rows.length) % rows.length].focus();
    };

    /* IT HANGS DOWN, because this bar is at the TOP of the window — the app
       dock's plates open upward for the mirror of this reason. Clamped to the
       window rather than clipped by it, and re-placed on resize and scroll
       because the bar is sticky and the plate is not inside it. */
    function place() {
      if (!plate) return;
      const a = b.getBoundingClientRect(), p = plate.getBoundingClientRect();
      let x = a.left + a.width / 2 - p.width / 2;
      x = Math.max(8, Math.min(x, innerWidth - p.width - 8));
      plate.style.left = x + 'px';
      plate.style.top  = (a.bottom + 11) + 'px';
    }

    b.addEventListener('click', () => {
      if (plate) { shut(); return; }

      const heads = [...document.querySelectorAll('main h2, .wrap h2')];
      if (!heads.length) return;

      const body = mk('div', 'plate-body');
      body.setAttribute('role', 'menu');

      heads.forEach((h, i) => {
        if (!h.id) h.id = 'sec-' + (i + 1);
        /* THE NUMBER IS THE `<span>`'S NEIGHBOUR, not a slice of the text: the
           heading is `NN <span>/</span> Name`, so the parts are already
           separated and pulling them apart with a regex would invent a format
           the markup does not have. */
        const parts = h.textContent.split('/');
        const no    = parts.length > 1 ? parts[0].trim() : '';
        const name  = (parts.length > 1 ? parts.slice(1).join('/') : h.textContent).trim();

        const r = mk('button', 'menu-row');
        r.type = 'button';
        r.setAttribute('role', 'menuitem');
        r.append(mk('span', 'menu-nm', name));
        if (no) r.append(mk('kbd', 'menu-kbd', no));
        r.addEventListener('click', () => {
          shut();
          h.scrollIntoView({ behavior: 'smooth', block: 'start' });
          /* FOCUS FOLLOWS THE SCROLL, or a keyboard user lands at the top of a
             document they just navigated away from. `tabindex="-1"` makes a
             heading focusable without putting it in the tab order. */
          h.tabIndex = -1;
          h.focus({ preventScroll: true });
        });
        body.append(r);
      });

      plate = mk('div', 'plate menu nav-sections-menu');
      plate.append(body);
      document.body.append(plate);
      place();

      b.classList.add('is-down');
      b.setAttribute('aria-expanded', 'true');
      addEventListener('resize', place, true);
      addEventListener('scroll', place, true);
      setTimeout(() => document.addEventListener('pointerdown', outside, true));
      document.addEventListener('keydown', onKey, true);
      body.querySelector('.menu-row').focus();
    });

    return b;
  }

  function navBar({ current = HERE, dock = true, mode = 'doc',
                    items = PAGES, onSelect } = {}) {
    const strip = mk('div', 'strip nav-strip');
    /* THE WORDMARK IS THE WAY HOME, and it is an ANCHOR when it is one — same
       rule as the keys beside it: no click handler, no location assignment, so
       middle-click, cmd-click, the status bar preview and copy-link all keep
       working. On the home page itself it is a span, because a link to where
       you already are is a link that lies about what it will do. */
    const home = items.find(p => p.file === 'index.html');
    const atHome = HERE === 'index.html';
    const mark = mk(home && !atHome ? 'a' : 'span', 'demo-etch nav-mark', 'SKEW');
    if (home && !atHome) { mark.href = home.file; mark.title = 'Skew — home'; }
    else if (atHome) mark.setAttribute('aria-current', 'page');
    strip.append(mark, mk('span', 'chan'));

    const bar = mk('div', 'piano nav-pages');
    const view = mode === 'view';
    const keys = [];

    /* FILTERED ONCE, INTO A LOCAL, and `select` reads THAT. Filtering inline
       and leaving `select` to index the original `items` works only for as long
       as nobody sets `inBar` on a view-mode entry — and then the key that
       lights and the item handed to `onSelect` are two different rows, silently.
       One list, one set of indices. */
    const list = items.filter(p => p.inBar !== false);
    list.forEach((p, i) => {
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
      onSelect?.(n, list[n]);
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

    /* ── THE SECTIONS KEY ─────────────────────────────────────────────────
       THE BAR CARRIES DOCUMENTS AND A PAGE IS TWELVE OF THEM. Four keys get
       you to SYSTEM; nothing gets you to SYSTEM 09 but a scroll, and these
       pages are long enough that the scroll is the whole cost of looking
       something up. This is the way in.

       IT IS A DOOR AND NOT A DESTINATION, which is why it is a `.key` with a
       plate and not a fifth `.pkey` on the bar beside them. §08's rule holds:
       the piano is the list of documents, and a key that opens a list of
       PLACES INSIDE the current one is a different kind of thing. It sits
       right of the channel with the readout, because that side of a bar is
       the tools.

       NOT ON HOME, and not on the view-mode specimen. Home is one screen with
       a card grid on it — a contents menu for a page you can already see all
       of is a door onto the room you are standing in. The specimen is a
       picture of a bar and must not grow a control the real one has.

       THE LIST IS READ WHEN IT OPENS, NEVER CACHED. This script runs as the
       first node in <body>, so at build time the page's own headings do not
       exist yet — and a list harvested once would be wrong for any page that
       writes a section later. Reading on open costs one `querySelectorAll`
       against a click and cannot go stale.

       A LOCAL PLATE, and the duplication is the same one `pressFix` carries
       for the same reason: `openPlate` is in skew-kit.js, and skew-panels.html
       never loads it. Chrome that is on every page cannot depend on a file
       that is on three of them. */
    const isHome = current === 'index.html';
    /* ONE CHANNEL, NOT TWO. The key and the readout are both on the tools side
       of the split the bar already has — the same arrangement §09's dock uses,
       where everything right of its single channel is the workspace. */
    if (!view && !isHome) strip.append(sectionsKey());

    const ver = mk('div', 'lcd nav-ver dim', 'v—');
    strip.append(ver);

    /* THE VERSION IS READ, NOT TYPED. A number written into two files drifts
       on the first commit that only remembers one of them. Dynamic import, so
       a failure is a dim window rather than a dead script. */
    import('../version.js')
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

  /* ── FOLD THE DETAIL ──────────────────────────────────────────────────────
     EVERY SPEC TABLE GOES BEHIND A CHEVRON, SHUT. The pages are specimens
     first: the argument for a part is the part, live, at its real size, and a
     four-row table of prose underneath is the thing you read once and scroll
     past forever after. Folded, a section is its heading and its specimens,
     and the reference is one click away for the day you need it.

     `<details>` DOES THE MECHANISM. It is a disclosure widget in the platform
     — keyboard, screen reader, Escape, find-in-page opening it to show a hit —
     and every hand-rolled version of it gets at least one of those wrong. All
     this adds is the metal: the summary wears the same knurled `.chev` the
     layer rows use, and `details[open]` turns it the same 90 degrees.

     THE LABEL IS THE TABLE'S OWN FIRST HEADING, so it cannot drift from what
     is inside. A table with no `thead` is a trap block, and says so. */
  document.addEventListener('DOMContentLoaded', () => {
    const CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true">'
               + '<polyline points="9 6 15 12 9 18"/></svg>';

    document.querySelectorAll('table.spec').forEach(table => {
      if (table.closest('details.detail')) return;

      const th   = table.querySelector('thead th');
      const trap = !th && table.querySelector('tr.trap');
      const name = th ? th.textContent.trim() : trap ? 'Traps' : 'Detail';
      const n    = table.querySelectorAll('tbody tr').length;

      const d = mk('details', 'detail');
      const sum = mk('summary', 'detail-tab');
      sum.innerHTML = `<span class="chev">${CHEV}</span>`
                    + `<span class="detail-nm">${name}</span>`
                    + `<span class="detail-n">${n}</span>`;

      table.replaceWith(d);
      d.append(sum, table);
    });
  });

  /* SEATED — one IntersectionObserver on a 1px sentinel, not a scroll
     listener: two callbacks in the life of the page instead of sixty a
     second. */
  new IntersectionObserver(
    ([e]) => dock.classList.toggle('seated', !e.isIntersecting),
    { threshold: 0 },
  ).observe(sentinel);
})();
