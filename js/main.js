/* Beauty Finder — shared code used by every page. */
(function () {
  'use strict';

  var ROOT = document.documentElement.getAttribute('data-root') || './';
  var LANGS = {
    en: { name: 'English', dir: 'ltr' },
    ckb: { name: 'کوردی (سۆرانی)', dir: 'rtl' },
    kmr: { name: 'Kurdî (Kurmancî)', dir: 'ltr' },
    ar: { name: 'العربية', dir: 'rtl' }
  };

  /* ---------- storage (falls back to memory if the browser blocks it) ---------- */
  var memory = {};
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return key in memory ? memory[key] : fallback; }
    },
    set: function (key, value) {
      memory[key] = value;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  /* ---------- language ---------- */
  var lang = document.documentElement.lang;
  if (!LANGS[lang]) lang = 'en';
  var dict = window.BF_I18N[lang];

  function t(key, vars) {
    var s = dict[key];
    if (key === 'p.results' && vars && vars.n === 1 && dict['p.result1']) s = dict['p.result1'];
    if (s === undefined) s = window.BF_I18N.en[key];
    if (s === undefined) return key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function tr(obj) { return !obj ? '' : typeof obj === 'string' ? obj : (obj[lang] || obj.en || ''); }
  function setLang(code) {
    try { localStorage.setItem('bf-lang', code); } catch (e) { /* ignore */ }
    location.reload();
  }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function page(name) { return ROOT + (name === 'home' ? 'index.html' : 'pages/' + name + '.html'); }
  function money(n) { return '<span dir="ltr" class="money">$' + (n % 1 ? Number(n).toFixed(2) : n) + '</span>'; }
  var SITES = { 'amazon.com': 'Amazon', 'ulta.com': 'Ulta', 'dermstore': 'Dermstore', 'sephora.com': 'Sephora' };
  var TINTS = { skincare: '#F4B6CC', makeup: '#F3C1A5', haircare: '#C9B8E8' };
  function norm(s) { return String(s).toLowerCase().trim(); }
  function param(name) { return new URLSearchParams(location.search).get(name); }

  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3"/><path d="M7.5 15h9"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.4 4.5 6.9 4.5c2 0 3.6 1 5.1 2.9 1.5-1.9 3.100-2.900 5.100-2.900 3.500 0 5.500 3.400 4.200 6.800-1.800 4.600-9.300 9.200-9.300 9.200z"/>',
    scale: '<path d="M12 3v18"/><path d="M7 21h10"/><path d="M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0z"/>',
    sparkles: '<path d="M10 3l1.8 5.2L17 10l-5.200 1.800L10 17l-1.800-5.200L3 10l5.200-1.800z"/><path d="M18 14l.9 2.100 2.100.900-2.100.900L18 20l-.900-2.100-2.100-.900 2.100-.900z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.500v.500"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.500"/><path d="m3.500 7 8.500 6.500L20.500 7"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.500 3 14.500 0 18"/><path d="M12 3c-3 3.500-3 14.500 0 18"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    check: '<path d="m5 12.500 4.500 4.500L19 7.500"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
    star: '<path d="M12 3.500l2.600 5.400 5.900.800-4.300 4.100 1.100 5.800L12 16.800l-5.300 2.800 1.100-5.800-4.300-4.100 5.900-.800z"/>',
    flower: '<circle cx="12" cy="8" r="2.200"/><circle cx="8.500" cy="6" r="2.200"/><circle cx="15.500" cy="6" r="2.200"/><circle cx="9.800" cy="10.500" r="2.200"/><circle cx="14.200" cy="10.500" r="2.200"/><path d="M12 13v8"/><path d="M12 18c-2 0-4-1.200-4.500-3.500 2.300 0 4 1 4.500 3.500z"/><path d="M12 18c2 0 4-1.200 4.500-3.500-2.300 0-4 1-4.500 3.500z"/>'
  };
  function icon(name, cls) {
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.700" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function stars(r) {
    return '<span class="rating" dir="ltr">' + icon('star', 'star') + '<b>' + Number(r).toFixed(1) + '</b></span>';
  }

  /* ---------- product photo (falls back to a drawn placeholder if it cannot load) ---------- */
  var PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#FCE4EC"/>' +
    '<rect x="88" y="42" width="24" height="26" rx="5" fill="#E879A5"/><rect x="70" y="66" width="60" height="96" rx="14" fill="#F4B6CC"/>' +
    '<rect x="82" y="96" width="36" height="30" rx="4" fill="#fff" opacity=".7"/></svg>');
  function art(p) {
    return '<img class="product-img" src="' + ROOT + 'images/products/' + p.id + '.webp" alt="' + esc(p.brandName + ' ' + p.name) +
      '" width="480" height="480" loading="lazy" decoding="async">';
  }
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el.tagName === 'IMG' && el.classList.contains('product-img') && el.src !== PLACEHOLDER) el.src = PLACEHOLDER;
  }, true);

  /* ---------- favorites and comparison lists ---------- */
  function makeList(key, max) {
    return {
      list: function () { return store.get(key, []); },
      has: function (id) { return this.list().indexOf(id) !== -1; },
      add: function (id) {
        var l = this.list();
        if (l.indexOf(id) !== -1) return 'exists';
        if (max && l.length >= max) return 'full';
        l.push(id); store.set(key, l); return 'added';
      },
      remove: function (id) { store.set(key, this.list().filter(function (x) { return x !== id; })); },
      set: function (ids) { store.set(key, ids); },
      clear: function () { store.set(key, []); }
    };
  }
  var favs = makeList('bf-favs');
  var cmp = makeList('bf-compare', 4);

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------- data ---------- */
  var data = null;
  function load() {
    function get(name) {
      return fetch(ROOT + 'data/' + name + '.json').then(function (r) {
        if (!r.ok) throw new Error(name);
        return r.json();
      });
    }
    return Promise.all([get('products'), get('ingredients'), get('brands')]).then(function (r) {
      var d = { products: r[0], ingredients: r[1], brands: r[2], brandById: {}, ingById: {}, productById: {} };
      d.brands.forEach(function (b) { d.brandById[b.id] = b; });
      d.ingredients.forEach(function (i) { d.ingById[i.id] = i; });
      d.products.forEach(function (p) {
        d.productById[p.id] = p;
        p.brandName = d.brandById[p.brand] ? d.brandById[p.brand].name : p.brand;
        p.tint = TINTS[p.cat] || '#F4B6CC';
        // everything a search should match, in every language
        var words = [p.name, p.brandName, SITES[p.site] || ''];
        Object.keys(LANGS).forEach(function (l) {
          var D = window.BF_I18N[l];
          words.push(D['type.' + p.type], D['cat.' + p.cat]);
          p.tags.forEach(function (tg) { words.push(D['tag.' + tg]); });
        });
        p.ingredients.forEach(function (id) {
          var ing = d.ingById[id];
          if (ing) { Object.keys(ing.name).forEach(function (l) { words.push(ing.name[l]); }); words.push(ing.aka); }
        });
        p.hay = norm(words.join(' | '));
      });
      data = d;
      return d;
    });
  }

  /* ---------- product card ---------- */
  function card(p) {
    var isFav = favs.has(p.id), inCmp = cmp.has(p.id), href = page('product') + '?id=' + p.id;
    return '<article class="card reveal">' +
      '<a class="card-art" href="' + href + '" style="--tint:' + p.tint + '" tabindex="-1" aria-hidden="true">' + art(p) + '</a>' +
      '<button class="icon-btn fav' + (isFav ? ' on' : '') + '" data-fav="' + p.id + '" aria-pressed="' + isFav + '" aria-label="' +
        esc(t(isFav ? 'card.unfav' : 'card.fav')) + '">' + icon('heart') + '</button>' +
      '<div class="card-body">' +
        '<span class="card-brand">' + esc(p.brandName) + '</span>' +
        '<h3 class="card-name"><a href="' + href + '">' + esc(p.name) + '</a></h3>' +
        '<span class="card-type">' + esc(t('type.' + p.type)) + (p.size ? ' · <span dir="ltr">' + esc(p.size) + '</span>' : '') + '</span>' +
        '<div class="card-foot"><span class="price">' + money(p.price) + '</span></div>' +
        '<button class="btn btn-soft btn-sm cmp' + (inCmp ? ' on' : '') + '" data-cmp="' + p.id + '" aria-pressed="' + inCmp + '">' +
          icon(inCmp ? 'check' : 'scale') + '<span>' + esc(t(inCmp ? 'card.inCmp' : 'card.cmp')) + '</span></button>' +
      '</div></article>';
  }

  function syncButtons() {
    document.querySelectorAll('[data-fav]').forEach(function (b) {
      var on = favs.has(b.getAttribute('data-fav'));
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      if (b.classList.contains('icon-btn')) b.setAttribute('aria-label', t(on ? 'card.unfav' : 'card.fav'));
      var lbl = b.querySelector('[data-label]');
      if (lbl) lbl.textContent = t(on ? 'd.inFav' : 'd.addFav');
    });
    document.querySelectorAll('[data-cmp]').forEach(function (b) {
      var on = cmp.has(b.getAttribute('data-cmp'));
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      var sp = b.querySelector('span');
      if (sp) sp.textContent = t(b.hasAttribute('data-long') ? (on ? 'd.inCmp' : 'd.addCmp') : (on ? 'card.inCmp' : 'card.cmp'));
      var ic = b.querySelector('svg');
      if (ic) ic.outerHTML = icon(on ? 'check' : 'scale');
    });
    var fc = document.getElementById('fav-count'), cc = document.getElementById('cmp-count');
    if (fc) { fc.textContent = favs.list().length; fc.hidden = !favs.list().length; }
    if (cc) { cc.textContent = cmp.list().length; cc.hidden = !cmp.list().length; }
  }

  document.addEventListener('click', function (e) {
    var f = e.target.closest('[data-fav]'), c = e.target.closest('[data-cmp]');
    if (f) {
      var id = f.getAttribute('data-fav');
      if (favs.has(id)) { favs.remove(id); toast(t('toast.favRemoved')); }
      else { favs.add(id); toast(t('toast.favAdded')); }
      syncButtons();
      document.dispatchEvent(new CustomEvent('bf:favs'));
    } else if (c) {
      var cid = c.getAttribute('data-cmp');
      if (cmp.has(cid)) { cmp.remove(cid); toast(t('toast.cmpRemoved')); }
      else { toast(t(cmp.add(cid) === 'full' ? 'toast.cmpFull' : 'toast.cmpAdded')); }
      syncButtons();
      document.dispatchEvent(new CustomEvent('bf:cmp'));
    }
  });

  /* ---------- header and footer ---------- */
  var NAV = [
    ['home', 'home'], ['products', 'search'], ['ingredients', 'flask'], ['compare', 'scale'],
    ['quiz', 'sparkles'], ['favorites', 'heart'], ['about', 'info'], ['contact', 'mail']
  ];

  function renderChrome() {
    var current = document.body.getAttribute('data-page');
    var links = NAV.map(function (n) {
      var badge = n[0] === 'favorites' ? '<span class="count" id="fav-count" hidden></span>' :
        n[0] === 'compare' ? '<span class="count" id="cmp-count" hidden></span>' : '';
      return '<a href="' + page(n[0]) + '"' + (current === n[0] ? ' class="active" aria-current="page"' : '') + '>' +
        icon(n[1]) + '<span>' + esc(t('nav.' + n[0])) + '</span>' + badge + '</a>';
    }).join('');
    var options = Object.keys(LANGS).map(function (code) {
      return '<option value="' + code + '"' + (code === lang ? ' selected' : '') + '>' + LANGS[code].name + '</option>';
    }).join('');

    var header = document.getElementById('site-header');
    header.innerHTML =
      '<div class="container header-row">' +
        '<a class="logo" href="' + page('home') + '">' + icon('flower') + '<span>BEAUTY FINDER</span></a>' +
        '<nav class="nav" id="nav" aria-label="' + esc(t('nav.menu')) + '">' + links + '</nav>' +
        '<div class="header-tools">' +
          '<label class="lang">' + icon('globe') + '<span class="sr-only">' + esc(t('lang.label')) + '</span>' +
            '<select id="lang-select">' + options + '</select></label>' +
          '<button class="icon-btn burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="' + esc(t('nav.menu')) + '">' + icon('menu') + '</button>' +
        '</div>' +
      '</div>';

    document.getElementById('lang-select').addEventListener('change', function () { setLang(this.value); });
    var burger = document.getElementById('burger'), nav = document.getElementById('nav');
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.innerHTML = icon(open ? 'x' : 'menu');
    });
    window.addEventListener('scroll', function () { header.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });

    var half = function (items) {
      return items.map(function (n) { return '<a href="' + page(n[0]) + '">' + esc(t('nav.' + n[0])) + '</a>'; }).join('');
    };
    document.getElementById('site-footer').innerHTML =
      '<div class="container footer-grid">' +
        '<div><a class="logo" href="' + page('home') + '">' + icon('flower') + '<span>BEAUTY FINDER</span></a>' +
          '<p class="footer-tag">' + esc(t('tagline')) + '</p><p>' + esc(t('foot.text')) + '</p></div>' +
        '<div><h4>' + esc(t('foot.explore')) + '</h4>' + half(NAV.slice(1, 5)) + '</div>' +
        '<div><h4>' + esc(t('foot.more')) + '</h4>' + half(NAV.slice(5)) + '</div>' +
      '</div>' +
      '<div class="container footer-note"><span>' + esc(t('foot.note')) + '</span><span class="credit">' + esc(t('foot.credit')) + '</span></div>';

    // fill in static text marked up in the HTML
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
    document.querySelectorAll('[data-icon]').forEach(function (el) { el.innerHTML = icon(el.getAttribute('data-icon')); });
    document.querySelectorAll('a[data-page]').forEach(function (el) { el.setAttribute('href', page(el.getAttribute('data-page'))); });
    syncButtons();
  }

  /* ---------- reveal on scroll ---------- */
  var observer = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); observer.unobserve(en.target); }
    });
  }, { threshold: 0.080 }) : null;
  function reveal(scope) {
    (scope || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      if (observer) observer.observe(el); else el.classList.add('in');
    });
  }

  /* ---------- page start ---------- */
  // The header, footer and static text never depend on the page's own script,
  // so a page still looks right even if that script fails to load.
  var chromeDone = false, pageStarted = false;
  function chrome() { if (!chromeDone) { chromeDone = true; renderChrome(); reveal(); } }
  function showError() {
    var main = document.querySelector('main');
    main.innerHTML = '<section class="section"><div class="container"><div class="empty">' + icon('info') +
      '<h2>' + esc(t('err.db')) + '</h2><button class="btn" onclick="location.reload()">' + esc(t('err.retry')) + '</button></div></div></section>';
  }
  function ready(fn) {
    pageStarted = true;
    function start() {
      chrome();
      load().then(function (d) {
        fn(d);
        syncButtons();
        reveal();
      }).catch(function (err) {
        if (window.console) console.error(err);
        showError();
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chrome); else chrome();
  window.addEventListener('load', function () {
    setTimeout(function () { if (!pageStarted) { chrome(); showError(); } }, 600);
  });

  window.BF = {
    root: ROOT, lang: lang, langs: LANGS, t: t, tr: tr, esc: esc, page: page, money: money, norm: norm, param: param,
    icon: icon, stars: stars, sites: SITES, art: art, card: card, favs: favs, cmp: cmp, store: store, toast: toast,
    ready: ready, reveal: reveal, sync: syncButtons, data: function () { return data; }
  };
})();
