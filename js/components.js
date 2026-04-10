'use strict';

/* ============================================================
   Les Portes de l'Isba — Loader de page
   ============================================================ */
(function () {
  const loaderStart = Date.now();
  const MIN_MS      = 1800;

  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.innerHTML =
    '<img src="images/Logo.jpg" class="loader-logo" alt="Les Portes de l\'Isba">' +
    '<div class="loader-text">' +
      '<div class="loader-brand">Les Portes de l\'Isba</div>' +
      '<div class="loader-sub">Escape Game · Troyes</div>' +
    '</div>' +
    '<div class="loader-bar-wrap"><div class="loader-bar"></div></div>';

  document.body.prepend(loader);

  function hideLoader() {
    var delay = Math.max(0, MIN_MS - (Date.now() - loaderStart));
    setTimeout(function () { loader.classList.add('loader-hidden'); }, delay);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
  }
}());

/* ============================================================
   Les Portes de l'Isba — Header & Footer injectés
   ============================================================ */

const HEADER_HTML = `
<nav class="nav" id="main-nav">
  <div class="nav-inner">

    <a href="index.html" class="nav-logo">
      <img src="images/Logo.jpg" alt="Les Portes de l'Isba" data-fallback="hide">
      <span class="nav-logo-text">Les Portes<br>de l'Isba</span>
    </a>

    <div class="nav-links">
      <a href="nos-aventures.html" class="nav-link">Nos Aventures</a>
      <a href="nos-tarifs.html"    class="nav-link">Tarifs</a>
      <a href="team-building.html" class="nav-link">Team Building</a>
      <a href="evenements.html"    class="nav-link">Événements</a>
      <a href="faq.html"           class="nav-link">FAQ</a>
      <div class="nav-dropdown">
        <span class="nav-link" tabindex="0">À propos ▾</span>
        <div class="nav-dropdown-menu">
          <a href="qui-sommes-nous.html" class="nav-dropdown-item">Qui sommes-nous ?</a>
          <a href="histoire-isba.html"   class="nav-dropdown-item">Histoire de l'Isba</a>
          <a href="nous-contacter.html"  class="nav-dropdown-item">Nous contacter</a>
          <a href="nos-horaires.html"    class="nav-dropdown-item">Nos horaires</a>
        </div>
      </div>
    </div>

    <a href="reservation.html" class="btn btn-gold btn-sm nav-cta">Réserver</a>

    <button class="nav-hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>

  </div>
</nav>

<div class="nav-mobile" id="nav-mobile">
  <a href="nos-aventures.html"    class="nav-mobile-link">Nos Aventures</a>
  <a href="nos-tarifs.html"      class="nav-mobile-link">Tarifs</a>
  <a href="cheques-cadeaux.html" class="nav-mobile-link">Bons Cadeaux</a>
  <a href="team-building.html"   class="nav-mobile-link">Team Building</a>
  <a href="evenements.html"      class="nav-mobile-link">Événements</a>
  <a href="faq.html"             class="nav-mobile-link">FAQ</a>
  <div class="nav-mobile-sep"></div>
  <a href="qui-sommes-nous.html" class="nav-mobile-link">Qui sommes-nous ?</a>
  <a href="histoire-isba.html"   class="nav-mobile-link">Histoire de l'Isba</a>
  <a href="nous-contacter.html"  class="nav-mobile-link">Nous contacter</a>
  <a href="nos-horaires.html"    class="nav-mobile-link">Nos horaires</a>
  <div class="nav-mobile-sep"></div>
  <a href="reservation.html" class="btn btn-gold" style="margin-top:8px">Réserver</a>
</div>
`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="container container--wide">
    <div class="footer-grid">

      <div>
        <img src="images/Logo.jpg" alt="Les Portes de l'Isba" class="footer-brand-logo" data-fallback="hide">
        <p class="footer-brand-text">
          Escape game immersif à Troyes. Vivez une aventure hors du commun dans notre isba russe mystérieuse.
          Une équipe, une salle, une heure : votre aventure.
        </p>
        <div class="footer-socials">
          <a href="https://www.facebook.com/escapegameLIsba" target="_blank" rel="noopener noreferrer" class="footer-social" title="Facebook" aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://www.instagram.com/lesportesdelisba" target="_blank" rel="noopener noreferrer" class="footer-social" title="Instagram" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
        </div>
      </div>

      <div>
        <p class="footer-col-title">Navigation</p>
        <div class="footer-links">
          <a href="nos-aventures.html"    class="footer-link">Nos Aventures</a>
          <a href="nos-tarifs.html"      class="footer-link">Nos Tarifs</a>
          <a href="cheques-cadeaux.html" class="footer-link">Bons Cadeaux</a>
          <a href="team-building.html"   class="footer-link">Team Building</a>
          <a href="evenements.html"      class="footer-link">Événements</a>
          <a href="faq.html"             class="footer-link">FAQ</a>
          <a href="reservation.html"     class="footer-link">Réserver</a>
        </div>
      </div>

      <div>
        <p class="footer-col-title">À propos</p>
        <div class="footer-links">
          <a href="qui-sommes-nous.html"          class="footer-link">Qui sommes-nous ?</a>
          <a href="histoire-isba.html"           class="footer-link">Histoire de l'Isba</a>
          <a href="nous-contacter.html"          class="footer-link">Nous contacter</a>
          <a href="nos-horaires.html"            class="footer-link">Nos horaires</a>
          <a href="cgv.html"                     class="footer-link">CGV</a>
          <a href="politique-confidentialite.html" class="footer-link">Politique de confidentialité</a>
        </div>
      </div>

      <div>
        <p class="footer-col-title">Contact</p>
        <div class="footer-contact-item">
          <span class="footer-contact-icon ic-loc"></span>
          <span>1 route de Cupigny<br>10150 Creney-près-Troyes</span>
        </div>
        <div class="footer-contact-item">
          <span class="footer-contact-icon ic-tel"></span>
          <a href="tel:0786284769">07 86 28 47 69</a>
        </div>
        <div class="footer-contact-item">
          <span class="footer-contact-icon ic-mail"></span>
          <a href="mailto:escape-game@lesportesdelisba.fr">escape-game@lesportesdelisba.fr</a>
        </div>
      </div>

    </div>

    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Les Portes de l'Isba. Tous droits réservés.</span>
      <span>Site conçu par <a href="https://jibril-filali.github.io" target="_blank" rel="noopener noreferrer" style="color:var(--gold);transition:opacity .2s;" data-hover-opacity=".7">Jibzz</a></span>
    </div>
  </div>
