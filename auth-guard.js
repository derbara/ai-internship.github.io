/* ============================================
   AUTH-GUARD.JS — Lock screen + управление навигацией
   Зависит от auth.js (window.TexelAuth)
   ============================================ */

(function () {

  // =============================================
  // 1. LOCK SCREEN
  // =============================================
  function createLockScreen(options) {
    const title = options.title || 'Требуется авторизация';
    const desc = options.desc || 'Войдите, чтобы получить доступ к этому разделу';
    const icon = options.icon || '🔒';

    const overlay = document.createElement('div');
    overlay.className = 'auth-lock-overlay';
    overlay.innerHTML = `
      <div class="auth-lock-card">
        <div class="auth-lock-icon">${icon}</div>
        <h2 class="auth-lock-title">${title}</h2>
        <p class="auth-lock-desc">${desc}</p>
        <button class="auth-lock-btn">Войти</button>
      </div>
    `;

    overlay.querySelector('.auth-lock-btn').addEventListener('click', () => {
      if (window.TexelAuth) window.TexelAuth.openModal();
    });

    return overlay;
  }

  function guardPage(selector, options) {
    const target = document.querySelector(selector);
    if (!target) return;

    target.style.position = 'relative';
    const lockScreen = createLockScreen(options || {});
    target.appendChild(lockScreen);

    if (window.TexelAuth) {
      window.TexelAuth.onReady((user) => {
        lockScreen.style.display = user ? 'none' : 'flex';
      });
    }

    return lockScreen;
  }

  // =============================================
  // 2. УПРАВЛЕНИЕ НАВИГАЦИЕЙ И CTA
  // =============================================
  function updateAuthUI() {
    if (!window.TexelAuth) return;

    window.TexelAuth.onReady((user) => {
      // Показать/скрыть "Избранное" в навигации
      document.querySelectorAll('.favorites-nav-item').forEach(el => {
        el.style.display = user ? '' : 'none';
      });

      // Скрыть CTA секцию для залогиненных
      const cta = document.getElementById('register-cta');
      if (cta) {
        cta.style.display = user ? 'none' : '';
      }
    });

    // CTA кнопка "Войти"
    const ctaBtn = document.getElementById('ctaLoginBtn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        window.TexelAuth.openModal();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', updateAuthUI);

  // =============================================
  // 3. ГЛОБАЛЬНЫЙ API
  // =============================================
  window.TexelGuard = {
    guardPage: guardPage,
    createLockScreen: createLockScreen
  };

})();
