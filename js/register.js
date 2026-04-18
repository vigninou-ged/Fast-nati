/**
 * register.js — BiblioFAST
 * Interactions de la page d'inscription
 */
'use strict';

(function () {
  if (sessionStorage.getItem('currentUser')) window.location.href = 'dashboard.html';

  document.getElementById('toggle-pw')?.addEventListener('click', function () {
    const inp = document.getElementById('reg-password');
    const icon = this.querySelector('i');
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  document.getElementById('register-form')?.addEventListener('submit', AuthModule.handleRegister);
})();
