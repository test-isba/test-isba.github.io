'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const devisForm = document.getElementById('devis-form');
  if (!devisForm) return;

  devisForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = devisForm.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled    = true;

    const data = Object.fromEntries(new FormData(devisForm));
    data.type = 'devis';

    try {
      const res = await fetch('/.netlify/functions/send-contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      btn.textContent      = 'Demande envoyée !';
      btn.style.background = '#16a34a';
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; devisForm.reset(); }, 3000);
    } catch {
      btn.textContent      = 'Erreur, réessayez';
      btn.style.background = '#dc2626';
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }, 3000);
    }
  });
});
