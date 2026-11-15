/* Contact form: checks the fields, then keeps the message in this browser */
BF.ready(function () {
  var t = BF.t, form = document.getElementById('contact-form'), err = document.getElementById('contact-error');
  var done = document.getElementById('contact-done');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, name = f.name.value.trim(), email = f.email.value.trim(), message = f.message.value.trim();
    var problem = (!name || !email || !message) ? t('form.fill') :
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? t('ct.errEmail') : '';
    if (problem) { err.textContent = problem; err.hidden = false; return; }
    err.hidden = true;
    var all = BF.store.get('bf-messages', []);
    all.push({ name: name, email: email, message: message, at: new Date().toISOString() });
    BF.store.set('bf-messages', all);
    form.reset(); form.hidden = true; done.hidden = false;
    BF.toast(t('ct.thanks'));
  });
  document.getElementById('contact-again').addEventListener('click', function () { done.hidden = true; form.hidden = false; });
});
