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

  /* ---- Formulaire contact ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Envoi...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Message envoyé !';
        btn.style.background = '#16a34a';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
          contactForm.reset();
        }, 3000);
      }, 1200);
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
