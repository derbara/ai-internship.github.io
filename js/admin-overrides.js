/* ============================================
   ADMIN-OVERRIDES.JS
   Подхватывает изменения админа из localStorage
   и применяет их на основном сайте
   ============================================ */

(function() {
  'use strict';

  // === Практики: перезаписать PRACTICES_DATA ===
  if (typeof PRACTICES_DATA !== 'undefined') {
    try {
      var adminPractices = localStorage.getItem('texel_admin_practices');
      if (adminPractices) {
        var parsed = JSON.parse(adminPractices);
        Object.keys(PRACTICES_DATA).forEach(function(k) { delete PRACTICES_DATA[k]; });
        Object.assign(PRACTICES_DATA, parsed);
      }
    } catch(e) { console.warn('Admin practices override failed:', e); }
  }

  // === Статьи: перестроить грид ===
  function overrideArticles() {
    try {
      var adminArticles = localStorage.getItem('texel_admin_articles');
      if (!adminArticles) return;
      var articles = JSON.parse(adminArticles);
      var grid = document.querySelector('.articles-grid');
      if (!grid) return;

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
    } catch(e) { console.warn('Admin articles override failed:', e); }
  }

  // === Методички: перестроить грид ===
  function overrideGuides() {
    try {
      var adminGuides = localStorage.getItem('texel_admin_guides');
      if (!adminGuides) return;
      var guides = JSON.parse(adminGuides);
      var grid = document.querySelector('.guides-grid');
      if (!grid) return;

      grid.innerHTML = '';
      guides.forEach(function(g) {
        var card = document.createElement('article');
        card.className = 'guide-card';
        card.setAttribute('data-reveal', '');

        var tagsHTML = g.tags.map(function(t) { return '<span class="guide-tag">' + t + '</span>'; }).join('');

        card.innerHTML =
          '<h3 class="guide-title">' + g.title + '</h3>' +
          '<p class="guide-desc">' + g.description + '</p>' +
          '<div class="guide-tags">' + tagsHTML + '</div>' +
          (g.authors ? '<p class="guide-desc" style="font-size:.8rem;color:rgba(255,255,255,0.6);margin-top:.5rem;">' + g.authors + '</p>' : '') +
          '<a href="' + g.href + '" class="download-btn" target="_blank" rel="noopener">Скачать PDF</a>';

        grid.appendChild(card);
      });
    } catch(e) { console.warn('Admin guides override failed:', e); }
  }

  // Запуск DOM-зависимых override'ов
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      overrideArticles();
      overrideGuides();
    });
  } else {
    overrideArticles();
    overrideGuides();
  }
})();
