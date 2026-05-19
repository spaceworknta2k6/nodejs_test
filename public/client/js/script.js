const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (mobileMenuButton && mobileMenu) {
  const closeMenu = () => {
    document.body.classList.remove('mobile-menu-open');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    document.body.classList.add('mobile-menu-open');
    mobileMenuButton.setAttribute('aria-expanded', 'true');
  };

  mobileMenuButton.addEventListener('click', () => {
    const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
      return;
    }

    openMenu();
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 767.98) {
      closeMenu();
    }
  });
}

const cartLink = document.querySelector('[data-cart-link]');

const updateCartCount = (quantity) => {
  if (!cartLink) {
    return;
  }

  let cartCount = cartLink.querySelector('[data-cart-count]');

  if (quantity <= 0) {
    if (cartCount) {
      cartCount.remove();
    }
    return;
  }

  if (!cartCount) {
    cartCount = document.createElement('span');
    cartCount.className = 'cart-count';
    cartCount.dataset.cartCount = '';
    cartLink.appendChild(cartCount);
  }

  cartCount.textContent = quantity;
};

let cartToastTimer;

const showCartToast = (message, type = 'success') => {
  let toast = document.querySelector('[data-cart-toast]');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.dataset.cartToast = '';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('is-visible');

  window.clearTimeout(cartToastTimer);
  cartToastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2200);
};

document.querySelectorAll('.cart-add-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đang thêm...';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(new FormData(form)),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể thêm vào giỏ hàng.');
      }

      updateCartCount(result.cartQuantity || 0);
      showCartToast(result.message || 'Đã thêm sản phẩm vào giỏ hàng.');
    } catch (error) {
      showCartToast(error.message || 'Không thể thêm vào giỏ hàng.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
});

document.querySelectorAll('.client-alert').forEach((alert) => {
  const closeButton = alert.querySelector('.client-alert__close');
  const closeAlert = () => {
    alert.classList.remove('show');
    window.setTimeout(() => alert.remove(), 250);
  };
  const timeout = parseInt(alert.dataset.time, 10);

  if (closeButton) {
    closeButton.addEventListener('click', closeAlert);
  }

  if (timeout > 0) {
    window.setTimeout(closeAlert, timeout);
  }
});
