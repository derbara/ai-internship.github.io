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

          <div class="auth-divider"><span>или</span></div>

          <form id="loginForm" class="auth-form">
            <label class="auth-field">
              <span class="auth-label">Email</span>
              <input type="email" id="loginEmail" class="auth-input" placeholder="you@example.com" required />
            </label>
            <label class="auth-field">
              <span class="auth-label">Пароль</span>
              <input type="password" id="loginPassword" class="auth-input" placeholder="Введите пароль" required />
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

          <div class="auth-divider"><span>или</span></div>

          <form id="registerForm" class="auth-form">
            <label class="auth-field">
              <span class="auth-label">Email</span>
              <input type="email" id="regEmail" class="auth-input" placeholder="you@example.com" required />
            </label>
            <label class="auth-field">
              <span class="auth-label">Пароль</span>
              <input type="password" id="regPassword" class="auth-input" placeholder="Минимум 6 символов" required minlength="6" />
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
  }

  // =============================================
  // 2. МОДАЛКА: открытие / закрытие / переключение
  // =============================================
  let currentUser = null;
  let authResolved = false;

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
  function updateProfileIcon(user) {
    const btn = document.getElementById('profileBtn');
    if (!btn) return;

    if (user) {
      const name = user.displayName || user.email || 'U';
      const initial = name.charAt(0).toUpperCase();
      btn.innerHTML = `<span class="profile-initial">${initial}</span>`;
      btn.classList.add('profile-logged-in');
    } else {
      btn.innerHTML = '<span class="profile-initial">\u{1F464}</span>';
      btn.classList.remove('profile-logged-in');
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
    return firebase.auth();
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
    auth.signOut().then(() => closeModal());
  }

  // =============================================
  // 5. ИНИЦИАЛИЗАЦИЯ
  // =============================================
  document.addEventListener('DOMContentLoaded', () => {
    injectAuthModal();

    const auth = initFirebase();

    // Profile button + dropdown
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      // Inject dropdown menu
      const dropdown = document.createElement('div');
      dropdown.className = 'profile-dropdown';
      dropdown.id = 'profileDropdown';
      dropdown.innerHTML = `
        <a href="profile.html" class="profile-dropdown-item">👤 Личный кабинет</a>
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

      // Logout from dropdown
      document.getElementById('dropdownLogout').addEventListener('click', () => {
        dropdown.classList.remove('profile-dropdown-open');
        if (auth) logout(auth);
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
      // Firebase not configured — show helpful message on form submit
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
      document.getElementById('logoutBtn').addEventListener('click', closeModal);
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
      currentUser = user;
      authResolved = true;
      updateProfileIcon(user);
      if (user) {
        updateProfileView(user);
      }
      window.dispatchEvent(new CustomEvent('texel-auth-changed', {
        detail: { user: user }
      }));
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