</footer>
`;

/* ---- Injection ---- */
document.addEventListener('DOMContentLoaded', () => {
  const headerSlot = document.getElementById('header-placeholder');
  const footerSlot  = document.getElementById('footer-placeholder');

  if (headerSlot) headerSlot.innerHTML = HEADER_HTML;
  if (footerSlot)  footerSlot.innerHTML = FOOTER_HTML;

  // Barre de progression scroll
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  document.body.prepend(progressBar);

  // Sticky CTA mobile (masqué sur la page réservation)
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage !== 'reservation.html') {
    const sticky = document.createElement('div');
    sticky.id = 'mobile-sticky-cta';
    sticky.innerHTML = '<a href="reservation.html" class="btn btn-gold" style="width:100%;justify-content:center;">Réserver</a>';
    document.body.appendChild(sticky);
  }
  // Curseur clé (desktop uniquement)
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursorKey = document.createElement('div');
    cursorKey.id = 'cursor-key';
    cursorKey.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`;
    document.body.appendChild(cursorKey);
  }

  document.querySelectorAll('.nav-link, .nav-mobile-link, .footer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPage) link.classList.add('active');
  });

  // ---- Bouton WhatsApp ----
  const wa = document.createElement('a');
  wa.id = 'whatsapp-btn';
  wa.href = 'https://wa.me/33786284769';
  wa.target = '_blank';
  wa.rel = 'noopener noreferrer';
  wa.setAttribute('aria-label', 'Nous contacter sur WhatsApp');
  wa.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';
  document.body.appendChild(wa);

  // ---- Retour en haut ----
  const btt = document.createElement('button');
  btt.id = 'back-to-top';
  btt.setAttribute('aria-label', 'Retour en haut');
  btt.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(btt);
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // ---- Transition de page ----
  const pt = document.createElement('div');
  pt.id = 'page-transition';
  document.body.appendChild(pt);
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('http') ||
        href.startsWith('//') || link.target === '_blank') return;
    e.preventDefault();
    pt.classList.add('active');
    setTimeout(() => { window.location.href = href; }, 330);
  });

  // ---- Bandeau cookies RGPD ----
  if (!localStorage.getItem('cookie_consent')) {
    const cb = document.createElement('div');
    cb.id = 'cookie-banner';
    cb.innerHTML =
      '<p class="cookie-text">Nous utilisons des cookies pour améliorer votre expérience de navigation.' +
      ' En continuant, vous acceptez notre <a href="politique-confidentialite.html">politique de confidentialité</a>.</p>' +
      '<div class="cookie-btns">' +
        '<button class="cookie-btn cookie-btn-refuse">Refuser</button>' +
        '<button class="cookie-btn cookie-btn-accept">Accepter</button>' +
      '</div>';
    document.body.appendChild(cb);
    function dismissCookie(value) {
      localStorage.setItem('cookie_consent', value);
      cb.classList.add('dismissed');
    }
    cb.querySelector('.cookie-btn-accept').addEventListener('click', () => dismissCookie('accepted'));
    cb.querySelector('.cookie-btn-refuse').addEventListener('click', () => dismissCookie('refused'));
  }

  // ---- Schema.org JSON-LD (LocalBusiness) ----
  var schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'EntertainmentBusiness'],
    'name': 'Les Portes de l\'Isba',
    'image': 'https://lesportesdelisba.fr/images/Logo.jpg',
    'description': 'Escape game immersif à Troyes. Trois salles pour 2 à 6 joueurs.',
    '@id': 'https://lesportesdelisba.fr',
    'url': 'https://lesportesdelisba.fr',
    'telephone': '+33786284769',
    'email': 'escape-game@lesportesdelisba.fr',
    'priceRange': '€€',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '1 Route de Cupigny',
      'addressLocality': 'Creney-près-Troyes',
      'postalCode': '10150',
      'addressCountry': 'FR'
    },
    'geo': { '@type': 'GeoCoordinates', 'latitude': 48.2967, 'longitude': 4.0942 },
    'openingHoursSpecification': [
      { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday','Thursday','Friday','Saturday','Sunday'], 'opens': '09:30', 'closes': '23:00' },
      { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Tuesday','Wednesday'], 'opens': '00:00', 'closes': '00:00' }
    ],
    'sameAs': [
      'https://www.facebook.com/escapegameLIsba',
      'https://www.instagram.com/lesportesdelisba'
    ]
  };
  var schemaEl = document.createElement('script');
  schemaEl.type = 'application/ld+json';
  schemaEl.textContent = JSON.stringify(schema);
  document.head.appendChild(schemaEl);

});
