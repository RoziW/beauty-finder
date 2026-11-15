/* Home page */
BF.ready(function (d) {
  var t = BF.t, esc = BF.esc;

  // search: an empty search asks for a keyword instead of submitting
  document.getElementById('hero-search').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = this.q.value.trim();
    if (!q) { BF.toast(t('search.empty')); this.q.focus(); return; }
    location.href = BF.page('products') + '?q=' + encodeURIComponent(q);
  });

  function firstOf(type) { return d.products.filter(function (p) { return p.type === type; })[0]; }

  // floating product cards in the hero
  document.getElementById('hero-float').innerHTML = ['serum', 'lip'].map(firstOf).filter(Boolean).map(function (p, i) {
    return '<a class="float-card f' + (i + 1) + '" href="' + BF.page('product') + '?id=' + p.id + '">' +
      BF.art(p) + '<span>' + esc(p.brandName) + '</span></a>';
  }).join('');

  document.getElementById('stats').innerHTML = [
    [d.products.length, 'stat.products'], [d.ingredients.length, 'stat.ingredients'],
    [d.brands.length, 'stat.brands'], [4, 'stat.langs']
  ].map(function (s) { return '<div class="stat"><b>' + s[0] + '</b><span>' + esc(t(s[1])) + '</span></div>'; }).join('');

  document.getElementById('cats').innerHTML = ['skincare', 'makeup', 'haircare'].map(function (c) {
    var n = d.products.filter(function (p) { return p.cat === c; }).length;
    return '<a class="cat-card reveal" href="' + BF.page('products') + '?cat=' + c + '">' +
      '<img src="' + BF.root + 'images/' + c + '.jpg" alt="" loading="lazy">' +
      '<div class="cat-info"><h3>' + esc(t('cat.' + c)) + '</h3><p>' + esc(t('cat.' + c + '.d')) + '</p>' +
      '<span class="pill">' + esc(t('p.results', { n: n })) + '</span></div></a>';
  }).join('');

  // one product from each of eight different types
  var featured = ['serum', 'lip', 'shampoo', 'mascara', 'moisturizer', 'eyeshadow', 'sunscreen', 'hairoil'].map(firstOf).filter(Boolean);
  document.getElementById('trending').innerHTML = featured.map(BF.card).join('');

  document.getElementById('brands').innerHTML = d.brands.slice(0, 12).map(function (b) {
    return '<a class="brand-card reveal" href="' + BF.page('products') + '?brand=' + b.id + '">' +
      '<span class="brand-mark">' + esc(b.name.charAt(0).toUpperCase()) + '</span>' +
      '<h3>' + esc(b.name) + '</h3>' +
      '<span class="pill">' + esc(t('p.results', { n: b.count })) + '</span></a>';
  }).join('');
});
