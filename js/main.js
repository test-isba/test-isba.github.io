'use strict';

/* ============================================================
   Les Portes de l'Isba — Interactions principales
   ============================================================ */

/* ---- Envoi des formulaires par la messagerie du visiteur ----
   Le site est hébergé sur GitHub Pages (fichiers statiques, aucun serveur) :
   les formulaires ouvrent la messagerie avec un email pré-rempli.
   Utilisé aussi par reservation.js et devis-form.js (chargés après ce fichier). */
const ISBA_EMAIL = 'escape-game@lesportesdelisba.fr';
const ISBA_TEL   = '07 86 28 47 69';

function ouvrirEmail(sujet, lignes) {
  const corps = lignes.filter(l => l !== null).join('\r\n');
  window.location.href = 'mailto:' + ISBA_EMAIL
    + '?subject=' + encodeURIComponent(sujet)
    + '&body=' + encodeURIComponent(corps);
}

// "2026-09-20" → "20 septembre 2026" (T00:00 : date locale, pas UTC)
function dateFr(iso) {
  return iso
    ? new Date(iso + 'T00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
}

// Après ouverture de la messagerie : rappel d'envoyer l'email + solution si rien ne s'est ouvert
function signalerEmailOuvert(form) {
  const btn = form.querySelector('[type="submit"]');
  let aide = form.querySelector('.email-aide');
  if (!aide) {
    aide = document.createElement('p');
    aide.className = 'email-aide';
    aide.setAttribute('role', 'status');
    aide.style.cssText = 'text-align:center;font-size:.85rem;color:var(--text-muted);margin-top:12px;line-height:1.6;';
    aide.innerHTML = 'Votre messagerie s&apos;est ouverte avec votre demande : pensez à <strong style="color:var(--text);">envoyer l&apos;email</strong>.<br>'
      + 'Rien ne s&apos;est ouvert ? Écrivez-nous à <a href="mailto:' + ISBA_EMAIL + '" style="color:var(--gold);">' + ISBA_EMAIL + '</a>'
      + ' ou appelez le <a href="tel:' + ISBA_TEL.replace(/\s/g, '') + '" style="color:var(--gold);white-space:nowrap;">' + ISBA_TEL + '</a>.';
    btn.insertAdjacentElement('afterend', aide);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Barre de progression scroll ---- */
  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    const updateProgress = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress.style.width = Math.min(scrolled * 100, 100) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---- Glitch sur le titre hero (déclenché au mouseenter uniquement) ---- */
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    heroTitle.addEventListener('mouseenter', () => {
      if (heroTitle.classList.contains('glitch')) return;
      heroTitle.classList.add('glitch');
      setTimeout(() => heroTitle.classList.remove('glitch'), 510);
    });
  }

  /* ---- Texte typé sur le hero ---- */
  const typedEl = document.querySelector('[data-typed]');
  if (typedEl) {
    const text = typedEl.textContent.trim();
    typedEl.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        typedEl.textContent += text[i++];
        setTimeout(type, 28);
      }
    };
    setTimeout(type, 600);
  }

  /* ---- Nav sticky ---- */
  const nav = document.getElementById('main-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Hamburger ---- */
  const hamburger  = document.getElementById('hamburger');
  const navMobile  = document.getElementById('nav-mobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll reveal (bidirectionnel) ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- Compteur animé (chiffres) ---- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current) + suffix;
          }
        }, 16);

        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => countObserver.observe(el));
  }

  /* ---- Panier : quantité ---- */
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.qty-control')?.querySelector('.qty-input');
      if (!input) return;
      const val = parseInt(input.value, 10);
      if (btn.dataset.action === 'minus' && val > 1) input.value = val - 1;
      if (btn.dataset.action === 'plus'  && val < 6) input.value = val + 1;
    });
  });

  /* ---- Smooth scroll ancres ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: window.IsbaMotion.comportement() });
      }
    });
  });

  /* ---- Formulaire contact (messagerie du visiteur) ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // Pré-remplissage du sujet via URL (?sujet=Bon+cadeau)
    const sujetParam = new URLSearchParams(window.location.search).get('sujet');
    if (sujetParam) {
      const sujetSelect = contactForm.querySelector('[name="sujet"]');
      if (sujetSelect) {
        Array.from(sujetSelect.options).forEach(opt => {
          if (opt.text.toLowerCase().includes(sujetParam.toLowerCase())) opt.selected = true;
        });
      }
    }

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm));
      const nomComplet = [data.prenom, data.nom].filter(Boolean).join(' ');

      ouvrirEmail(data.sujet + ' — ' + nomComplet, [
        'Bonjour,',
        '',
        data.message,
        '',
        '---',
        nomComplet,
        'Email : ' + data.email,
        data.telephone ? 'Téléphone : ' + data.telephone : null,
      ]);
      signalerEmailOuvert(contactForm);
    });
  }

  /* ---- Parallaxe hero ---- */
  // Le contenu qui glisse à contre-sens du scroll est exactement ce que la préférence
  // « réduire les animations » demande d'éviter : on ne branche même pas l'écouteur.
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && !window.IsbaMotion.reduit()) {
    window.addEventListener('scroll', () => {
      heroContent.style.transform = 'translateY(' + (window.scrollY * 0.13) + 'px)';
    }, { passive: true });
  }

  /* ---- Particules hero ---- */
  const heroSection = document.querySelector('.hero');
  if (heroSection && !window.IsbaMotion.reduit()) {
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      const size = 2 + Math.random() * 3;
      const isGold = Math.random() > 0.4;
      p.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (Math.random() * 100) + '%;' +
        'bottom:' + (Math.random() * 60) + '%;' +
        'background:' + (isGold ? 'rgba(189,138,30,' : 'rgba(164,100,151,') + (0.3 + Math.random() * 0.5) + ');' +
        'animation-duration:' + (5 + Math.random() * 8) + 's;' +
        'animation-delay:' + (Math.random() * 6) + 's;' +
        '--tx:' + (-20 + Math.random() * 40) + 'px;';
      heroSection.appendChild(p);
    }
  }

  /* ---- Badge prochain créneau (index uniquement) ----
     Les horaires viennent de config.json, edite dans Isba Admin. Ils etaient ecrits en
     dur ici : le badge annoncait donc les anciens horaires des que le client les
     changeait. Le repli ci-dessous ne sert que si config.json est injoignable. */
  const heroBtns = document.querySelector('.hero-btns');
  if (heroBtns) {
    const REPLI = [
      { jourJs: 1, ouvre: 9.5, ferme: 23 },   // lundi
      { jourJs: 4, ouvre: 9.5, ferme: 23 },   // jeudi
      { jourJs: 5, ouvre: 9.5, ferme: 23 },   // vendredi
      { jourJs: 6, ouvre: 9.5, ferme: 23 },   // samedi
      { jourJs: 0, ouvre: 9.5, ferme: 23 },   // dimanche
    ];
    const nomsJours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    function texteBadge(semaine) {
      const maintenant = new Date();
      const aujourdhui = maintenant.getDay();
      const heureH = maintenant.getHours() + maintenant.getMinutes() / 60;

      for (let i = 0; i < 7; i++) {
        const d = (aujourdhui + i) % 7;
        const jour = semaine.find(s => s.jourJs === d);
        if (!jour) continue;
        const ouverture = window.IsbaHoraires ? IsbaHoraires.heureEnTexte(jour.ouvre) : '09h30';
        if (i === 0 && jour.ferme !== null && heureH >= jour.ouvre && heureH < jour.ferme) return 'Ouvert maintenant';
        if (i === 0 && heureH < jour.ouvre) return 'Aujourd\'hui à ' + ouverture;
        if (i === 1) return 'Demain à ' + ouverture;
        return nomsJours[d] + ' à ' + ouverture;
      }
      return '';
    }

    function afficherBadge(semaine) {
      const texte = texteBadge(semaine);
      let badge = document.getElementById('next-slot-badge');
      if (!texte) { if (badge) badge.remove(); return; }
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'next-slot-badge';
        heroBtns.after(badge);
      }
      badge.innerHTML = '<span class="next-slot-dot"></span>' + texte;
    }

    // Affichage immediat avec le repli, puis correction des que la config arrive :
    // le visiteur ne voit jamais de vide en attendant le fichier.
    afficherBadge(REPLI);
    if (window.IsbaHoraires) {
      IsbaHoraires.chargerConfig().then(config => {
        const semaine = config && IsbaHoraires.semaineOuverte(config);
        if (semaine) afficherBadge(semaine);
      });
    }
  }

  /* ---- Horaires de la page contact ----
     Ils etaient ecrits en dur dans le HTML, et cette page ne charge pas
     from-config.js : ils auraient donc menti des que le client change ses horaires
     dans Isba Admin. Le HTML garde les valeurs actuelles en repli, remplacees ici
     des que config.json est lu. */
  const blocInt = document.getElementById('contact-horaires-int');
  const blocExt = document.getElementById('contact-horaires-ext');
  if ((blocInt || blocExt) && window.IsbaHoraires) {
    IsbaHoraires.chargerConfig().then(config => {
      if (!config) return;

      const remplir = (cible, categorie) => {
        if (!cible) return;
        const groupes = IsbaHoraires.groupesOuverture(config, categorie);
        if (!groupes) return;

        const lignes = groupes.map(g => {
          const jours = g.jours.map(d => IsbaHoraires.NOMS_COURTS[d]).join(', ');
          const heures = g.ferme === null
            ? 'à partir de ' + IsbaHoraires.heureEnTexte(g.ouvre)
            : IsbaHoraires.heureEnTexte(g.ouvre) + ' – ' + IsbaHoraires.heureEnTexte(g.ferme);
          return jours + ' : ' + heures;
        });

        // Les jours absents des groupes sont les jours de fermeture
        const ouverts = new Set(groupes.flatMap(g => g.jours));
        const fermes = [1, 2, 3, 4, 5, 6, 0]
          .filter(d => !ouverts.has(d))
          .map(d => IsbaHoraires.NOMS_COURTS[d]);
        if (fermes.length) lignes.push(fermes.join(', ') + ' : Fermé');

        cible.replaceChildren(...lignes.map(t => {
          const p = document.createElement('p');
          p.textContent = t;
          return p;
        }));
      };

      remplir(blocInt, 'interieures');
      remplir(blocExt, 'exterieures');
    });
  }

  /* ---- Lightbox ---- */
  const lbTriggers = document.querySelectorAll('[data-lightbox]');
  if (lbTriggers.length) {
    const lb      = document.createElement('div');
    lb.id = 'lightbox';
    const lbImg   = document.createElement('img'); lbImg.id = 'lightbox-img';
    const lbClose = document.createElement('div'); lbClose.id = 'lightbox-close'; lbClose.textContent = '×';
    const lbPrev  = document.createElement('div'); lbPrev.id  = 'lightbox-prev';  lbPrev.className = 'lightbox-nav'; lbPrev.innerHTML = '&#8249;';
    const lbNext  = document.createElement('div'); lbNext.id  = 'lightbox-next';  lbNext.className = 'lightbox-nav'; lbNext.innerHTML = '&#8250;';
    const lbCap   = document.createElement('div'); lbCap.id   = 'lightbox-caption';
    lb.append(lbClose, lbPrev, lbImg, lbNext, lbCap);
    document.body.appendChild(lb);

    // Liste recalculée à chaque ouverture : une image introuvable est retirée de la page (voir fallback plus bas)
    let images = [];
    let current = 0;

    function openLb(idx) {
      current = idx;
      lbImg.src = images[idx].src;
      lbCap.textContent = images[idx].alt || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbPrev.style.display = images.length > 1 ? '' : 'none';
      lbNext.style.display = images.length > 1 ? '' : 'none';
    }
    function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; }

    lbTriggers.forEach(img => {
      img.classList.add('lightbox-trigger');
      img.addEventListener('click', () => {
        images = Array.from(lbTriggers).filter(el => el.isConnected);
        openLb(images.indexOf(img));
      });
    });
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    lbPrev.addEventListener('click', () => openLb((current - 1 + images.length) % images.length));
    lbNext.addEventListener('click', () => openLb((current + 1) % images.length));
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft')  lbPrev.click();
      if (e.key === 'ArrowRight') lbNext.click();
    });
  }

  /* ---- Fallback images (remplace les onerror inline) ---- */
  const IMG_FALLBACKS = {
    'large':     'width:100%;height:360px;display:block;background:var(--bg-3);border-radius:var(--radius-lg)',
    'team':      'width:100%;height:260px;display:block;background:var(--bg-3)',
    'gallery':   'width:100%;height:220px;display:block;background:var(--bg-3);border-radius:var(--radius-lg)',
    'card':      'width:80px;height:60px;display:block;background:var(--bg-3);border-radius:var(--radius);flex-shrink:0',
    'parchemin': 'width:100%;height:300px;display:block;background:var(--bg-3);border-radius:var(--radius-lg)',
    'hide':      'display:none',
  };
  // Remplace l'image introuvable par un bloc vide de même taille (une <img> cassée garde l'icône du navigateur)
  const appliquerFallback = img => {
    const style = IMG_FALLBACKS[img.dataset.fallback];
    if (!style) return;
    const bloc = document.createElement('div');
    bloc.className = img.className.replace('lightbox-trigger', '').trim();
    bloc.style.cssText = style;
    bloc.setAttribute('aria-hidden', 'true');
    img.replaceWith(bloc);
  };
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    // Une image introuvable a pu échouer avant ce script : "error" ne se redéclenchera pas
    if (img.complete && img.naturalWidth === 0) appliquerFallback(img);
    else img.addEventListener('error', () => appliquerFallback(img));
  });

  /* ---- Carte Google Maps sur demande ----
     L'iframe n'est creee qu'au clic : tant que le visiteur ne la demande pas, son
     navigateur ne contacte jamais Google. C'est ce qui evite d'avoir a lui demander
     son consentement au chargement de la page. */
  const carteBouton = document.getElementById('carte-afficher');
  if (carteBouton) {
    carteBouton.addEventListener('click', () => {
      const bloc = document.getElementById('carte');
      const cadre = document.createElement('iframe');
      cadre.src = 'https://maps.google.com/maps?q=1+Route+de+Cupigny%2C+10150+Creney-pr%C3%A8s-Troyes%2C+France&output=embed&hl=fr&z=15';
      cadre.width = '100%';
      cadre.height = '220';
      cadre.loading = 'lazy';
      cadre.referrerPolicy = 'no-referrer-when-downgrade';
      cadre.title = 'Localisation Les Portes de l Isba';
      cadre.allowFullscreen = true;
      bloc.replaceChildren(cadre);
      bloc.classList.add('carte-bloc--chargee');
    });
  }

  /* ---- Liens hover (remplace les onmouseover/onmouseout inline) ---- */
  document.querySelectorAll('[data-hover-color]').forEach(el => {
    const original = el.dataset.hoverColor;
    el.addEventListener('mouseenter', () => { el.style.color = original; });
    el.addEventListener('mouseleave', () => { el.style.color = ''; });
  });

  document.querySelectorAll('[data-hover-opacity]').forEach(el => {
    const val = el.dataset.hoverOpacity;
    el.addEventListener('mouseenter', () => { el.style.opacity = val; });
    el.addEventListener('mouseleave', () => { el.style.opacity = '1'; });
  });

});
