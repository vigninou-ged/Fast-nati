/**
 * app.js — BiblioFAST
 * Initialisation UI, sidebar, favoris, adaptation selon rôle
 */

'use strict';

const AppModule = (function () {

  // ── Initialiser l'affichage utilisateur ──────────────────────────────
  function initUserUI(user) {
    if (!user) return;
    const P       = AuthModule.PERMISSIONS;
    const isAdmin = P.isAdmin(user.role);
    const prenom  = (user.nom || 'Utilisateur').split(' ')[0];
    const avatar  = prenom.charAt(0).toUpperCase();

    document.querySelectorAll('.js-user-name').forEach(el => { el.textContent = user.nom || 'Utilisateur'; });
    document.querySelectorAll('.js-user-role').forEach(el => {
      el.textContent = AuthModule.getRoleLabel(user.role);
      el.style.color      = isAdmin ? 'var(--brand-accent)' : '';
      el.style.fontWeight = isAdmin ? '600' : '';
    });
    document.querySelectorAll('.js-user-avatar').forEach(el => { el.textContent = avatar; });
    document.querySelectorAll('.js-welcome-name').forEach(el => { el.textContent = prenom; });

    applyRoleUI(user.role);
  }

  // ── Masquer/afficher éléments selon permissions ───────────────────────
  function applyRoleUI(role) {
    const P       = AuthModule.PERMISSIONS;
    const isAdmin = P.isAdmin(role);

    document.querySelectorAll('[data-perm-add]')    .forEach(el => { el.style.display = P.canAdd(role)    ? '' : 'none'; });
    document.querySelectorAll('[data-perm-delete]') .forEach(el => { el.style.display = P.canDelete(role) ? '' : 'none'; });
    document.querySelectorAll('[data-role-admin]')  .forEach(el => { el.style.display = isAdmin ? '' : 'none'; });

    const adminLink = document.getElementById('admin-nav-link');
    if (adminLink) adminLink.style.display = isAdmin ? '' : 'none';
  }

  // ── Sidebar mobile ────────────────────────────────────────────────────
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;
    const open  = () => { sidebar.classList.add('open');    overlay.classList.add('active'); };
    const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };
    overlay.addEventListener('click', close);
    document.querySelector('.sidebar-mobile-toggle')?.addEventListener('click', open);
    window.openSidebar  = open;
    window.closeSidebar = close;
  }

  // ── Favoris ───────────────────────────────────────────────────────────
  const favKey = id => 'favs_' + id;
  function loadFavorites(userId)       { return JSON.parse(localStorage.getItem(favKey(userId)) || '[]'); }
  function saveFavorites(userId, favs) { localStorage.setItem(favKey(userId), JSON.stringify(favs)); }

  function updateFavCount(userId) {
    const el = document.getElementById('fav-count-sidebar'); if (!el) return;
    const n  = loadFavorites(userId).length;
    el.textContent  = n;
    el.style.display = n > 0 ? '' : 'none';
  }

  function toggleFavorite(userId, resourceId, btnEl) {
    if (!userId || !resourceId) return;
    const favs  = loadFavorites(userId);
    const idx   = favs.indexOf(resourceId);
    const added = idx === -1;
    added ? favs.push(resourceId) : favs.splice(idx, 1);
    saveFavorites(userId, favs);
    if (btnEl) btnEl.classList.toggle('active', added);
    updateFavCount(userId);
    FAST.showNotification(added ? 'Ajouté aux favoris !' : 'Retiré des favoris', added ? 'success' : 'info');
    return added;
  }

  // ── Init page protégée ────────────────────────────────────────────────
  function initPage(options = {}) {
    const user = AuthModule.requireAuth(options.redirectTo || 'login.html');
    if (!user) return null;
    if (options.adminOnly && !AuthModule.PERMISSIONS.isAdmin(user.role)) {
      window.location.href = 'dashboard.html'; return null;
    }
    initUserUI(user);
    initSidebar();
    updateFavCount(user.id);
    return user;
  }

  return {
    initPage, initUserUI, initSidebar, applyRoleUI,
    loadFavorites, saveFavorites, updateFavCount, toggleFavorite
  };
})();

// ── Wiring global commun à toutes les pages ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Boutons déconnexion
  document.querySelectorAll('.js-logout').forEach(btn => btn.addEventListener('click', FAST.logoutUser));
});
