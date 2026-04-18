/**
 * admin.js — BiblioFAST
 * Logique du tableau de bord administrateur
 */

'use strict';

(function () {

  // ── Guard ─────────────────────────────────────────────────────────────
  const adminUser = AppModule.initPage({ adminOnly: true });
  if (!adminUser) return;

  // ── PDF upload state ──────────────────────────────────────────────────
  let _pdfData = null;

  // ── Navigation ────────────────────────────────────────────────────────
  const TABS = ['dashboard', 'ressources', 'utilisateurs', 'categories'];
  const TAB_TITLES = { dashboard:'Tableau de bord', ressources:'Gestion des ressources', utilisateurs:'Utilisateurs', categories:'Catégories' };

  function showTab(tab) {
    TABS.forEach(t => {
      const el  = document.getElementById('tab-' + t);
      const nav = document.getElementById('nav-' + t);
      if (el)  el.style.display = t === tab ? 'block' : 'none';
      if (nav) nav.classList.toggle('active', t === tab);
    });
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = TAB_TITLES[tab] || '';
    if (tab === 'ressources')   renderResourcesTable();
    if (tab === 'utilisateurs') renderUsersTable();
    if (tab === 'dashboard')    refreshDashboard();
  }

  // ── Dashboard stats ───────────────────────────────────────────────────
  function refreshDashboard() {
    const resources = ResourceModule.getAll();
    const users     = JSON.parse(localStorage.getItem('FAST_USERS') || '[]');
    const totalVues = resources.reduce((s, r) => s + (r.vues || 0), 0);

    _set('stat-ressources', resources.length);
    _set('stat-users',      users.length);
    _set('stat-etudiants',  users.filter(u => u.role !== 'admin').length);
    _set('stat-vues',       totalVues.toLocaleString('fr-FR'));

    const recentRes = document.getElementById('recent-resources-body');
    if (recentRes) recentRes.innerHTML = resources.slice(0, 5).map(r => `
      <tr>
        <td class="truncate">${r.titre}</td>
        <td><span class="badge ${ResourceModule.TYPE_BADGE[r.type] || 'badge-gray'}">${ResourceModule.TYPE_LABELS[r.type] || r.type}</span></td>
        <td>${r.vues}</td>
      </tr>`).join('') || '<tr><td colspan="3" class="empty-cell">Aucune ressource</td></tr>';

    const recentUsers = document.getElementById('recent-users-body');
    if (recentUsers) recentUsers.innerHTML = users.length === 0
      ? '<tr><td colspan="3" class="empty-cell">Aucun étudiant inscrit</td></tr>'
      : users.slice(0, 5).map(u => `
        <tr>
          <td class="fw-600">${u.nom}</td>
          <td class="text-muted small">${u.email || '—'}</td>
          <td>${_roleBadge(u.role)}</td>
        </tr>`).join('');
  }

  // ── Table ressources ──────────────────────────────────────────────────
  function renderResourcesTable() {
    const list = ResourceModule.getAll();
    _set('ressources-subtitle', `${list.length} ressource${list.length !== 1 ? 's' : ''}`);
    const tbody = document.getElementById('resources-table-body');
    if (!tbody) return;
    tbody.innerHTML = list.length === 0
      ? '<tr><td colspan="7" class="empty-cell">Aucune ressource. Ajoutez-en une !</td></tr>'
      : list.map(r => ResourceModule.adminRowHTML(r)).join('');
  }

  // ── Table utilisateurs ────────────────────────────────────────────────
  function renderUsersTable() {
    const users     = JSON.parse(localStorage.getItem('FAST_USERS') || '[]');
    const etudiants = users.filter(u => u.role !== 'admin');

    _set('user-count-label', `${users.length} utilisateur${users.length !== 1 ? 's' : ''} · ${etudiants.length} étudiant${etudiants.length !== 1 ? 's' : ''}`);
    _set('stat-users',       users.length);
    _set('stat-etudiants',   etudiants.length);

    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = users.length === 0
      ? '<tr><td colspan="5" class="empty-cell">Aucun étudiant inscrit.</td></tr>'
      : users.map(u => `
        <tr data-uid="${u.id}">
          <td class="fw-600">${u.nom}</td>
          <td class="text-muted">${u.email || u.matricule || '—'}</td>
          <td>${_roleBadge(u.role)}</td>
          <td class="text-muted small">${u.dateInscription ? new Date(u.dateInscription).toLocaleDateString('fr-FR') : '—'}</td>
          <td><button class="btn btn-ghost btn-sm btn-icon text-error js-delete-user" data-id="${u.id}" data-label="${(u.nom || '').replace(/'/g, "\\'")}" title="Supprimer"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('');
  }

  // ── Confirmation suppression ──────────────────────────────────────────
  function confirmDelete(id, label, type) {
    const modal = document.getElementById('confirm-modal');
    const msg   = document.getElementById('confirm-msg');
    if (msg) msg.textContent = `Supprimer "${label}" définitivement ?`;
    if (modal) modal.classList.add('open');

    document.getElementById('confirm-ok').onclick = () => {
      modal.classList.remove('open');
      if (type === 'resource') {
        ResourceModule.remove(Number(id));
        FAST.showNotification('Ressource supprimée.', 'success');
        renderResourcesTable();
        refreshDashboard();
      } else if (type === 'user') {
        const users = JSON.parse(localStorage.getItem('FAST_USERS') || '[]').filter(u => u.id !== id);
        localStorage.setItem('FAST_USERS', JSON.stringify(users));
        FAST.showNotification('Utilisateur supprimé.', 'success');
        renderUsersTable();
        refreshDashboard();
      }
    };
    document.getElementById('confirm-cancel').onclick = () => modal.classList.remove('open');
  }

  // ── PDF upload ────────────────────────────────────────────────────────
  function handlePdfDrop(e) {
    e.preventDefault();
    document.getElementById('pdf-drop-zone')?.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file) validateAndLoadPdf(file);
  }

  function validateAndLoadPdf(file) {
    const errEl = document.getElementById('pdf-error');
    _hide(errEl); _pdfData = null;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      _showEl(errEl, 'Fichier invalide — sélectionnez un .pdf');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      _showEl(errEl, `Fichier volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo) — peut dépasser la limite du stockage local.`);
    }

    const reader = new FileReader();
    reader.onload = e => {
      _pdfData = e.target.result;
      _set('pdf-name', file.name);
      _set('pdf-size', (file.size / 1024).toFixed(1) + ' Ko');
      document.getElementById('pdf-drop-zone')?.style.setProperty('display', 'none');
      const prev = document.getElementById('pdf-preview');
      if (prev) prev.classList.add('visible');
    };
    reader.onerror = () => _showEl(errEl, 'Erreur de lecture du fichier.');
    reader.readAsDataURL(file);
  }

  function clearPdf() {
    _pdfData = null;
    const inp = document.getElementById('add-pdf'); if (inp) inp.value = '';
    document.getElementById('pdf-preview')?.classList.remove('visible');
    const dz = document.getElementById('pdf-drop-zone');
    if (dz) dz.style.display = '';
    _hide(document.getElementById('pdf-error'));
  }

  // ── Modal ajout ressource ─────────────────────────────────────────────
  function openAddModal() {
    document.getElementById('add-modal')?.classList.add('open');
    ['add-titre','add-desc','add-url'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['add-type','add-categorie','add-niveau'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    clearPdf();
  }

  function closeAddModal() {
    document.getElementById('add-modal')?.classList.remove('open');
  }

  function submitAddResource() {
    const titre  = document.getElementById('add-titre')?.value.trim()    || '';
    const desc   = document.getElementById('add-desc')?.value.trim()     || '';
    const type   = document.getElementById('add-type')?.value            || '';
    const cat    = document.getElementById('add-categorie')?.value       || '';
    const niveau = document.getElementById('add-niveau')?.value          || '';
    const url    = document.getElementById('add-url')?.value.trim()      || '';

    if (!titre || !desc || !type || !cat || !niveau) {
      FAST.showNotification('Remplissez tous les champs obligatoires (*).', 'error');
      return;
    }
    if (type === 'pdf' && !_pdfData && !url) {
      FAST.showNotification('Pour un type PDF, uploadez un fichier ou fournissez un lien.', 'error');
      return;
    }

    try {
      ResourceModule.add({ titre, description: desc, type, categorie_id: Number(cat), niveau, url: url || null, file_data: _pdfData || null });
      FAST.showNotification(`« ${titre} » ajoutée !`, 'success');
      closeAddModal();
      renderResourcesTable();
      refreshDashboard();
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        FAST.showNotification('PDF trop volumineux pour le stockage local. Utilisez un lien URL.', 'error');
      } else {
        FAST.showNotification('Erreur : ' + e.message, 'error');
      }
    }
  }

  // ── Helpers privés ────────────────────────────────────────────────────
  function _set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
  function _hide(el) { if (el) el.classList.remove('visible'), el.style.display = 'none'; }
  function _showEl(el, msg) { if (el) { el.textContent = msg; el.style.display = 'block'; } }
  function _roleBadge(role) {
    return role === 'admin'
      ? '<span class="badge badge-red">Admin</span>'
      : '<span class="badge badge-blue">Étudiant</span>';
  }

  // ── Délégation d'événements ───────────────────────────────────────────
  document.addEventListener('click', e => {
    // Supprimer ressource
    const delRes = e.target.closest('.js-delete-resource');
    if (delRes) { confirmDelete(delRes.dataset.id, delRes.dataset.label, 'resource'); return; }
    // Supprimer utilisateur
    const delUser = e.target.closest('.js-delete-user');
    if (delUser) { confirmDelete(delUser.dataset.id, delUser.dataset.label, 'user'); return; }
  });

  // ── Exposition globale (pour les onclick HTML résiduels) ──────────────
  window.showTab          = showTab;
  window.openAddModal     = openAddModal;
  window.closeAddModal    = closeAddModal;
  window.submitAddResource= submitAddResource;
  window.handlePdfDrop    = handlePdfDrop;
  window.validateAndLoadPdf = (input) => { const f = input.files[0]; if (f) validateAndLoadPdf(f); };
  window.clearPdf         = clearPdf;

  // ── Démarrage ─────────────────────────────────────────────────────────
  // Sidebar nav tabs
  document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showTab(link.dataset.tab); });
  });

  // Liens "Tout voir" dans le dashboard
  document.querySelectorAll('[data-tab-link]').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tabLink));
  });

  // Boutons modal ajout
  document.getElementById('btn-open-add')    ?.addEventListener('click', openAddModal);
  document.getElementById('btn-close-add')   ?.addEventListener('click', closeAddModal);
  document.getElementById('btn-cancel-add')  ?.addEventListener('click', closeAddModal);
  document.getElementById('btn-submit-add')  ?.addEventListener('click', submitAddResource);

  // Upload PDF
  document.getElementById('pdf-drop-zone')?.addEventListener('click', () => document.getElementById('add-pdf')?.click());
  document.getElementById('pdf-drop-zone')?.addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); });
  document.getElementById('pdf-drop-zone')?.addEventListener('dragleave', e => e.currentTarget.classList.remove('dragover'));
  document.getElementById('pdf-drop-zone')?.addEventListener('drop', handlePdfDrop);
  document.getElementById('add-pdf')?.addEventListener('change', function () { if (this.files[0]) validateAndLoadPdf(this.files[0]); });
  document.getElementById('pdf-clear-btn')?.addEventListener('click', clearPdf);

  // Logout
  document.querySelectorAll('.js-logout').forEach(btn => btn.addEventListener('click', FAST.logoutUser));

  refreshDashboard();
  showTab('dashboard');

})();
