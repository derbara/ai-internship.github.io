/* ============================================
   AUTH.JS — Авторизация через Firebase
   Google + Email/Password
   ============================================ */

(function () {

  // =============================================
  // 1. ИНЖЕКЦИЯ HTML МОДАЛКИ
  // =============================================
  function injectAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal-wrapper';
    modal.innerHTML = `
      <div class="auth-modal-overlay" id="authOverlay"></div>
      <div class="auth-modal-card">
        <button class="auth-close-btn" id="authCloseBtn">&times;</button>

        <!-- === ВХОД === -->
        <div class="auth-view" id="loginView">
          <div class="auth-head">
            <h2 class="auth-title">Вход</h2>
            <p class="auth-desc">Войди, чтобы сохранять прогресс и получать доступ к инструментам</p>
          </div>

          <button class="auth-google-btn" id="googleLoginBtn">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Войти через Google
          </button>
<button type="button" class="auth-yandex-btn js-yandex-login-btn">
  Войти через Яндекс
</button>
          <div class="auth-divider"><span>или</span></div>

          <form id="loginForm" class="auth-form">
            <label class="auth-field">
              <span class="auth-label">Email</span>
              <input type="email" id="loginEmail" class="auth-input" placeholder="you@example.com" required />
            </label>
            <label class="auth-field">
              <span class="auth-label">Пароль</span>
              <div class="auth-password-wrap">
                <input type="password" id="loginPassword" class="auth-input" placeholder="Введите пароль" required />
                <button type="button" class="auth-eye-btn" data-target="loginPassword" aria-label="Показать пароль">
                  <svg class="eye-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg class="eye-closed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </label>
            <div class="auth-error" id="loginError"></div>
            <button type="submit" class="auth-btn">Войти</button>
          </form>

          <div class="auth-switch">
            Нет аккаунта? <a href="#" id="showRegister">Регистрация</a>
          </div>
        </div>

        <!-- === РЕГИСТРАЦИЯ === -->
        <div class="auth-view" id="registerView" style="display:none;">
          <div class="auth-head">
            <h2 class="auth-title">Регистрация</h2>
            <p class="auth-desc">Создай аккаунт для полного доступа к платформе</p>
          </div>

          <button class="auth-google-btn" id="googleRegBtn">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Войти через Google
          </button>
<button type="button" class="auth-yandex-btn js-yandex-login-btn">
  Войти через Яндекс
</button>
          <div class="auth-divider"><span>или</span></div>

          <form id="registerForm" class="auth-form">
            <label class="auth-field">
              <span class="auth-label">Email</span>
              <input type="email" id="regEmail" class="auth-input" placeholder="you@example.com" required />
            </label>
            <label class="auth-field">
              <span class="auth-label">Пароль</span>
              <div class="auth-password-wrap">
                <input type="password" id="regPassword" class="auth-input" placeholder="Минимум 6 символов" required minlength="6" />
                <button type="button" class="auth-eye-btn" data-target="regPassword" aria-label="Показать пароль">
                  <svg class="eye-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg class="eye-closed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </label>
            <div class="auth-error" id="regError"></div>
            <button type="submit" class="auth-btn">Создать аккаунт</button>
          </form>

          <div class="auth-switch">
            Уже есть аккаунт? <a href="#" id="showLogin">Войти</a>
          </div>
        </div>

        <!-- === ПРОФИЛЬ === -->
        <div class="auth-view" id="profileView" style="display:none;">
          <div class="auth-head">
            <div class="auth-profile-avatar" id="profileAvatar">U</div>
            <h2 class="auth-title" id="profileName"></h2>
            <p class="auth-desc" id="profileEmail"></p>
          </div>
          <button class="auth-btn auth-logout-btn" id="logoutBtn">Выйти</button>
        </div>

      </div>
    `;
    document.body.appendChild(modal);

    // Eye toggle buttons
    modal.querySelectorAll('.auth-eye-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.dataset.target);
        var isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.querySelector('.eye-open').style.display = isHidden ? 'none' : '';
        btn.querySelector('.eye-closed').style.display = isHidden ? '' : 'none';
      });
    });
  }

  // =============================================
  // 2. МОДАЛКА: открытие / закрытие / переключение
  // =============================================
  let currentUser = null;
  let authResolved = false;

  // СИНХРОННОЕ восстановление пользователя из localStorage до любых async-операций.
  // Это гарантирует, что getCurrentUser() сразу возвращает юзера на любой странице,
  // не дожидаясь Firebase (~100мс) и не показывая lock screen.
  (function restoreUserSync() {
    try {
      const yandexRaw = localStorage.getItem('yandexUser');
      if (yandexRaw) {
        const raw = JSON.parse(yandexRaw);
        currentUser = {
          uid: 'yandex_' + (raw.id || raw.login || raw.default_email || 'unknown'),
          displayName: raw.display_name || raw.real_name || raw.login || 'Пользователь Яндекс',
          email: raw.default_email || (raw.emails && raw.emails[0]) || '',
          providerId: 'yandex.ru'
        };
        return;
      }
      const cachedRaw = localStorage.getItem('texel_auth_cache');
      if (cachedRaw) {
        currentUser = JSON.parse(cachedRaw);
      }
    } catch (e) {
      console.warn('Failed to restore user from cache:', e);
    }
  })();

  function openModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('auth-active');
    if (currentUser) {
      showView('profileView');
    } else {
      showView('loginView');
    }
  }

  function closeModal() {
    document.getElementById('authModal').classList.remove('auth-active');
    clearErrors();
  }

  function showView(viewId) {
    document.querySelectorAll('.auth-view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
    clearErrors();
  }

  function clearErrors() {
    document.querySelectorAll('.auth-error').forEach(e => {
      e.textContent = '';
      e.style.display = 'none';
    });
  }

  function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = 'block';
  }

  function getErrorMessage(code) {
    const messages = {
      'auth/email-already-in-use': 'Этот email уже зарегистрирован',
      'auth/invalid-email': 'Неверный формат email',
      'auth/weak-password': 'Пароль слишком короткий (минимум 6 символов)',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/invalid-credential': 'Неверный email или пароль',
      'auth/too-many-requests': 'Слишком много попыток. Подождите немного',
      'auth/popup-closed-by-user': 'Окно авторизации было закрыто',
      'auth/cancelled-popup-request': 'Подождите, окно уже открывается...',
      'auth/popup-blocked': 'Браузер заблокировал всплывающее окно. Разрешите попапы',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение'
    };
    return messages[code] || 'Произошла ошибка. Попробуйте ещё раз';
  }

  // =============================================
  // 3. ОБНОВЛЕНИЕ UI ПРОФИЛЯ
  // =============================================
  function cacheUser(user) {
    try {
      if (user) {
        localStorage.setItem('texel_auth_cache', JSON.stringify({
          uid: user.uid || '',
          displayName: user.displayName || '',
          email: user.email || '',
          providerId: user.providerId || ''
        }));
      } else {
        localStorage.removeItem('texel_auth_cache');
      }
    } catch (e) {}
  }

  function readCachedUser() {
    try {
      const raw = localStorage.getItem('texel_auth_cache');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function updateProfileIcon(user) {
    const btn = document.getElementById('profileBtn');
    if (!btn) return;

    if (user) {
      const name = user.displayName || user.email || 'U';
      const initial = name.charAt(0).toUpperCase();
      btn.innerHTML = `<span class="profile-initial">${initial}</span>`;
      btn.classList.add('profile-logged-in');
      cacheUser(user);
    } else {
      btn.innerHTML = '<span class="profile-initial">\u{1F464}</span>';
      btn.classList.remove('profile-logged-in');
      cacheUser(null);
    }
  }

  function updateProfileView(user) {
    if (!user) return;
    const name = user.displayName || 'Пользователь';
    const email = user.email || '';
    const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();

    document.getElementById('profileAvatar').textContent = initial;
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = email;
  }

  // =============================================
  // 4. FIREBASE AUTH
  // =============================================
  function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') {
      console.warn('Firebase SDK or config not loaded. Auth disabled.');
      return null;
    }

    if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
      console.warn('Firebase config not set. Replace values in firebase-config.js');
      return null;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    // Явно ставим LOCAL persistence — сессия переживает закрытие вкладки/браузера
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (err) {
      console.warn('Failed to set Firebase persistence:', err);
    });
    return auth;
  }

  let googleAuthInProgress = false;

  function loginWithGoogle(auth) {
    if (googleAuthInProgress) return;
    googleAuthInProgress = true;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(() => closeModal())
      .catch(err => {
        if (err.code !== 'auth/cancelled-popup-request') {
          showError('loginError', getErrorMessage(err.code));
        }
      })
      .finally(() => { googleAuthInProgress = false; });
  }

  function loginWithEmail(auth, email, password) {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => closeModal())
      .catch(err => showError('loginError', getErrorMessage(err.code)));
  }

  function registerWithEmail(auth, email, password) {
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => closeModal())
      .catch(err => showError('regError', getErrorMessage(err.code)));
  }

  function logout(auth) {
    const wasYandex = !!localStorage.getItem('yandexUser');
    localStorage.removeItem('yandexUser');
    localStorage.removeItem('texel_auth_cache');

    if (auth && auth.currentUser) {
      auth.signOut().then(() => closeModal());
    } else {
      closeModal();
    }

    if (wasYandex) {
      currentUser = null;
      authResolved = true;
      updateProfileIcon(null);
      window.dispatchEvent(new CustomEvent('texel-auth-changed', {
        detail: { user: null }
      }));
    }
  }

  // =============================================
  // 4b. ЯНДЕКС OAUTH
  // =============================================
  function normalizeYandexUser(raw) {
    return {
      uid: 'yandex_' + (raw.id || raw.login || raw.default_email || 'unknown'),
      displayName: raw.display_name || raw.real_name || raw.login || 'Пользователь Яндекс',
      email: raw.default_email || (raw.emails && raw.emails[0]) || '',
      providerId: 'yandex.ru'
    };
  }

  function loginWithYandex() {
    const clientId = '49caed66fd8d446e9af41e7ae42943ab';
    const redirectUri = encodeURIComponent(
      'https://derbara.github.io/ai-internship.github.io/'
    );
    // Запомним страницу, с которой вошли, чтобы вернуться после OAuth
    try {
      sessionStorage.setItem('yandexReturnUrl', window.location.href);
    } catch (e) {}
    const url = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = url;
  }

  function handleYandexAuth() {
    const fullUrl = window.location.href;
    if (!fullUrl.includes('access_token')) return;

    const hashPart = fullUrl.split('#')[1];
    const params = new URLSearchParams(hashPart);
    const token = params.get('access_token');
    if (!token) return;

    // сразу убираем токен из URL, чтобы не оставался в адресной строке
    history.replaceState(null, '', window.location.pathname + window.location.search);

    fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Yandex /info failed: ' + res.status);
        return res.json();
      })
      .then(raw => {
        const user = normalizeYandexUser(raw);
        localStorage.setItem('yandexUser', JSON.stringify(raw));

        currentUser = user;
        authResolved = true;
        updateProfileIcon(user);
        updateProfileView(user);

        window.dispatchEvent(new CustomEvent('texel-auth-changed', {
          detail: { user: user }
        }));

        closeModal();

        // Возврат на исходную страницу, если входили не с homepage
        try {
          const returnUrl = sessionStorage.getItem('yandexReturnUrl');
          sessionStorage.removeItem('yandexReturnUrl');
          if (returnUrl && returnUrl !== window.location.href.split('#')[0]) {
            window.location.replace(returnUrl);
          }
        } catch (e) {}
      })
      .catch(err => {
        console.error('Yandex auth error:', err);
        showError('loginError', 'Не удалось войти через Яндекс. Попробуйте ещё раз');
      });
  }
  // =============================================
  // 5. ИНИЦИАЛИЗАЦИЯ
  // =============================================
  document.addEventListener('DOMContentLoaded', () => {
    injectAuthModal();

    // currentUser уже восстановлен синхронно из localStorage до DOMContentLoaded.
    // Если он есть — обновить UI и пометить состояние как разрешённое для consumers.
    if (currentUser) {
      updateProfileIcon(currentUser);
      updateProfileView(currentUser);
      authResolved = true;
      window.dispatchEvent(new CustomEvent('texel-auth-changed', {
        detail: { user: currentUser }
      }));
    }

    handleYandexAuth();
    const auth = initFirebase();

    // Кнопка Яндекс — работает даже если Firebase не настроен
    document.querySelectorAll('.js-yandex-login-btn')
      .forEach(btn => btn.addEventListener('click', loginWithYandex));

    // Profile button + dropdown
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      // Inject dropdown menu
      // Путь к profile.html зависит от того, в какой папке открыта страница
      const isInPagesDir = /\/pages\//.test(window.location.pathname);
      const profileHref = isInPagesDir ? 'profile.html' : 'pages/profile.html';
      const dropdown = document.createElement('div');
      dropdown.className = 'profile-dropdown';
      dropdown.id = 'profileDropdown';
      dropdown.innerHTML = `
        <a href="${profileHref}" class="profile-dropdown-item">👤 Личный кабинет</a>
        <button class="profile-dropdown-item profile-dropdown-logout" id="dropdownLogout">🚪 Выход</button>
      `;
      profileBtn.parentElement.style.position = 'relative';
      profileBtn.parentElement.appendChild(dropdown);

      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentUser) {
          dropdown.classList.toggle('profile-dropdown-open');
        } else {
          openModal();
        }
      });

      // Logout from dropdown — работает и для Яндекс-пользователей без Firebase
      document.getElementById('dropdownLogout').addEventListener('click', () => {
        dropdown.classList.remove('profile-dropdown-open');
        logout(auth);
      });

      // Close dropdown on outside click
      document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove('profile-dropdown-open');
        }
      });
    }

    // Close modal
    document.getElementById('authCloseBtn').addEventListener('click', closeModal);
    document.getElementById('authOverlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Switch views
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      showView('registerView');
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      showView('loginView');
    });

    if (!auth) {
      // Firebase не настроен — резолвим состояние, чтобы guard не висел в loading
      if (!authResolved) {
        authResolved = true;
        window.dispatchEvent(new CustomEvent('texel-auth-changed', {
          detail: { user: currentUser }
        }));
      }
      // helpful message on form submit
      document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showError('loginError', 'Firebase не настроен. Заполните firebase-config.js');
      });
      document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showError('regError', 'Firebase не настроен. Заполните firebase-config.js');
      });
      document.getElementById('googleLoginBtn').addEventListener('click', () => {
        showError('loginError', 'Firebase не настроен. Заполните firebase-config.js');
      });
      document.getElementById('googleRegBtn').addEventListener('click', () => {
        showError('regError', 'Firebase не настроен. Заполните firebase-config.js');
      });
      // logout — даже без Firebase нужно уметь выйти из Яндекса
      document.getElementById('logoutBtn').addEventListener('click', () => logout(null));
      return;
    }

    // Google login
    document.getElementById('googleLoginBtn').addEventListener('click', () => loginWithGoogle(auth));
    document.getElementById('googleRegBtn').addEventListener('click', () => loginWithGoogle(auth));

    // Email login
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      loginWithEmail(auth, email, password);
    });

    // Email register
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      registerWithEmail(auth, email, password);
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => logout(auth));

    // Auth state observer
    auth.onAuthStateChanged((user) => {
      authResolved = true;

      // Если есть Яндекс-юзер — он приоритетнее Firebase null
      if (!user && localStorage.getItem('yandexUser')) {
        return;
      }

      // Firebase подтвердил юзера — обновляем currentUser реальным объектом
      if (user) {
        currentUser = user;
        updateProfileIcon(user);
        updateProfileView(user);
        window.dispatchEvent(new CustomEvent('texel-auth-changed', {
          detail: { user: user }
        }));
        return;
      }

      // Firebase подтвердил «не залогинен».
      // Если кэш был от Firebase-провайдера (не Яндекс) — сессия истекла, чистим.
      const cached = readCachedUser();
      const wasFirebaseSession = cached && cached.providerId !== 'yandex.ru';
      if (wasFirebaseSession || !cached) {
        currentUser = null;
        updateProfileIcon(null);
        window.dispatchEvent(new CustomEvent('texel-auth-changed', {
          detail: { user: null }
        }));
      }
    });
  });

  // =============================================
  // 6. ГЛОБАЛЬНЫЙ API
  // =============================================
  window.TexelAuth = {
    getCurrentUser: () => currentUser,
    isResolved: () => authResolved,
    openModal: openModal,
    onReady: (callback) => {
      if (authResolved) {
        callback(currentUser);
      }
      window.addEventListener('texel-auth-changed', (e) => callback(e.detail.user));
    }
  };

})();
