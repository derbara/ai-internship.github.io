/* ============================================
   MAIN.JS — Интерактив для всего сайта TEXEL
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // =============================================
  // 1. SCROLL REVEAL — анимация появления блоков
  // =============================================
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((el, i) => {
      el.style.transitionDelay = `${i % 4 * 0.1}s`;
      revealObserver.observe(el);
    });
  }

  // =============================================
  // 2. БУРГЕР-МЕНЮ для мобильных
  // =============================================
  const burger = document.querySelector('.burger-btn');
  const navLinks = document.querySelector('.nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      navLinks.classList.toggle('nav-open');
    });

    // Закрытие при клике на ссылку
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinks.classList.remove('nav-open');
      });
    });
  }

  // =============================================
  // 3. КНОПКА «НАВЕРХ»
  // =============================================
  const scrollBtn = document.querySelector('.scroll-top-btn');

  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =============================================
  // 4. АКТИВНАЯ ССЫЛКА В НАВИГАЦИИ
  // =============================================
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href').split('#')[0];
    if (href === currentPage) {
      link.classList.add('nav-active');
    }
  });

  // =============================================
  // 5. ПЛАВНОЕ ПОЯВЛЕНИЕ СТРАНИЦЫ
  // =============================================
  document.body.classList.add('page-loaded');

});
