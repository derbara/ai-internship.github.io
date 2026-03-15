/* ============================================
   FAVORITES-PAGE.JS — Рендер избранного
   Работает только на favorites.html
   ============================================ */

(function () {

  function renderFavorites() {
    // Guard the page behind auth
    if (window.TexelGuard) {
      window.TexelGuard.guardPage('#favoritesContent', {
        title: 'Войдите, чтобы увидеть избранное',
        desc: 'Сохраняйте интересные статьи и методички в свою коллекцию',
        icon: '⭐'
      });
    }

    if (!window.TexelAuth || !window.TexelFavorites) return;

    window.TexelAuth.onReady((user) => {
      if (!user) return;

      const grid = document.getElementById('favoritesGrid');
      const emptyMsg = document.getElementById('favoritesEmpty');
      if (!grid || !emptyMsg) return;

      const favorites = window.TexelFavorites.getFavorites(user.uid);

      if (favorites.length === 0) {
        grid.style.display = 'none';
        emptyMsg.style.display = 'flex';
        return;
      }

      grid.style.display = '';
      emptyMsg.style.display = 'none';

      grid.innerHTML = favorites.map(item => {
        const badgeClass = item.type === 'guide' ? 'badge-edu' : '';
        return `
          <article class="article-card" data-id="${item.id}" data-type="${item.type}">
            <div class="article-top">
              <div class="badge ${badgeClass}">${escapeHtml(item.badge)}</div>
              <button class="bookmark-btn bookmarked" data-remove-id="${item.id}" data-remove-type="${item.type}">★</button>
            </div>
            <h2 class="article-headline">${escapeHtml(item.title)}</h2>
            <a class="article-btn" href="${escapeHtml(item.href)}">${item.type === 'guide' ? 'Открыть' : 'Читать'} →</a>
          </article>
        `;
      }).join('');

      // Handle remove buttons
      grid.querySelectorAll('[data-remove-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.dataset.removeId;
          const type = btn.dataset.removeType;
          window.TexelFavorites.toggleFavorite(user.uid, { id, type });
          renderFavorites();
        });
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderFavorites);
  } else {
    renderFavorites();
  }

})();
