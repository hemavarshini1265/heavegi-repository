// Cart logic using localStorage
const Cart = (() => {
  const STORAGE_KEY = 'heavegi_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function addItem(product, qty = 1) {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx > -1) {
      cart[idx].qty += qty;
    } else {
      cart.push({ ...product, qty });
    }
    saveCart(cart);
    showToast(`${product.name} added to cart!`);
  }

  function removeItem(productId) {
    const cart = getCart().filter(i => i.id !== productId);
    saveCart(cart);
  }

  function updateQty(productId, qty) {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === productId);
    if (idx > -1) {
      if (qty <= 0) {
        cart.splice(idx, 1);
      } else {
        cart[idx].qty = qty;
      }
    }
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function getTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = getCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function showToast(msg) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      toast.style.cssText = `
        position:fixed;bottom:80px;right:20px;background:#232F3E;color:#fff;
        padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:opacity 0.3s;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  }

  // Initialize badge on load
  document.addEventListener('DOMContentLoaded', updateCartBadge);

  return { getCart, addItem, removeItem, updateQty, clearCart, getTotal, getCount, updateCartBadge, showToast };
})();
