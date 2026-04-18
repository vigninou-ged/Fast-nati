/**
 * auth.js — BiblioFAST
 * Authentification, inscription, rôles, mot de passe oublié
 * Rôles : "etudiant" | "admin"
 */

'use strict';

const AuthModule = (function () {

  const USERS_KEY        = 'FAST_USERS';
  const SESSION_KEY      = 'currentUser';

  // ── Compte administrateur (hardcodé, non modifiable) ─────────────────
  // Personnalisez le nom ici avant déploiement
  const ADMIN_ACCOUNT = {
    id:        'admin-001',
    nom:       'Administrateur BiblioFAST',
    matricule: 'ADMIN001',
    email:     'admin@fast-nati.edu',
    password:  'admin123',
    role:      'admin'
  };

  // ── Table de permissions ──────────────────────────────────────────────
  const PERMISSIONS = {
    isAdmin:        role => role === 'admin',
    canAdd:         role => role === 'admin',
    canDelete:      role => role === 'admin',
    canManageUsers: role => role === 'admin'
  };

  // ── Labels de rôle ───────────────────────────────────────────────────
  const ROLE_LABELS = { etudiant: 'Étudiant', admin: 'Administrateur' };
  const getRoleLabel = role => ROLE_LABELS[role] || 'Étudiant';

  // ── Helpers UI ────────────────────────────────────────────────────────
  function showFieldError(boxId, msgId, msg) {
    const box = document.getElementById(boxId);
    const el  = document.getElementById(msgId);
    if (box && el) { el.textContent = msg; box.style.display = 'flex'; }
  }
  function hideFieldError(boxId) {
    const box = document.getElementById(boxId); if (box) box.style.display = 'none';
  }
  function setLoading(btnId, text) {
    const b = document.getElementById(btnId); if (!b) return;
    b.disabled = true;
    b.dataset.originalHtml = b.innerHTML;
    b.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
  }
  function resetBtn(btnId) {
    const b = document.getElementById(btnId); if (!b) return;
    b.disabled = false;
    if (b.dataset.originalHtml) b.innerHTML = b.dataset.originalHtml;
  }

  function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function validatePassword(p) { return p && p.length >= 6; }

  // ── Redirection selon rôle ────────────────────────────────────────────
  function redirectByRole(role) {
    window.location.href = PERMISSIONS.isAdmin(role) ? 'admin.html' : 'dashboard.html';
  }

  // ── Authentification ──────────────────────────────────────────────────
  function authenticate(identifier, password) {
    // 1. Compte admin hardcodé
    if ((identifier === ADMIN_ACCOUNT.email || identifier === ADMIN_ACCOUNT.matricule)
        && password === ADMIN_ACCOUNT.password) {
      const { password: _, ...safe } = ADMIN_ACCOUNT;
      return safe;
    }
    // 2. Utilisateurs inscrits
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user  = users.find(u =>
      (u.email === identifier || u.matricule === identifier) && u.password === password
    );
    if (!user) return null;
    if (!user.role || !['etudiant','admin'].includes(user.role)) user.role = 'etudiant';
    const { password: _, ...safe } = user;
    return safe;
  }

  // ── Handler login ─────────────────────────────────────────────────────
  function handleLogin(e) {
    e.preventDefault();
    const identifier = (document.getElementById('identifier')?.value || '').trim();
    const password   =  document.getElementById('password')?.value  || '';
    hideFieldError('login-error');

    if (!identifier || !password) {
      showFieldError('login-error', 'login-error-msg', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading('login-btn', 'Connexion…');

    setTimeout(() => {
      const user = authenticate(identifier, password);
      if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        FAST.showNotification(`Bienvenue, ${user.nom.split(' ')[0]} !`, 'success');
        setTimeout(() => redirectByRole(user.role), 700);
      } else {
        resetBtn('login-btn');
        showFieldError('login-error', 'login-error-msg', 'Identifiant ou mot de passe incorrect.');
      }
    }, 700);
  }

  // ── Handler inscription ───────────────────────────────────────────────
  function handleRegister(e) {
    e.preventDefault();
    const nom        = (document.getElementById('nom')?.value        || '').trim();
    const matricule  = (document.getElementById('matricule')?.value  || '').trim().toUpperCase();
    const email      = (document.getElementById('email')?.value      || '').trim().toLowerCase();
    const password   =  document.getElementById('reg-password')?.value || '';
    const niveau     =  document.getElementById('niveau')?.value      || '';
    const specialite =  document.getElementById('specialite')?.value  || '';
    hideFieldError('register-error');

    if (!nom)                            { showFieldError('register-error','register-error-msg','Le nom complet est obligatoire.'); return; }
    if (!matricule)                       { showFieldError('register-error','register-error-msg','Le matricule est obligatoire.'); return; }
    if (!email || !validateEmail(email))  { showFieldError('register-error','register-error-msg','Adresse email invalide.'); return; }
    if (!validatePassword(password))      { showFieldError('register-error','register-error-msg','Le mot de passe doit faire au moins 6 caractères.'); return; }

    setLoading('register-btn', 'Création…');
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (users.some(u => u.email === email)) {
        resetBtn('register-btn');
        showFieldError('register-error','register-error-msg','Cette adresse email est déjà utilisée.'); return;
      }
      if (users.some(u => u.matricule === matricule)) {
        resetBtn('register-btn');
        showFieldError('register-error','register-error-msg','Ce matricule est déjà enregistré.'); return;
      }
      users.push({
        id: 'user-' + Date.now(), nom, matricule, email, password,
        niveau, specialite, role: 'etudiant',
        dateInscription: new Date().toISOString()
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      FAST.showNotification('Compte créé ! Connectez-vous.', 'success');
      setTimeout(() => {
        sessionStorage.setItem('reg_ok', email);
        window.location.href = 'login.html';
      }, 1000);
    }, 700);
  }

  // ── Mot de passe oublié ───────────────────────────────────────────────
  function handleForgotPassword(e) {
    e.preventDefault();
    const matricule   = (document.getElementById('forgot-matricule')?.value   || '').trim().toUpperCase();
    const newPassword =  document.getElementById('forgot-newpassword')?.value || '';
    hideFieldError('forgot-error');
    _setForgotSuccess(false);

    if (!matricule)                    { showFieldError('forgot-error','forgot-error-msg','Veuillez entrer votre matricule.'); return; }
    if (!validatePassword(newPassword)) { showFieldError('forgot-error','forgot-error-msg','Nouveau mot de passe : 6 caractères minimum.'); return; }
    if (matricule === ADMIN_ACCOUNT.matricule) {
      showFieldError('forgot-error','forgot-error-msg','Le mot de passe admin ne peut pas être réinitialisé ici.'); return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx   = users.findIndex(u => u.matricule === matricule);
    if (idx === -1) { showFieldError('forgot-error','forgot-error-msg','Aucun compte trouvé avec ce matricule.'); return; }

    setLoading('forgot-btn', 'Réinitialisation…');
    setTimeout(() => {
      users[idx].password = newPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      resetBtn('forgot-btn');
      _setForgotSuccess(true);
      setTimeout(() => closeForgotModal(), 2000);
    }, 700);
  }

  function _setForgotSuccess(show) {
    const el = document.getElementById('forgot-success');
    if (el) el.classList.toggle('visible', show);
  }

  function openForgotModal() {
    const m = document.getElementById('forgot-modal'); if (!m) return;
    m.classList.add('open');
    ['forgot-matricule','forgot-newpassword'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    hideFieldError('forgot-error');
    _setForgotSuccess(false);
  }
  function closeForgotModal() {
    const m = document.getElementById('forgot-modal'); if (m) m.classList.remove('open');
  }

  // ── Pré-remplissage après inscription ─────────────────────────────────
  function checkRegisterSuccess() {
    const email = sessionStorage.getItem('reg_ok'); if (!email) return;
    sessionStorage.removeItem('reg_ok');
    const el = document.getElementById('identifier'); if (el) el.value = email;
    setTimeout(() => FAST.showNotification('Compte créé ! Connectez-vous.', 'success'), 250);
  }

  // ── Guards ────────────────────────────────────────────────────────────
  function requireAuth(to) {
    const s = sessionStorage.getItem(SESSION_KEY);
    if (!s) { window.location.href = to || 'login.html'; return null; }
    try { return JSON.parse(s); }
    catch { sessionStorage.removeItem(SESSION_KEY); window.location.href = to || 'login.html'; return null; }
  }

  function requireAdmin() {
    const user = requireAuth();
    if (user && !PERMISSIONS.isAdmin(user.role)) { window.location.href = 'dashboard.html'; return null; }
    return user;
  }

  return {
    handleLogin, handleRegister, handleForgotPassword,
    openForgotModal, closeForgotModal, checkRegisterSuccess,
    requireAuth, requireAdmin,
    authenticate, getRoleLabel, ROLE_LABELS, PERMISSIONS
  };
})();

// Auto-run sur login.html
if (document.getElementById('login-form')) AuthModule.checkRegisterSuccess();
