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

  /* ---- Curseur personnalisé ---- */
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');
  if (cursor && cursorDot) {
    document.addEventListener('mousemove', e => {
      cursor.style.left    = e.clientX + 'px';
      cursor.style.top     = e.clientY + 'px';
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, [role="button"], label.room-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
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

    // Fermer sur clic d'un lien
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

      // Fermer tous
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

      // Ouvrir si était fermé
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

  /* ---- Réservation : mise à jour du prix ---- */
  const reservationForm = document.getElementById('reservation-form');
  if (reservationForm) {
    const roomSelect    = document.getElementById('res-room');
    const playersSelect = document.getElementById('res-players');
    const priceDisplay  = document.getElementById('res-price');

    const PRICES = {
      '2': 80,
      '3': 90,
      '4': 104,
      '5': 120,
      '6': 132
    };

    const updatePrice = () => {
      const players = playersSelect ? playersSelect.value : null;
      if (priceDisplay && players && PRICES[players]) {
        priceDisplay.textContent = PRICES[players] + ' €';
      }
    };

    if (playersSelect) playersSelect.addEventListener('change', updatePrice);
    updatePrice();
  }

  /* ---- Panier : quantité ---- */
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.qty-control')?.querySelector('.qty-input');
      if (!input) return;
      const val = parseInt(input.value, 10);
      if (btn.dataset.action === 'minus' && val > 1) input.value = val - 1;
      if (btn.dataset.action === 'plus'  && val < 6) input.value = val + 1;
      updateCartTotal();
    });
  });

  function updateCartTotal() {
    let total = 0;
    document.querySelectorAll('.cart-item').forEach(item => {
      const price = parseFloat(item.dataset.price || 0);
      const qty   = parseInt(item.querySelector('.qty-input')?.value || 1, 10);
      total += price * qty;
    });
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = total.toFixed(2) + ' €';
  }

  /* ---- Smooth scroll ancres ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // hauteur nav
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

      // Simulation — à remplacer par vrai appel fetch vers backend
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

});
