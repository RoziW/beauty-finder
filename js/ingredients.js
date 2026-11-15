/* Ingredient explorer */
BF.ready(function (d) {
  var t = BF.t, esc = BF.esc, $ = function (id) { return document.getElementById(id); };
  var types = [];
  d.ingredients.forEach(function (i) { if (types.indexOf(i.type) === -1) types.push(i.type); });
  var state = { q: '', type: 'all', open: d.ingById[BF.param('i')] ? BF.param('i') : null };

  function productsWith(id) { return d.products.filter(function (p) { return p.ingredients.indexOf(id) !== -1; }); }
  function matches(ing, q) {
    var hay = BF.norm(Object.keys(ing.name).map(function (l) { return ing.name[l]; }).join(' | ') + ' | ' + ing.aka);
    return hay.indexOf(q) !== -1;
  }

  function drawTypes() {
    $('i-types').innerHTML = ['all'].concat(types).map(function (ty) {
      var on = state.type === ty;
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-type="' + ty + '" aria-pressed="' + on + '">' +
        esc(ty === 'all' ? t('i.all') : t('itype.' + ty)) + '</button>';
    }).join('');
  }

  function drawGrid() {
    var q = BF.norm(state.q);
    var list = d.ingredients.filter(function (i) {
      return (state.type === 'all' || i.type === state.type) && (!q || matches(i, q));
    });
    $('i-grid').innerHTML = list.length ? list.map(function (i) {
      return '<button type="button" class="ing-card reveal' + (state.open === i.id ? ' on' : '') + '" data-ing="' + i.id + '">' +
        '<span class="ing-type">' + esc(t('itype.' + i.type)) + '</span>' +
        '<h3>' + esc(BF.tr(i.name)) + '</h3>' +
        '<p>' + esc(BF.tr(i.desc)) + '</p>' +
        '<span class="ing-count">' + BF.icon('flask') + esc(t('i.inProducts', { n: productsWith(i.id).length })) + '</span></button>';
    }).join('') : '<div class="empty wide">' + BF.icon('flask') + '<h2>' + esc(t('i.notFound')) + '</h2><p>' + esc(t('i.tryAnother')) + '</p></div>';
    BF.reveal($('i-grid'));
  }

  function drawDetail(scroll) {
    var box = $('i-detail'), ing = d.ingById[state.open];
    if (!ing) { box.hidden = true; box.innerHTML = ''; return; }
    var prods = productsWith(ing.id);
    box.hidden = false;
    box.innerHTML =
      '<button class="icon-btn close" id="i-close" aria-label="' + esc(t('i.close')) + '">' + BF.icon('x') + '</button>' +
      '<span class="ing-type">' + esc(t('itype.' + ing.type)) + '</span>' +
      '<h2>' + esc(BF.tr(ing.name)) + '</h2>' +
      '<p class="muted">' + esc(t('i.aka')) + ': <span dir="ltr">' + esc(ing.aka) + (BF.lang !== 'en' ? ', ' + esc(ing.name.en) : '') + '</span></p>' +
      '<div class="ing-facts">' +
        '<div><h3>' + BF.icon('info') + esc(t('i.what')) + '</h3><p>' + esc(BF.tr(ing.desc)) + '</p></div>' +
        '<div><h3>' + BF.icon('sparkles') + esc(t('i.benefits')) + '</h3><p>' + esc(BF.tr(ing.benefits)) + '</p></div>' +
        '<div><h3>' + BF.icon('check') + esc(t('i.uses')) + '</h3><div class="chips">' +
          ing.uses.map(function (u) { return '<span class="chip static">' + esc(t('use.' + u)) + '</span>'; }).join('') + '</div></div>' +
        '<div class="caution"><h3>' + BF.icon('heart') + esc(t('i.precautions')) + '</h3><p>' + esc(BF.tr(ing.precautions)) + '</p></div>' +
      '</div>' +
      '<h3 class="h3">' + esc(t('i.found')) + '</h3>' +
      (prods.length ? '<div class="grid tight">' + prods.slice(0, 8).map(BF.card).join('') + '</div>' +
        (prods.length > 8 ? '<div class="center"><a class="btn btn-outline" href="' + BF.page('products') + '?q=' + encodeURIComponent(ing.name.en.replace(/ \(.*/, '')) + '">' +
          esc(t('i.more', { n: prods.length })) + '</a></div>' : '') : '<p class="muted">' + esc(t('i.noProducts')) + '</p>');
    BF.reveal(box); BF.sync();
    if (scroll) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function open(id, scroll) {
    state.open = id;
    history.replaceState(null, '', id ? '?i=' + id : location.pathname);
    drawDetail(scroll);
    document.querySelectorAll('.ing-card').forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-ing') === id); });
  }

  $('i-q').addEventListener('input', function () { state.q = this.value; drawGrid(); });
  $('i-form').addEventListener('submit', function (e) { e.preventDefault(); });
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-ing]'), ty = e.target.closest('[data-type]');
    if (c) open(c.getAttribute('data-ing'), true);
    else if (ty) { state.type = ty.getAttribute('data-type'); drawTypes(); drawGrid(); }
    else if (e.target.closest('#i-close')) open(null);
  });

  drawTypes(); drawGrid(); drawDetail(false);
});
