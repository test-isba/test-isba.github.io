'use strict';

const roomLabels = {
  'athazagoraphobia': 'Athazagoraphobia',
  'heros-de-midgard': 'Héros de Midgard',
  'ho-ho-ho':         'Ho-Ho-Ho !'
};

document.addEventListener('DOMContentLoaded', async () => {

  // Chargement des prix depuis config.json
  let prices = { '2': 80, '3': 90, '4': 104, '5': 120, '6': 130 };
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

  // Libellés de la liste « Nombre de joueurs » alignés sur les prix de config.json (modifiés dans Isba Admin)
  document.querySelectorAll('#res-players option[value]').forEach(opt => {
    if (opt.value && prices[opt.value] != null) opt.textContent = opt.value + ' joueurs · ' + prices[opt.value] + ' €';
  });

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

  // Soumission : demande de réservation envoyée par la messagerie du visiteur (voir ouvrirEmail dans main.js)
  const form = document.getElementById('reservation-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const room = document.querySelector('input[name="res-room"]:checked');
      if (!room) {
        alert("Choisissez d'abord votre aventure (étape 1).");
        document.querySelector('.room-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const valeur  = id => document.getElementById(id)?.value.trim() || '';
      const salle   = roomLabels[room.value] || room.value;
      const players = valeur('res-players');
      const date    = dateFr(valeur('res-date'));
      const time    = valeur('res-time');
      const note    = valeur('res-note');

      ouvrirEmail('Réservation — ' + salle + ' — ' + date + ' à ' + time, [
        'Bonjour,',
        '',
        'Je souhaite réserver une session :',
        '',
        'Salle : ' + salle,
        'Date : ' + date,
        'Créneau : ' + time,
        'Joueurs : ' + players,
        'Tarif : ' + (prices[players] ?? '—') + ' € (règlement sur place)',
        '',
        note ? 'Informations complémentaires : ' + note : null,
        note ? '' : null,
        '---',
        valeur('res-prenom') + ' ' + valeur('res-nom'),
        'Email : ' + valeur('res-email'),
        'Téléphone : ' + valeur('res-tel'),
      ]);
      signalerEmailOuvert(form);
    });
  }

});
