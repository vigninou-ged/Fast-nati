/**
 * utils.js — BiblioFAST
 * Utilitaires partagés : notifications, debounce, dates relatives
 */

'use strict';

// ── Notifications toast ──────────────────────────────────────────────
function showNotification(message, type = 'info') {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:10000;display:flex;flex-direction:column;gap:.5rem;';
    document.body.appendChild(container);
  }

  const colors = {
    success: { bg: '#dcfce7', border: '#86efac', text: '#166534', icon: 'fa-check-circle' },
    error:   { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', icon: 'fa-exclamation-circle' },
    warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', icon: 'fa-exclamation-triangle' },
    info:    { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', icon: 'fa-info-circle' },
  };
  const c = colors[type] || colors.info;

  const n = document.createElement('div');
  n.style.cssText = `display:flex;align-items:center;gap:.6rem;padding:.75rem 1rem;border-radius:8px;border:1px solid ${c.border};background:${c.bg};color:${c.text};font-size:.875rem;font-weight:500;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,.1);animation:fadeIn .2s ease;`;
  n.innerHTML = `<i class="fas ${c.icon}" style="flex-shrink:0;"></i><span>${message}</span>`;
  container.appendChild(n);

  setTimeout(() => {
    n.style.opacity = '0';
    n.style.transition = 'opacity .3s';
    setTimeout(() => n.remove(), 300);
  }, 3500);
}

// ── Debounce ─────────────────────────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Date relative ─────────────────────────────────────────────────────
function relativeDate(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return 'Hier';
  if (d < 7)   return `Il y a ${d} jours`;
  if (d < 30)  return `Il y a ${Math.floor(d / 7)} sem.`;
  return `Il y a ${Math.floor(d / 30)} mois`;
}

// ── Déconnexion ───────────────────────────────────────────────────────
function logoutUser() {
  sessionStorage.removeItem('currentUser');
  showNotification('Déconnexion réussie', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 900);
}

// ── Export global ─────────────────────────────────────────────────────
window.FAST = { showNotification, debounce, relativeDate, logoutUser };
