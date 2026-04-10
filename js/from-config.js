'use strict';

(async function () {
  let config;
  try {
    const res = await fetch('data/config.json');
    if (!res.ok) return;
    config = await res.json();
  } catch (e) {
    return;
  }

  // ─── UTILITAIRES HORAIRES ──────────────────────────────────────
  // Parse "09h30" → 9.5, "Fermé" → null
  function parseHeure(str) {
    const m = str.trim().match(/^(\d+)h(\d+)/);
    if (!m) return null;
    return parseInt(m[1]) + parseInt(m[2]) / 60;
  }

  function renderRows(rows, tableId) {
    const table = document.getElementById(tableId);
    if (!table || !rows) return;
    table.innerHTML = rows.map(r => {
      const ferme = /ferm/i.test(r.horaire);
      return `<tr><td>${r.jour}</td><td${ferme ? ' class="ferme"' : ''}>${r.horaire}</td></tr>`;
    }).join('');
  }

  // ─── TARIFS (nos-tarifs.html) ──────────────────────────────────
  const tarifsCards = document.getElementById('tarifs-cards');
  if (tarifsCards && config.tarifs) {
    const sessions = config.tarifs.sessions;

    function priceCard(s, showFeatures) {
      const featured = !!s.featured;
      return `
        <div class="price-card${featured ? ' featured' : ''}">
          ${featured ? '<div class="price-card-badge"><span class="badge badge-gold">Le plus choisi</span></div>' : ''}
          <h3>${s.joueurs} joueurs</h3>
          <div class="price-amount">${s.prix} <span>€ / session</span></div>
          <p class="price-desc">${s.parPersonne} € par personne</p>
          ${showFeatures ? `
          <ul class="price-features">
            <li>Session 60 minutes</li>
            <li>Salle au choix</li>
            <li>Introduction par le maître du jeu</li>
            <li>Parking gratuit</li>
          </ul>` : ''}
          <a href="reservation.html" class="btn ${featured ? 'btn-gold' : 'btn-outline'}" style="width:100%;justify-content:center;${showFeatures ? '' : 'margin-top:16px;'}">Réserver</a>
        </div>`;
    }

    tarifsCards.innerHTML =
      `<div class="grid-3 reveal visible" style="margin-bottom:48px;">
        ${sessions.slice(0, 3).map(s => priceCard(s, true)).join('')}
      </div>
      <div class="grid-2 reveal visible" style="max-width:740px; margin:0 auto 48px;">
        ${sessions.slice(3).map(s => priceCard(s, false)).join('')}
      </div>`;
  }

  // ─── HORAIRES (nos-horaires.html) ─────────────────────────────
  if (config.horaires) {
    renderRows(config.horaires.interieures, 'table-interieures');
    renderRows(config.horaires.exterieures, 'table-exterieures');
    renderRows(config.horaires.interieures, 'home-table-int');
    renderRows(config.horaires.exterieures, 'home-table-ext');
  }

  // ─── TARIFS APERCU (index.html) ───────────────────────────────
  const homeTarifs = document.getElementById('home-tarifs-cards');
  if (homeTarifs && config.tarifs) {
    const s = config.tarifs.sessions;
    const cards = [
      { session: s[0], label: 'Duo',    featured: false },
      { session: s[2], label: 'Groupe', featured: true  },
      { session: s[4], label: 'Équipe', featured: false },
    ].filter(c => c.session);

    homeTarifs.innerHTML = cards.map(c => `
      <div class="price-card${c.featured ? ' featured' : ''}">
        ${c.featured ? '<div class="price-card-badge"><span class="badge badge-gold">Populaire</span></div>' : ''}
        <h3>${c.label}</h3>
        <div class="price-amount">${c.session.prix} <span>€</span></div>
        <p class="price-desc">Pour ${c.session.joueurs} joueurs</p>
        <a href="reservation.html" class="btn ${c.featured ? 'btn-gold' : 'btn-outline'}" style="width:100%; justify-content:center;">Réserver</a>
      </div>`).join('');
  }

  // ─── BADGE OUVERT MAINTENANT (index.html) ─────────────────────
  const badge = document.getElementById('next-slot-badge');
  if (badge && config.horaires) {
    // config.horaires.interieures est ordonné [Lundi, Mardi, ..., Dimanche]
    // getDay() : 0=Dim, 1=Lun, ..., 6=Sam → config index : 0→6, 1→0, ..., 6→5
    const cfgIndex = d => d === 0 ? 6 : d - 1;
    const rows = config.horaires.interieures;
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const now   = new Date();
    const today = now.getDay();
    const nowH  = now.getHours() + now.getMinutes() / 60;

    let label = '';
    for (let i = 0; i < 7; i++) {
      const dayJs = (today + i) % 7;
      const row   = rows[cfgIndex(dayJs)];
      if (!row) continue;
      const opens = parseHeure(row.horaire);
      if (opens === null) continue; // fermé

      const parts  = row.horaire.split(/\s*[–-]\s*/);
      const closes = parts[1] ? parseHeure(parts[1]) : null;
      const openStr = parts[0].trim();

      if (i === 0) {
        if (nowH >= opens && (closes === null || nowH < closes)) {
          label = 'Ouvert maintenant'; break;
        } else if (nowH < opens) {
          label = `Aujourd'hui à ${openStr}`; break;
        }
      } else if (i === 1) {
        label = `Demain à ${openStr}`; break;
      } else {
        label = `${dayNames[dayJs]} à ${openStr}`; break;
      }
    }

    if (label) badge.innerHTML = '<span class="next-slot-dot"></span>' + label;
  }

  // ─── FAQ (faq.html) ───────────────────────────────────────────
  const faqSections = document.getElementById('faq-sections');
  if (faqSections && config.faq) {
    faqSections.innerHTML = config.faq.map(cat => `
      <h3 style="color:var(--gold);margin-bottom:24px;font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;">${cat.categorie}</h3>
      <div style="margin-bottom:48px;" class="reveal visible">
        ${cat.questions.map(q => `
          <div class="faq-item">
            <div class="faq-question">
              ${q.question}
              <div class="faq-icon">+</div>
            </div>
            <div class="faq-answer">
              <div class="faq-answer-inner">${q.reponse}</div>
            </div>
          </div>`).join('')}
      </div>`).join('');

    faqSections.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item   = q.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ─── BONS CADEAUX (cheques-cadeaux.html) ─────────────────────
  const gcCards = document.getElementById('cheques-cadeaux-cards');
  if (gcCards && config.tarifs) {
    const sessions = config.tarifs.sessions;

    function giftCard(s) {
      const featured = !!s.featured;
      return `
        <div class="price-card${featured ? ' featured' : ''}">
          ${featured ? '<div class="price-card-badge"><span class="badge badge-gold">Le plus offert</span></div>' : ''}
          <h3>${s.joueurs} joueurs</h3>
          <div class="price-amount">${s.prix} <span>€</span></div>
          <p class="price-desc">${s.parPersonne} € par personne</p>
          <a href="nous-contacter.html?sujet=Bon+cadeau" class="btn ${featured ? 'btn-gold' : 'btn-outline'}" style="width:100%;justify-content:center;margin-top:16px;">Commander ce bon</a>
        </div>`;
    }

    gcCards.innerHTML =
      `<div class="grid-3 reveal visible" style="margin-bottom:48px;">
        ${sessions.slice(0, 3).map(s => giftCard(s)).join('')}
      </div>
      <div class="grid-2 reveal visible" style="max-width:740px;margin:0 auto 48px;">
        ${sessions.slice(3).map(s => giftCard(s)).join('')}
      </div>`;
  }

  // ─── SALLES (nos-aventures.html) ──────────────────────────────
  if (config.salles) {
    config.salles.forEach(salle => {
      const section = document.getElementById(salle.id);
      if (!section) return;

      const set = (field, value) => {
        const el = section.querySelector(`[data-field="${field}"]`);
        if (el) el.textContent = value;
      };

      set('type',         salle.type);
      set('tagline',      `"${salle.tagline}"`);
      set('description1', salle.description1);
      set('description2', salle.description2);

      const badges = section.querySelector('[data-field="badges"]');
      if (badges) {
        badges.innerHTML = `
          <span class="badge badge-gold">${salle.joueurs}</span>
          <span class="badge badge-purple">${salle.duree}</span>
          <span class="badge badge-purple">Difficulté : ${salle.difficulte}</span>
          <span class="badge badge-gold">${salle.ageMin}</span>`;
      }
    });
  }

})();
