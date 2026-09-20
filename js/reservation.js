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

  // Sélection de salle par clic sur la card (la dispo est déjà chargée pour la date)
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
  // La disponibilité dépend de la salle ET de la date. Les créneaux déjà pris
  // viennent de l'API (temps réel), plus de config.json.

  // Créneaux occupés pour la date actuellement affichée : { salle: ["10h00", ...] }
  let dispoDuJour = {};
  let dateChargee = null;
  let apiHorsLigne = false;

  async function chargerDispo(iso) {
    if (iso === dateChargee) return;            // déjà chargé pour cette date
    const r = await IsbaApi.disponibilites(iso, iso);
    apiHorsLigne = !!r.horsLigne;
    dispoDuJour  = r.occupes[iso] || {};
    dateChargee  = iso;
  }

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
      // On rappelle les jours d'ouverture : sinon le visiteur essaie les dates
      // au hasard jusqu'a en trouver une qui passe.
      const quand = config ? IsbaHoraires.phraseOuverture(config) : '';
      note.textContent = quand
        ? "L'Isba est fermée ce jour-là. Nous sommes ouverts " + quand + "."
        : "L'Isba est fermée ce jour-là. Choisissez une autre date.";
      return;
    }

    const creneaux = config?.planning?.creneaux || CRENEAUX_DEFAUT;
    // Créneaux pris : depuis l'API. Si elle est injoignable, dispoDuJour est vide et
    // tout est proposé (mieux vaut une demande à trier qu'un visiteur bloqué).
    const pris     = dispoDuJour[salle] || [];

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

  document.getElementById('res-date')?.addEventListener('change', async () => {
    const iso = document.getElementById('res-date')?.value || '';
    if (iso) await chargerDispo(iso);   // récupère les créneaux pris pour cette date
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

  // Repli : ouvre la messagerie du visiteur avec la demande pré-remplie.
  // Utilisé seulement si l'API est injoignable, pour ne jamais perdre une demande.
  function ouvrirEmailReservation(v) {
    ouvrirEmail('Réservation — ' + v.salleLabel + ' — ' + v.dateFr + ' à ' + v.time, [
      'Bonjour,', '',
      'Je souhaite réserver une session :', '',
      'Salle : ' + v.salleLabel,
      'Date : ' + v.dateFr,
      'Créneau : ' + v.time,
      'Joueurs : ' + v.players,
      'Tarif : ' + (prices[v.players] ?? '—') + ' € (règlement sur place)', '',
      v.note ? 'Informations complémentaires : ' + v.note : null,
      v.note ? '' : null,
      '---',
      v.prenom + ' ' + v.nom,
      'Email : ' + v.email,
      'Téléphone : ' + v.tel,
    ]);
    signalerEmailOuvert(form);
  }

  function messageResa(texte, erreur) {
    let el = form.querySelector('.resa-message');
    if (!el) {
      el = document.createElement('p');
      el.className = 'resa-message';
      el.setAttribute('role', 'status');
      form.querySelector('[type="submit"]').insertAdjacentElement('afterend', el);
    }
    el.style.cssText = 'margin-top:14px;padding:12px 16px;border-radius:var(--radius);font-size:.9rem;line-height:1.5;'
      + (erreur
          ? 'background:rgba(200,60,60,.12);border:1px solid rgba(200,60,60,.4);color:#e0a0a0;'
          : 'background:var(--gold-bg);border:1px solid var(--border);color:var(--text);');
    el.innerHTML = texte;
    el.scrollIntoView({ behavior: window.IsbaMotion.comportement(), block: 'center' });
  }

  // Soumission : envoi réel à l'API. Le créneau se bloque côté serveur.
  const form = document.getElementById('reservation-form');
  if (form) {
    const bouton = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const room = document.querySelector('input[name="res-room"]:checked');
      if (!room) {
        alert("Choisissez d'abord votre aventure (étape 1).");
        document.querySelector('.room-card')?.scrollIntoView({ behavior: window.IsbaMotion.comportement(), block: 'center' });
        return;
      }
      const time = creneauChoisi();
      if (!time) {
        alert('Choisissez un créneau horaire (étape 2).');
        document.getElementById('res-slots')?.scrollIntoView({ behavior: window.IsbaMotion.comportement(), block: 'center' });
        return;
      }

      const valeur = id => document.getElementById(id)?.value.trim() || '';
      const iso    = valeur('res-date');
      const infos  = {
        salleLabel: roomLabels[room.value] || room.value,
        dateFr: dateFr(iso), time,
        players: valeur('res-players'),
        prenom: valeur('res-prenom'), nom: valeur('res-nom'),
        email: valeur('res-email'), tel: valeur('res-tel'), note: valeur('res-note'),
      };

      const payload = {
        salle_id: room.value, date_session: iso, creneau: time,
        joueurs: parseInt(infos.players, 10),
        prenom: infos.prenom, nom: infos.nom, email: infos.email,
        telephone: infos.tel, note: infos.note,
      };

      const texteInitial = bouton.textContent;
      bouton.disabled = true;
      bouton.textContent = 'Envoi…';

      const r = await IsbaApi.reserver(payload);

      bouton.disabled = false;
      bouton.textContent = texteInitial;

      if (r.horsLigne) {
        // API injoignable : on bascule sur l'email pour ne pas perdre la demande
        ouvrirEmailReservation(infos);
        return;
      }
      if (r.conflit) {
        // Quelqu'un a pris ce créneau entre-temps : on rafraîchit la grille
        dateChargee = null;
        await chargerDispo(iso);
        renderCreneaux();
        messageResa('Ce créneau vient d\'être réservé par quelqu\'un d\'autre. '
          + 'Choisissez un autre horaire, la grille est à jour.', true);
        return;
      }
      if (r.erreur) {
        messageResa((r.message || 'Votre demande n\'a pas pu être enregistrée.')
          + '<br>Vous pouvez nous contacter directement au 07 86 28 47 69.', true);
        return;
      }

      // Succès : le créneau est réservé côté serveur
      dateChargee = null;
      await chargerDispo(iso);
      renderCreneaux();
      bouton.disabled = true;
      messageResa('<strong>Demande enregistrée.</strong> Le créneau vous est réservé. '
        + 'Votre venue sera confirmée sous 24h, par email ou par téléphone. '
        + 'Le règlement se fait sur place.');
    });
  }

});
