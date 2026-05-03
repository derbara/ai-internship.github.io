/* ============================================
   PROFILE.JS — Личный кабинет TEXEL
   Прогресс, титулы, достижения
   ============================================ */

(function () {

  var db = null;

  function initFirestore() {
    try {
      if (firebase && firebase.firestore) {
        db = firebase.firestore();
      }
    } catch(e) {}
  }

  // =============================================
  // 1. ДАННЫЕ ДОСТИЖЕНИЙ
  // =============================================

  var TITLES = {
    python: [
      { min: 1, icon: '🐣', name: 'Python-новичок', desc: 'Пройден 1 уровень по Python' },
      { min: 3, icon: '🐍', name: 'Python-практик', desc: 'Пройдены 3 уровня по Python' },
      { min: 5, icon: '📜', name: 'Python-выпускник', desc: 'Пройдены все 5 уровней по Python' }
    ],
    html: [
      { min: 1, icon: '🌱', name: 'Веб-новичок', desc: 'Пройден 1 уровень по HTML' },
      { min: 3, icon: '🌐', name: 'Веб-практик', desc: 'Пройдены 3 уровня по HTML' },
      { min: 5, icon: '📜', name: 'Веб-выпускник', desc: 'Пройдены все 5 уровней по HTML' }
    ],
    modeling: [
      { min: 1, icon: '🎨', name: '3D-новичок', desc: 'Пройден 1 уровень по 3D' },
      { min: 3, icon: '🖌️', name: '3D-практик', desc: 'Пройдены 3 уровня по 3D' },
      { min: 5, icon: '📜', name: '3D-выпускник', desc: 'Пройдены все 5 уровней по 3D' }
    ]
  };

  var ACHIEVEMENTS = [
    {
      id: 'first_step',
      icon: '🎯',
      name: 'Первый шаг',
      desc: 'Пройден первый уровень в любой теме',
      check: function (progress) {
        return getTotalLevels(progress) >= 1;
      }
    },
    {
      id: 'on_fire',
      icon: '🔥',
      name: 'На волне',
      desc: 'Пройдены все 5 уровней в одной теме',
      check: function (progress) {
        return ['python', 'html', 'modeling'].some(function (t) {
          return getTopicLevels(progress, t) >= 5;
        });
      }
    },
    {
      id: 'perfectionist',
      icon: '⭐',
      name: 'Перфекционист',
      desc: 'Все ответы правильные в одном уровне',
      check: function (progress) {
        var topics = ['python', 'html', 'modeling'];
        for (var t = 0; t < topics.length; t++) {
          var tp = progress[topics[t]];
          if (!tp) continue;
          var keys = Object.keys(tp);
          for (var k = 0; k < keys.length; k++) {
            var lvl = tp[keys[k]];
            if (lvl && lvl.score === lvl.total) return true;
          }
        }
        return false;
      }
    },
    {
      id: 'universal',
      icon: '🏅',
      name: 'Универсал',
      desc: 'Пройден хотя бы 1 уровень в каждой из 3 тем',
      check: function (progress) {
        return getTopicLevels(progress, 'python') >= 1 &&
               getTopicLevels(progress, 'html') >= 1 &&
               getTopicLevels(progress, 'modeling') >= 1;
      }
    },
    {
      id: 'master',
      icon: '👑',
      name: 'Магистр TEXEL',
      desc: 'Пройдены все 15 уровней',
      check: function (progress) {
        return getTotalLevels(progress) >= 15;
      }
    }
  ];

  var TOPIC_META = {
    python: { icon: '../pic/py.png', name: 'Python', color: '#3776AB', total: 5 },
    html: { icon: '../pic/veb.png', name: 'Веб-разработка', color: '#E34F26', total: 5 },
    modeling: { icon: '../pic/3d.png', name: '3D-моделирование', color: '#FF6B35', total: 5 }
  };

  // =============================================
  // 2. УТИЛИТЫ
  // =============================================

  function getUserProgress(uid, callback) {
    if (db) {
      db.collection('user_progress').doc(uid).get().then(function(doc) {
        var progress = doc.exists ? doc.data().progress || {} : {};
        callback(progress);
      }).catch(function(e) {
        console.warn('Firestore read failed, using localStorage:', e);
        callback(getLocalProgress(uid));
      });
    } else {
      callback(getLocalProgress(uid));
    }
  }

  function getLocalProgress(uid) {
    try {
      var data = JSON.parse(localStorage.getItem('texel_practice_progress')) || {};
      return data[uid] || {};
    } catch (e) { return {}; }
  }

  function getTopicLevels(progress, topic) {
    if (!progress[topic]) return 0;
    return Object.keys(progress[topic]).length;
  }

  function getTotalLevels(progress) {
    var total = 0;
    ['python', 'html', 'modeling'].forEach(function (t) {
      total += getTopicLevels(progress, t);
    });
    return total;
  }

  // =============================================
  // 3. РЕНДЕР
  // =============================================

  function renderProfile(user) {
    var uid = user.uid;

    // User info
    var name = user.displayName || 'Пользователь';
    var email = user.email || '';
    var initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();

    var avatarEl = document.getElementById('profileAvatarBig');
    var nameEl = document.getElementById('profileUserName');
    var emailEl = document.getElementById('profileUserEmail');
    if (avatarEl) avatarEl.textContent = initial;
    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;

    getUserProgress(uid, function(progress) {
      renderProgressCards(progress);
      renderTitles(progress);
      renderAchievements(progress);
    });
  }

  function renderProgressCards(progress) {
    var grid = document.getElementById('progressGrid');
    if (!grid) return;

    grid.innerHTML = '';
    Object.entries(TOPIC_META).forEach(function (entry) {
      var key = entry[0];
      var meta = entry[1];
      var completed = getTopicLevels(progress, key);
      var percent = (completed / meta.total) * 100;

      var card = document.createElement('div');
      card.className = 'profile-progress-card';
      card.style.setProperty('--card-color', meta.color);
      var iconHTML = (/^data:image\//i.test(meta.icon) || /\.(png|jpe?g|svg|webp|gif)$/i.test(meta.icon))
        ? '<img src="' + meta.icon + '" alt="">'
        : meta.icon;
      card.innerHTML =
        '<div class="profile-progress-header">' +
          '<span class="profile-progress-icon">' + iconHTML + '</span>' +
          '<span class="profile-progress-name">' + meta.name + '</span>' +
        '</div>' +
        '<div class="profile-progress-bar">' +
          '<div class="profile-progress-fill" style="width:' + percent + '%"></div>' +
        '</div>' +
        '<div class="profile-progress-text">' + completed + ' / ' + meta.total + ' уровней пройдено</div>';
      grid.appendChild(card);
    });
  }

  function renderTitles(progress) {
    var grid = document.getElementById('titlesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    Object.entries(TITLES).forEach(function (entry) {
      var topicKey = entry[0];
      var titles = entry[1];
      var completed = getTopicLevels(progress, topicKey);

      titles.forEach(function (title) {
        var earned = completed >= title.min;
        var badge = document.createElement('div');
        badge.className = 'profile-title-badge ' + (earned ? 'title-earned' : 'title-locked');
        badge.innerHTML =
          '<span class="profile-title-icon">' + title.icon + '</span>' +
          '<div class="profile-title-info">' +
            '<span class="profile-title-name">' + title.name + '</span>' +
            '<span class="profile-title-desc">' + title.desc + '</span>' +
          '</div>';
        grid.appendChild(badge);
      });
    });
  }

  function renderAchievements(progress) {
    var grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    ACHIEVEMENTS.forEach(function (ach) {
      var earned = ach.check(progress);
      var card = document.createElement('div');
      card.className = 'profile-achievement ' + (earned ? 'achievement-earned' : 'achievement-locked');
      card.innerHTML =
        '<span class="achievement-icon">' + ach.icon + '</span>' +
        '<div class="achievement-info">' +
          '<span class="achievement-name">' + ach.name + '</span>' +
          '<span class="achievement-desc">' + ach.desc + '</span>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  // =============================================
  // 4. ИНИЦИАЛИЗАЦИЯ
  // =============================================

  function clearProfile() {
    var avatarEl = document.getElementById('profileAvatarBig');
    var nameEl = document.getElementById('profileUserName');
    var emailEl = document.getElementById('profileUserEmail');
    var progressGrid = document.getElementById('progressGrid');
    var titlesGrid = document.getElementById('titlesGrid');
    var achievementsGrid = document.getElementById('achievementsGrid');

    if (avatarEl) avatarEl.textContent = 'U';
    if (nameEl) nameEl.textContent = 'Пользователь';
    if (emailEl) emailEl.textContent = '';
    if (progressGrid) progressGrid.innerHTML = '';
    if (titlesGrid) titlesGrid.innerHTML = '';
    if (achievementsGrid) achievementsGrid.innerHTML = '';
  }

  function init() {
    initFirestore();

    // Guard entire profile page behind auth
    if (window.TexelGuard) {
      window.TexelGuard.guardPage('.profile-page', {
        title: 'Войдите, чтобы увидеть профиль',
        desc: 'Личный кабинет доступен зарегистрированным пользователям',
        icon: '👤'
      });
    }

    if (!window.TexelAuth) return;

    window.TexelAuth.onReady(function (user) {
      if (user) {
        renderProfile(user);
      } else {
        clearProfile();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
