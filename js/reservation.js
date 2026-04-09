'use strict';

const roomLabels = {
  'athazagoraphobia': 'Athazagoraphobia',
  'heros-de-midgard': 'Héros de Midgard',
  'ho-ho-ho':         'Ho-Ho-Ho !'
};

document.addEventListener('DOMContentLoaded', async () => {

  // Chargement des prix depuis config.json
  let prices = { '2': 80, '3': 90, '4': 104, '5': 120, '6': 132 };
  try {
    const res = await fetch('data/config.json');
    if (res.ok) {
      const config = await res.json();
      if (config.tarifs?.sessions) {
        const extracted = {};
        config.tarifs.sessions.forEach(s => {
          const m = String(s.joueurs).match(/^(\d+)/);
          if (m) extracted[m[1]] = s.prix;
        });
        if (Object.keys(extracted).length) prices = extracted;
      }
    }
  } catch (_) { /* fallback aux prix par défaut */ }

  // Sélection de salle par clic sur la card
  document.querySelectorAll('.room-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.room-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateRecap();
    });
  });

  function updateRecap() {
    const room    = document.querySelector('input[name="res-room"]:checked');
    const date    = document.getElementById('res-date');
    const players = document.getElementById('res-players');
    const time    = document.getElementById('res-time');

    if (room)
      document.getElementById('recap-room').textContent = roomLabels[room.value] || room.value;

    if (date?.value) {
      const d = new Date(date.value);
      document.getElementById('recap-date').textContent =
        d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (players?.value) {
      document.getElementById('recap-players').textContent =
        players.value + ' joueur' + (parseInt(players.value) > 1 ? 's' : '');
      document.getElementById('res-price').textContent =
        (prices[players.value] ?? '—') + ' €';
    }

    if (time?.value)
      document.getElementById('recap-time').textContent = time.value;
  }

  document.getElementById('res-date')?.addEventListener('change', updateRecap);
  document.getElementById('res-players')?.addEventListener('change', updateRecap);
  document.getElementById('res-time')?.addEventListener('change', updateRecap);

  // Présélection via paramètre URL (?salle=athazagoraphobia)
  const salleParam = new URLSearchParams(window.location.search).get('salle');
  if (salleParam) {
    const radio = document.querySelector(`input[value="${CSS.escape(salleParam)}"]`);
    if (radio) radio.closest('.room-card')?.click();
  }

  // Soumission du formulaire → Stripe Checkout via fonction Netlify
  const form = document.getElementById('reservation-form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Redirection vers le paiement…'; }

      const room    = document.querySelector('input[name="res-room"]:checked');
      const players = document.getElementById('res-players')?.value || '';
      const date    = document.getElementById('res-date')?.value    || '';
      const time    = document.getElementById('res-time')?.value    || '';

      const dateStr = date
        ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

      const payload = {
        salle:   room ? (roomLabels[room.value] || room.value) : '',
        joueurs: players,
        date:    dateStr,
        creneau: time,
        prenom:  document.getElementById('res-prenom')?.value || '',
        nom:     document.getElementById('res-nom')?.value    || '',
        email:   document.getElementById('res-email')?.value  || '',
        tel:     document.getElementById('res-tel')?.value    || '',
        note:    document.getElementById('res-note')?.value   || '',
      };

      try {
        const res  = await fetch('/.netlify/functions/create-checkout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Erreur serveur');
        }

        window.location.href = data.url;
      } catch (err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Réserver'; }
        alert('Une erreur est survenue : ' + err.message + '\nVeuillez réessayer ou nous contacter par téléphone.');
      }
    });
  }

});
