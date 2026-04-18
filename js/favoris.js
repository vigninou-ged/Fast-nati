/**
 * favoris.js — BiblioFAST
 * Page des ressources favorites de l'étudiant
 */
'use strict';

(function () {
  const currentUser = AppModule.initPage();
  if (!currentUser) return;

  function render() {
    const favorites   = AppModule.loadFavorites(currentUser.id);
    const favResources = ResourceModule.getAll().filter(r => favorites.includes(r.id));
    const subtitle    = document.getElementById('fav-subtitle');
    const grid        = document.getElementById('fav-grid');
    const empty       = document.getElementById('empty-favs');

    if (subtitle) subtitle.textContent = `${favResources.length} ressource${favResources.length !== 1 ? 's' : ''} sauvegardée${favResources.length !== 1 ? 's' : ''}`;

    if (favResources.length === 0) {
      if (grid)  { grid.innerHTML = ''; grid.style.display = 'none'; }
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (grid) {
      grid.style.display = 'grid';
      grid.innerHTML = favResources.map(r => ResourceModule.cardHTML(r, favorites)).join('');
    }
  }

  // Délégation : retirer des favoris via les cartes
  document.getElementById('fav-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    AppModule.toggleFavorite(currentUser.id, parseInt(btn.dataset.fav), btn);
    setTimeout(render, 300);
  });

  render();
})();
