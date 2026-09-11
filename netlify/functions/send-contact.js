'use strict';

const DEST_EMAIL = 'escape-game@lesportesdelisba.fr';
const FROM_EMAIL = "Les Portes de l'Isba <contact@lesportesdelisba.fr>";

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Configuration manquante' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corps invalide' }) };
  }

  const { type, prenom, nom, email, telephone, sujet, message, entreprise, effectif, date } = body;
  const fullName = [prenom, nom].filter(Boolean).join(' ');

  let subject, html;

  if (type === 'devis') {
    subject = `Demande de devis team building — ${entreprise || fullName}`;
    html = buildHtml([
      ['Nom',             fullName],
      ['Email',           email],
      telephone && ['Telephone',       telephone],
      entreprise && ['Entreprise',      entreprise],
      effectif   && ['Effectif',        effectif],
      date       && ['Date souhaitee',  date],
      message    && ['Message',         message.replace(/\n/g, '<br>')],
    ]);
  } else {
    subject = `Contact — ${sujet || 'Message depuis le site'}`;
    html = buildHtml([
      ['Nom',       fullName],
      ['Email',     email],
      telephone && ['Telephone', telephone],
      sujet     && ['Sujet',     sujet],
      message   && ['Message',   message.replace(/\n/g, '<br>')],
    ]);
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:     FROM_EMAIL,
        to:       [DEST_EMAIL],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Erreur Resend' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

function buildHtml(pairs) {
  const rows = pairs
    .filter(Boolean)
    .map(([label, value]) =>
      `<tr>
        <td style="padding:8px 20px 8px 0;color:#6b5e3a;font-size:14px;white-space:nowrap;vertical-align:top">${label}</td>
        <td style="padding:8px 0;color:#1a1208;font-size:14px">${value}</td>
      </tr>`
    ).join('');

  return `
    <div style="font-family:system-ui,sans-serif;background:#faf7f2;padding:32px">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e8dcc8;overflow:hidden">
        <div style="background:#0d0b07;padding:20px 24px">
          <span style="font-family:Georgia,serif;font-size:16px;color:#c9982a;letter-spacing:.08em">LES PORTES DE L'ISBA</span>
        </div>
        <div style="padding:24px">
          <table style="border-collapse:collapse;width:100%">${rows}</table>
        </div>
      </div>
    </div>`;
}
