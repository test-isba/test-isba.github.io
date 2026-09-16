'use strict';

// Appels a l'API de reservation. Aucune fonction ne leve : elles renvoient toujours
// un objet normalise, pour que la page reste utilisable meme si l'API est injoignable.
(function (global) {

  // En local (site servi sur localhost), on tape l'API locale ; en ligne, le domaine dedie.
  const EN_LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
  const BASE = EN_LOCAL
    ? 'http://127.0.0.1:3838'
    : 'https://api.lesportesdelisba.fr';   // a mettre en place a l'etape 6

  const TIMEOUT_MS = 7000;

  async function appel(route, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(BASE + route, { signal: controller.signal, ...options });
      let data = {};
      try { data = await res.json(); } catch (_) { /* corps non-JSON */ }
      return { ok: res.ok, status: res.status, data };
    } catch (_) {
      // Reseau coupe, API eteinte, timeout : on le signale sans lever
      return { ok: false, status: 0, horsLigne: true, data: {} };
    } finally {
      clearTimeout(timer);
    }
  }

  // Creneaux occupes entre deux dates ISO incluses.
  // Retourne { occupes: {...} } ou { horsLigne: true }.
  async function disponibilites(debut, fin) {
    const r = await appel(`/api/disponibilites?debut=${encodeURIComponent(debut)}&fin=${encodeURIComponent(fin)}`);
    if (r.horsLigne) return { horsLigne: true, occupes: {} };
    return { occupes: r.data.occupes || {} };
  }

  // Envoie une demande de reservation.
  // Retourne { ok:true, id } | { conflit:true } | { erreur, message } | { horsLigne:true }
  async function reserver(payload) {
    const r = await appel('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (r.horsLigne)        return { horsLigne: true };
    if (r.status === 201)   return { ok: true, id: r.data.id };
    if (r.status === 409)   return { conflit: true, message: r.data.message };
    return { erreur: true, message: r.data.message || 'La demande n a pas pu etre enregistree.' };
  }

  global.IsbaApi = { BASE, disponibilites, reserver };

})(window);
