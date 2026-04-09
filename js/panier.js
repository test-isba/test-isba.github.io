'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const cartEmpty   = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  const cartItems   = document.getElementById('cart-items');

  // Charger la réservation depuis sessionStorage
  let reservation = null;
  try { reservation = JSON.parse(sessionStorage.getItem('reservation')); } catch (e) {}

  if (reservation && reservation.salle) {
    // Formater la date
    let dateLabel = reservation.date;
    if (reservation.date) {
      const d = new Date(reservation.date);
      dateLabel = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Construire l'article
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.dataset.price = reservation.prix;
    item.innerHTML =
      '<img src="' + reservation.salleImg + '" class="cart-item-img" data-fallback="card" loading="lazy">' +
      '<div class="cart-item-info">' +
        '<h4>' + reservation.salle + '</h4>' +
        '<p>' + dateLabel + ' · ' + reservation.creneau + ' · ' + reservation.joueurs + ' joueur' + (parseInt(reservation.joueurs) > 1 ? 's' : '') + '</p>' +
        (reservation.prenom ? '<p style="font-size:.8rem;color:var(--text-muted);">' + reservation.prenom + ' ' + reservation.nom + ' · ' + reservation.email + '</p>' : '') +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">' +
        '<span class="cart-item-price">' + reservation.prix + ' €</span>' +
        '<button class="cart-delete-btn" style="color:var(--text-dim);font-size:.75rem;transition:color var(--transition);">Supprimer</button>' +
      '</div>';
    cartItems.innerHTML = '';
    cartItems.appendChild(item);
  }

  function updateCartDisplay() {
    const items = document.querySelectorAll('.cart-item');
    if (items.length === 0) {
      cartEmpty.style.display   = 'block';
      cartContent.style.display = 'none';
      sessionStorage.removeItem('reservation');
    } else {
      cartEmpty.style.display   = 'none';
      cartContent.style.display = 'grid';

      let total = 0;
      items.forEach(item => { total += parseFloat(item.dataset.price || 0); });

      const fmt = n => n.toFixed(2).replace('.', ',') + ' \u20ac';
      document.getElementById('cart-subtotal').textContent = fmt(total);
      document.getElementById('cart-total').textContent    = fmt(total);
      const payBtn = document.querySelector('button[disabled]');
      if (payBtn) payBtn.textContent = 'Payer ' + fmt(total);
    }
  }

  // Boutons supprimer
  cartItems.addEventListener('click', e => {
    const btn = e.target.closest('.cart-delete-btn');
    if (!btn) return;
    btn.closest('.cart-item').remove();
    updateCartDisplay();
  });

  cartItems.addEventListener('mouseover', e => {
    const btn = e.target.closest('.cart-delete-btn');
    if (btn) btn.style.color = 'var(--error, #dc2626)';
  });
  cartItems.addEventListener('mouseout', e => {
    const btn = e.target.closest('.cart-delete-btn');
    if (btn) btn.style.color = 'var(--text-dim)';
  });

  updateCartDisplay();
});
