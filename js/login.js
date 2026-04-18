/**
 * login.js — BiblioFAST
 * Interactions de la page de connexion
 */
'use strict';

(function () {
  // Redirect si déjà connecté
  const stored = sessionStorage.getItem('currentUser');
  if (stored) {
    try {
      const u = JSON.parse(stored);
      window.location.href = AuthModule.PERMISSIONS.isAdmin(u.role) ? 'admin.html' : 'dashboard.html';
    } catch {}
  }

  // Toggle mot de passe
  document.getElementById('toggle-pwd')?.addEventListener('click', function () {
    const inp  = document.getElementById('password');
    const icon = this.querySelector('i');
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  // Formulaire login
  document.getElementById('login-form')?.addEventListener('submit', AuthModule.handleLogin);

  // Modal mot de passe oublié
  document.getElementById('forgot-trigger')?.addEventListener('click', AuthModule.openForgotModal);
  document.getElementById('forgot-close')?.addEventListener('click',   AuthModule.closeForgotModal);
  document.getElementById('forgot-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) AuthModule.closeForgotModal();
  });
  document.getElementById('forgot-form')?.addEventListener('submit', AuthModule.handleForgotPassword);
})();
