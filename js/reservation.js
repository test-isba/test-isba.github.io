'use strict';

document.addEventListener('DOMContentLoaded', () => {

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

  const roomLabels = {
    'athazagoraphobia': 'Athazagoraphobia',
    'heros-de-midgard': 'Héros de Midgard',
    'ho-ho-ho': 'Ho-Ho-Ho !'
  };

  function updateRecap() {
    const room    = document.querySelector('input[name="res-room"]:checked');
    const date    = document.getElementById('res-date');
    const players = document.getElementById('res-players');
    const time    = document.getElementById('res-time');
    const prices  = { '2': 80, '3': 90, '4': 104, '5': 120, '6': 132 };

    if (room)
      document.getElementById('recap-room').textContent = roomLabels[room.value] || room.value;

    if (date && date.value) {
      const d = new Date(date.value);
      document.getElementById('recap-date').textContent =
        d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (players && players.value) {
      document.getElementById('recap-players').textContent =
        players.value + ' joueur' + (parseInt(players.value) > 1 ? 's' : '');
      document.getElementById('res-price').textContent =
        (prices[players.value] || '—') + ' €';
    }

    if (time && time.value)
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

});
