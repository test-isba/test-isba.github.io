'use strict';

// Formulaire de devis team building : envoi par la messagerie du visiteur (voir ouvrirEmail dans main.js)
document.addEventListener('DOMContentLoaded', () => {
  const devisForm = document.getElementById('devis-form');
  if (!devisForm) return;

  devisForm.addEventListener('submit', e => {
    e.preventDefault();
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
