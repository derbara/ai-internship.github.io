/* ============================================
   ADMIN.JS — Логика админ-панели TEXEL
   ============================================ */

const Admin = (function() {

  // ===== КОНСТАНТЫ =====
  const CREDENTIALS = { login: 'admin', password: 'qwerty' };
  const KEYS = {
    session: 'texel_admin_session',
    practices: 'texel_admin_practices',
    articles: 'texel_admin_articles',
    guides: 'texel_admin_guides'
  };

  var db = null;
  function initFirestore() {
    try {
      if (typeof firebase === 'undefined' || !firebase.firestore) return;
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
    } catch(e) {
      try { db = firebase.firestore(); } catch(e2) {}
    }
  }

  // ===== ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ (Firestore) =====
  // Документы хранятся в коллекции admin_data: practices/articles/guides
  function saveToCloud(key, data) {
    if (!db) return Promise.resolve();
    return db.collection('admin_data').doc(key).set({
      data: data,
      updatedAt: new Date().toISOString()
    });
  }

  function loadFromCloud(key) {
    if (!db) return Promise.resolve(null);
    return db.collection('admin_data').doc(key).get()
      .then(function(doc) {
        return doc.exists ? doc.data().data : null;
      });
  }

  // На старте — подтянуть свежие данные из облака в localStorage,
  // чтобы админ редактировал актуальное состояние, а не старый локальный кэш
  function syncFromCloud() {
    if (!db) return Promise.resolve();
    return Promise.all([
      loadFromCloud('practices').then(function(d) {
        if (d) localStorage.setItem(KEYS.practices, JSON.stringify(d));
      }).catch(function(e) { console.warn('Cloud sync practices failed:', e); }),
      loadFromCloud('articles').then(function(d) {
        if (d) localStorage.setItem(KEYS.articles, JSON.stringify(d));
      }).catch(function(e) { console.warn('Cloud sync articles failed:', e); }),
      loadFromCloud('guides').then(function(d) {
        if (d) localStorage.setItem(KEYS.guides, JSON.stringify(d));
      }).catch(function(e) { console.warn('Cloud sync guides failed:', e); })
    ]);
  }

  const DEFAULT_ARTICLES = [
    { id: 'education', badge: 'Образование', badgeClass: 'badge-edu', isNew: true, headline: 'Как GPT-модели меняют обучение', description: 'Персональные объяснения, автогенерация заданий, адаптивные траектории. Почему ИИ уже стал частью учебного процесса и что это меняет для студентов.', href: 'pages/article-education.html' },
    { id: 'python', badge: 'Python', badgeClass: 'badge-dev', isNew: true, headline: 'Зачем учить Python в 2026 году', description: 'Python — самый популярный язык по индексу TIOBE уже третий год подряд. Разбираемся, почему он стал стандартом в ИИ, аналитике и автоматизации.', href: 'pages/article-python.html' },
    { id: 'prompt', badge: 'Разработка', badgeClass: 'badge-dev', isNew: false, headline: 'Prompt Engineering без магии', description: 'Промт — это интерфейс к модели. Как формулировать задачу, чтобы ИИ отвечал стабильно, а не случайно.', href: 'pages/article-prompt.html' },
    { id: 'creative', badge: 'Креатив', badgeClass: 'badge-creative', isNew: false, headline: 'Нейросети и творчество: кто тут автор?', description: 'Генеративная графика, музыка, синтез голоса. Как ИИ помогает создавать быстрее, не убивая личный почерк автора.', href: 'pages/article-creative.html' },
    { id: '3d', badge: '3D', badgeClass: 'badge-creative', isNew: false, headline: 'ИИ в 3D-моделировании: новая эра дизайна', description: 'NVIDIA Omniverse, Blender с ИИ-плагинами, генерация текстур и мешей. Как нейросети ускоряют работу 3D-художников и снижают порог входа.', href: 'pages/article-3d.html' },
    { id: 'webdev', badge: 'Веб', badgeClass: 'badge-biz', isNew: false, headline: 'HTML, CSS, JS: почему веб-разработка — это суперсила', description: 'Веб-технологии лежат в основе всего: от лендингов до сложных приложений. Почему стоит начать именно с них и как ИИ помогает учиться быстрее.', href: 'pages/article-webdev.html' },
    { id: 'learning', badge: 'Обучение', badgeClass: 'badge-edu', isNew: false, headline: 'Как учиться программированию с помощью ИИ', description: 'Чат-боты объясняют код, генерируют задания и дают мгновенную обратную связь. Практические советы, как использовать ИИ для обучения, а не для списывания.', href: 'pages/article-learning.html' }
  ];

  const DEFAULT_GUIDES = [
    { id: 'guide-0', title: 'Базовые понятия ИИ для стажёров', description: 'Методическое пособие от студентов Московского Политеха. Объясняет ключевые термины, типы ИИ, машинное обучение, нейросети и промт-взаимодействие. Подходит для стажёров, начинающих карьеру в цифровых компаниях.', tags: ['Образование', 'ИИ', 'Машинное обучение'], authors: 'Составители: студенты МПУ — Захаров А.С., Ким А.А., Угрюмова С.А., Винокуров А.Д. и др.', href: 'guides/guide2.pdf' }
  ];

  const BADGE_OPTIONS = [
    { value: 'badge-edu', label: 'Образование (зелёный)' },
    { value: 'badge-dev', label: 'Разработка (фиолетовый)' },
    { value: 'badge-creative', label: 'Креатив (оранжевый)' },
    { value: 'badge-biz', label: 'Веб (синий)' }
  ];

  // ===== УТИЛИТЫ =====
  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function isImageIcon(icon) {
    return !!icon && (/^data:image\//i.test(icon) || /\.(png|jpe?g|svg|webp|gif)$/i.test(icon));
  }

  function renderIcon(icon) {
    if (!icon) return '';
    if (isImageIcon(icon)) {
      var src = icon.replace(/^(\.\.\/)+/, '');
      return '<img class="admin-topic-icon" src="' + esc(src) + '" alt="">';
    }
    return esc(icon);
  }

  // ===== TOAST =====
  var toastTimer = null;
  function showToast(msg, type) {
    type = type || 'success';
    var el = document.getElementById('adminToast');
    el.textContent = msg;
    el.className = 'admin-toast ' + type + ' show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      el.classList.remove('show');
    }, 2500);
  }

  // ===== CONFIRM =====
  var confirmCallback = null;
  function showConfirm(text, onConfirm) {
    document.getElementById('adminConfirm').style.display = 'flex';
    document.getElementById('adminConfirmText').textContent = text;
    confirmCallback = onConfirm;
  }
  function closeConfirm() {
    document.getElementById('adminConfirm').style.display = 'none';
    confirmCallback = null;
  }

  // ===== MODAL =====
  function openModal(title, html) {
    document.getElementById('adminModalTitle').textContent = title;
    document.getElementById('adminModalBody').innerHTML = html;
    document.getElementById('adminModal').style.display = 'flex';
  }
  function closeModal() {
    document.getElementById('adminModal').style.display = 'none';
  }

  // ===== AUTH =====
  function checkSession() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEYS.session));
      return s && s.authenticated;
    } catch(e) { return false; }
  }

  function login(user, pass) {
    if (user === CREDENTIALS.login && pass === CREDENTIALS.password) {
      sessionStorage.setItem(KEYS.session, JSON.stringify({ authenticated: true, loginTime: new Date().toISOString() }));
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(KEYS.session);
    location.reload();
  }

  // ===== DATA LOADERS =====
  function loadPractices() {
    try {
      var d = localStorage.getItem(KEYS.practices);
      if (d) return JSON.parse(d);
    } catch(e) {}
    return deepClone(PRACTICES_DATA);
  }

  function savePractices(data) {
    localStorage.setItem(KEYS.practices, JSON.stringify(data));
    showToast('Практики сохранены');
    saveToCloud('practices', data)
      .then(function() { showToast('Синхронизировано с облаком', 'success'); })
      .catch(function(err) {
        console.error('Cloud save practices failed:', err);
        showToast('Не удалось сохранить в облако: ' + err.message, 'error');
      });
  }

  function loadArticles() {
    try {
      var d = localStorage.getItem(KEYS.articles);
      if (d) return JSON.parse(d);
    } catch(e) {}
    return deepClone(DEFAULT_ARTICLES);
  }

  function saveArticles(data) {
    localStorage.setItem(KEYS.articles, JSON.stringify(data));
    showToast('Статьи сохранены');
    saveToCloud('articles', data)
      .then(function() { showToast('Синхронизировано с облаком', 'success'); })
      .catch(function(err) {
        console.error('Cloud save articles failed:', err);
        showToast('Не удалось сохранить в облако: ' + err.message, 'error');
      });
  }

  function loadGuides() {
    try {
      var d = localStorage.getItem(KEYS.guides);
      if (d) return JSON.parse(d);
    } catch(e) {}
    return deepClone(DEFAULT_GUIDES);
  }

  function saveGuides(data) {
    localStorage.setItem(KEYS.guides, JSON.stringify(data));
    showToast('Методички сохранены');
    saveToCloud('guides', data)
      .then(function() { showToast('Синхронизировано с облаком', 'success'); })
      .catch(function(err) {
        console.error('Cloud save guides failed:', err);
        showToast('Не удалось сохранить в облако: ' + err.message, 'error');
      });
  }

  // ===== ROUTER =====
  function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(function(s) {
      s.style.display = 'none';
    });
    document.getElementById('sec-' + id).style.display = 'block';

    document.querySelectorAll('.admin-nav-item').forEach(function(b) {
      b.classList.toggle('active', b.dataset.section === id);
    });

    if (id === 'dashboard') renderDashboard();
    if (id === 'practices') renderTopicsList();
    if (id === 'articles') renderArticlesList();
    if (id === 'guides') renderGuidesList();
  }

  // ===== DASHBOARD =====
  function renderDashboard() {
    var practices = loadPractices();
    var articles = loadArticles();
    var guides = loadGuides();

    var topicKeys = Object.keys(practices);
    var totalLevels = 0;
    var totalTasks = 0;
    topicKeys.forEach(function(k) {
      totalLevels += practices[k].levels.length;
      practices[k].levels.forEach(function(l) { totalTasks += l.tasks.length; });
    });

    // Show stats with placeholder for users (loaded async)
    var html = '';
    html += '<div class="admin-stat-card"><div class="admin-stat-icon">🧩</div><div class="admin-stat-value">' + topicKeys.length + '</div><div class="admin-stat-label">Темы практик</div><div class="admin-stat-detail">' + totalLevels + ' уровней, ' + totalTasks + ' заданий</div></div>';
    html += '<div class="admin-stat-card"><div class="admin-stat-icon">📝</div><div class="admin-stat-value">' + articles.length + '</div><div class="admin-stat-label">Статьи</div></div>';
    html += '<div class="admin-stat-card"><div class="admin-stat-icon">📚</div><div class="admin-stat-value">' + guides.length + '</div><div class="admin-stat-label">Методички</div></div>';
    html += '<div class="admin-stat-card"><div class="admin-stat-icon">👥</div><div class="admin-stat-value" id="userCountValue">...</div><div class="admin-stat-label">Пользователей с прогрессом</div><div class="admin-stat-detail" id="userLevelsDetail"></div></div>';
    document.getElementById('dashboardStats').innerHTML = html;

    // Load users from Firestore
    loadUsersFromFirestore();
  }

  var cachedUsers = [];

  function loadUsersFromFirestore() {
    if (!db) {
      var el = document.getElementById('userCountValue');
      if (el) el.textContent = '0';
      return;
    }

    db.collection('user_progress').get().then(function(snapshot) {
      cachedUsers = [];
      var totalCompletedLevels = 0;
      snapshot.forEach(function(doc) {
        var data = doc.data();
        var progress = data.progress || {};
        var levelsCount = 0;
        ['python','html','modeling'].forEach(function(t) {
          if (progress[t]) levelsCount += Object.keys(progress[t]).length;
        });
        totalCompletedLevels += levelsCount;
        cachedUsers.push({
          uid: doc.id,
          displayName: data.displayName || 'Unknown',
          progress: progress,
          levelsCompleted: levelsCount,
          updatedAt: data.updatedAt || ''
        });
      });

      var el = document.getElementById('userCountValue');
      if (el) el.textContent = cachedUsers.length;
      var detail = document.getElementById('userLevelsDetail');
      if (detail) detail.textContent = totalCompletedLevels + ' уровней пройдено всего';
    }).catch(function(e) {
      console.warn('Failed to load users:', e);
      var el = document.getElementById('userCountValue');
      if (el) el.textContent = '?';
    });
  }

  // ===== PRACTICES — TOPICS LIST =====
  function renderTopicsList() {
    var data = loadPractices();
    var keys = Object.keys(data);

    var html = '<div class="admin-section-header"><h2 class="admin-section-title">Практики</h2>';
    html += '<div style="display:flex;gap:.5rem"><button class="admin-btn admin-btn-primary admin-btn-sm" onclick="Admin.showTopicForm()">+ Тема</button>';
    html += '<button class="admin-btn admin-btn-outline admin-btn-sm" onclick="Admin.resetPractices()">Сбросить</button></div></div>';

    if (keys.length === 0) {
      html += '<div class="admin-empty"><div class="admin-empty-icon">🧩</div><p>Нет тем</p></div>';
    } else {
      html += '<table class="admin-table"><thead><tr><th>Тема</th><th>Уровни</th><th>Задания</th><th></th></tr></thead><tbody>';
      keys.forEach(function(k) {
        var t = data[k];
        var taskCount = 0;
        t.levels.forEach(function(l) { taskCount += l.tasks.length; });
        html += '<tr>';
        html += '<td><span class="admin-color-swatch" style="background:' + esc(t.color) + '"></span>' + renderIcon(t.icon) + ' ' + esc(t.title) + '</td>';
        html += '<td>' + t.levels.length + '</td>';
        html += '<td>' + taskCount + '</td>';
        html += '<td class="admin-table-actions">';
        html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.renderLevelsList(\'' + esc(k) + '\')">Открыть</button>';
        html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.showTopicForm(\'' + esc(k) + '\')">Ред.</button>';
        html += '<button class="admin-btn admin-btn-danger admin-btn-xs" onclick="Admin.deleteTopic(\'' + esc(k) + '\')">Удл.</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
    }

    document.getElementById('practicesContent').innerHTML = html;
  }

  // ===== PRACTICES — LEVELS LIST =====
  function renderLevelsList(topicKey) {
    var data = loadPractices();
    var topic = data[topicKey];
    if (!topic) return;

    var html = '<nav class="admin-breadcrumb">';
    html += '<button class="admin-breadcrumb-link" onclick="Admin.renderTopicsList()">Практики</button>';
    html += '<span class="admin-breadcrumb-sep">›</span>';
    html += '<span class="admin-breadcrumb-current">' + renderIcon(topic.icon) + ' ' + esc(topic.title) + '</span>';
    html += '</nav>';

    html += '<div class="admin-section-header"><h2 class="admin-section-title">Уровни</h2>';
    html += '<button class="admin-btn admin-btn-primary admin-btn-sm" onclick="Admin.showLevelForm(\'' + esc(topicKey) + '\')">+ Уровень</button></div>';

    if (topic.levels.length === 0) {
      html += '<div class="admin-empty"><div class="admin-empty-icon">📋</div><p>Нет уровней</p></div>';
    } else {
      html += '<table class="admin-table"><thead><tr><th>#</th><th>Название</th><th>Задания</th><th></th></tr></thead><tbody>';
      topic.levels.forEach(function(lvl, i) {
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + esc(lvl.title) + '</td>';
        html += '<td>' + lvl.tasks.length + '</td>';
        html += '<td class="admin-table-actions">';
        html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.renderTasksList(\'' + esc(topicKey) + '\',' + i + ')">Открыть</button>';
        html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.showLevelForm(\'' + esc(topicKey) + '\',' + i + ')">Ред.</button>';
        html += '<button class="admin-btn admin-btn-danger admin-btn-xs" onclick="Admin.deleteLevel(\'' + esc(topicKey) + '\',' + i + ')">Удл.</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
    }

    document.getElementById('practicesContent').innerHTML = html;
  }

  // ===== PRACTICES — TASKS LIST =====
  function renderTasksList(topicKey, levelIndex) {
    var data = loadPractices();
    var topic = data[topicKey];
    if (!topic) return;
    var level = topic.levels[levelIndex];
    if (!level) return;

    var html = '<nav class="admin-breadcrumb">';
    html += '<button class="admin-breadcrumb-link" onclick="Admin.renderTopicsList()">Практики</button>';
    html += '<span class="admin-breadcrumb-sep">›</span>';
    html += '<button class="admin-breadcrumb-link" onclick="Admin.renderLevelsList(\'' + esc(topicKey) + '\')">' + renderIcon(topic.icon) + ' ' + esc(topic.title) + '</button>';
    html += '<span class="admin-breadcrumb-sep">›</span>';
    html += '<span class="admin-breadcrumb-current">' + esc(level.title) + '</span>';
    html += '</nav>';

    html += '<div class="admin-section-header"><h2 class="admin-section-title">Задания</h2>';
    html += '<button class="admin-btn admin-btn-primary admin-btn-sm" onclick="Admin.showTaskForm(\'' + esc(topicKey) + '\',' + levelIndex + ')">+ Задание</button></div>';

    if (level.tasks.length === 0) {
      html += '<div class="admin-empty"><div class="admin-empty-icon">✏️</div><p>Нет заданий</p></div>';
    } else {
      html += '<table class="admin-table"><thead><tr><th>#</th><th>Тип</th><th>Вопрос</th><th></th></tr></thead><tbody>';
      level.tasks.forEach(function(task, i) {
        var typeBadge = task.type === 'choice'
          ? '<span class="admin-badge admin-badge-choice">выбор</span>'
          : '<span class="admin-badge admin-badge-input">ввод</span>';
        var q = task.question.length > 60 ? task.question.substring(0, 60) + '...' : task.question;
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + typeBadge + '</td>';
        html += '<td>' + esc(q) + '</td>';
        html += '<td class="admin-table-actions">';
        html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.showTaskForm(\'' + esc(topicKey) + '\',' + levelIndex + ',' + i + ')">Ред.</button>';
        html += '<button class="admin-btn admin-btn-danger admin-btn-xs" onclick="Admin.deleteTask(\'' + esc(topicKey) + '\',' + levelIndex + ',' + i + ')">Удл.</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
    }

    document.getElementById('practicesContent').innerHTML = html;
  }

  // ===== PRACTICES — TOPIC FORM =====
  function showTopicForm(topicKey) {
    var data = loadPractices();
    var existing = topicKey ? data[topicKey] : null;
    var isEdit = !!existing;

    var html = '<div class="admin-field"><label class="admin-label">Ключ (slug)</label>';
    html += '<input class="admin-input" id="fTopicKey" value="' + esc(topicKey || '') + '" ' + (isEdit ? 'readonly style="opacity:0.5"' : '') + ' placeholder="например: python" /></div>';
    html += '<div class="admin-field"><label class="admin-label">Название</label>';
    html += '<input class="admin-input" id="fTopicTitle" value="' + esc(existing ? existing.title : '') + '" /></div>';
    html += '<div class="admin-field"><label class="admin-label">Иконка (emoji или картинка)</label>';
    html += '<div class="admin-icon-row">';
    html += '<div class="admin-icon-preview" id="fTopicIconPreview">' + (existing && existing.icon ? renderIcon(existing.icon) : '<span class="admin-icon-placeholder">—</span>') + '</div>';
    html += '<div class="admin-icon-controls">';
    html += '<input class="admin-input" id="fTopicIcon" value="' + esc(existing ? existing.icon : '') + '" placeholder="🐍 или путь / data URL" oninput="Admin.updateIconPreview()" />';
    html += '<label class="admin-btn admin-btn-outline admin-btn-sm admin-icon-upload-btn">📁 Загрузить картинку<input type="file" accept="image/*" id="fTopicIconFile" onchange="Admin.handleIconUpload(event)" hidden /></label>';
    html += '</div>';
    html += '</div></div>';
    html += '<div class="admin-field"><label class="admin-label">Цвет</label>';
    html += '<input type="color" class="admin-input" id="fTopicColor" value="' + (existing ? existing.color : '#1C97FD') + '" style="height:44px;padding:4px" /></div>';
    html += '<div class="admin-field"><label class="admin-label">Описание</label>';
    html += '<input class="admin-input" id="fTopicDesc" value="' + esc(existing ? existing.description : '') + '" /></div>';
    html += '<div class="admin-form-actions"><button class="admin-btn admin-btn-primary" onclick="Admin.saveTopicForm(\'' + esc(topicKey || '') + '\')">' + (isEdit ? 'Сохранить' : 'Создать') + '</button>';
    html += '<button class="admin-btn admin-btn-outline" onclick="Admin.closeModal()">Отмена</button></div>';

    openModal(isEdit ? 'Редактировать тему' : 'Новая тема', html);
  }

  function saveTopicForm(oldKey) {
    var key = document.getElementById('fTopicKey').value.trim();
    var title = document.getElementById('fTopicTitle').value.trim();
    var icon = document.getElementById('fTopicIcon').value.trim();
    var color = document.getElementById('fTopicColor').value;
    var desc = document.getElementById('fTopicDesc').value.trim();

    if (!key || !title) { showToast('Заполните ключ и название', 'error'); return; }

    var data = loadPractices();
    var isEdit = !!oldKey;

    if (!isEdit && data[key]) { showToast('Тема с таким ключом уже существует', 'error'); return; }

    if (!isEdit) data[key] = { title: title, icon: icon, color: color, description: desc, levels: [] };
    else { data[key].title = title; data[key].icon = icon; data[key].color = color; data[key].description = desc; }

    savePractices(data);
    closeModal();
    renderTopicsList();
  }

  function updateIconPreview() {
    var input = document.getElementById('fTopicIcon');
    var preview = document.getElementById('fTopicIconPreview');
    if (!input || !preview) return;
    var val = input.value.trim();
    preview.innerHTML = val ? renderIcon(val) : '<span class="admin-icon-placeholder">—</span>';
  }

  function handleIconUpload(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showToast('Картинка слишком большая (максимум 500 КБ)', 'error');
      event.target.value = '';
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = e.target.result;
      var input = document.getElementById('fTopicIcon');
      if (input) input.value = dataUrl;
      updateIconPreview();
    };
    reader.onerror = function() { showToast('Не удалось прочитать файл', 'error'); };
    reader.readAsDataURL(file);
  }

  function deleteTopic(topicKey) {
    showConfirm('Удалить тему и все её уровни и задания?', function() {
      var data = loadPractices();
      delete data[topicKey];
      savePractices(data);
      closeConfirm();
      renderTopicsList();
    });
  }

  // ===== PRACTICES — LEVEL FORM =====
  function showLevelForm(topicKey, levelIndex) {
    var data = loadPractices();
    var level = (levelIndex !== undefined) ? data[topicKey].levels[levelIndex] : null;
    var isEdit = !!level;

    var html = '<div class="admin-field"><label class="admin-label">Название</label>';
    html += '<input class="admin-input" id="fLevelTitle" value="' + esc(level ? level.title : '') + '" /></div>';
    html += '<div class="admin-field"><label class="admin-label">Описание</label>';
    html += '<input class="admin-input" id="fLevelDesc" value="' + esc(level ? level.description : '') + '" /></div>';
    html += '<div class="admin-form-actions"><button class="admin-btn admin-btn-primary" onclick="Admin.saveLevelForm(\'' + esc(topicKey) + '\',' + (levelIndex !== undefined ? levelIndex : -1) + ')">' + (isEdit ? 'Сохранить' : 'Создать') + '</button>';
    html += '<button class="admin-btn admin-btn-outline" onclick="Admin.closeModal()">Отмена</button></div>';

    openModal(isEdit ? 'Редактировать уровень' : 'Новый уровень', html);
  }

  function saveLevelForm(topicKey, levelIndex) {
    var title = document.getElementById('fLevelTitle').value.trim();
    var desc = document.getElementById('fLevelDesc').value.trim();
    if (!title) { showToast('Введите название', 'error'); return; }

    var data = loadPractices();
    if (levelIndex === -1) {
      data[topicKey].levels.push({ title: title, description: desc, tasks: [] });
    } else {
      data[topicKey].levels[levelIndex].title = title;
      data[topicKey].levels[levelIndex].description = desc;
    }
    savePractices(data);
    closeModal();
    renderLevelsList(topicKey);
  }

  function deleteLevel(topicKey, levelIndex) {
    showConfirm('Удалить уровень и все его задания?', function() {
      var data = loadPractices();
      data[topicKey].levels.splice(levelIndex, 1);
      savePractices(data);
      closeConfirm();
      renderLevelsList(topicKey);
    });
  }

  // ===== PRACTICES — TASK FORM =====
  function showTaskForm(topicKey, levelIndex, taskIndex) {
    var data = loadPractices();
    var task = (taskIndex !== undefined) ? data[topicKey].levels[levelIndex].tasks[taskIndex] : null;
    var isEdit = !!task;
    var type = task ? task.type : 'choice';

    var html = '<div class="admin-field"><label class="admin-label">Тип задания</label>';
    html += '<select class="admin-select" id="fTaskType" onchange="Admin.toggleTaskType()">';
    html += '<option value="choice"' + (type === 'choice' ? ' selected' : '') + '>Выбор ответа</option>';
    html += '<option value="input"' + (type === 'input' ? ' selected' : '') + '>Ввод ответа</option>';
    html += '</select></div>';

    html += '<div class="admin-field"><label class="admin-label">Вопрос</label>';
    html += '<textarea class="admin-textarea" id="fTaskQuestion">' + esc(task ? task.question : '') + '</textarea></div>';

    // Choice options
    var opts = (task && task.options) ? task.options : ['', '', '', ''];
    var correct = (task && task.correct !== undefined) ? task.correct : 0;
    html += '<div id="fTaskChoiceBlock"' + (type !== 'choice' ? ' style="display:none"' : '') + '>';
    html += '<label class="admin-label">Варианты ответа (отметьте правильный)</label>';
    for (var i = 0; i < 4; i++) {
      html += '<div class="admin-option-row">';
      html += '<input type="radio" name="fCorrect" value="' + i + '"' + (correct === i ? ' checked' : '') + ' />';
      html += '<input class="admin-input" id="fOpt' + i + '" value="' + esc(opts[i] || '') + '" placeholder="Вариант ' + (i+1) + '" />';
      html += '</div>';
    }
    html += '</div>';

    // Input answers
    var answers = (task && task.answers) ? task.answers : [''];
    html += '<div id="fTaskInputBlock"' + (type !== 'input' ? ' style="display:none"' : '') + '>';
    html += '<label class="admin-label">Допустимые ответы</label>';
    html += '<div class="admin-answers-list" id="fAnswersList">';
    answers.forEach(function(a, idx) {
      html += '<div class="admin-answer-row"><input class="admin-input" value="' + esc(a) + '" />';
      html += '<button class="admin-btn admin-btn-danger admin-btn-xs" onclick="this.parentElement.remove()">✕</button></div>';
    });
    html += '</div>';
    html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.addAnswerField()" style="margin-top:.5rem">+ Ответ</button>';
    html += '</div>';

    html += '<div class="admin-form-actions"><button class="admin-btn admin-btn-primary" onclick="Admin.saveTaskForm(\'' + esc(topicKey) + '\',' + levelIndex + ',' + (taskIndex !== undefined ? taskIndex : -1) + ')">' + (isEdit ? 'Сохранить' : 'Создать') + '</button>';
    html += '<button class="admin-btn admin-btn-outline" onclick="Admin.closeModal()">Отмена</button></div>';

    openModal(isEdit ? 'Редактировать задание' : 'Новое задание', html);
  }

  function toggleTaskType() {
    var type = document.getElementById('fTaskType').value;
    document.getElementById('fTaskChoiceBlock').style.display = type === 'choice' ? '' : 'none';
    document.getElementById('fTaskInputBlock').style.display = type === 'input' ? '' : 'none';
  }

  function addAnswerField() {
    var list = document.getElementById('fAnswersList');
    var row = document.createElement('div');
    row.className = 'admin-answer-row';
    row.innerHTML = '<input class="admin-input" value="" placeholder="Допустимый ответ" /><button class="admin-btn admin-btn-danger admin-btn-xs" onclick="this.parentElement.remove()">✕</button>';
    list.appendChild(row);
  }

  function saveTaskForm(topicKey, levelIndex, taskIndex) {
    var type = document.getElementById('fTaskType').value;
    var question = document.getElementById('fTaskQuestion').value.trim();
    if (!question) { showToast('Введите вопрос', 'error'); return; }

    var taskObj = { type: type, question: question };

    if (type === 'choice') {
      var options = [];
      for (var i = 0; i < 4; i++) {
        var v = document.getElementById('fOpt' + i).value.trim();
        if (!v) { showToast('Заполните все 4 варианта', 'error'); return; }
        options.push(v);
      }
      var correctEl = document.querySelector('input[name="fCorrect"]:checked');
      taskObj.options = options;
      taskObj.correct = correctEl ? parseInt(correctEl.value) : 0;
    } else {
      var answerInputs = document.querySelectorAll('#fAnswersList .admin-answer-row input');
      var answers = [];
      answerInputs.forEach(function(inp) {
        var v = inp.value.trim();
        if (v) answers.push(v);
      });
      if (answers.length === 0) { showToast('Добавьте хотя бы один ответ', 'error'); return; }
      taskObj.answers = answers;
    }

    var data = loadPractices();
    if (taskIndex === -1) {
      data[topicKey].levels[levelIndex].tasks.push(taskObj);
    } else {
      data[topicKey].levels[levelIndex].tasks[taskIndex] = taskObj;
    }
    savePractices(data);
    closeModal();
    renderTasksList(topicKey, levelIndex);
  }

  function deleteTask(topicKey, levelIndex, taskIndex) {
    showConfirm('Удалить задание?', function() {
      var data = loadPractices();
      data[topicKey].levels[levelIndex].tasks.splice(taskIndex, 1);
      savePractices(data);
      closeConfirm();
      renderTasksList(topicKey, levelIndex);
    });
  }

  function resetPractices() {
    showConfirm('Сбросить практики к исходным данным? Все изменения будут потеряны.', function() {
      localStorage.removeItem(KEYS.practices);
      showToast('Практики сброшены', 'info');
      closeConfirm();
      renderTopicsList();
    });
  }

  // ===== ARTICLES =====
  function renderArticlesList() {
    var articles = loadArticles();
    var container = document.getElementById('articlesContent');

    if (articles.length === 0) {
      container.innerHTML = '<div class="admin-empty"><div class="admin-empty-icon">📝</div><p>Нет статей</p></div>';
      return;
    }

    var html = '<div class="admin-card-list">';
    articles.forEach(function(a, i) {
      html += '<div class="admin-card-item">';
      html += '<div class="admin-card-info">';
      html += '<div class="admin-card-title">' + (a.isNew ? '<span class="admin-badge admin-badge-new" style="margin-right:6px">NEW</span>' : '') + esc(a.headline) + '</div>';
      html += '<div class="admin-card-meta">' + esc(a.badge) + ' · ' + esc(a.href) + '</div>';
      html += '</div>';
      html += '<div class="admin-table-actions">';
      html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.showArticleForm(' + i + ')">Ред.</button>';
      html += '<button class="admin-btn admin-btn-danger admin-btn-xs" onclick="Admin.deleteArticle(' + i + ')">Удл.</button>';
      html += '</div></div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  function showArticleForm(index) {
    var articles = loadArticles();
    var a = (index !== undefined) ? articles[index] : null;
    var isEdit = !!a;

    var html = '<div class="admin-field"><label class="admin-label">Заголовок</label>';
    html += '<input class="admin-input" id="fArtHeadline" value="' + esc(a ? a.headline : '') + '" /></div>';

    html += '<div class="admin-field"><label class="admin-label">Описание</label>';
    html += '<textarea class="admin-textarea" id="fArtDesc">' + esc(a ? a.description : '') + '</textarea></div>';

    html += '<div class="admin-field"><label class="admin-label">Текст бейджа</label>';
    html += '<input class="admin-input" id="fArtBadge" value="' + esc(a ? a.badge : '') + '" placeholder="Образование" /></div>';

    html += '<div class="admin-field"><label class="admin-label">Стиль бейджа</label>';
    html += '<select class="admin-select" id="fArtBadgeClass">';
    BADGE_OPTIONS.forEach(function(b) {
      html += '<option value="' + b.value + '"' + (a && a.badgeClass === b.value ? ' selected' : '') + '>' + esc(b.label) + '</option>';
    });
    html += '</select></div>';

    html += '<div class="admin-field"><label class="admin-label">Ссылка (href)</label>';
    html += '<input class="admin-input" id="fArtHref" value="' + esc(a ? a.href : '') + '" placeholder="article-example.html" /></div>';

    html += '<div class="admin-field"><label class="admin-label">ID (уникальный)</label>';
    html += '<input class="admin-input" id="fArtId" value="' + esc(a ? a.id : '') + '" placeholder="example" /></div>';

    html += '<div class="admin-checkbox-row"><input type="checkbox" id="fArtNew"' + (a && a.isNew ? ' checked' : '') + ' /><label class="admin-label" for="fArtNew">Показывать бейдж NEW</label></div>';

    html += '<div class="admin-form-actions"><button class="admin-btn admin-btn-primary" onclick="Admin.saveArticleForm(' + (index !== undefined ? index : -1) + ')">' + (isEdit ? 'Сохранить' : 'Создать') + '</button>';
    html += '<button class="admin-btn admin-btn-outline" onclick="Admin.closeModal()">Отмена</button></div>';

    openModal(isEdit ? 'Редактировать статью' : 'Новая статья', html);
  }

  function saveArticleForm(index) {
    var headline = document.getElementById('fArtHeadline').value.trim();
    var description = document.getElementById('fArtDesc').value.trim();
    var badge = document.getElementById('fArtBadge').value.trim();
    var badgeClass = document.getElementById('fArtBadgeClass').value;
    var href = document.getElementById('fArtHref').value.trim();
    var id = document.getElementById('fArtId').value.trim();
    var isNew = document.getElementById('fArtNew').checked;

    if (!headline || !href || !id) { showToast('Заполните заголовок, ссылку и ID', 'error'); return; }

    var obj = { id: id, badge: badge, badgeClass: badgeClass, isNew: isNew, headline: headline, description: description, href: href };

    var articles = loadArticles();
    if (index === -1) articles.push(obj);
    else articles[index] = obj;

    saveArticles(articles);
    closeModal();
    renderArticlesList();
  }

  function deleteArticle(index) {
    showConfirm('Удалить статью?', function() {
      var articles = loadArticles();
      articles.splice(index, 1);
      saveArticles(articles);
      closeConfirm();
      renderArticlesList();
    });
  }

  // ===== GUIDES =====
  function renderGuidesList() {
    var guides = loadGuides();
    var container = document.getElementById('guidesContent');

    if (guides.length === 0) {
      container.innerHTML = '<div class="admin-empty"><div class="admin-empty-icon">📚</div><p>Нет методичек</p></div>';
      return;
    }

    var html = '<div class="admin-card-list">';
    guides.forEach(function(g, i) {
      html += '<div class="admin-card-item">';
      html += '<div class="admin-card-info">';
      html += '<div class="admin-card-title">' + esc(g.title) + '</div>';
      html += '<div class="admin-card-meta">' + esc(g.tags.join(', ')) + ' · ' + esc(g.href) + '</div>';
      html += '</div>';
      html += '<div class="admin-table-actions">';
      html += '<button class="admin-btn admin-btn-outline admin-btn-xs" onclick="Admin.showGuideForm(' + i + ')">Ред.</button>';
      html += '<button class="admin-btn admin-btn-danger admin-btn-xs" onclick="Admin.deleteGuide(' + i + ')">Удл.</button>';
      html += '</div></div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  function showGuideForm(index) {
    var guides = loadGuides();
    var g = (index !== undefined) ? guides[index] : null;
    var isEdit = !!g;

    var html = '<div class="admin-field"><label class="admin-label">Название</label>';
    html += '<input class="admin-input" id="fGuideTitle" value="' + esc(g ? g.title : '') + '" /></div>';

    html += '<div class="admin-field"><label class="admin-label">Описание</label>';
    html += '<textarea class="admin-textarea" id="fGuideDesc">' + esc(g ? g.description : '') + '</textarea></div>';

    html += '<div class="admin-field"><label class="admin-label">Теги (через запятую)</label>';
    html += '<input class="admin-input" id="fGuideTags" value="' + esc(g ? g.tags.join(', ') : '') + '" /></div>';

    html += '<div class="admin-field"><label class="admin-label">Авторы</label>';
    html += '<input class="admin-input" id="fGuideAuthors" value="' + esc(g ? g.authors : '') + '" /></div>';

    html += '<div class="admin-field"><label class="admin-label">Путь к файлу</label>';
    html += '<input class="admin-input" id="fGuideHref" value="' + esc(g ? g.href : '') + '" placeholder="guides/guide.pdf" /></div>';

    html += '<p style="color:rgba(255,255,255,0.4);font-size:.8rem">PDF-файл нужно загрузить в папку guides/ вручную</p>';

    html += '<div class="admin-form-actions"><button class="admin-btn admin-btn-primary" onclick="Admin.saveGuideForm(' + (index !== undefined ? index : -1) + ')">' + (isEdit ? 'Сохранить' : 'Создать') + '</button>';
    html += '<button class="admin-btn admin-btn-outline" onclick="Admin.closeModal()">Отмена</button></div>';

    openModal(isEdit ? 'Редактировать методичку' : 'Новая методичка', html);
  }

  function saveGuideForm(index) {
    var title = document.getElementById('fGuideTitle').value.trim();
    var description = document.getElementById('fGuideDesc').value.trim();
    var tagsRaw = document.getElementById('fGuideTags').value.trim();
    var authors = document.getElementById('fGuideAuthors').value.trim();
    var href = document.getElementById('fGuideHref').value.trim();

    if (!title || !href) { showToast('Заполните название и путь', 'error'); return; }

    var tags = tagsRaw.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    var obj = { id: 'guide-' + Date.now(), title: title, description: description, tags: tags, authors: authors, href: href };

    var guides = loadGuides();
    if (index === -1) guides.push(obj);
    else { obj.id = guides[index].id; guides[index] = obj; }

    saveGuides(guides);
    closeModal();
    renderGuidesList();
  }

  function deleteGuide(index) {
    showConfirm('Удалить методичку?', function() {
      var guides = loadGuides();
      guides.splice(index, 1);
      saveGuides(guides);
      closeConfirm();
      renderGuidesList();
    });
  }

  // ===== EXPORT =====
  function exportData() {
    var payload = {
      practices: loadPractices(),
      articles: loadArticles(),
      guides: loadGuides(),
      exportedAt: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'texel-admin-export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Экспорт загружен', 'info');
  }

  // ===== QUICK ACTIONS =====
  function goToAddTask() {
    showSection('practices');
    // Show topics list, user picks topic then level then adds task
  }
  function goToAddArticle() {
    showSection('articles');
    showArticleForm();
  }
  function goToAddGuide() {
    showSection('guides');
    showGuideForm();
  }

  // ===== INIT =====
  function init() {
    initFirestore();

    // Login form
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var user = document.getElementById('adminUser').value.trim();
      var pass = document.getElementById('adminPass').value;
      if (login(user, pass)) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        // Сначала подтянуть свежие данные из облака, потом рендерить
        syncFromCloud().then(renderDashboard);
      } else {
        document.getElementById('adminLoginError').textContent = 'Неверный логин или пароль';
      }
    });

    // Logout
    document.getElementById('adminLogout').addEventListener('click', logout);

    // Sidebar nav
    document.querySelectorAll('.admin-nav-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        showSection(this.dataset.section);
      });
    });

    // Confirm dialog
    document.getElementById('adminConfirmYes').addEventListener('click', function() {
      if (confirmCallback) confirmCallback();
    });

    // Modal overlay close
    document.querySelectorAll('.admin-modal-overlay').forEach(function(overlay) {
      overlay.addEventListener('click', function() {
        closeModal();
        closeConfirm();
      });
    });

    // ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { closeModal(); closeConfirm(); }
    });

    // Check session
    if (checkSession()) {
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
      syncFromCloud().then(renderDashboard);
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  // ===== PUBLIC API =====
  return {
    showSection: showSection,
    renderTopicsList: renderTopicsList,
    renderLevelsList: renderLevelsList,
    renderTasksList: renderTasksList,
    showTopicForm: showTopicForm,
    saveTopicForm: saveTopicForm,
    updateIconPreview: updateIconPreview,
    handleIconUpload: handleIconUpload,
    deleteTopic: deleteTopic,
    showLevelForm: showLevelForm,
    saveLevelForm: saveLevelForm,
    deleteLevel: deleteLevel,
    showTaskForm: showTaskForm,
    saveTaskForm: saveTaskForm,
    deleteTask: deleteTask,
    toggleTaskType: toggleTaskType,
    addAnswerField: addAnswerField,
    resetPractices: resetPractices,
    showArticleForm: showArticleForm,
    saveArticleForm: saveArticleForm,
    deleteArticle: deleteArticle,
    showGuideForm: showGuideForm,
    saveGuideForm: saveGuideForm,
    deleteGuide: deleteGuide,
    exportData: exportData,
    goToAddTask: goToAddTask,
    goToAddArticle: goToAddArticle,
    goToAddGuide: goToAddGuide,
    closeModal: closeModal,
    closeConfirm: closeConfirm
  };
})();
