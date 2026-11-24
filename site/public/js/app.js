(function () {
  'use strict';
  var form = document.getElementById('subscribe-form');
  var status = document.getElementById('status');
  var token = '';

  function getToken() {
    return fetch('/api/token', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) { token = d.token; })
      .catch(function () { token = ''; });
  }

  function say(text, ok) {
    status.textContent = text;
    status.className = 'status ' + (ok ? 'ok' : 'err');
  }

  if (form) {
    getToken();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.elements.email.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say('Проверьте адрес почты.', false); return; }
      if (!form.elements.consent.checked) { say('Нужно ваше согласие на обработку почты.', false); return; }
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      fetch('/api/subscribe', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, consent: true, website: form.elements.website.value, token: token })
      }).then(function (r) {
        if (r.status === 429) { say('Слишком много попыток. Попробуйте позже.', false); return; }
        if (!r.ok) { say('Не получилось. Обновите страницу и попробуйте ещё раз.', false); return getToken(); }
        form.reset();
        say('Готово! Мы напишем вам, как только всё будет готово.', true);
      }).catch(function () {
        say('Нет связи. Попробуйте ещё раз.', false);
      }).then(function () { btn.disabled = false; });
    });
  }

  var social = document.getElementById('social');
  if (social) {
    fetch('/api/links', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      (d.links || []).forEach(function (l) {
        var a = document.createElement('a');
        a.href = l.url; a.textContent = l.label; a.rel = 'noopener noreferrer'; a.target = '_blank';
        social.appendChild(a);
      });
      if (social.children.length) { social.hidden = false; }
    }).catch(function () {});
  }
})();
