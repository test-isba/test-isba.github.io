'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs     = require('fs');
const path   = require('path');

// Lit les prix depuis config.json — même source de vérité que le site
function getPrices() {
  try {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config     = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const prices     = {};
    if (config.tarifs?.sessions) {
      config.tarifs.sessions.forEach(s => {
        const m = String(s.joueurs).match(/^(\d+)/);
        if (m) prices[m[1]] = Math.round(s.prix * 100); // en centimes
      });
    }
    if (Object.keys(prices).length) return prices;
  } catch (_) {}
  // Fallback si config.json inaccessible
  return { '2': 8000, '3': 9000, '4': 10400, '5': 12000, '6': 13200 };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corps de requête invalide' }) };
  }

  const { joueurs, salle, date, creneau, prenom, nom, email } = body;

  const prices    = getPrices();
  const unitAmount = prices[String(joueurs)];

  if (!unitAmount) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Nombre de joueurs invalide' })
    };
  }

  const origin = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'https://votresite.netlify.app';

  const params = new URLSearchParams({ salle, date, creneau, joueurs, prenom, nom }).toString();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name:        `Escape Game — ${salle}`,
            description: `${date} à ${creneau} — ${joueurs} joueur${joueurs > 1 ? 's' : ''}`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode:           'payment',
      customer_email: email || undefined,
      metadata:       { salle, date, creneau, joueurs, prenom, nom },
      success_url:    `${origin}/reservation-confirmee.html?${params}`,
      cancel_url:     `${origin}/reservation.html`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
