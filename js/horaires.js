'use strict';

// Lecture des horaires de config.json, partagee par from-config.js et reservation.js.
// Expose window.IsbaHoraires.
(function (global) {

  // "09h30" → 9.5 ; "Fermé" → null
  function parseHeure(str) {
    const m = String(str).trim().match(/^(\d+)h(\d+)/);
    if (!m) return null;
    return parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
  }

  // config.horaires.* est ordonne [Lundi, Mardi, ..., Dimanche]
  // getDay() : 0=Dim, 1=Lun, ..., 6=Sam → index config : 0→6, 1→0, ..., 6→5
  function cfgIndex(jourJs) {
    return jourJs === 0 ? 6 : jourJs - 1;
  }

  // "2026-09-20" → Date au fuseau local.
  // new Date("2026-09-20") serait interprete en UTC et pourrait decaler d'un jour.
  function dateDepuisIso(iso) {
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    return isNaN(d.getTime()) ? null : d;
  }

  function isoDepuisDate(d) {
    const deuxChiffres = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + deuxChiffres(d.getMonth() + 1) + '-' + deuxChiffres(d.getDate());
  }

  // Plage d'ouverture d'un jour donne.
  // Retourne { ouvre, ferme, texte } en heures decimales, ou null si ferme.
  // categorie : 'interieures' (defaut) ou 'exterieures'
  function plageDuJour(config, date, categorie) {
    const rows = config && config.horaires && config.horaires[categorie || 'interieures'];
    if (!rows || !date) return null;

    const row = rows[cfgIndex(date.getDay())];
    if (!row || /ferm/i.test(row.horaire)) return null;

    const parts = String(row.horaire).split(/\s*[–-]\s*/);
    const ouvre = parseHeure(parts[0]);
    if (ouvre === null) return null;

    return {
      ouvre: ouvre,
      ferme: parts[1] ? parseHeure(parts[1]) : null,
      texte: parts[0].trim(),
    };
  }

  // Semaine complete d'ouverture, indexee sur getDay() de JavaScript (0 = dimanche).
  // Sert au badge « prochain creneau » de l'accueil et aux donnees Schema.org : sans
  // elle, chacun réécrivait les horaires en dur et divergeait des que le client les
  // modifiait dans Isba Admin.
  // Retourne [{ jourJs, ouvre, ferme, texte }] pour les seuls jours ouverts, ou null
  // si la config est absente.
  function semaineOuverte(config, categorie) {
    const rows = config && config.horaires && config.horaires[categorie || 'interieures'];
    if (!rows) return null;

    const sortie = [];
    for (let idx = 0; idx < rows.length; idx++) {
      // index config (0 = lundi) -> getDay() (0 = dimanche)
      const jourJs = (idx + 1) % 7;
      // On fabrique une date reelle tombant ce jour-la pour reutiliser plageDuJour
      const repere = new Date(2026, 0, 4 + jourJs);   // 4 janvier 2026 = un dimanche
      const plage = plageDuJour(config, repere, categorie);
      if (plage) sortie.push({ jourJs: jourJs, ouvre: plage.ouvre, ferme: plage.ferme, texte: plage.texte });
    }
    return sortie;
  }

  // 9.5 -> "09h30", pour l'affichage
  function heureEnTexte(h) {
    if (h === null || h === undefined) return '';
    const heures = Math.floor(h);
    const minutes = Math.round((h - heures) * 60);
    const deux = n => String(n).padStart(2, '0');
    return deux(heures) + 'h' + deux(minutes);
  }

  // 9.5 -> "09:30", format attendu par Schema.org
  function heureEnIso(h) {
    return heureEnTexte(h).replace('h', ':');
  }

  var NOMS_JOURS  = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var NOMS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Regroupe les jours ouverts qui partagent les memes horaires, dans l'ordre
  // lundi -> dimanche. Evite d'ecrire « lundi de 9h30 a 23h, jeudi de 9h30 a 23h... ».
  // Retourne [{ jours: [jourJs...], ouvre, ferme }] ou null sans config.
  function groupesOuverture(config, categorie) {
    var semaine = semaineOuverte(config, categorie);
    if (!semaine) return null;

    var groupes = [];
    for (var i = 0; i < semaine.length; i++) {
      var j = semaine[i];
      var dernier = groupes[groupes.length - 1];
      if (dernier && dernier.ouvre === j.ouvre && dernier.ferme === j.ferme) {
        dernier.jours.push(j.jourJs);
      } else {
        groupes.push({ jours: [j.jourJs], ouvre: j.ouvre, ferme: j.ferme });
      }
    }
    return groupes;
  }

  // ['lundi','jeudi','vendredi'] -> "lundi, jeudi et vendredi"
  function listeFr(mots) {
    if (!mots.length) return '';
    if (mots.length === 1) return mots[0];
    return mots.slice(0, -1).join(', ') + ' et ' + mots[mots.length - 1];
  }

  // Phrase lisible des jours et heures d'ouverture, pour rappeler au visiteur
  // quand venir plutot que de lui dire seulement « non ».
  // Ex : "lundi, jeudi, vendredi, samedi et dimanche de 09h30 a 23h00"
  function phraseOuverture(config, categorie) {
    var groupes = groupesOuverture(config, categorie);
    if (!groupes || !groupes.length) return '';
    return groupes.map(function (g) {
      var jours = listeFr(g.jours.map(function (d) { return NOMS_JOURS[d]; }));
      if (g.ferme === null) return jours + ' a partir de ' + heureEnTexte(g.ouvre);
      return jours + ' de ' + heureEnTexte(g.ouvre) + ' à ' + heureEnTexte(g.ferme);
    }).join(' ; ');
  }

  // Chargement de la config du site. Retourne null si le fichier est injoignable :
  // les pages doivent rester utilisables sans lui.
  // Le cache est court-circuite (parametre ?v= et no-store) : sinon un visiteur peut
  // voir l'ancien planning pendant des heures apres une publication.
  function chargerConfig() {
    return fetch('data/config.json?v=' + Date.now(), { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  global.IsbaHoraires = { parseHeure, cfgIndex, dateDepuisIso, isoDepuisDate, plageDuJour,
                          semaineOuverte, groupesOuverture, phraseOuverture, listeFr,
                          heureEnTexte, heureEnIso, NOMS_JOURS, NOMS_COURTS, chargerConfig };

})(window);
