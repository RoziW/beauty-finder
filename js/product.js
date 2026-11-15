/* Product details, with reviews saved in this browser */
BF.ready(function (d) {
  var t = BF.t, esc = BF.esc, root = document.getElementById('product');
  var p = d.productById[BF.param('id')];

  if (!p) {
    root.innerHTML = '<div class="empty">' + BF.icon('search') + '<h2>' + esc(t('d.notFound')) + '</h2>' +
      '<a class="btn" href="' + BF.page('products') + '">' + esc(t('d.back')) + '</a></div>';
    return;
  }
  document.title = p.name + ' · Beauty Finder';

  function reviews() { return (BF.store.get('bf-reviews', {})[p.id]) || []; }
  function drawReviews() {
    var list = reviews();
    document.getElementById('review-list').innerHTML = list.length ? list.map(function (r) {
      return '<li class="review"><div class="review-head"><b>' + esc(r.name) + '</b>' + BF.stars(r.rating) +
        '<time dir="ltr">' + esc(r.date) + '</time></div><p>' + esc(r.text) + '</p></li>';
    }).join('') : '<li class="muted">' + esc(t('d.noReviews')) + '</li>';
  }

  var isFav = BF.favs.has(p.id), inCmp = BF.cmp.has(p.id);
  var similar = d.products.filter(function (x) { return x.id !== p.id && x.cat === p.cat; })
    .sort(function (a, b) { return (b.type === p.type) - (a.type === p.type) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price); }).slice(0, 4);

  root.innerHTML =
    '<a class="back-link" href="' + BF.page('products') + '">' + BF.icon('arrow', 'flip') + esc(t('d.back')) + '</a>' +
    '<div class="detail">' +
      '<div class="detail-art" style="--tint:' + p.tint + '">' + BF.art(p) + '</div>' +
      '<div class="detail-info">' +
        '<a class="card-brand" href="' + BF.page('products') + '?brand=' + p.brand + '">' + esc(p.brandName) + '</a>' +
        '<h1>' + esc(p.name) + '</h1>' +
        '<div class="detail-meta"><span class="pill">' + esc(t('cat.' + p.cat)) + '</span><span class="pill">' + esc(t('type.' + p.type)) + '</span>' +
          (p.size ? '<span class="pill" dir="ltr">' + esc(p.size) + '</span>' : '') + '</div>' +
        '<div class="detail-price">' + BF.money(p.price) + '</div>' +
        '<p class="lead" dir="ltr" lang="en">' + esc(p.desc) + '</p>' +
        (BF.lang !== 'en' ? '<p class="muted small">' + esc(t('d.descNote')) + '</p>' : '') +
        '<div class="detail-actions">' +
          '<button class="btn' + (isFav ? ' on' : '') + '" data-fav="' + p.id + '">' + BF.icon('heart') + '<span data-label>' + esc(t(isFav ? 'd.inFav' : 'd.addFav')) + '</span></button>' +
          '<button class="btn btn-outline' + (inCmp ? ' on' : '') + '" data-cmp="' + p.id + '" data-long>' + BF.icon(inCmp ? 'check' : 'scale') + '<span>' + esc(t(inCmp ? 'd.inCmp' : 'd.addCmp')) + '</span></button>' +
          '<a class="text-link" href="' + BF.page('compare') + '">' + esc(t('d.goCmp')) + BF.icon('arrow', 'flip-rtl') + '</a>' +
        '</div>' +
        (p.url ? '<a class="text-link" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' +
          esc(t('d.source', { site: BF.sites[p.site] || p.site })) + BF.icon('arrow', 'flip-rtl') + '</a>' : '') +
        (p.tags.length ? '<h2 class="h3">' + esc(t('d.features')) + '</h2>' +
        '<div class="chips">' + p.tags.map(function (g) { return '<span class="chip static">' + BF.icon('check') + esc(t('tag.' + g)) + '</span>'; }).join('') + '</div>' : '') +
        '<h2 class="h3">' + esc(t('d.ingredients')) + '</h2><p class="muted small">' + esc(t('d.ingHint')) + '</p>' +
        '<ul class="ing-list">' + p.ingredients.map(function (id) {
          var ing = d.ingById[id];
          return '<li><a href="' + BF.page('ingredients') + '?i=' + id + '">' + BF.icon('flask') +
            '<span><b>' + esc(BF.tr(ing.name)) + '</b><small>' + esc(BF.tr(ing.desc)) + '</small></span>' + BF.icon('arrow', 'flip-rtl') + '</a></li>';
        }).join('') + '</ul>' +
        '<details class="inci"><summary>' + esc(t('d.inci')) + '</summary>' +
          '<p dir="ltr" lang="en">' + esc(p.inci) + '</p><p class="muted small">' + esc(t('d.inciNote')) + '</p></details>' +
      '</div>' +
    '</div>' +
    '<div class="reviews">' +
      '<div><h2>' + esc(t('d.reviews')) + '</h2><ul id="review-list" class="review-list"></ul></div>' +
      '<form id="review-form" class="panel" novalidate>' +
        '<h3>' + esc(t('d.writeReview')) + '</h3>' +
        '<label>' + esc(t('d.yourName')) + '<input name="name" maxlength="40" autocomplete="name"></label>' +
        '<fieldset class="stars-input"><legend>' + esc(t('d.yourRating')) + '</legend>' +
          [5, 4, 3, 2, 1].map(function (n) {
            return '<input type="radio" name="rating" id="star' + n + '" value="' + n + '"><label for="star' + n + '" aria-label="' + n + '">' + BF.icon('star') + '</label>';
          }).join('') + '</fieldset>' +
        '<label>' + esc(t('d.yourReview')) + '<textarea name="text" rows="3" maxlength="500"></textarea></label>' +
        '<p class="form-error" id="review-error" role="alert" hidden></p>' +
        '<button class="btn" type="submit">' + esc(t('d.submit')) + '</button>' +
        '<p class="muted small">' + esc(t('d.reviewLocal')) + '</p>' +
      '</form>' +
    '</div>' +
    (similar.length ? '<h2 class="section-title left">' + esc(t('d.similar')) + '</h2><div class="grid">' + similar.map(BF.card).join('') + '</div>' : '');

  drawReviews();

  document.getElementById('review-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this.elements, name = f.name.value.trim(), text = f.text.value.trim(), rating = f.rating.value;
    var err = document.getElementById('review-error');
    if (!name || !text || !rating) { err.textContent = t('form.fill'); err.hidden = false; return; }
    err.hidden = true;
    var all = BF.store.get('bf-reviews', {});
    (all[p.id] = all[p.id] || []).unshift({ name: name, text: text, rating: Number(rating), date: new Date().toISOString().slice(0, 10) });
    BF.store.set('bf-reviews', all);
    this.reset();
    drawReviews();
    BF.toast(t('d.reviewThanks'));
  });
});
