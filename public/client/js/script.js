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
