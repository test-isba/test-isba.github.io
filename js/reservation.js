'use strict';

const roomLabels = {
  'athazagoraphobia': 'Athazagoraphobia',
  'heros-de-midgard': 'Héros de Midgard',
  'ho-ho-ho':         'Ho-Ho-Ho !'
};

// Utilisés tant que config.json n'a pas répondu, ou s'il ne contient pas encore de planning
const CRENEAUX_DEFAUT = ['10h00', '11h30', '13h00', '14h30', '16h00', '17h30', '19h00', '20h30'];
const DUREE_SESSION = 1;  // heures : un créneau doit finir avant la fermeture

document.addEventListener('DOMContentLoaded', async () => {

  // Chargement de la config du site (tarifs, horaires, planning)
  let prices = { '2': 80, '3': 90, '4': 104, '5': 120, '6': 130 };
  const config = await IsbaHoraires.chargerConfig();

  if (config?.tarifs?.sessions) {
    const extracted = {};
    config.tarifs.sessions.forEach(s => {
      const m = String(s.joueurs).match(/^(\d+)/);
      if (m) extracted[m[1]] = s.prix;
    });
    if (Object.keys(extracted).length) prices = extracted;
  }

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
      renderCreneaux();
      updateRecap();
    });
  });

  // ─── CRÉNEAUX ────────────────────────────────────────────────────
  // La disponibilité dépend de la salle ET de la date : la grille est reconstruite
  // à chaque changement de l'un ou de l'autre.

  function creneauChoisi() {
    return document.querySelector('input[name="res-time"]:checked')?.value || '';
  }

  function boutonCreneau(heure, indisponible, coche) {
    const label = document.createElement('label');
    label.className = 'slot' + (indisponible ? ' slot--off' : '');

    const input = document.createElement('input');
    input.type  = 'radio';
    input.name  = 'res-time';
    input.value = heure;
    // disabled retire le créneau du parcours clavier et le rend non cliquable
    if (indisponible) input.disabled = true;
    else if (coche)   input.checked  = true;

    const texte = document.createElement('span');
    texte.textContent = heure;
    label.append(input, texte);

    if (indisponible) {
      const etat = document.createElement('span');
      etat.className   = 'slot-etat';
      etat.textContent = indisponible;
      label.appendChild(etat);
    }
    return label;
  }

  function renderCreneaux() {
    const grille = document.getElementById('res-slots');
    const note   = document.getElementById('res-slots-note');
    if (!grille || !note) return;

    const choisi = creneauChoisi();
    grille.textContent = '';

    const salle = document.querySelector('input[name="res-room"]:checked')?.value || '';
    const iso   = document.getElementById('res-date')?.value || '';
    if (!salle || !iso) {
      note.textContent = "Choisissez d'abord une salle et une date.";
      return;
    }

    const jour = IsbaHoraires.dateDepuisIso(iso);
    // Sans config (fichier injoignable), on propose tous les créneaux : mieux vaut une
    // demande à trier à la main qu'un visiteur bloqué.
    const plage = config ? IsbaHoraires.plageDuJour(config, jour) : { ouvre: 0, ferme: null };
    if (!plage) {
      note.textContent = "L'Isba est fermée ce jour-là. Choisissez une autre date.";
      return;
    }

    const creneaux = config?.planning?.creneaux || CRENEAUX_DEFAUT;
    const pris     = config?.planning?.occupes?.[iso]?.[salle] || [];

    const maintenant    = new Date();
    const estAujourdhui = iso === IsbaHoraires.isoDepuisDate(maintenant);
    const heureActuelle = maintenant.getHours() + maintenant.getMinutes() / 60;

    let proposes = 0;
    creneaux.forEach(creneau => {
      const h = IsbaHoraires.parseHeure(creneau);
      if (h === null) return;
      // Hors des horaires d'ouverture du jour : le créneau n'existe pas, on ne l'affiche pas
      if (h < plage.ouvre) return;
      if (plage.ferme !== null && h + DUREE_SESSION > plage.ferme) return;

      let indisponible = '';
      if (pris.includes(creneau))                        indisponible = 'Réservé';
      else if (estAujourdhui && h <= heureActuelle)      indisponible = 'Passé';

      grille.appendChild(boutonCreneau(creneau, indisponible, creneau === choisi));
      proposes++;
    });

    note.textContent = proposes ? '' : 'Aucun créneau disponible ce jour-là.';
  }

  document.getElementById('res-slots')?.addEventListener('change', updateRecap);

  function updateRecap() {
    const room    = document.querySelector('input[name="res-room"]:checked');
    const date    = document.getElementById('res-date');
    const players = document.getElementById('res-players');

    if (room)
      document.getElementById('recap-room').textContent = roomLabels[room.value] || room.value;

    if (date?.value) {
      const d = IsbaHoraires.dateDepuisIso(date.value);
      if (d) document.getElementById('recap-date').textContent =
        d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (players?.value) {
      document.getElementById('recap-players').textContent =
        players.value + ' joueur' + (parseInt(players.value) > 1 ? 's' : '');
      document.getElementById('res-price').textContent =
        (prices[players.value] ?? '—') + ' €';
    }

    // Changer de date ou de salle peut invalider le créneau choisi : le récap suit
    document.getElementById('recap-time').textContent = creneauChoisi() || '—';
  }

  document.getElementById('res-date')?.addEventListener('change', () => {
    renderCreneaux();
    updateRecap();
  });
  document.getElementById('res-players')?.addEventListener('change', updateRecap);

  // Pas de demande pour une date déjà passée
  const champDate = document.getElementById('res-date');
  if (champDate) champDate.min = IsbaHoraires.isoDepuisDate(new Date());

  renderCreneaux();

  // Présélection via paramètre URL (?salle=athazagoraphobia)
  const salleParam = new URLSearchParams(window.location.search).get('salle');
  if (salleParam) {
    const radio = document.querySelector(`input[name="res-room"][value="${CSS.escape(salleParam)}"]`);
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

      // Le créneau est une grille de radios : la validation native du navigateur ne
      // la couvre pas, on vérifie comme pour la salle
      const time = creneauChoisi();
      if (!time) {
        alert('Choisissez un créneau horaire (étape 2).');
        document.getElementById('res-slots')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const valeur  = id => document.getElementById(id)?.value.trim() || '';
      const salle   = roomLabels[room.value] || room.value;
      const players = valeur('res-players');
      const date    = dateFr(valeur('res-date'));
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
