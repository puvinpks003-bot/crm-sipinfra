// ============================================================
// SOLAR CRM — MAIN APP CONTROLLER
// Dashboard renderer + page router + toast system
// ============================================================

window.APP = {
  currentPage: 'dashboard',
  toastQueue: [],

  async init() {
    // Always dismiss splash screen first to prevent UI freezing on errors
    setTimeout(() => {
      const splash = document.getElementById('splash');
      if (splash) splash.classList.add('hidden');
    }, 1800);

    // Boot auth
    Auth.init();
    this.initTheme();
    this.startClock();

    // Initialize modules only if we have a user, or catch errors gracefully
    try {
      if (Auth.currentUser && Auth.currentUser.token) {
        await MockAPI.syncGlobals();
        await Promise.all([
          LeadsModule.init(),
          QuotesModule.init(),
          Notifications.init(),
        ]);
        await ScheduleModule.init();
        await TeamModule.init();
        this.updateNotifBadge();
      }
    } catch (err) {
      console.warn("Module initialization deferred:", err.message);
    }
  },

  startClock() {
    const el = document.getElementById('live-clock');
    if (!el) return;
    const tick = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    tick();
    setInterval(tick, 10000);
  },

  // ── Theme Management ───────────────────────────────────────
  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      document.documentElement.classList.add('light-mode');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = '☀️';
    }
  },

  toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    document.documentElement.classList.toggle('light-mode');
    
    const btn = document.getElementById('theme-toggle-btn');
    if (isLight) {
      localStorage.setItem('theme', 'light');
      if (btn) btn.textContent = '☀️';
    } else {
      localStorage.setItem('theme', 'dark');
      if (btn) btn.textContent = '🌙';
    }
  },

  // ── Router ─────────────────────────────────────────────────
  async showPage(page, pushHistory = true) {
    if (!page) page = 'dashboard';
    // Access guard
    if (!Auth.canAccess(page)) {
      this.showToast('error','🔒 Access Denied', 'You do not have permission for this page.');
      return;
    }

    this.currentPage = page;

    if (pushHistory) {
      history.pushState({ page: page }, '', '#' + page);
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + page)?.classList.add('active');

    // Update breadcrumb
    const labels = {
      'dashboard':     '🏠 Dashboard',
      'leads':         '📊 All Leads',
      'my-leads':      '📞 My Leads',
      'pipeline':      '🔄 Pipeline',
      'schedule':      '📅 Schedule',
      'quotes':        '📄 Quotes',
      'reports':       '📈 Reports',
      'team':          '👥 Team',
      'settings':      '⚙️ Settings',
      'notifications': '🔔 Notifications',
    };
    document.getElementById('breadcrumb').textContent = labels[page] || page;

    // Close overlays
    closeOverlays();
    closeDrawer();

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
    }

    // Render page
    const content = document.getElementById('page-content');
    content.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;"><div class="spinner" style="width:32px;height:32px;color:var(--gold-500);"></div></div>';

    try {
      if (Auth.currentUser && Auth.currentUser.token) {
        await MockAPI.syncGlobals();
        // Sync local variables to modules
        LeadsModule.allLeads = window.LEADS;
        LeadsModule.filtered = window.LEADS;
        QuotesModule.quotes = window.QUOTES;
        ScheduleModule.followUps = window.FOLLOW_UPS;
        TeamModule.team = window.USERS.filter(u => u.role === 'telecaller');
      }
    } catch (err) {
      console.warn("Failed to sync globals on page transition:", err.message);
    }

    let html = '';
    try {
      switch(page) {
        case 'dashboard':
          html = await this.renderDashboard();
          break;
        case 'leads':
          LeadsModule.applyFilters({});
          html = LeadsModule.renderAllLeads();
          break;
        case 'my-leads':
          html = LeadsModule.renderMyLeads();
          break;
        case 'pipeline':
          PipelineModule.leads = LEADS;
          html = PipelineModule.renderPipeline();
          break;
        case 'schedule':
          await ScheduleModule.init();
          html = ScheduleModule.renderSchedule();
          break;
        case 'quotes':
          html = QuotesModule.renderQuotesList();
          break;
        case 'reports':
          html = await ReportsModule.render();
          break;
        case 'team':
          await TeamModule.init();
          html = TeamModule.renderTeam();
          break;
        case 'settings':
          html = SettingsModule.renderSettings();
          break;
        case 'notifications':
          html = renderNotificationsPage();
          break;
        default:
          html = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Page not found</div></div>`;
      }
    } catch (renderError) {
      console.error("Rendering error on page:", page, renderError);
      html = `
        <div class="empty-state">
          <div class="empty-icon" style="color:var(--zoho-orange);">⚠️</div>
          <div class="empty-title">Error Loading Page</div>
          <div class="empty-desc" style="color:var(--red-400);margin-top:8px;max-width:400px;margin-left:auto;margin-right:auto;">${renderError.message}</div>
          <button class="btn btn-secondary mt-16" onclick="window.APP.showPage('${page}')">🔄 Retry</button>
        </div>
      `;
    }

    content.innerHTML = html;
    content.scrollTop = 0;

    // Animate page entry
    const firstChild = content.firstElementChild;
    if (firstChild) firstChild.classList.add('page-enter');
  },

  // ── Dashboard ──────────────────────────────────────────────
  async renderDashboard() {
    const user  = Auth.currentUser;
    const isTC  = user.role === 'telecaller';
    const stats = await MockAPI.getStats(isTC ? user.id : null);
    
    const leadsList = window.LEADS || [];
    const activitiesList = window.ACTIVITIES || [];
    const followUpsList = window.FOLLOW_UPS || [];
    const usersList = window.USERS || [];

    const leads = isTC ? leadsList.filter(l => l.assignedTo === user.id) : leadsList;
    const team  = usersList.filter(u => u.role === 'telecaller');

    const todayFollowUps = followUpsList.filter(f =>
      (isTC ? f.assignedTo === user.id : true) && f.isToday
    ).length;
    const overdueFollowUps = followUpsList.filter(f =>
      (isTC ? f.assignedTo === user.id : true) && f.isOverdue
    ).length;

    const monthStats = Utils.monthStats(leads);
    const recentLeads = leads.slice(0, 8);
    const recentActivity = activitiesList.filter(a =>
      isTC ? leadsList.find(l => l.id === a.leadId && l.assignedTo === user.id) : true
    ).slice(0, 10);

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Good ${this.getGreeting()}, ${user.name.split(' ')[0]}! ☀️</h1>
          <p class="page-subtitle">${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <div class="page-header-right">
          ${!isTC ? `<button class="btn btn-secondary" onclick="LeadsModule.showAddLead()">➕ Add Lead</button>` : ''}
          <button class="btn btn-primary" onclick="window.APP.showPage('schedule')">📅 ${todayFollowUps} Follow-ups Today</button>
        </div>
      </div>

      ${overdueFollowUps > 0 ? `
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">⚠️</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--red-400);">${overdueFollowUps} Overdue Follow-up${overdueFollowUps > 1 ? 's' : ''}</div>
            <div style="font-size:12px;color:var(--text-muted);">These leads need immediate attention</div>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="window.APP.showPage('schedule')">View All →</button>
      </div>` : ''}

      <!-- Stats Cards -->
      <div class="stats-grid">
        ${[
          { label: 'Total Leads',      val: stats.total,    icon: '📋', cls: 'blue',   trend: '+12%', up: true,  sub: `${monthStats.total} this month` },
          { label: 'New Leads',        val: stats.new,      icon: '🌟', cls: 'gold',   trend: '+8%',  up: true,  sub: 'Uncontacted' },
          { label: 'In Progress',      val: stats.contacted + stats.qualified, icon: '🔄', cls: 'teal', sub: `${stats.qualified} qualified` },
          { label: 'Deals Won',        val: stats.won,      icon: '🏆', cls: 'green',  trend: '+24%', up: true,  sub: `${stats.convRate}% conv. rate` },
          { label: 'Revenue Closed',   val: Utils.formatINR(stats.revenue), icon: '💰', cls: 'purple', noAnim: true, sub: `${Utils.formatINR(monthStats.revenue)} this month` },
          { label: 'Pipeline Value',   val: Utils.formatINR(stats.pipeline), icon: '📈', cls: 'teal', noAnim: true, sub: 'Active pipeline' },
        ].map(s => `
          <div class="stat-card ${s.cls} hover-lift" onclick="window.APP.showPage('leads')">
            <div class="stat-header">
              <div class="stat-icon ${s.cls}">${s.icon}</div>
              ${s.trend ? `<div class="stat-trend ${s.up ? 'up' : 'down'}">${s.up ? '↑' : '↓'} ${s.trend}</div>` : ''}
            </div>
            <div class="stat-value">${s.val}</div>
            <div class="stat-label">${s.label}</div>
            ${s.sub ? `<div class="stat-sub">${s.sub}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Quick Actions -->
      ${isTC ? `
      <div class="quick-actions">
        ${[
          { icon: '📞', title: 'My Leads',        desc: 'View & call your leads',    color: 'rgba(45,212,191,0.15)',  page: 'my-leads' },
          { icon: '📅', title: 'Schedule',         desc: `${todayFollowUps} due today`,color:'rgba(245,158,11,0.15)', page: 'schedule' },
          { icon: '📄', title: 'Generate Quote',   desc: 'Create proposal instantly', color: 'rgba(168,85,247,0.15)', page: 'quotes' },
          { icon: '📊', title: 'Pipeline',         desc: 'View lead stages',          color: 'rgba(59,130,246,0.15)', page: 'pipeline' },
        ].map(a => `
          <div class="quick-action-card hover-lift" onclick="window.APP.showPage('${a.page}')">
            <div class="qa-icon" style="background:${a.color};">${a.icon}</div>
            <div><div class="qa-title">${a.title}</div><div class="qa-desc">${a.desc}</div></div>
          </div>
        `).join('')}
      </div>` : ''}

      <div class="dashboard-grid">
        <!-- Left Column -->
        <div style="display:flex;flex-direction:column;gap:20px;">
          <!-- Recent Leads -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">⚡ Recent Leads</div>
              <button class="btn btn-ghost btn-sm" onclick="window.APP.showPage('${isTC ? 'my-leads' : 'leads'}')">View All →</button>
            </div>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>System</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentLeads.length === 0 ? `
                    <tr>
                      <td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">No recent leads available.</td>
                    </tr>
                  ` : recentLeads.map(l => `
                    <tr onclick="LeadsModule.openDrawer('${l.id}')">
                      <td>
                        <div class="td-lead-name">
                          <div class="lead-initials" style="background:${Utils.leadColor(l.id)};">${Utils.initials(l.name)}</div>
                          <div>
                            <div style="font-weight:600;">${l.name}</div>
                            <div style="font-size:11px;color:var(--text-muted);">${l.city}</div>
                          </div>
                        </div>
                      </td>
                      <td>${Utils.systemBadge(l.systemType)} ${Utils.formatKW(l.kwSize)}</td>
                      <td>${Utils.statusBadge(l.status)}</td>
                      <td style="color:var(--gold-400);font-weight:600;">${Utils.formatINR(l.netCost)}</td>
                      <td style="font-size:12px;${l.nextFollowUp && Utils.isOverdue(l.nextFollowUp) ? 'color:var(--red-400)' : 'color:var(--text-muted)'}">
                        ${l.nextFollowUp ? Utils.formatDate(l.nextFollowUp) : '—'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activity Feed -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">📋 Recent Activity</div>
            </div>
            <div class="card-body">
              <div class="activity-feed">
                ${recentActivity.length === 0 ? `
                  <div style="text-align:center;color:var(--text-muted);padding:24px;">No recent activities.</div>
                ` : recentActivity.slice(0, 8).map(a => {
                  const u = Utils.getUser(a.userId);
                  const lead = leadsList.find(l => l.id === a.leadId);
                  const icons = { call:'📞', note:'📝', status_change:'🔄', email:'✉️', whatsapp:'💬', site_visit:'🏠' };
                  const bgColors = { call:'rgba(45,212,191,0.1)', note:'rgba(245,158,11,0.1)', status_change:'rgba(168,85,247,0.1)', email:'rgba(59,130,246,0.1)', whatsapp:'rgba(74,222,128,0.1)', site_visit:'rgba(249,115,22,0.1)' };
                  let desc = '';
                  if (a.type === 'call')          desc = `<strong>${u.name.split(' ')[0]}</strong> called ${lead?.name || 'lead'} — ${a.data?.outcome || ''}`;
                  else if (a.type === 'note')     desc = `<strong>${u.name.split(' ')[0]}</strong> noted: "${(a.data?.text || '').substring(0, 60)}..."`;
                  else if (a.type === 'status_change') desc = `<strong>${u.name.split(' ')[0]}</strong> moved ${lead?.name || 'lead'}: ${a.data?.from} → ${a.data?.to}`;
                  else if (a.type === 'email')    desc = `<strong>${u.name.split(' ')[0]}</strong> emailed ${lead?.name || 'lead'}`;
                  else if (a.type === 'whatsapp') desc = `<strong>${u.name.split(' ')[0]}</strong> WhatsApp'd ${lead?.name || 'lead'}`;
                  else desc = `<strong>${u.name.split(' ')[0]}</strong> visited ${lead?.name || 'lead'}'s site`;
                  return `
                    <div class="activity-item">
                      <div class="activity-icon" style="background:${bgColors[a.type] || 'rgba(255,255,255,0.05)'};">${icons[a.type] || '📋'}</div>
                      <div class="activity-text">
                        <div class="activity-desc">${desc}</div>
                        <div class="activity-time">${Utils.timeAgo(a.timestamp)}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div style="display:flex;flex-direction:column;gap:20px;">
          <!-- Pipeline Status -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">🔄 Pipeline Status</div>
              <button class="btn btn-ghost btn-sm" onclick="window.APP.showPage('pipeline')">Kanban →</button>
            </div>
            <div class="card-body">
              <div class="pipeline-mini">
                ${LEAD_STATUSES.map((s, i) => {
                  const count = leads.filter(l => l.status === s).length;
                  const pct   = leads.length > 0 ? (count / leads.length) * 100 : 0;
                  const colors = ['#3B82F6','#FACC15','#A855F7','#F97316','#22C55E','#EF4444'];
                  return `
                    <div class="pipeline-step" onclick="window.APP.showPage('pipeline')">
                      <div class="pipeline-step-name">${s}</div>
                      <div class="pipeline-step-bar">
                        <div class="pipeline-step-fill" style="width:${pct}%;background:${colors[i]};height:100%;border-radius:9999px;transition:width 0.8s ease;"></div>
                      </div>
                      <div class="pipeline-step-count">${count}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Lead Source -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">📡 Lead Sources</div>
            </div>
            <div class="card-body">
              <div class="source-list">
                ${(() => {
                  if (leads.length === 0) return `<div style="text-align:center;color:var(--text-muted);padding:24px;">No lead source data available.</div>`;
                  const sourceCounts = {};
                  leads.forEach(l => { sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1; });
                  const sorted = Object.entries(sourceCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
                  const max = Math.max(...sorted.map(s => s[1]), 1);
                  const colors = ['#F59E0B','#14B8A6','#A855F7','#3B82F6','#EF4444','#10B981'];
                  return sorted.map(([src, cnt], i) => `
                    <div class="source-item">
                      <div class="source-name">${src}</div>
                      <div class="source-bar-wrap">
                        <div class="source-bar-fill" style="width:${Math.round((cnt/max)*100)}%;background:${colors[i]};"></div>
                      </div>
                      <div class="source-count">${cnt}</div>
                    </div>
                  `).join('');
                })()}
              </div>
            </div>
          </div>

          <!-- Top Performers (Manager/Admin) -->
          ${!isTC ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">🏆 Top Performers</div>
              <button class="btn btn-ghost btn-sm" onclick="window.APP.showPage('team')">Team →</button>
            </div>
            <div class="card-body">
              <div class="performer-list">
                ${team.length === 0 ? `
                  <div style="text-align:center;color:var(--text-muted);padding:24px;">No performance data.</div>
                ` : team.map(u => {
                  const myLeads = leadsList.filter(l => l.assignedTo === u.id);
                  const won = myLeads.filter(l => l.status === 'Won').length;
                  const rev = myLeads.filter(l => l.status === 'Won').reduce((s,l) => s + l.netCost, 0);
                  return { ...u, _won: won, _rev: rev };
                }).sort((a,b) => b._rev - a._rev || b._won - a._won).slice(0, 5).map((u, i) => {
                  const myLeads = leadsList.filter(l => l.assignedTo === u.id);
                  const won = myLeads.filter(l => l.status === 'Won').length;
                  const rev = myLeads.filter(l => l.status === 'Won').reduce((s,l) => s + l.netCost, 0);
                  const medals = ['🥇','🥈','🥉'];
                  return `
                    <div class="performer-item">
                      <div class="performer-rank ${i===0 ? 'gold-rank' : ''}">${medals[i] || (i+1)}</div>
                      <div class="performer-av">${Utils.avatarHtml(u, 32)}</div>
                      <div class="performer-info">
                        <div class="performer-name">${u.name.split(' ')[0]}</div>
                        <div class="performer-leads">${myLeads.length} leads • ${won} won</div>
                      </div>
                      <div class="performer-val">${Utils.formatINR(rev)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>` : ''}

          <!-- My Targets (Tele-caller) -->
          ${isTC ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">🎯 My Monthly Target</div>
            </div>
            <div class="card-body" style="text-align:center;">
              ${Utils.progressCircle(Math.min((stats.won / (user.target || 20)) * 100, 100), 100, '#F59E0B')}
              <div style="margin-top:12px;font-size:14px;color:var(--text-secondary);">${stats.won} / ${user.target || 20} closures</div>
              <div style="margin-top:4px;font-size:12px;color:var(--text-muted);">${Math.max(0, (user.target || 20) - stats.won)} more to reach target</div>
            </div>
          </div>` : ''}
        </div>
      </div>
    `;
  },

  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  },

  updateNotifBadge() {
    const count = Notifications.unreadCount();
    const badge = document.getElementById('notif-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  // ── Toast System ───────────────────────────────────────────
  showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const id = 'toast-' + Date.now();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.id = id;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        ${message ? `<span class="toast-msg">${message}</span>` : ''}
      </div>
    `;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      setTimeout(() => el.remove(), 400);
    }, 3500);
  },
};

// ── Sidebar Toggle ─────────────────────────────────────────
function toggleSidebar() {
  if (window.innerWidth > 768) {
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebar-collapsed', document.body.classList.contains('sidebar-collapsed'));
  } else {
    document.getElementById('sidebar').classList.toggle('open');
    const overlay = document.getElementById('overlay');
    overlay.classList.toggle('active', document.getElementById('sidebar').classList.contains('open'));
  }
}

// ── Initialize App ─────────────────────────────────────────
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page) {
    window.APP.showPage(e.state.page, false);
  } else {
    const hash = window.location.hash.replace('#', '');
    if (hash) window.APP.showPage(hash, false);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('sidebar-collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }
  window.APP.init();
});
