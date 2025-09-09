document.addEventListener('DOMContentLoaded', () => {
  // ----- Menu burger -----
  const toggle = document.querySelector('.nav-toggle'); // bouton
  const nav    = document.getElementById('site-nav');   // nav

  if (toggle && nav) {
    const closeNav = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('no-scroll', isOpen);
    });

    // Fermer au clic sur un lien
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        closeNav();
      }
    });

    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });
  }

  // ----- Marquer le lien courant -----
  const links = document.querySelectorAll('#site-nav a');
  const here  = location.pathname.replace(/index\.html$/, '');
  links.forEach(a => {
    const p = new URL(a.href, location.origin).pathname.replace(/index\.html$/, '');
    if (p === here) a.setAttribute('aria-current', 'page');
  });
});
// ----- Sous-menus en mobile : ouverture au clic sur le chevron -----
(function(){
  const toggles = document.querySelectorAll('.submenu-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const item = btn.closest('.has-submenu');
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
})();
