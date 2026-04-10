'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const devisForm = document.getElementById('devis-form');
  if (!devisForm) return;

  const FORMSPREE    = 'https://formspree.io/f/XXXXXXXX';
  const isConfigured = !FORMSPREE.includes('XXXXXXXX');

  devisForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = devisForm.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled    = true;

    if (!isConfigured) {
      await new Promise(r => setTimeout(r, 1200));
      btn.textContent      = 'Demande envoyée !';
      btn.style.background = '#16a34a';
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; devisForm.reset(); }, 3000);
      return;
    }

    try {
      const data       = new FormData(devisForm);
      const entreprise = devisForm.querySelector('[name="entreprise"]')?.value || '';
      data.append('_subject', 'Demande de devis team building — ' + entreprise);

      const res = await fetch(FORMSPREE, {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' }
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
