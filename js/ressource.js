/**
 * ressource.js — BiblioFAST
 * Page de détail d'une ressource
 */

'use strict';

(function () {

  const currentUser = AppModule.initPage();
  if (!currentUser) return;

  let favorites  = AppModule.loadFavorites(currentUser.id);
  let currentRes = null;

  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  currentRes = ResourceModule.getById(id);

  setTimeout(() => {
    document.getElementById('detail-loading')?.style.setProperty('display', 'none');
    if (!currentRes) { document.getElementById('not-found')?.style.setProperty('display', 'block'); return; }
    render();
  }, 350);

  function render() {
    const r = currentRes;
    const R = ResourceModule;

    document.title = r.titre + ' — BiblioFAST';
    _set('breadcrumb-title',  r.titre.slice(0, 45) + (r.titre.length > 45 ? '…' : ''));
    _set('detail-emoji',      R.TYPE_EMOJI[r.type] || '📄');
    _set('detail-type-badge', R.TYPE_LABELS[r.type] || r.type);
    _set('detail-title',      r.titre);
    _set('detail-desc',       r.description);
    _set('info-type',   R.TYPE_LABELS[r.type]  || r.type);
    _set('info-cat',    R.CATEGORIES[r.categorie_id] || '—');
    _set('info-niveau', r.niveau);
    _set('info-vues',   r.vues.toLocaleString());
    _set('info-date',   new Date(r.date_upload).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }));

    const badges = document.getElementById('detail-badges');
    if (badges) badges.innerHTML = `
      <span class="badge ${R.CAT_COLORS[r.categorie_id] || 'badge-gray'}">${R.CATEGORIES[r.categorie_id] || 'Autre'}</span>
      <span class="badge badge-gray">${r.niveau}</span>
      <span class="badge ${R.TYPE_BADGE[r.type] || 'badge-gray'}">${R.TYPE_LABELS[r.type] || r.type}</span>`;

    _injectPdfButtons(r);
    _updateFavBtn();
    document.getElementById('detail-content')?.style.setProperty('display', 'block');
  }

  function _injectPdfButtons(r) {
    const container = document.getElementById('action-buttons');
    if (!container) return;
    container.querySelectorAll('.pdf-action-btn').forEach(b => b.remove());
    const favBtn = document.getElementById('btn-fav');
    const pdf    = ResourceModule.pdfLink(r);

    if (pdf) {
      const open = document.createElement('a');
      open.href = pdf; open.target = '_blank'; open.rel = 'noopener';
      open.className = 'btn btn-primary btn-lg pdf-action-btn';
      open.innerHTML = '<i class="fas fa-file-pdf"></i> Ouvrir le PDF';
      container.insertBefore(open, favBtn);

      const dl = document.createElement('a');
      dl.href = pdf; dl.download = r.titre + '.pdf';
      dl.className = 'btn btn-secondary btn-lg pdf-action-btn';
      dl.innerHTML = '<i class="fas fa-download"></i> Télécharger';
      container.insertBefore(dl, favBtn);
    } else {
      const noBtn = document.createElement('button');
      noBtn.disabled = true;
      noBtn.className = 'btn btn-secondary btn-lg pdf-action-btn';
      noBtn.title = 'Aucun fichier associé à cette ressource';
      noBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Fichier non disponible';
      container.insertBefore(noBtn, favBtn);
    }
  }

  function toggleFav() {
    if (!currentRes) return;
    AppModule.toggleFavorite(currentUser.id, currentRes.id, null);
    favorites = AppModule.loadFavorites(currentUser.id);
    _updateFavBtn();
  }

  function _updateFavBtn() {
    const isFav   = favorites.includes(currentRes?.id);
    const label   = document.getElementById('fav-label');
    const btn     = document.getElementById('btn-fav');
    if (label) label.textContent = isFav ? 'Dans les favoris' : 'Ajouter aux favoris';
    if (btn) { btn.style.background = isFav ? 'var(--brand-accent-dim)' : ''; btn.style.color = isFav ? 'var(--brand-accent)' : ''; }
  }

  function _set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

  window.toggleFav = toggleFav;

})();
