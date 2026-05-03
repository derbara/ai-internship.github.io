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
    // Скрываем по умолчанию: не показываем экран блокировки, пока авторизация не разрешена
    // (иначе при переходе с homepage Firebase ~100мс восстанавливает сессию и lock мигает)
    lockScreen.style.display = 'none';
    target.appendChild(lockScreen);

    if (window.TexelAuth) {
      function checkAuth() {
        // Пока Firebase не сообщил состояние — оставляем lock скрытым
        if (!window.TexelAuth.isResolved() && !localStorage.getItem('yandexUser')) {
          lockScreen.style.display = 'none';
          return;
        }

        const firebaseUser = window.TexelAuth.getCurrentUser();
        const yandexUser = localStorage.getItem('yandexUser');

        lockScreen.style.display = (firebaseUser || yandexUser) ? 'none' : 'flex';
      }

      checkAuth();
      window.addEventListener('texel-auth-changed', checkAuth);
    }
    return lockScreen;
  }

  // =============================================
  // 2. УПРАВЛЕНИЕ НАВИГАЦИЕЙ И CTA
  // =============================================
  function updateAuthUI() {
    if (!window.TexelAuth) return;

    function updateUI() {
      // Пока авторизация не разрешена — не трогаем UI, иначе мигание при перезагрузке
      if (!window.TexelAuth.isResolved() && !localStorage.getItem('yandexUser')) {
        return;
      }
      const firebaseUser = window.TexelAuth.getCurrentUser();
      const yandexUser = localStorage.getItem('yandexUser');
      const isAuth = !!(firebaseUser || yandexUser);

      document.querySelectorAll('.favorites-nav-item').forEach(el => {
        el.style.display = isAuth ? '' : 'none';
      });

      const cta = document.getElementById('register-cta');
      if (cta) {
        cta.style.display = isAuth ? 'none' : '';
      }
    }

    updateUI();
    window.addEventListener('texel-auth-changed', updateUI);

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
