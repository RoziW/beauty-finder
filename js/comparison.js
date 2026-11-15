/* Product comparison: two to four products side by side */
BF.ready(function (d) {
  var t = BF.t, esc = BF.esc, root = document.getElementById('compare');
  var highlight = BF.store.get('bf-cmp-highlight', true);

  function selected() {
    var ids = BF.cmp.list().filter(function (id) { return d.productById[id]; });
    if (ids.length !== BF.cmp.list().length) BF.cmp.set(ids);
    return ids.map(function (id) { return d.productById[id]; });
  }

  function picker(items) {
    if (items.length >= 4) return '';
    var taken = items.map(function (p) { return p.id; });
    var groups = ['skincare', 'makeup', 'haircare'].map(function (c) {
      var opts = d.products.filter(function (p) { return p.cat === c && taken.indexOf(p.id) === -1; })
        .sort(function (a, b) { return (a.brandName + a.name).localeCompare(b.brandName + b.name); }).map(function (p) {
        return '<option value="' + p.id + '">' + esc(p.brandName) + ' — ' + esc(p.name) + '</option>';
      }).join('');
      return opts ? '<optgroup label="' + esc(t('cat.' + c)) + '">' + opts + '</optgroup>' : '';
    }).join('');
    return '<label class="picker">' + BF.icon('plus') + '<span class="sr-only">' + esc(t('c.add')) + '</span>' +
      '<select id="add-product"><option value="">' + esc(t('c.add')) + '…</option>' + groups + '</select></label>';
  }

  function chipRow(items, field, labelFor) {
    return items.map(function (p) {
      return '<td><div class="chips">' + p[field].map(function (v) {
        var shared = items.every(function (o) { return o[field].indexOf(v) !== -1; });
        return '<span class="chip static ' + (shared ? 'shared' : 'unique') + '">' + esc(labelFor(v)) + '</span>';
      }).join('') + '</div></td>';
    }).join('');
  }

  function row(label, items, value, extra) {
    var vals = items.map(value);
    var differs = vals.some(function (v) { return v !== vals[0]; });
    return '<tr class="' + (differs ? 'differs' : 'same') + '"><th scope="row">' + esc(label) + '</th>' +
      items.map(function (p, i) { return '<td>' + vals[i] + (extra ? extra(p) : '') + '</td>'; }).join('') + '</tr>';
  }

  function saved() { return BF.store.get('bf-saved-cmp', []); }
  function savedHtml() {
    var list = saved().filter(function (s) { return s.ids.every(function (id) { return d.productById[id]; }); });
    if (!list.length) return '';
    return '<h2 class="section-title left">' + esc(t('c.savedList')) + '</h2><ul class="saved-list">' + list.map(function (s) {
      return '<li><span>' + s.ids.map(function (id) { return esc(d.productById[id].name); }).join(' <em>vs</em> ') + '</span>' +
        '<span class="saved-actions"><button class="btn btn-soft btn-sm" data-open="' + s.at + '">' + esc(t('c.open')) + '</button>' +
        '<button class="icon-btn" data-del="' + s.at + '" aria-label="' + esc(t('c.remove')) + '">' + BF.icon('trash') + '</button></span></li>';
    }).join('') + '</ul>';
  }

  function draw() {
    var items = selected(), html = '';
    html += '<div class="cmp-bar">' + picker(items) +
      (items.length ? '<button class="btn btn-outline btn-sm" id="cmp-clear">' + BF.icon('trash') + esc(t('c.clear')) + '</button>' : '') + '</div>';

    if (items.length < 2) {
      html += '<div class="empty">' + BF.icon('scale') + '<h2>' + esc(t(items.length ? 'c.needOne' : 'c.need')) + '</h2>' +
        (items.length ? '<div class="grid one">' + BF.card(items[0]) + '</div>' : '') + '</div>';
    } else {
      var minPrice = Math.min.apply(null, items.map(function (p) { return p.price; }));
      var priceTie = items.every(function (p) { return p.price === minPrice; });

      html += '<div class="cmp-tools"><label class="switch"><input type="checkbox" id="cmp-highlight"' + (highlight ? ' checked' : '') + '>' +
        '<span></span>' + esc(t('c.highlight')) + '</label>' +
        '<span class="legend"><span class="chip static unique">' + esc(t('c.legendUnique')) + '</span>' +
        '<span class="chip static shared">' + esc(t('c.legendShared')) + '</span></span></div>' +
        '<div class="table-wrap"><table class="cmp-table' + (highlight ? ' hl' : '') + '" style="--cols:' + items.length + '">' +
        '<thead><tr><th scope="col">' + esc(t('c.product')) + '</th>' + items.map(function (p) {
          return '<th scope="col"><button class="icon-btn remove" data-remove="' + p.id + '" aria-label="' + esc(t('c.remove')) + '">' + BF.icon('x') + '</button>' +
            '<a class="cmp-art" href="' + BF.page('product') + '?id=' + p.id + '" style="--tint:' + p.tint + '">' + BF.art(p) + '</a>' +
            '<a class="cmp-name" href="' + BF.page('product') + '?id=' + p.id + '">' + esc(p.name) + '</a></th>';
        }).join('') + '</tr></thead><tbody>' +
        row(t('c.brand'), items, function (p) { return esc(p.brandName); }) +
        row(t('c.category'), items, function (p) { return esc(t('cat.' + p.cat)); }) +
        row(t('c.type'), items, function (p) { return esc(t('type.' + p.type)); }) +
        row(t('c.size'), items, function (p) { return '<span dir="ltr">' + esc(p.size || '—') + '</span>'; }) +
        row(t('c.price'), items, function (p) { return '<b class="big">' + BF.money(p.price) + '</b>'; }, function (p) {
          return !priceTie && p.price === minPrice ? '<span class="badge">' + esc(t('c.lowest')) + '</span>' : '';
        }) +
        '<tr class="chips-row"><th scope="row">' + esc(t('c.features')) + '</th>' + chipRow(items, 'tags', function (v) { return t('tag.' + v); }) + '</tr>' +
        '<tr class="chips-row"><th scope="row">' + esc(t('c.ingredients')) + '</th>' + chipRow(items, 'ingredients', function (v) { return BF.tr(d.ingById[v].name); }) + '</tr>' +
        '<tr><th scope="row"></th>' + items.map(function (p) {
          return '<td><button class="icon-btn fav' + (BF.favs.has(p.id) ? ' on' : '') + '" data-fav="' + p.id + '">' + BF.icon('heart') + '</button></td>';
        }).join('') + '</tr>' +
        '</tbody></table></div>' +
        '<div class="center"><button class="btn" id="cmp-save">' + BF.icon('check') + esc(t('c.save')) + '</button></div>';
    }
    root.innerHTML = html + savedHtml();
    BF.reveal(root); BF.sync();
  }

  root.addEventListener('change', function (e) {
    if (e.target.id === 'add-product' && e.target.value) {
      var res = BF.cmp.add(e.target.value);
      if (res === 'full') BF.toast(t('toast.cmpFull'));
      draw();
    } else if (e.target.id === 'cmp-highlight') {
      highlight = e.target.checked;
      BF.store.set('bf-cmp-highlight', highlight);
      root.querySelector('.cmp-table').classList.toggle('hl', highlight);
    }
  });
  root.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-remove]'), op = e.target.closest('[data-open]'), del = e.target.closest('[data-del]');
    if (rm) { BF.cmp.remove(rm.getAttribute('data-remove')); draw(); }
    else if (e.target.closest('#cmp-clear')) { BF.cmp.clear(); draw(); }
    else if (e.target.closest('#cmp-save')) {
      var ids = BF.cmp.list(), list = saved().filter(function (s) { return s.ids.join() !== ids.join(); });
      list.unshift({ ids: ids, at: Date.now() });
      BF.store.set('bf-saved-cmp', list.slice(0, 10));
      BF.toast(t('c.saved')); draw();
    } else if (op) {
      var s = saved().filter(function (x) { return String(x.at) === op.getAttribute('data-open'); })[0];
      if (s) { BF.cmp.set(s.ids); draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    } else if (del) {
      BF.store.set('bf-saved-cmp', saved().filter(function (x) { return String(x.at) !== del.getAttribute('data-del'); }));
      draw();
    }
  });
  // cards inside the page can change the comparison list too
  document.addEventListener('bf:cmp', draw);

  draw();
});
