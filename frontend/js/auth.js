// ============================================================
// SOLAR CRM — AUTH MODULE
// ============================================================

const Auth = {
  currentUser: null,

  // Nav items per role
  navConfig: {
    telecaller: [
      { section: 'MY WORKSPACE' },
      { id: 'dashboard',     icon: '🏠', label: 'Dashboard',       badge: null },
      { id: 'my-leads',      icon: '📞', label: 'My Leads',         badge: null },
      { id: 'schedule',      icon: '📅', label: 'Follow-up Schedule', badge: null },
      { id: 'quotes',        icon: '📄', label: 'Quote Builder',    badge: null },
      { section: 'TOOLS' },
      { id: 'notifications', icon: '🔔', label: 'Notifications',    badge: 5 },
    ],
    manager: [
      { section: 'OVERVIEW' },
      { id: 'dashboard',     icon: '🏠', label: 'Dashboard',        badge: null },
      { id: 'leads',         icon: '📊', label: 'All Leads',         badge: null },
      { id: 'pipeline',      icon: '🔄', label: 'Pipeline (Kanban)', badge: null },
      { section: 'MANAGEMENT' },
      { id: 'team',          icon: '👥', label: 'Team',              badge: null },
      { id: 'schedule',      icon: '📅', label: 'Schedule',          badge: null },
      { id: 'reports',       icon: '📈', label: 'Reports & Analytics', badge: null },
      { section: 'TOOLS' },
      { id: 'quotes',        icon: '📄', label: 'Quotes',            badge: null },
      { id: 'notifications', icon: '🔔', label: 'Notifications',     badge: 5 },
    ],
    admin: [
      { section: 'OVERVIEW' },
      { id: 'dashboard',     icon: '🏠', label: 'Dashboard',         badge: null },
      { id: 'leads',         icon: '📊', label: 'All Leads',          badge: null },
      { id: 'pipeline',      icon: '🔄', label: 'Pipeline (Kanban)',  badge: null },
      { section: 'MANAGEMENT' },
      { id: 'team',          icon: '👥', label: 'Team Management',    badge: null },
      { id: 'schedule',      icon: '📅', label: 'Schedule',           badge: null },
      { id: 'reports',       icon: '📈', label: 'Reports & Analytics', badge: null },
      { section: 'TOOLS' },
      { id: 'quotes',        icon: '📄', label: 'Quotes',             badge: null },
      { id: 'notifications', icon: '🔔', label: 'Notifications',      badge: 5 },
      { section: 'SYSTEM' },
      { id: 'settings',      icon: '⚙️', label: 'System Settings',    badge: null },
    ],
  },

  init() {
    const saved = localStorage.getItem('SIP INFRA_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      this.showApp();
    }
  },

  async login(email, password) {
    const user = await MockAPI.login(email, password);
    this.currentUser = user;
    localStorage.setItem('SIP INFRA_user', JSON.stringify(user));
    this.showApp();
    return user;
  },

  async signup(userData) {
    const user = await MockAPI.signup(userData);
    this.currentUser = user;
    localStorage.setItem('SIP INFRA_user', JSON.stringify(user));
    this.showApp();
    return user;
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('SIP INFRA_user');
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    // Reset login form
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    // Ensure we are showing the login form and not the signup form
    if (typeof toggleAuthMode === 'function') {
      toggleAuthMode('login');
    } else {
      document.getElementById('signup-form-wrapper')?.classList.add('hidden');
      document.getElementById('login-form-wrapper')?.classList.remove('hidden');
    }
  },

  showApp() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    this.buildNav();
    this.updateUserUI();
    const initialPage = window.location.hash.replace('#', '') || 'dashboard';
    window.APP.showPage(initialPage, false);
  },

  buildNav() {
    const nav = document.getElementById('sidebar-nav');
    const items = this.navConfig[this.currentUser.role] || [];
    nav.innerHTML = items.map(item => {
      if (item.section) {
        return `<div class="nav-section"><div class="nav-section-label">${item.section}</div></div>`;
      }
      const badge = item.badge ? `<span class="nav-badge" id="nav-badge-${item.id}">${item.badge}</span>` : '';
      return `<div class="nav-item" id="nav-${item.id}" onclick="window.APP.showPage('${item.id}')" title="${item.label}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
        ${badge}
      </div>`;
    }).join('');
  },

  updateUserUI() {
    const u = this.currentUser;
    if (!u) return;
    document.getElementById('sidebar-name').textContent = u.name;
    document.getElementById('sidebar-role-badge').textContent = u.role.charAt(0).toUpperCase() + u.role.slice(1);
    document.getElementById('sidebar-avatar').textContent = u.avatar;
    document.getElementById('sidebar-avatar').style.background = u.color;
    document.getElementById('header-avatar').textContent = u.avatar;
    document.getElementById('header-avatar').style.background = u.color;
  },

  canAccess(page) {
    const role = this.currentUser?.role;
    const restricted = {
      leads:    ['manager', 'admin'],
      pipeline: ['manager', 'admin'],
      team:     ['manager', 'admin'],
      reports:  ['manager', 'admin'],
      settings: ['admin'],
    };
    if (!restricted[page]) return true;
    return restricted[page].includes(role);
  },
};

// ── Login Form Handlers ──────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');

  btn.disabled = true;
  btnText.textContent = 'Signing in...';
  btnLoader.classList.remove('hidden');

  try {
    await Auth.login(email, password);
    window.APP.showToast('success', '✅ Welcome back!', `Signed in as ${Auth.currentUser.name}`);
  } catch (err) {
    window.APP.showToast('error', '❌ Login Failed', 'Invalid email or password.');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Sign In';
    btnLoader.classList.add('hidden');
  }
}

function handleLogout() {
  Auth.logout();
  window.APP.showToast('info', '👋 Signed Out', 'See you next time!');
}

function togglePassword(id) {
  const inp = document.getElementById(id);
  if (!inp) return;
  
  if (inp.type === 'password') {
    inp.type = 'text';
    // Optionally change the icon visually, but we will handle this via CSS
  } else {
    inp.type = 'password';
  }
}

// ── Auth UI Toggles ──────────────────────────────────────────
function toggleAuthMode(mode) {
  const loginWrapper = document.getElementById('login-form-wrapper');
  const signupWrapper = document.getElementById('signup-form-wrapper');
  
  if (mode === 'signup') {
    loginWrapper.classList.add('hidden');
    signupWrapper.classList.remove('hidden');
  } else {
    signupWrapper.classList.add('hidden');
    loginWrapper.classList.remove('hidden');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const role = document.getElementById('signup-role').value;
  const btn = document.getElementById('signup-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');

  btn.disabled = true;
  btnText.textContent = 'Creating Account...';
  btnLoader.classList.remove('hidden');

  try {
    await Auth.signup({ name, email, password, role });
    window.APP.showToast('success', '🎉 Welcome to SIP INFRA!', `Your account was created successfully.`);
  } catch (err) {
    window.APP.showToast('error', '❌ Signup Failed', err.message || 'Could not create account.');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Create Account';
    btnLoader.classList.add('hidden');
  }
}
