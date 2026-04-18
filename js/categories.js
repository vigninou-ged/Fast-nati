/**
 * categories.js — BiblioFAST
 * Navigation par catégories
 */
'use strict';

(function () {
  const currentUser = AppModule.initPage();
  if (!currentUser) return;

  const CATS = [
    { id:1, name:'Mathématiques', emoji:'📐', color:'#fee2e2' },
    { id:2, name:'Informatique',  emoji:'💻', color:'#dbeafe' },
    { id:3, name:'Physique',      emoji:'⚛️',  color:'#fef3c7' },
    { id:4, name:'Chimie',        emoji:'🧪', color:'#d1fae5' },
    { id:5, name:'Biologie',      emoji:'🌿', color:'#d1fae5' },
    { id:6, name:'Statistiques',  emoji:'📊', color:'#dbeafe' },
  ];

  function renderCats() {
    const all = ResourceModule.getAll();
    const grid = document.getElementById('cat-grid');
    if (!grid) return;
    grid.innerHTML = CATS.map(cat => {
      const count = all.filter(r => r.categorie_id === cat.id).length;
      return `<div class="category-card" data-cat="${cat.id}" style="cursor:pointer;">
        <div class="category-card-icon" style="background:${cat.color};">${cat.emoji}</div>
        <div class="category-card-name">${cat.name}</div>
        <div class="category-card-count">${count} ressource${count !== 1 ? 's' : ''}</div>
      </div>`;
    }).join('');
  }

  function showCategory(catId) {
    const cat = CATS.find(c => c.id === catId);
    if (!cat) return;
    const resources = ResourceModule.getAll().filter(r => r.categorie_id === catId);

    document.getElementById('view-cats').style.display        = 'none';
    document.getElementById('view-cat-detail').style.display  = 'block';
    document.getElementById('cat-detail-name').textContent    = cat.name;
    document.getElementById('cat-detail-title').textContent   = cat.name;
    document.getElementById('cat-detail-count').textContent   = `${resources.length} ressource${resources.length !== 1 ? 's' : ''}`;

    const grid  = document.getElementById('cat-resources-grid');
    const empty = document.getElementById('cat-empty');
    const favs  = AppModule.loadFavorites(currentUser.id);

    if (resources.length === 0) {
      if (grid)  { grid.innerHTML = ''; grid.style.display = 'none'; }
      if (empty) empty.style.display = 'block';
    } else {
      if (empty) empty.style.display = 'none';
      if (grid)  { grid.style.display = 'grid'; grid.innerHTML = resources.map(r => ResourceModule.cardHTML(r, favs)).join(''); }
    }
  }

  function showCategories() {
    document.getElementById('view-cats').style.display       = 'block';
    document.getElementById('view-cat-detail').style.display = 'none';
  }

  // Événements
  document.getElementById('cat-grid')?.addEventListener('click', e => {
    const card = e.target.closest('[data-cat]');
    if (card) showCategory(parseInt(card.dataset.cat));
  });

  document.getElementById('back-to-cats')?.addEventListener('click', e => {
    e.preventDefault(); showCategories();
  });

  // Délégation favoris
  document.getElementById('cat-resources-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-fav]');
    if (btn) AppModule.toggleFavorite(currentUser.id, parseInt(btn.dataset.fav), btn);
  });

  renderCats();
})();
