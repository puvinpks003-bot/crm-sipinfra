// ============================================================
// SOLAR CRM — NOTIFICATIONS MODULE
// ============================================================

const Notifications = {
  list: [],
  panelOpen: false,

  async init() {
    this.list = await MockAPI.getNotifications();
    this.renderBadge();
  },

  unreadCount() {
    return this.list.filter(n => !n.read).length;
  },

  renderBadge() {
    const count = this.unreadCount();
    const badge = document.getElementById('notif-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
    // Update nav badge
    const navBadge = document.getElementById('nav-badge-notifications');
    if (navBadge) navBadge.textContent = count;
  },

  renderPanel() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    if (this.list.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">No Notifications</div></div>`;
      return;
    }
    list.innerHTML = this.list.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="Notifications.markRead('${n.id}')">
        <div class="notif-icon" style="background:${n.color}20;">${n.icon}</div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        ${n.read ? '' : '<div class="notif-dot"></div>'}
      </div>
    `).join('');
  },

  markRead(id) {
    const n = this.list.find(n => String(n.id) === String(id));
    if (n) n.read = true;
    this.renderBadge();
    this.renderPanel();
  },

  markAllRead() {
    this.list.forEach(n => n.read = true);
    this.renderBadge();
    this.renderPanel();
  },

  add(notif) {
    this.list.unshift({ ...notif, id: 'n_' + Date.now(), time: 'just now', read: false });
    this.renderBadge();
    if (this.panelOpen) this.renderPanel();
  },
};

function showNotifications() {
  const panel = document.getElementById('notif-panel');
  const overlay = document.getElementById('overlay');
  Notifications.panelOpen = !Notifications.panelOpen;
  panel.classList.toggle('active', Notifications.panelOpen);
  overlay.classList.toggle('active', Notifications.panelOpen);
  if (Notifications.panelOpen) Notifications.renderPanel();
}

function markAllRead() {
  Notifications.markAllRead();
}

function closeOverlays() {
  document.getElementById('notif-panel').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  Notifications.panelOpen = false;
}

// ── Full notifications page ──────────────────────────────────
function renderNotificationsPage() {
  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">🔔 Notifications</h1>
        <p class="page-subtitle">${Notifications.unreadCount()} unread notifications</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-secondary" onclick="Notifications.markAllRead();window.APP.showPage('notifications')">Mark All Read</button>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        ${Notifications.list.length === 0 
          ? `<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">All caught up!</div><div class="empty-desc">No notifications to show</div></div>`
          : Notifications.list.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" onclick="Notifications.markRead('${n.id}');document.getElementById('notif-count').textContent=Notifications.unreadCount()">
              <div class="notif-icon" style="background:${n.color}20;width:44px;height:44px;font-size:20px;">${n.icon}</div>
              <div class="notif-content">
                <div class="notif-title" style="font-size:14px;">${n.title}</div>
                <div class="notif-time">${n.time}</div>
              </div>
              ${n.read ? '<span style="font-size:11px;color:var(--text-disabled)">Read</span>' : '<div class="notif-dot"></div>'}
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
}
