document.addEventListener('DOMContentLoaded', () => {
  // Burger
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('site-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // aria-current sur le lien courant
  const links = document.querySelectorAll('#site-nav a');
  const here = location.pathname.replace(/index\.html$/, '');
  links.forEach(a => {
    const p = new URL(a.href).pathname.replace(/index\.html$/, '');
    if (p === here) a.setAttribute('aria-current', 'page');
  });
});
