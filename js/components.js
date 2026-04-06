'use strict';

/* ============================================================
   Les Portes de l'Isba — Header & Footer injectés
   ============================================================ */

const HEADER_HTML = `
<nav class="nav" id="main-nav">
  <div class="nav-inner">

    <a href="index.html" class="nav-logo">
      <img src="images/Logo.jpg" alt="Les Portes de l'Isba" onerror="this.style.display='none'">
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
  <a href="nos-aventures.html" class="nav-mobile-link">Nos Aventures</a>
  <a href="nos-tarifs.html"    class="nav-mobile-link">Tarifs</a>
  <a href="team-building.html" class="nav-mobile-link">Team Building</a>
  <a href="evenements.html"    class="nav-mobile-link">Événements</a>
  <a href="faq.html"           class="nav-mobile-link">FAQ</a>
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
        <img src="images/Logo.jpg" alt="Les Portes de l'Isba" class="footer-brand-logo"
             onerror="this.style.display='none'">
        <p class="footer-brand-text">
          Escape game immersif à Troyes. Vivez une aventure hors du commun dans notre isba russe mystérieuse.
          Une équipe, une salle, une heure : votre aventure.
        </p>
        <div class="footer-socials">
          <a href="https://www.facebook.com/escapegameLIsba" target="_blank" rel="noopener" class="footer-social footer-social--fb" title="Facebook">Fb</a>
          <a href="https://www.instagram.com/lesportesdelisba" target="_blank" rel="noopener" class="footer-social footer-social--ig" title="Instagram">Ig</a>
        </div>
      </div>

      <div>
        <p class="footer-col-title">Navigation</p>
        <div class="footer-links">
          <a href="nos-aventures.html"   class="footer-link">Nos Aventures</a>
          <a href="nos-tarifs.html"      class="footer-link">Nos Tarifs</a>
          <a href="team-building.html"   class="footer-link">Team Building</a>
          <a href="evenements.html"      class="footer-link">Événements</a>
          <a href="faq.html"             class="footer-link">FAQ</a>
          <a href="reservation.html"     class="footer-link">Réserver</a>
        </div>
      </div>

      <div>
        <p class="footer-col-title">À propos</p>
        <div class="footer-links">
          <a href="qui-sommes-nous.html" class="footer-link">Qui sommes-nous ?</a>
          <a href="histoire-isba.html"   class="footer-link">Histoire de l'Isba</a>
          <a href="nous-contacter.html"  class="footer-link">Nous contacter</a>
          <a href="nos-horaires.html"    class="footer-link">Nos horaires</a>
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
      <span>Site conçu par <a href="#" style="color:var(--gold);transition:opacity .2s;" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">Jibzz</a></span>
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

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-mobile-link, .footer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPage) link.classList.add('active');
  });
});
