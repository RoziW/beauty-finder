/* Explore products: search, filter and sort */
BF.ready(function (d) {
  var t = BF.t, esc = BF.esc, $ = function (id) { return document.getElementById(id); };
  var CATS = ['all', 'skincare', 'makeup', 'haircare'], PAGE = 24;
  var TAGS = [];
  d.products.forEach(function (p) { p.tags.forEach(function (g) { if (TAGS.indexOf(g) === -1) TAGS.push(g); }); });

  var state = {
    q: BF.param('q') || '',
    cat: CATS.indexOf(BF.param('cat')) > 0 ? BF.param('cat') : 'all',
    brand: d.brandById[BF.param('brand')] ? BF.param('brand') : '',
    min: '', max: '', tags: [], sort: 'featured', type: '', shown: PAGE
  };

  $('f-brand').innerHTML = '<option value="">' + esc(t('p.allBrands')) + '</option>' + d.brands.map(function (b) {
    return '<option value="' + b.id + '">' + esc(b.name) + '</option>';
  }).join('');
  function drawTypes() {
    var types = [];
    d.products.forEach(function (p) {
      if ((state.cat === 'all' || p.cat === state.cat) && types.indexOf(p.type) === -1) types.push(p.type);
    });
    if (types.indexOf(state.type) === -1) state.type = '';
    types.sort(function (a, b) { return t('type.' + a).localeCompare(t('type.' + b)); });
    $('f-type').innerHTML = '<option value="">' + esc(t('p.allTypes')) + '</option>' + types.map(function (ty) {
      return '<option value="' + ty + '"' + (state.type === ty ? ' selected' : '') + '>' + esc(t('type.' + ty)) + '</option>';
    }).join('');
  }
  $('f-sort').innerHTML = ['featured', 'priceLow', 'priceHigh', 'name'].map(function (s) {
    return '<option value="' + s + '">' + esc(t('sort.' + s)) + '</option>';
  }).join('');

  function drawChips() {
    $('f-cats').innerHTML = CATS.map(function (c) {
      return '<button type="button" class="chip' + (state.cat === c ? ' on' : '') + '" data-cat="' + c + '" aria-pressed="' + (state.cat === c) + '">' +
        esc(t('cat.' + c)) + '</button>';
    }).join('');
    $('f-tags').innerHTML = TAGS.map(function (g) {
      var on = state.tags.indexOf(g) !== -1;
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-tag="' + g + '" aria-pressed="' + on + '">' + esc(t('tag.' + g)) + '</button>';
    }).join('');
  }

  function apply() {
    var q = BF.norm(state.q), min = parseFloat(state.min), max = parseFloat(state.max);
    var list = d.products.filter(function (p) {
      if (q && p.hay.indexOf(q) === -1) return false;
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.brand && p.brand !== state.brand) return false;
      if (state.type && p.type !== state.type) return false;
      if (!isNaN(min) && p.price < min) return false;
      if (!isNaN(max) && p.price > max) return false;
      return state.tags.every(function (g) { return p.tags.indexOf(g) !== -1; });
    });
    var sorters = {
      priceLow: function (a, b) { return a.price - b.price; },
      priceHigh: function (a, b) { return b.price - a.price; },
      name: function (a, b) { return a.name.localeCompare(b.name); }
    };
    if (sorters[state.sort]) list.sort(sorters[state.sort]);

    $('count').textContent = t('p.results', { n: list.length });
    $('more').hidden = list.length <= state.shown;
    $('grid').innerHTML = list.length ? list.slice(0, state.shown).map(BF.card).join('') :
      '<div class="empty wide">' + BF.icon('search') + '<h2>' + esc(t('p.none')) + '</h2><p>' + esc(t('p.noneHint')) + '</p>' +
      '<button class="btn" id="reset2">' + esc(t('p.reset')) + '</button></div>';
    BF.reveal($('grid'));
    BF.sync();
  }

  function reset() {
    state = { q: '', cat: 'all', brand: '', min: '', max: '', tags: [], sort: 'featured', type: '', shown: PAGE };
    $('f-q').value = ''; $('f-brand').value = ''; $('f-min').value = ''; $('f-max').value = ''; $('f-sort').value = 'featured';
    history.replaceState(null, '', location.pathname);
    drawChips(); drawTypes(); apply();
  }

  $('f-q').value = state.q; $('f-brand').value = state.brand;
  $('f-q').addEventListener('input', function () { state.q = this.value; state.shown = PAGE; apply(); });
  $('f-brand').addEventListener('change', function () { state.brand = this.value; state.shown = PAGE; apply(); });
  $('f-min').addEventListener('input', function () { state.min = this.value; state.shown = PAGE; apply(); });
  $('f-max').addEventListener('input', function () { state.max = this.value; state.shown = PAGE; apply(); });
  $('f-sort').addEventListener('change', function () { state.sort = this.value; apply(); });
  $('f-type').addEventListener('change', function () { state.type = this.value; state.shown = PAGE; apply(); });
  $('more').addEventListener('click', function () { state.shown += PAGE; apply(); });
  $('f-reset').addEventListener('click', reset);
  $('filter-toggle').addEventListener('click', function () {
    var open = $('filters').classList.toggle('open');
    this.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-cat]'), g = e.target.closest('[data-tag]');
    if (c) { state.cat = c.getAttribute('data-cat'); state.shown = PAGE; drawChips(); drawTypes(); apply(); }
    else if (g) {
      var tag = g.getAttribute('data-tag'), i = state.tags.indexOf(tag);
      if (i === -1) state.tags.push(tag); else state.tags.splice(i, 1);
      state.shown = PAGE; drawChips(); apply();
    } else if (e.target.id === 'reset2') reset();
  });

  drawChips(); drawTypes(); apply();
});
