/* ============================================
   PRACTICES.JS — Логика практик TEXEL
   Рендер тем, уровней, заданий, проверка, прогресс
   ============================================ */

(function () {

  // =============================================
  // 1. ПРОГРЕСС (Firestore + localStorage fallback)
  // =============================================

  var db = null;
  var cachedProgress = {};

  function initFirestore() {
    try {
      if (firebase && firebase.firestore) {
        db = firebase.firestore();
      }
    } catch(e) { console.warn('Firestore not available:', e); }
  }

  function getUserId() {
    if (window.TexelAuth) {
      var user = window.TexelAuth.getCurrentUser();
      return user ? user.uid : null;
    }
    return null;
  }

  function getUserDisplayName() {
    if (window.TexelAuth) {
      var user = window.TexelAuth.getCurrentUser();
      return user ? (user.displayName || user.email || 'Unknown') : '';
    }
    return '';
  }

  function getUserProgress() {
    return cachedProgress;
  }

  function loadUserProgress(callback) {
    var uid = getUserId();
    if (!uid) { cachedProgress = {}; if (callback) callback(); return; }

    if (db) {
      db.collection('user_progress').doc(uid).get().then(function(doc) {
        cachedProgress = doc.exists ? doc.data().progress || {} : {};
        if (callback) callback();
      }).catch(function(e) {
        console.warn('Firestore read failed, using localStorage:', e);
        loadFromLocalStorage(uid);
        if (callback) callback();
      });
    } else {
      loadFromLocalStorage(uid);
      if (callback) callback();
    }
  }

  function loadFromLocalStorage(uid) {
    try {
      var data = JSON.parse(localStorage.getItem('texel_practice_progress')) || {};
      cachedProgress = data[uid] || {};
    } catch(e) { cachedProgress = {}; }
  }

  function saveProgressToFirestore() {
    var uid = getUserId();
    if (!uid) return;

    if (db) {
      db.collection('user_progress').doc(uid).set({
        progress: cachedProgress,
        displayName: getUserDisplayName(),
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(function(e) {
        console.warn('Firestore write failed:', e);
      });
    }

    // Also save to localStorage as backup
    try {
      var all = JSON.parse(localStorage.getItem('texel_practice_progress')) || {};
      all[uid] = cachedProgress;
      localStorage.setItem('texel_practice_progress', JSON.stringify(all));
    } catch(e) {}
  }

  function setLevelComplete(topic, levelIndex, score, total) {
    if (!cachedProgress[topic]) cachedProgress[topic] = {};
    cachedProgress[topic][levelIndex] = {
      score: score,
      total: total,
      completedAt: new Date().toISOString()
    };
    saveProgressToFirestore();
  }

  function isLevelComplete(topic, levelIndex) {
    return !!(cachedProgress[topic] && cachedProgress[topic][levelIndex]);
  }

  function getTopicCompletedCount(topic) {
    if (!cachedProgress[topic]) return 0;
    return Object.keys(cachedProgress[topic]).length;
  }

  function isLevelUnlocked(topic, levelIndex) {
    if (levelIndex === 0) return true;
    return isLevelComplete(topic, levelIndex - 1);
  }

  // =============================================
  // 2. СТРАНИЦА ТЕМ (practices.html)
  // =============================================

  function initTopicsPage() {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;

    // Auto-redirect to last active practice level
    var lastUrl = sessionStorage.getItem('texel_last_practice');
    if (lastUrl) {
      window.location.href = lastUrl;
      return;
    }

    grid.innerHTML = '';
    Object.entries(PRACTICES_DATA).forEach(function (entry) {
      var key = entry[0];
      var topic = entry[1];
      grid.appendChild(createTopicCard(key, topic));
    });
  }

  function createTopicCard(topicKey, topic) {
    var card = document.createElement('div');
    card.className = 'topic-card revealed';
    card.style.setProperty('--topic-color', topic.color);

    var completed = getTopicCompletedCount(topicKey);
    var total = topic.levels.length;
    var percent = (completed / total) * 100;

    // Build level list (all visible)
    var levelsHTML = '';
    for (var i = 0; i < total; i++) {
      var level = topic.levels[i];
      var done = isLevelComplete(topicKey, i);
      var unlocked = isLevelUnlocked(topicKey, i);
      var rowClass = done ? 'level-row-complete' : (unlocked ? 'level-row-available' : 'level-row-locked');
      var tag = unlocked ? 'a' : 'div';
      var href = unlocked ? ' href="practice.html?topic=' + topicKey + '&level=' + (i + 1) + '"' : '';
      var icon = done ? '✓' : (unlocked ? (i + 1) : '🔒');
      var status = done ? '✅' : (unlocked ? '→' : '');

      levelsHTML += '<' + tag + ' class="level-row ' + rowClass + '"' + href + '>' +
        '<div class="level-row-num">' + icon + '</div>' +
        '<div class="level-row-info">' +
          '<div class="level-row-title">' + level.title + '</div>' +
          '<div class="level-row-desc">' + level.description + '</div>' +
        '</div>' +
        '<div class="level-row-status">' + status + '</div>' +
      '</' + tag + '>';
    }

    // Subscription row
    levelsHTML += '<div class="level-row level-row-locked">' +
      '<div class="level-row-num">🔒</div>' +
      '<div class="level-row-info">' +
        '<div class="level-row-title">Уровни 6+ по подписке</div>' +
        '<div class="level-row-desc">2 000 ₽/мес — скоро будет доступно</div>' +
      '</div>' +
    '</div>';

    var iconHTML = (/^data:image\//i.test(topic.icon) || /\.(png|jpe?g|svg|webp|gif)$/i.test(topic.icon))
      ? '<img src="' + topic.icon + '" alt="">'
      : topic.icon;

    card.innerHTML =
      '<div class="topic-icon">' + iconHTML + '</div>' +
      '<h3 class="topic-title">' + topic.title + '</h3>' +
      '<p class="topic-desc">' + topic.description + '</p>' +
      '<div class="topic-progress">' +
        '<div class="topic-progress-bar">' +
          '<div class="topic-progress-fill" style="width:' + percent + '%"></div>' +
        '</div>' +
        '<span class="topic-progress-text">' + completed + '/' + total + ' уровней</span>' +
      '</div>' +
      '<div class="topic-level-list">' + levelsHTML + '</div>';

    return card;
  }

  // =============================================
  // 3. СТРАНИЦА ЗАДАНИЙ (practice.html)
  // =============================================

  var currentTaskIndex = 0;
  var taskAnswers = [];
  var currentTopic = null;
  var currentTopicKey = null;
  var currentLevelIndex = 0;
  var currentLevelData = null;

  // --- Session state: save/restore when switching tabs ---
  function getSessionKey() {
    return 'texel_practice_' + currentTopicKey + '_' + currentLevelIndex;
  }

  function saveSessionState() {
    if (!currentTopicKey) return;
    sessionStorage.setItem(getSessionKey(), JSON.stringify({
      taskIndex: currentTaskIndex,
      answers: taskAnswers
    }));
  }

  function loadSessionState() {
    try {
      var data = JSON.parse(sessionStorage.getItem(getSessionKey()));
      if (data && Array.isArray(data.answers) && data.answers.length === currentLevelData.tasks.length) {
        taskAnswers = data.answers;
        return data.taskIndex || 0;
      }
    } catch (e) {}
    return 0;
  }

  function clearSessionState() {
    if (currentTopicKey) sessionStorage.removeItem(getSessionKey());
  }

  function initPracticePage() {
    var params = new URLSearchParams(window.location.search);
    var topicKey = params.get('topic');
    var levelNum = parseInt(params.get('level'));

    if (!topicKey || !levelNum || !PRACTICES_DATA[topicKey]) {
      window.location.href = 'practices.html';
      return;
    }

    currentTopicKey = topicKey;
    currentTopic = PRACTICES_DATA[topicKey];
    currentLevelIndex = levelNum - 1;

    // Remember this URL so clicking "Практики" in nav returns here
    sessionStorage.setItem('texel_last_practice', window.location.href);

    // Check if beyond available levels → show subscription
    if (currentLevelIndex >= currentTopic.levels.length) {
      showSubscriptionLock();
      return;
    }

    // Check if level is unlocked
    if (!isLevelUnlocked(topicKey, currentLevelIndex)) {
      window.location.href = 'practices.html';
      return;
    }

    currentLevelData = currentTopic.levels[currentLevelIndex];
    taskAnswers = new Array(currentLevelData.tasks.length).fill(null);

    // Restore saved session state (if user navigated away and came back)
    var restoredIndex = loadSessionState();

    // Set header
    var eyebrow = document.getElementById('practiceEyebrow');
    var title = document.getElementById('practiceTitle');
    if (eyebrow) {
      var isImg = /^data:image\//i.test(currentTopic.icon) || /\.(png|jpe?g|svg|webp|gif)$/i.test(currentTopic.icon);
      if (isImg) {
        eyebrow.innerHTML = '<img src="' + currentTopic.icon + '" alt="" class="practice-eyebrow-icon"> ' + currentTopic.title + ' · Уровень ' + levelNum;
      } else {
        eyebrow.textContent = currentTopic.icon + ' ' + currentTopic.title + ' · Уровень ' + levelNum;
      }
    }
    if (title) title.textContent = currentLevelData.title;
    document.title = currentLevelData.title + ' — TEXEL';

    renderTask(restoredIndex);
    setupNavigation();
  }

  function renderTask(index) {
    currentTaskIndex = index;
    saveSessionState();
    var task = currentLevelData.tasks[index];
    var total = currentLevelData.tasks.length;
    var card = document.getElementById('taskCard');
    if (!card) return;

    // Progress
    var progressText = document.getElementById('progressText');
    var progressFill = document.getElementById('progressFill');
    if (progressText) progressText.textContent = 'Задание ' + (index + 1) + ' из ' + total;
    if (progressFill) progressFill.style.width = (((index + 1) / total) * 100) + '%';

    // Nav buttons
    var prevBtn = document.getElementById('prevTask');
    var nextBtn = document.getElementById('nextTask');
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) nextBtn.textContent = (index === total - 1) ? 'Завершить уровень' : 'Далее →';

    if (task.type === 'choice') {
      renderChoiceTask(card, task, index);
    } else {
      renderInputTask(card, task, index);
    }
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function renderChoiceTask(card, task, taskIndex) {
    var prev = taskAnswers[taskIndex];
    var answered = prev !== null;

    var optionsHTML = '';
    for (var i = 0; i < task.options.length; i++) {
      var cls = '';
      if (answered) {
        if (i === task.correct) cls = 'option-correct';
        else if (i === prev && prev !== task.correct) cls = 'option-wrong';
      }
      optionsHTML += '<button class="option-btn ' + cls + '" data-index="' + i + '"' +
        (answered ? ' disabled' : '') + '>' + escapeHtml(task.options[i]) + '</button>';
    }

    var feedbackHTML = '';
    if (answered) {
      feedbackHTML = prev === task.correct
        ? '<span class="feedback-correct">✅ Правильно!</span>'
        : '<span class="feedback-wrong">❌ Неправильно</span>';
    }

    card.innerHTML =
      '<div class="task-number">Задание ' + (taskIndex + 1) + '</div>' +
      '<p class="task-question">' + escapeHtml(task.question) + '</p>' +
      '<div class="task-options">' + optionsHTML + '</div>' +
      '<div class="task-feedback" style="display:' + (answered ? 'block' : 'none') + '">' + feedbackHTML + '</div>' +
      '<div class="task-hint">💡 Если не знаешь ответ — спроси у <a href="chatbot.html" target="_blank">Чат Бота</a>!</div>';

    if (!answered) {
      card.querySelectorAll('.option-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var selected = parseInt(btn.dataset.index);
          taskAnswers[taskIndex] = selected;
          renderTask(taskIndex);
        });
      });
    }
  }

  function renderInputTask(card, task, taskIndex) {
    var prev = taskAnswers[taskIndex];
    var answered = prev !== null;
    var isCorrect = answered && prev.correct;

    var feedbackHTML = '';
    if (answered) {
      if (isCorrect) {
        feedbackHTML = '<span class="feedback-correct">✅ Правильно!</span>';
      } else {
        feedbackHTML = '<span class="feedback-wrong">❌ Неправильно</span>' +
          '<span class="feedback-answer">Правильный ответ: ' + escapeHtml(task.answers[0]) + '</span>' +
          '<button class="retry-btn" id="retryBtn">Попробовать ещё раз</button>';
      }
    }

    card.innerHTML =
      '<div class="task-number">Задание ' + (taskIndex + 1) + '</div>' +
      '<p class="task-question">' + escapeHtml(task.question) + '</p>' +
      '<div class="task-input-wrapper">' +
        '<input type="text" class="task-input" id="taskInput" placeholder="Введите ответ..."' +
        ' value="' + (answered ? escapeHtml(prev.value) : '') + '"' +
        (answered ? ' disabled' : '') + ' />' +
        '<button class="task-check-btn" id="checkBtn"' + (answered ? ' disabled' : '') + '>Проверить</button>' +
      '</div>' +
      '<div class="task-feedback" style="display:' + (answered ? 'block' : 'none') + '">' + feedbackHTML + '</div>' +
      '<div class="task-hint">💡 Если не знаешь ответ — спроси у <a href="chatbot.html" target="_blank">Чат Бота</a>!</div>';

    if (!answered) {
      var input = document.getElementById('taskInput');
      var checkBtn = document.getElementById('checkBtn');

      function checkAnswer() {
        var value = input.value.trim();
        if (!value) return;
        var correct = task.answers.some(function (a) {
          return a.trim().toLowerCase() === value.toLowerCase();
        });
        taskAnswers[taskIndex] = { value: value, correct: correct };
        renderTask(taskIndex);
      }

      if (checkBtn) checkBtn.addEventListener('click', checkAnswer);
      if (input) input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') checkAnswer();
      });
    }

    var retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        taskAnswers[taskIndex] = null;
        renderTask(taskIndex);
      });
    }
  }

  function setupNavigation() {
    var prevBtn = document.getElementById('prevTask');
    var nextBtn = document.getElementById('nextTask');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (currentTaskIndex > 0) renderTask(currentTaskIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (currentTaskIndex < currentLevelData.tasks.length - 1) {
          renderTask(currentTaskIndex + 1);
        } else {
          completeLevel();
        }
      });
    }
  }

  // --- Achievement definitions (shared with profile.js) ---
  var REWARD_TITLES = {
    python: [
      { min: 1, icon: '🐣', name: 'Python-новичок' },
      { min: 3, icon: '🐍', name: 'Python-практик' },
      { min: 5, icon: '📜', name: 'Python-выпускник' }
    ],
    html: [
      { min: 1, icon: '🌱', name: 'Веб-новичок' },
      { min: 3, icon: '🌐', name: 'Веб-практик' },
      { min: 5, icon: '📜', name: 'Веб-выпускник' }
    ],
    modeling: [
      { min: 1, icon: '🎨', name: '3D-новичок' },
      { min: 3, icon: '🖌️', name: '3D-практик' },
      { min: 5, icon: '📜', name: '3D-выпускник' }
    ]
  };

  var REWARD_ACHIEVEMENTS = [
    { icon: '🎯', name: 'Первый шаг', check: function (p) { return countAll(p) >= 1; } },
    { icon: '🔥', name: 'На волне', check: function (p) { return ['python','html','modeling'].some(function(t){ return countTopic(p,t)>=5; }); } },
    { icon: '⭐', name: 'Перфекционист', check: function (p) { return hasPerfect(p); } },
    { icon: '🏅', name: 'Универсал', check: function (p) { return countTopic(p,'python')>=1 && countTopic(p,'html')>=1 && countTopic(p,'modeling')>=1; } },
    { icon: '👑', name: 'Магистр TEXEL', check: function (p) { return countAll(p) >= 15; } }
  ];

  function countTopic(p, t) { return p[t] ? Object.keys(p[t]).length : 0; }
  function countAll(p) { return countTopic(p,'python') + countTopic(p,'html') + countTopic(p,'modeling'); }
  function hasPerfect(p) {
    var topics = ['python','html','modeling'];
    for (var i = 0; i < topics.length; i++) {
      var tp = p[topics[i]];
      if (!tp) continue;
      var keys = Object.keys(tp);
      for (var k = 0; k < keys.length; k++) {
        if (tp[keys[k]].score === tp[keys[k]].total) return true;
      }
    }
    return false;
  }

  function getEarnedRewards(progress) {
    var earned = [];
    // Titles
    Object.keys(REWARD_TITLES).forEach(function (topic) {
      var count = countTopic(progress, topic);
      REWARD_TITLES[topic].forEach(function (t) {
        if (count >= t.min) earned.push(t.icon + ' ' + t.name);
      });
    });
    // Achievements
    REWARD_ACHIEVEMENTS.forEach(function (a) {
      if (a.check(progress)) earned.push(a.icon + ' ' + a.name);
    });
    return earned;
  }

  function showRewardToast(text) {
    var toast = document.createElement('div');
    toast.className = 'reward-toast';
    toast.innerHTML = '<div class="reward-toast-inner">' +
      '<span class="reward-toast-label">Новое достижение!</span>' +
      '<span class="reward-toast-name">' + text + '</span>' +
    '</div>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('reward-toast-visible');
    });
    setTimeout(function () {
      toast.classList.remove('reward-toast-visible');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  function completeLevel() {
    var score = 0;
    taskAnswers.forEach(function (answer, i) {
      var task = currentLevelData.tasks[i];
      if (task.type === 'choice' && answer === task.correct) score++;
      if (task.type === 'input' && answer && answer.correct) score++;
    });

    var total = currentLevelData.tasks.length;

    // Snapshot rewards BEFORE saving
    var uid = getUserId();
    var progressBefore = getUserProgress();
    var earnedBefore = getEarnedRewards(progressBefore);

    setLevelComplete(currentTopicKey, currentLevelIndex, score, total);
    clearSessionState();
    sessionStorage.removeItem('texel_last_practice');

    // Check for NEW rewards
    var progressAfter = getUserProgress();
    var earnedAfter = getEarnedRewards(progressAfter);
    var newRewards = earnedAfter.filter(function (r) { return earnedBefore.indexOf(r) === -1; });

    // Show toasts with delay
    newRewards.forEach(function (reward, i) {
      setTimeout(function () { showRewardToast(reward); }, 800 + i * 1200);
    });

    // Show overlay
    var overlay = document.getElementById('levelComplete');
    var scoreEl = document.getElementById('levelScore');
    if (scoreEl) scoreEl.textContent = 'Правильных ответов: ' + score + '/' + total;
    if (overlay) overlay.style.display = 'flex';

    var nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
      var nextNum = currentLevelIndex + 2;
      if (nextNum > currentTopic.levels.length) {
        nextLevelBtn.textContent = '🔒 Уровни по подписке';
      }
      nextLevelBtn.addEventListener('click', function () {
        window.location.href = 'practice.html?topic=' + currentTopicKey + '&level=' + nextNum;
      });
    }
  }

  function showSubscriptionLock() {
    var overlay = document.getElementById('subscriptionLock');
    if (overlay) overlay.style.display = 'flex';
    var hero = document.querySelector('.practice-hero');
    var content = document.querySelector('.practice-content');
    if (hero) hero.style.display = 'none';
    if (content) content.style.display = 'none';
  }

  // =============================================
  // 4. ИНИЦИАЛИЗАЦИЯ
  // =============================================

  function init() {
    initFirestore();

    // "Назад к темам" — clear saved URL so topics page shows normally
    document.querySelectorAll('.practice-back-btn, .practice-back-link').forEach(function (link) {
      link.addEventListener('click', function () {
        sessionStorage.removeItem('texel_last_practice');
      });
    });

    var isTopicsPage = document.getElementById('topicsGrid');
    var isTaskPage = document.getElementById('taskCard');

    if (isTopicsPage) {
      var lockSection = document.getElementById('practicesLock');
      var mainContent = document.getElementById('practicesMain');
      var loginBtn = document.getElementById('practicesLoginBtn');

      // Кнопка "Войти" открывает модалку
      if (loginBtn) {
        loginBtn.addEventListener('click', function () {
          if (window.TexelAuth) window.TexelAuth.openModal();
        });
      }

      if (window.TexelAuth) {
        window.TexelAuth.onReady(function (user) {
          if (user) {
            if (lockSection) lockSection.style.display = 'none';
            if (mainContent) mainContent.style.display = '';
            loadUserProgress(function() { initTopicsPage(); });
          } else {
            if (lockSection) lockSection.style.display = '';
            if (mainContent) mainContent.style.display = 'none';
          }
        });
      } else {
        if (lockSection) lockSection.style.display = 'none';
        if (mainContent) mainContent.style.display = '';
        initTopicsPage();
      }
    }

    if (isTaskPage) {
      if (window.TexelAuth) {
        window.TexelAuth.onReady(function (user) {
          if (user) loadUserProgress(function() { initPracticePage(); });
        });
        if (window.TexelGuard) {
          window.TexelGuard.guardPage('.practice-content', {
            title: 'Войдите для доступа к практикам',
            desc: 'Зарегистрируйтесь, чтобы начать обучение',
            icon: '🎯'
          });
        }
      } else {
        initPracticePage();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
