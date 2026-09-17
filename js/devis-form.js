'use strict';

// Formulaire de devis team building : envoi par la messagerie du visiteur (voir ouvrirEmail dans main.js)
//
// La date demandee est controlee comme celle de la page de reservation : meme source de
// verite (les horaires de config.json), memes refus. Sans ca le formulaire acceptait une
// date passee ou un jour de fermeture, et personne ne s'en apercevait avant de lire l'email.
document.addEventListener('DOMContentLoaded', () => {
  const devisForm = document.getElementById('devis-form');
  if (!devisForm) return;

  const champDate = document.getElementById('devis-date');
  const note      = document.getElementById('devis-date-note');
  let config = null;

  // Pas de date anterieure a aujourd'hui, comme sur la page de reservation.
  if (champDate && window.IsbaHoraires) {
    champDate.min = IsbaHoraires.isoDepuisDate(new Date());
  }

  // Les horaires viennent de config.json, edite dans Isba Admin. Si le fichier est
  // injoignable, on laisse passer : mieux vaut une demande a trier qu'un visiteur bloque.
  if (window.IsbaHoraires) {
    IsbaHoraires.chargerConfig().then(c => {
      config = c;
      if (champDate && champDate.value) verifierDate();
    });
  }

  // Renvoie un message si la date choisie ne convient pas, sinon une chaine vide.
  // Separe de l'affichage pour servir aux deux appels : saisie et envoi.
  function problemeDate() {
    if (!champDate || !champDate.value) return '';           // le champ reste facultatif
    if (!window.IsbaHoraires) return '';

    const jour = IsbaHoraires.dateDepuisIso(champDate.value);
    if (!jour) return 'Cette date n’est pas valide.';

    const maintenant = new Date();
    const debutDuJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    if (jour < debutDuJour) return 'Cette date est déjà passée. Choisissez une autre date.';

    // Sans config chargee, on ne peut rien affirmer sur les jours de fermeture.
    if (!config) return '';
    if (!IsbaHoraires.plageDuJour(config, jour)) {
      return 'L’Isba est fermée ce jour-là. Choisissez une autre date.';
    }
    return '';
  }

  function verifierDate() {
    const message = problemeDate();
    if (note) {
      note.textContent = message;
      note.classList.toggle('form-note--erreur', Boolean(message));
    }
    if (champDate) champDate.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  if (champDate) champDate.addEventListener('change', verifierDate);

  devisForm.addEventListener('submit', e => {
    e.preventDefault();

    // On refuse d'ouvrir la messagerie avec une date impossible : sinon l'Isba recoit
    // une demande qu'elle devra refuser a la main.
    if (!verifierDate()) {
      champDate.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(devisForm));

    ouvrirEmail('Demande de devis team building — ' + data.entreprise, [
      'Bonjour,',
      '',
      'Je souhaite recevoir un devis pour un team building.',
      '',
      'Entreprise : ' + data.entreprise,
      'Participants : ' + data.effectif,
      data.date ? 'Date souhaitée : ' + dateFr(data.date) : null,
      data.message ? '\r\n' + data.message : null,
      '',
      '---',
      [data.prenom, data.nom].filter(Boolean).join(' '),
      'Email : ' + data.email,
      data.telephone ? 'Téléphone : ' + data.telephone : null,
    ]);
    signalerEmailOuvert(devisForm);
  });
});
