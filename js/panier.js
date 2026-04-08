'use strict';

function updateCartDisplay() {
  const items       = document.querySelectorAll('.cart-item');
  const cartEmpty   = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');

  if (items.length === 0) {
    cartEmpty.style.display   = 'block';
    cartContent.style.display = 'none';
  } else {
    cartEmpty.style.display   = 'none';
    cartContent.style.display = 'grid';

    let total = 0;
    items.forEach(item => { total += parseFloat(item.dataset.price || 0); });

    const fmt = n => n.toFixed(2).replace('.', ',') + ' €';
    document.getElementById('cart-subtotal').textContent = fmt(total);
    document.getElementById('cart-total').textContent    = fmt(total);
    const payBtn = document.querySelector('button[disabled]');
    if (payBtn) payBtn.textContent = 'Payer — ' + fmt(total);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // Boutons supprimer — gérés en JS, plus d'onclick inline
  document.querySelectorAll('.cart-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.cart-item').remove();
      updateCartDisplay();
    });
    btn.addEventListener('mouseenter', () => { btn.style.color = 'var(--error)'; });
    btn.addEventListener('mouseleave', () => { btn.style.color = 'var(--text-dim)'; });
  });

  // Affichage initial
  const hasItems = document.querySelectorAll('.cart-item').length > 0;
  document.getElementById('cart-empty').style.display   = hasItems ? 'none'  : 'block';
  document.getElementById('cart-content').style.display = hasItems ? 'grid'  : 'none';

});
