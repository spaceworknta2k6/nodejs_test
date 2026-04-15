const sidebar = document.querySelector('.admin-sidebar');
const shell = document.querySelector('.admin-shell');
const openSidebarButton = document.querySelector('[data-admin-sidebar-toggle]');
const closeSidebarButton = document.querySelector('[data-admin-sidebar-close]');
const MOBILE_BREAKPOINT = 768;

if (shell && !shell.querySelector('.admin-sidebar-overlay')) {
  const overlay = document.createElement('button');
  overlay.type = 'button';
  overlay.className = 'admin-sidebar-overlay';
  overlay.setAttribute('aria-label', 'Đóng menu');
  shell.appendChild(overlay);
}

const sidebarOverlay = document.querySelector('.admin-sidebar-overlay');

const closeSidebar = () => {
  document.body.classList.remove('admin-sidebar-open');
};

const openSidebar = () => {
  document.body.classList.add('admin-sidebar-open');
};

if (openSidebarButton) {
  openSidebarButton.addEventListener('click', () => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      openSidebar();
    }
  });
}

if (closeSidebarButton) {
  closeSidebarButton.addEventListener('click', closeSidebar);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

window.addEventListener('resize', () => {
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    closeSidebar();
  }
});

const alertBoxes = document.querySelectorAll('.alert');

alertBoxes.forEach((alertBox) => {
  const closeBtn = alertBox.querySelector('.alert__close');
  const time = parseInt(alertBox.getAttribute('data-time'), 10) || 0;

  const hideAlert = () => {
    alertBox.classList.add('alert--hidden');
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', hideAlert);
  }

  if (time > 0) {
    setTimeout(hideAlert, time);
  }
});
