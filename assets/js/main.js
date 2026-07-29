document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var status = form.querySelector('.form-status');
      var submitBtn = form.querySelector('button[type="submit"]');
      var lang = document.documentElement.lang === 'en' ? 'en' : 'pl';
      var copy = {
        pl: {
          sending: 'Wysyłanie…',
          ok: 'Dziękujemy! Wiadomość została wysłana — odezwiemy się najszybciej, jak to możliwe.',
          fail: 'Nie udało się wysłać formularza. Napisz do nas bezpośrednio: '
        },
        en: {
          sending: 'Sending…',
          ok: 'Thank you! Your message was sent — we’ll get back to you as soon as possible.',
          fail: 'The form could not be sent. Please email us directly: '
        }
      }[lang];

      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = copy.sending; }
      if (status) { status.hidden = true; status.classList.remove('is-error'); }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            if (status) { status.textContent = copy.ok; status.hidden = false; }
            form.reset();
          } else {
            throw new Error('form backend error');
          }
        })
        .catch(function () {
          if (status) {
            status.innerHTML = copy.fail + '<a href="mailto:' + form.getAttribute('data-fallback-email') + '">' + form.getAttribute('data-fallback-email') + '</a>';
            status.hidden = false;
            status.classList.add('is-error');
          }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        });
    });
  }
});

/*
  Contact form note for whoever deploys this site:
  The form on kontakt.html / en/contact.html posts to a Formspree endpoint
  (the placeholder ID in the `action` attribute — replace it with your own
  form ID from https://formspree.io after creating a free account there;
  Claude cannot sign up for third-party accounts on your behalf). Until you
  swap in a real endpoint, submissions will fail and the script falls back
  to showing your contact email so no inquiry is silently lost. Netlify
  Forms or a small server endpoint would work as drop-in alternatives —
  just change the `action` URL and, for Netlify, add `data-netlify="true"`
  to the <form> tag.
*/
