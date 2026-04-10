'use strict';

/* ============================================================
   Les Portes de l'Isba — Interactions principales
   ============================================================ */

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

  /* ---- Curseur clé ---- */
  const cursorKey = document.getElementById('cursor-key');
  if (cursorKey) {
    document.addEventListener('mousemove', e => {
      cursorKey.style.left = e.clientX + 'px';
      cursorKey.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, label.room-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorKey.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorKey.classList.remove('hover'));
    });
    document.addEventListener('mouseleave', () => { cursorKey.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursorKey.style.opacity = '1'; cursorKey.classList.add('visible'); });
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
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
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
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Formulaire contact (Formspree) ---- */
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
    // Remplacez XXXXXXXX par votre ID Formspree (formspree.io)
    const FORMSPREE = 'https://formspree.io/f/XXXXXXXX';
    const isConfigured = !FORMSPREE.includes('XXXXXXXX');

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Envoi en cours...';
      btn.disabled = true;

      if (!isConfigured) {
        // Mode démo — simule l'envoi
        await new Promise(r => setTimeout(r, 1200));
        btn.textContent = 'Message envoyé !';
        btn.style.background = '#16a34a';
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; contactForm.reset(); }, 3000);
        return;
      }

      try {
        const res = await fetch(FORMSPREE, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error();
        btn.textContent = 'Message envoyé !';
        btn.style.background = '#16a34a';
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; contactForm.reset(); }, 3000);
      } catch {
        btn.textContent = 'Erreur, réessayez';
        btn.style.background = '#dc2626';
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }, 3000);
      }
    });
  }

  /* ---- Parallaxe hero ---- */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      heroContent.style.transform = 'translateY(' + (window.scrollY * 0.13) + 'px)';
    }, { passive: true });
  }

  /* ---- Particules hero ---- */
  const heroSection = document.querySelector('.hero');
  if (heroSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

  /* ---- Badge prochain créneau (index uniquement) ---- */
  const heroBtns = document.querySelector('.hero-btns');
  if (heroBtns) {
    const schedule = [
      { day: 0, opens: 9.5,  closes: 23 },
      { day: 1, opens: 9.5,  closes: 23 },
      { day: 4, opens: 9.5,  closes: 23 },
      { day: 5, opens: 9.5,  closes: 23 },
      { day: 6, opens: 9.5,  closes: 23 },
    ];
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const now = new Date();
    const today = now.getDay();
    const nowH = now.getHours() + now.getMinutes() / 60;

    let label = '';
    for (let i = 0; i < 7; i++) {
      const d = (today + i) % 7;
      const slot = schedule.find(s => s.day === d);
      if (!slot) continue;
      if (i === 0 && nowH >= slot.opens && nowH < slot.closes) { label = 'Ouvert maintenant'; break; }
      if (i === 0 && nowH < slot.opens) { label = 'Aujourd\'hui à 09h30'; break; }
      if (i === 1) { label = 'Demain à 09h30'; break; }
      label = dayNames[d] + ' à 09h30'; break;
    }

    if (label) {
      const badge = document.createElement('div');
      badge.id = 'next-slot-badge';
      badge.innerHTML = '<span class="next-slot-dot"></span>' + label;
      heroBtns.after(badge);
    }
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

    const images = Array.from(lbTriggers);
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

    images.forEach((img, i) => { img.classList.add('lightbox-trigger'); img.addEventListener('click', () => openLb(i)); });
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
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      const style = IMG_FALLBACKS[img.dataset.fallback];
      if (style) img.style.cssText = style;
    });
  });

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
