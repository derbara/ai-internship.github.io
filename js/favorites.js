/* ============================================
   FAVORITES.JS — Система избранного TEXEL
   Закладки на статьи и методички (localStorage)
   ============================================ */

(function () {

  function getFavorites(uid) {
    const data = localStorage.getItem(`texel_favorites_${uid}`);
    return data ? JSON.parse(data) : [];
  }

  function saveFavorites(uid, favorites) {
    localStorage.setItem(`texel_favorites_${uid}`, JSON.stringify(favorites));
  }

  function toggleFavorite(uid, item) {
    const favorites = getFavorites(uid);
    const index = favorites.findIndex(f => f.id === item.id && f.type === item.type);

    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push({ ...item, savedAt: new Date().toISOString() });
    }

    saveFavorites(uid, favorites);
    return index < 0; // true = added, false = removed
  }

  function isFavorited(uid, type, id) {
    return getFavorites(uid).some(f => f.id === id && f.type === type);
  }

  // Inject bookmark buttons on article cards (articles.html)
  function injectArticleBookmarks(uid) {
    document.querySelectorAll('.article-card').forEach(card => {
      const link = card.querySelector('.article-btn');
      if (!link) return;

      const href = link.getAttribute('href');
      const id = href.replace('article-', '').replace('.html', '');
      const title = (card.querySelector('.article-headline') || {}).textContent || '';
      const badge = (card.querySelector('.badge') || {}).textContent || '';

      const btn = document.createElement('button');
      btn.className = 'bookmark-btn';

      const favorited = isFavorited(uid, 'article', id);
      btn.innerHTML = favorited ? '★' : '☆';
      btn.classList.toggle('bookmarked', favorited);
      btn.title = favorited ? 'Убрать из избранного' : 'В избранное';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleFavorite(uid, { type: 'article', id, title: title.trim(), href, badge: badge.trim() });
        btn.innerHTML = added ? '★' : '☆';
        btn.classList.toggle('bookmarked', added);
        btn.title = added ? 'Убрать из избранного' : 'В избранное';
      });

      const topDiv = card.querySelector('.article-top');
      if (topDiv) topDiv.appendChild(btn);
    });
  }

  // Inject bookmark buttons on guide cards (guides.html)
  function injectGuideBookmarks(uid) {
    document.querySelectorAll('.guide-card').forEach((card, index) => {
      const title = (card.querySelector('.guide-title') || {}).textContent || '';
      const link = card.querySelector('.download-btn');
      const href = link ? link.getAttribute('href') : '';
      const id = 'guide-' + index;

      const btn = document.createElement('button');
      btn.className = 'bookmark-btn bookmark-btn-guide';

      const favorited = isFavorited(uid, 'guide', id);
      btn.innerHTML = favorited ? '★' : '☆';
      btn.classList.toggle('bookmarked', favorited);
      btn.title = favorited ? 'Убрать из избранного' : 'В избранное';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleFavorite(uid, { type: 'guide', id, title: title.trim(), href, badge: 'Методичка' });
        btn.innerHTML = added ? '★' : '☆';
        btn.classList.toggle('bookmarked', added);
        btn.title = added ? 'Убрать из избранного' : 'В избранное';
      });

      card.style.position = 'relative';
      card.insertBefore(btn, card.firstChild);
    });
  }

  function init() {
    if (!window.TexelAuth) return;

    window.TexelAuth.onReady((user) => {
      if (!user) return;
      const uid = user.uid;

      // Detect page and inject bookmarks
      if (document.querySelector('.articles-grid .article-card')) {
        injectArticleBookmarks(uid);
      }
      if (document.querySelector('.guides-grid .guide-card')) {
        injectGuideBookmarks(uid);
      }
    });
  }

  // Expose for favorites page
  window.TexelFavorites = {
    getFavorites: getFavorites,
    toggleFavorite: toggleFavorite
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
