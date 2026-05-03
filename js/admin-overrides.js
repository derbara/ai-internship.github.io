/* ============================================
   ADMIN-OVERRIDES.JS
   Применяет изменения админа к фронтенду:
   1) сразу подхватывает из localStorage (мгновенный рендер для возвращающихся посетителей);
   2) в фоне забирает свежие данные из Firestore (admin_data/*) и обновляет DOM,
      чтобы изменения админа были видны на ВСЕХ устройствах и браузерах.
   ============================================ */

(function() {
  'use strict';

  var KEYS = {
    practices: 'texel_admin_practices',
    articles: 'texel_admin_articles',
    guides: 'texel_admin_guides'
  };

  // ===== ПРАКТИКИ =====
  function applyPractices(parsed) {
    if (typeof PRACTICES_DATA === 'undefined' || !parsed) return;
    Object.keys(PRACTICES_DATA).forEach(function(k) { delete PRACTICES_DATA[k]; });
    Object.assign(PRACTICES_DATA, parsed);
  }

  // ===== СТАТЬИ =====
  function applyArticles(articles) {
    var grid = document.querySelector('.articles-grid');
    if (!grid || !articles) return;
    grid.innerHTML = '';
    articles.forEach(function(a) {
      var card = document.createElement('article');
      card.className = 'article-card';
      card.setAttribute('data-reveal', '');

      var topHTML = '<div class="article-top">';
      topHTML += '<div class="badge ' + a.badgeClass + '">' + a.badge + '</div>';
      if (a.isNew) topHTML += '<div class="article-badge-new">NEW</div>';
      topHTML += '</div>';

      card.innerHTML = topHTML +
        '<h2 class="article-headline">' + a.headline + '</h2>' +
        '<p class="article-text">' + a.description + '</p>' +
        '<a class="article-btn" href="' + a.href + '">Читать &rarr;</a>';

      grid.appendChild(card);
    });
  }

  // ===== МЕТОДИЧКИ =====
  function applyGuides(guides) {
    var grid = document.querySelector('.guides-grid');
    if (!grid || !guides) return;
    grid.innerHTML = '';
    guides.forEach(function(g) {
      var card = document.createElement('article');
      card.className = 'guide-card';
      card.setAttribute('data-reveal', '');

      var tagsHTML = (g.tags || []).map(function(t) { return '<span class="guide-tag">' + t + '</span>'; }).join('');

      card.innerHTML =
        '<h3 class="guide-title">' + g.title + '</h3>' +
        '<p class="guide-desc">' + g.description + '</p>' +
        '<div class="guide-tags">' + tagsHTML + '</div>' +
        (g.authors ? '<p class="guide-desc" style="font-size:.8rem;color:rgba(255,255,255,0.6);margin-top:.5rem;">' + g.authors + '</p>' : '') +
        '<a href="' + g.href + '" class="download-btn" target="_blank" rel="noopener">Скачать PDF</a>';

      grid.appendChild(card);
    });
  }

  // ===== ШАГ 1: ЛОКАЛЬНЫЙ КЭШ (мгновенно) =====
  function applyFromLocalStorage() {
    try {
      var p = localStorage.getItem(KEYS.practices);
      if (p) applyPractices(JSON.parse(p));
    } catch(e) { console.warn('Local practices override failed:', e); }

    try {
      var a = localStorage.getItem(KEYS.articles);
      if (a) applyArticles(JSON.parse(a));
    } catch(e) { console.warn('Local articles override failed:', e); }

    try {
      var g = localStorage.getItem(KEYS.guides);
      if (g) applyGuides(JSON.parse(g));
    } catch(e) { console.warn('Local guides override failed:', e); }
  }

  // ===== ШАГ 2: ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ (Firestore) =====
  function applyFromCloud() {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;

    var db;
    try {
      if (!firebase.apps.length && typeof firebaseConfig !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
    } catch(e) {
      try { db = firebase.firestore(); } catch(e2) { return; }
    }
    if (!db) return;

    function fetchAndApply(key, applyFn, lsKey) {
      db.collection('admin_data').doc(key).get()
        .then(function(doc) {
          if (!doc.exists) return;
          var data = doc.data().data;
          if (!data) return;
          // Кэшируем для следующего захода
          try { localStorage.setItem(lsKey, JSON.stringify(data)); } catch(e) {}
          applyFn(data);
        })
        .catch(function(err) { console.warn('Cloud fetch ' + key + ' failed:', err); });
    }

    fetchAndApply('practices', applyPractices, KEYS.practices);
    fetchAndApply('articles', applyArticles, KEYS.articles);
    fetchAndApply('guides', applyGuides, KEYS.guides);
  }

  // ===== ЗАПУСК =====
  function run() {
    applyFromLocalStorage();
    applyFromCloud();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
