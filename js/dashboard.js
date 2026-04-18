/**
 * dashboard.js — BiblioFAST
 * Bibliothèque étudiant : filtres, cartes, favoris
 */

'use strict';

(function () {

  const currentUser = AppModule.initPage();
  if (!currentUser) return;

  let favorites = AppModule.loadFavorites(currentUser.id);

  // ── Rendu filtré ──────────────────────────────────────────────────────
  function applyFilters() {
    const q      = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const catId  = document.getElementById('filter-categorie')?.value || '';
    const type   = document.getElementById('filter-type')?.value || '';
    const niveau = document.getElementById('filter-niveau')?.value || '';
    const tri    = document.getElementById('filter-tri')?.value || 'recent';

    let list = ResourceModule.getAll().filter(r => {
      const matchQ   = !q    || r.titre.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchCat = !catId || r.categorie_id == catId;
      const matchT   = !type  || r.type === type;
      const matchN   = !niveau|| r.niveau === niveau;
      return matchQ && matchCat && matchT && matchN;
    });

    if (tri === 'populaire') list = list.sort((a, b) => b.vues - a.vues);
    else if (tri === 'az')   list = list.sort((a, b) => a.titre.localeCompare(b.titre));

    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = `${list.length} ressource${list.length !== 1 ? 's' : ''} trouvée${list.length !== 1 ? 's' : ''}`;

    const grid  = document.getElementById('resources-grid');
    const empty = document.getElementById('empty-state');
    if (!grid) return;

    if (list.length === 0) {
      grid.style.display = 'none'; grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = list.map(r => ResourceModule.cardHTML(r, favorites)).join('');
  }

  function resetFilters() {
    ['search-input','filter-categorie','filter-type','filter-niveau'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const tri = document.getElementById('filter-tri'); if (tri) tri.value = 'recent';
    document.querySelectorAll('#cat-pills .filter-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
    applyFilters();
  }

  // ── Favoris (délégation) ──────────────────────────────────────────────
  document.getElementById('resources-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    const id = parseInt(btn.dataset.fav);
    AppModule.toggleFavorite(currentUser.id, id, btn);
    favorites = AppModule.loadFavorites(currentUser.id);
  });

  // ── Filtres ───────────────────────────────────────────────────────────
  document.getElementById('search-input')?.addEventListener('input', FAST.debounce(applyFilters, 280));

  document.querySelectorAll('#cat-pills .filter-pill').forEach(pill => {
    pill.addEventListener('click', function () {
      document.querySelectorAll('#cat-pills .filter-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const fc = document.getElementById('filter-categorie'); if (fc) fc.value = this.dataset.cat;
      applyFilters();
    });
  });

  window.applyFilters  = applyFilters;
  window.resetFilters  = resetFilters;

  // ── Démarrage ─────────────────────────────────────────────────────────
  setTimeout(() => {
    document.getElementById('skeleton-grid')?.style.setProperty('display', 'none');
    const grid = document.getElementById('resources-grid');
    if (grid) grid.style.display = 'grid';
    applyFilters();
  }, 600);

})();
