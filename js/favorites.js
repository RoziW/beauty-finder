/* Favorites, saved in this browser */
BF.ready(function (d) {
  var t = BF.t, esc = BF.esc, root = document.getElementById('favorites');

  function draw() {
    var items = BF.favs.list().map(function (id) { return d.productById[id]; }).filter(Boolean);
    root.innerHTML = items.length ?
      '<div class="cmp-bar"><span class="muted">' + esc(t('p.results', { n: items.length })) + '</span>' +
        '<button class="btn btn-outline btn-sm" id="fav-clear">' + BF.icon('trash') + esc(t('fav.clear')) + '</button></div>' +
        '<div class="grid">' + items.map(BF.card).join('') + '</div>' :
      '<div class="empty">' + BF.icon('heart') + '<h2>' + esc(t('fav.empty')) + '</h2><p>' + esc(t('fav.emptyHint')) + '</p>' +
        '<a class="btn" href="' + BF.page('products') + '">' + esc(t('hero.cta1')) + '</a></div>';
    BF.reveal(root); BF.sync();
  }

  root.addEventListener('click', function (e) {
    if (e.target.closest('#fav-clear')) { BF.favs.clear(); BF.toast(t('fav.cleared')); draw(); }
  });
  document.addEventListener('bf:favs', draw);
  draw();
});
