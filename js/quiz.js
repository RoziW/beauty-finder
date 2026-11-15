/* Beauty quiz: four questions, then matching products */
BF.ready(function (d) {
  var t = BF.t, esc = BF.esc, root = document.getElementById('quiz');
  var CATS = ['skincare', 'makeup', 'haircare'];
  var BUDGETS = [['b1', 15], ['b2', 30], ['b3', 50], ['b4', Infinity]];
  var TOTAL = 4, step = 1;
  var answers = { cat: null, prefs: [], budget: null, brand: null };

  function inCat() { return d.products.filter(function (p) { return p.cat === answers.cat; }); }

  function option(attr, value, label, on, extra) {
    return '<button type="button" class="q-option' + (on ? ' on' : '') + '" ' + attr + '="' + value + '" aria-pressed="' + on + '">' +
      (extra || '') + '<span>' + label + '</span>' + BF.icon('check', 'tick') + '</button>';
  }

  function question() {
    var title, hint = '', body = '';
    if (step === 1) {
      title = t('q.q1');
      body = CATS.map(function (c) {
        return option('data-cat', c, esc(t('cat.' + c)), answers.cat === c,
          '<img src="' + BF.root + 'images/' + c + '.jpg" alt="">');
      }).join('');
    } else if (step === 2) {
      title = t('q.q2'); hint = t('q.q2hint');
      var tags = [];
      inCat().forEach(function (p) { p.tags.forEach(function (g) { if (tags.indexOf(g) === -1) tags.push(g); }); });
      body = tags.map(function (g) { return option('data-pref', g, esc(t('tag.' + g)), answers.prefs.indexOf(g) !== -1); }).join('');
    } else if (step === 3) {
      title = t('q.q3');
      body = BUDGETS.map(function (b) { return option('data-budget', b[0], esc(t('q.' + b[0])), answers.budget === b[0]); }).join('');
    } else {
      title = t('q.q4');
      var brands = d.brands.map(function (b) {
        return { id: b.id, name: b.name, n: inCat().filter(function (p) { return p.brand === b.id; }).length };
      }).filter(function (b) { return b.n; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 9);
      body = option('data-brand', 'any', esc(t('q.anyBrand')), answers.brand === 'any') +
        brands.map(function (b) { return option('data-brand', b.id, esc(b.name), answers.brand === b.id); }).join('');
    }
    root.innerHTML =
      '<div class="q-card">' +
        '<div class="q-progress"><span style="width:' + (step / TOTAL * 100) + '%"></span></div>' +
        '<p class="q-step">' + esc(t('q.step', { n: step, t: TOTAL })) + '</p>' +
        '<h2>' + esc(title) + '</h2>' + (hint ? '<p class="muted">' + esc(hint) + '</p>' : '') +
        '<div class="q-options' + (step === 1 ? ' photos' : '') + '">' + body + '</div>' +
        '<div class="q-nav">' +
          (step > 1 ? '<button class="btn btn-outline" id="q-back">' + esc(t('q.back')) + '</button>' : '<span></span>') +
          '<button class="btn" id="q-next">' + esc(t(step === TOTAL ? 'q.see' : 'q.next')) + '</button>' +
        '</div>' +
      '</div>';
  }

  function score(p, limit) {
    var prefPart = answers.prefs.length ?
      answers.prefs.filter(function (g) { return p.tags.indexOf(g) !== -1; }).length / answers.prefs.length : 1;
    var budgetPart = p.price <= limit ? 1 : Math.max(0, 1 - (p.price - limit) / limit);
    var brandPart = answers.brand === 'any' || p.brand === answers.brand ? 1 : 0;
    return Math.round(prefPart * 55 + budgetPart * 30 + brandPart * 15);
  }

  function results() {
    var limit = BUDGETS.filter(function (b) { return b[0] === answers.budget; })[0][1];
    var scored = inCat().map(function (p) { return { p: p, s: score(p, limit) }; })
      .sort(function (a, b) { return b.s - a.s || a.p.price - b.p.price; });
    var exact = scored.filter(function (x) { return x.s === 100; });
    var list = exact.length ? exact.slice(0, 12) : scored.slice(0, 8);
    root.innerHTML =
      '<div class="q-results">' +
        '<h2 class="section-title">' + esc(t(exact.length ? 'q.results' : 'q.noExact')) + '</h2>' +
        '<p class="section-sub">' + esc(t(exact.length ? 'q.resultsSub' : 'q.alt')) + '</p>' +
        '<div class="grid">' + list.map(function (x) {
          return BF.card(x.p).replace('<div class="card-body">', '<div class="card-body"><span class="match">' + esc(t('q.match', { n: x.s })) + '</span>');
        }).join('') + '</div>' +
        '<div class="center"><button class="btn btn-outline" id="q-retake">' + esc(t('q.retake')) + '</button> ' +
        '<a class="btn" href="' + BF.page('compare') + '">' + BF.icon('scale') + esc(t('nav.compare')) + '</a></div>' +
      '</div>';
    BF.reveal(root); BF.sync();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-cat]'), g = e.target.closest('[data-pref]'),
      b = e.target.closest('[data-budget]'), br = e.target.closest('[data-brand]');
    if (c && !c.hasAttribute('data-cmp')) {
      if (answers.cat !== c.getAttribute('data-cat')) { answers.prefs = []; answers.brand = null; }
      answers.cat = c.getAttribute('data-cat'); question();
    } else if (g) {
      var tag = g.getAttribute('data-pref'), i = answers.prefs.indexOf(tag);
      if (i === -1) answers.prefs.push(tag); else answers.prefs.splice(i, 1);
      question();
    } else if (b) { answers.budget = b.getAttribute('data-budget'); question(); }
    else if (br) { answers.brand = br.getAttribute('data-brand'); question(); }
    else if (e.target.closest('#q-back')) { step--; question(); }
    else if (e.target.closest('#q-next')) {
      var missing = (step === 1 && !answers.cat) || (step === 3 && !answers.budget) || (step === 4 && !answers.brand);
      if (missing) { BF.toast(t('q.pick')); return; }
      if (step === TOTAL) results(); else { step++; question(); }
    } else if (e.target.closest('#q-retake')) {
      step = 1; answers = { cat: null, prefs: [], budget: null, brand: null }; question();
    }
  });

  question();
});
