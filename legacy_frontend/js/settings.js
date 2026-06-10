// ============================================================
// SOLAR CRM — SETTINGS MODULE
// ============================================================

const SettingsModule = {
  activeSection: 'general',

  renderSettings() {
    const sections = [
      { id: 'general',      icon: '⚙️', label: 'General' },
      { id: 'api',          icon: '📡', label: 'API Configuration' },
      { id: 'notifications',icon: '🔔', label: 'Notifications' },
      { id: 'pricing',      icon: '💰', label: 'Pricing & Quotes' },
      { id: 'users',        icon: '👥', label: 'User Management' },
      { id: 'audit',        icon: '📋', label: 'Audit Log' },
    ];

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">⚙️ System Settings</h1>
          <p class="page-subtitle">Configure your SIP INFRA workspace</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" onclick="SettingsModule.saveSettings()">💾 Save Changes</button>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Left Menu -->
        <div class="settings-menu">
          ${sections.map(s => `
            <div class="settings-menu-item ${this.activeSection === s.id ? 'active' : ''}" onclick="SettingsModule.switchSection('${s.id}')">
              <span>${s.icon}</span> ${s.label}
            </div>
          `).join('')}
        </div>

        <!-- Right Panel -->
        <div class="settings-panel" id="settings-panel">
          ${this.renderSection(this.activeSection)}
        </div>
      </div>
    `;
  },

  switchSection(id) {
    this.activeSection = id;
    document.querySelectorAll('.settings-menu-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.settings-menu-item[onclick*="${id}"]`)?.classList.add('active');
    document.getElementById('settings-panel').innerHTML = this.renderSection(id);
  },

  renderSection(id) {
    switch(id) {
      case 'general':      return this.renderGeneral();
      case 'api':          return this.renderAPI();
      case 'notifications':return this.renderNotifSettings();
      case 'pricing':      return this.renderPricing();
      case 'users':        return this.renderUsers();
      case 'audit':        return this.renderAudit();
      default:             return this.renderGeneral();
    }
  },

  renderGeneral() {
    return `
      <div class="settings-section">
        <div class="settings-section-title">Company Information</div>
        <div class="settings-section-desc">Update your company details shown on quotes and reports</div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="form-row">
            <div class="field"><label>Company Name</label><input type="text" value="SIP INFRA Solutions Pvt. Ltd." /></div>
            <div class="field"><label>Registration No.</label><input type="text" value="MH2020ABC1234" /></div>
          </div>
          <div class="form-row">
            <div class="field"><label>GST Number</label><input type="text" value="27AABCS1429B1ZB" /></div>
            <div class="field"><label>Support Email</label><input type="email" value="support@sipinfra.in" /></div>
          </div>
          <div class="field"><label>Head Office Address</label><input type="text" value="42, Solar Tower, Baner Road, Pune – 411045" /></div>
          <div class="form-row">
            <div class="field"><label>Contact Phone</label><input type="tel" value="1800-SOLAR-99" /></div>
            <div class="field"><label>Website</label><input type="url" value="https://SIP INFRA.in" /></div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Workspace Settings</div>
        <div class="settings-section-desc">Configure your CRM workspace preferences</div>
        <div class="toggle-row">
          <div class="toggle-info">
            <div class="toggle-label">Dark Mode</div>
            <div class="toggle-desc">Use dark theme across all pages</div>
          </div>
          <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="toggle-row">
          <div class="toggle-info">
            <div class="toggle-label">Compact View</div>
            <div class="toggle-desc">Show more leads per page in tables</div>
          </div>
          <div class="toggle-switch" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="toggle-row">
          <div class="toggle-info">
            <div class="toggle-label">Auto-assign New Leads</div>
            <div class="toggle-desc">Automatically distribute API leads round-robin</div>
          </div>
          <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
        </div>
      </div>
    `;
  },

  renderAPI() {
    return `
      <div class="settings-section">
        <div class="settings-section-title">📡 Lead Feed API Configuration</div>
        <div class="settings-section-desc">Configure external APIs that push leads into SIP INFRA</div>

        <div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:12px;">
          <div class="status-dot pulse" style="background:var(--green-400);"></div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--green-400);">API Connected & Active</div>
            <div style="font-size:12px;color:var(--text-muted);">Last sync: 2 minutes ago • 1,247 leads imported</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="field">
            <label>Primary Lead API Endpoint</label>
            <input type="url" value="https://api.leadprovider.com/v2/solar-leads" />
          </div>
          <div class="form-row">
            <div class="field">
              <label>API Key</label>
              <input type="password" value="sk_live_********************" />
            </div>
            <div class="field">
              <label>Polling Interval</label>
              <select>
                <option>Every 5 minutes</option>
                <option selected>Every 15 minutes</option>
                <option>Every 30 minutes</option>
                <option>Every hour</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Webhook URL (receive pushes)</label>
              <input type="url" value="https://SIP INFRA.in/webhook/leads/abc123" readonly style="background:var(--bg-surface);" />
            </div>
            <div class="field">
              <label>Lead Source Tag</label>
              <input type="text" value="API-External" />
            </div>
          </div>
        </div>

        <div style="margin-top:20px;">
          <div style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:12px;">Additional Sources</div>
          ${[
            { name: 'Facebook Lead Ads', status: 'Active',      icon: '📘', color: 'var(--green-400)' },
            { name: 'Google Lead Form',  status: 'Active',      icon: '🔍', color: 'var(--green-400)' },
            { name: 'WhatsApp Business', status: 'Not configured', icon: '💬', color: 'var(--text-muted)' },
            { name: 'JustDial API',      status: 'Paused',      icon: '📞', color: 'var(--orange-400)' },
          ].map(s => `
            <div class="toggle-row">
              <div class="toggle-info">
                <div class="toggle-label">${s.icon} ${s.name}</div>
                <div class="toggle-desc" style="color:${s.color};">${s.status}</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <button class="btn btn-secondary btn-sm">Configure</button>
                <div class="toggle-switch ${s.status === 'Active' ? 'on' : ''}" onclick="this.classList.toggle('on')"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Twilio WhatsApp Integration</div>
        <div class="settings-section-desc">Configure Twilio for real WhatsApp messaging (currently mock)</div>
        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-md);padding:12px;margin-bottom:16px;">
          <div style="font-size:13px;color:var(--gold-400);">⚠️ Mock mode enabled — messages are simulated. Add Twilio credentials to enable real sending.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div class="field"><label>Twilio Account SID</label><input type="text" placeholder="ACxxxxxxxxxxxxx" /></div>
          <div class="field"><label>Twilio Auth Token</label><input type="password" placeholder="Your auth token" /></div>
          <div class="field"><label>WhatsApp From Number</label><input type="tel" placeholder="+1 555 000 0000" /></div>
          <button class="btn btn-teal">🔗 Connect Twilio</button>
        </div>
      </div>
    `;
  },

  renderNotifSettings() {
    return `
      <div class="settings-section">
        <div class="settings-section-title">Notification Preferences</div>
        <div class="settings-section-desc">Choose which events trigger in-app and email notifications</div>
        ${[
          { label: 'New lead assigned',         desc: 'Notify when a lead is assigned to you', on: true },
          { label: 'Follow-up reminders',        desc: '30-minute advance reminder before follow-ups', on: true },
          { label: 'Lead status changes',         desc: 'When a lead moves through pipeline stages', on: true },
          { label: 'Deal won by team',            desc: 'Celebrate team wins in real-time', on: true },
          { label: 'Overdue follow-up alerts',    desc: 'Alert when follow-up date passes', on: true },
          { label: 'New API leads batch',         desc: 'When new leads arrive from external API', on: true },
          { label: 'Daily performance summary',   desc: 'EOD summary email with your stats', on: false },
          { label: 'Weekly team report',          desc: 'Monday morning team performance digest', on: false },
        ].map(n => `
          <div class="toggle-row">
            <div class="toggle-info">
              <div class="toggle-label">${n.label}</div>
              <div class="toggle-desc">${n.desc}</div>
            </div>
            <div class="toggle-switch ${n.on ? 'on' : ''}" onclick="this.classList.toggle('on')"></div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderPricing() {
    return `
      <div class="settings-section">
        <div class="settings-section-title">💰 Pricing Configuration</div>
        <div class="settings-section-desc">These values are used to auto-calculate quotes</div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="form-row">
            <div class="field">
              <label>Cost per kW (₹)</label>
              <input type="number" id="price-per-kw" value="${PRICING.costPerKW}" onchange="PRICING.costPerKW=+this.value" />
            </div>
            <div class="field">
              <label>GST Rate (%)</label>
              <input type="number" value="${PRICING.gstRate * 100}" step="0.1" onchange="PRICING.gstRate=+this.value/100" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Installation % of system cost</label>
              <input type="number" value="${PRICING.installationPercent * 100}" step="0.5" onchange="PRICING.installationPercent=+this.value/100" />
            </div>
            <div class="field">
              <label>PM Subsidy per kW (₹)</label>
              <input type="number" value="${PRICING.subsidyPerKW}" onchange="PRICING.subsidyPerKW=+this.value" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Annual generation per kW (kWh)</label>
              <input type="number" value="${PRICING.annualGenPerKW}" onchange="PRICING.annualGenPerKW=+this.value" />
            </div>
            <div class="field">
              <label>Electricity cost per unit (₹)</label>
              <input type="number" value="${PRICING.electricityCostPerUnit}" step="0.5" onchange="PRICING.electricityCostPerUnit=+this.value" />
            </div>
          </div>
        </div>

        <div style="background:var(--bg-elevated);border-radius:var(--radius-md);padding:16px;margin-top:16px;">
          <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">📊 Example: 5 kW Residential System</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;color:var(--text-secondary);">
            <div>System Cost: <strong style="color:var(--text-primary);">${Utils.formatINR(5 * PRICING.costPerKW)}</strong></div>
            <div>Installation: <strong style="color:var(--text-primary);">${Utils.formatINR(Math.round(5 * PRICING.costPerKW * PRICING.installationPercent))}</strong></div>
            <div>GST: <strong style="color:var(--text-primary);">${Utils.formatINR(Math.round(5 * PRICING.costPerKW * (1 + PRICING.installationPercent) * PRICING.gstRate))}</strong></div>
            <div>Subsidy: <strong style="color:var(--green-400);">-${Utils.formatINR(Math.min(Math.round(5 * PRICING.subsidyPerKW), 78000))}</strong></div>
            <div>Net Cost: <strong style="color:var(--gold-400);font-size:15px;">${Utils.formatINR(Math.round(5 * PRICING.costPerKW * (1 + PRICING.installationPercent) * (1 + PRICING.gstRate)) - Math.min(Math.round(5 * PRICING.subsidyPerKW), 78000))}</strong></div>
            <div>Payback: <strong style="color:var(--teal-400);">${(Math.round(5 * PRICING.costPerKW * (1 + PRICING.installationPercent) * (1 + PRICING.gstRate)) - Math.min(Math.round(5 * PRICING.subsidyPerKW), 78000)) / Math.round(5 * PRICING.annualGenPerKW * PRICING.electricityCostPerUnit)} yrs</strong></div>
          </div>
        </div>
      </div>
    `;
  },

  renderUsers() {
    const allUsers = window.USERS || [];
    return `
      <div class="settings-section">
        <div class="settings-section-title">👥 User Management</div>
        <div class="settings-section-desc">Manage all CRM users, roles and access levels</div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Team</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${allUsers.map(u => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div class="user-avatar" style="width:32px;height:32px;font-size:12px;background:${u.color};">${u.avatar}</div>
                      <div>
                        <div style="font-weight:600;color:var(--text-primary);">${u.name}</div>
                        <div style="font-size:11px;color:var(--text-muted);">${u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge ${u.role === 'admin' ? 'badge-proposal' : u.role === 'manager' ? 'badge-qualified' : 'badge-new'}">${u.role}</span></td>
                  <td style="font-size:12px;color:var(--text-muted);">${u.team}</td>
                  <td><span class="badge ${u.status === 'active' ? 'badge-won' : 'badge-lost'}">${u.status}</span></td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="lead-action-btn" title="Edit" onclick="SettingsModule.editUser('${u.id}')">✏️</button>
                      ${u.id !== Auth.currentUser?.id ? `<button class="lead-action-btn" title="Deactivate" onclick="SettingsModule.toggleUser('${u.id}')">🔒</button>` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary mt-16" onclick="TeamModule.showAddMember()">➕ Add New Member</button>
      </div>
    `;
  },

  renderAudit() {
    const events = [
      { time: '11:23 AM', user: 'Ravi Gupta', action: 'Assigned 5 leads to Rahul Kumar', icon: '👤' },
      { time: '10:45 AM', user: 'Admin User', action: 'Changed pricing: ₹50,000/kW → ₹55,000/kW', icon: '💰' },
      { time: '10:30 AM', user: 'Priya Sharma', action: 'Deal Won: Ganesh Pawar — ₹3,30,000', icon: '🏆' },
      { time: '09:55 AM', user: 'Rahul Kumar', action: 'Status changed: Suresh Jadhav → Qualified', icon: '🔄' },
      { time: '09:30 AM', user: 'System',      action: '12 new leads imported from Facebook API', icon: '📡' },
      { time: '09:00 AM', user: 'Kavita Joshi', action: 'New quote generated: Q2024087 — ₹6,60,000', icon: '📄' },
      { time: 'Yesterday', user: 'Admin User', action: 'New team member added: Vijay Rao', icon: '➕' },
      { time: 'Yesterday', user: 'Ravi Gupta', action: 'Bulk assigned 20 leads to team', icon: '📋' },
    ];
    return `
      <div class="settings-section">
        <div class="settings-section-title">📋 System Audit Log</div>
        <div class="settings-section-desc">Full log of all system events and user actions</div>
        <div class="activity-feed">
          ${events.map(e => `
            <div class="activity-item">
              <div class="activity-icon" style="background:rgba(245,158,11,0.1);">${e.icon}</div>
              <div class="activity-text">
                <div class="activity-desc"><strong>${e.user}</strong> — ${e.action}</div>
                <div class="activity-time">${e.time} today</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  editUser(id) {
    const u = (window.USERS || []).find(u => u.id === id);
    if (!u) return;
    showModal('✏️ Edit User', `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="form-row">
          <div class="field"><label>Full Name</label><input type="text" id="eu-name" value="${u.name}" /></div>
          <div class="field"><label>Email</label><input type="email" id="eu-email" value="${u.email}" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Role</label>
            <select id="eu-role">
              ${['telecaller','manager','admin'].map(r => `<option value="${r}" ${r===u.role?'selected':''}>${r}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Team</label><input type="text" id="eu-team" value="${u.team}" /></div>
        </div>
        <div class="field"><label>Monthly Target</label><input type="number" id="eu-target" value="${u.target || 20}" /></div>
        <button class="btn btn-primary btn-full" onclick="SettingsModule.saveUser('${id}')">💾 Save</button>
      </div>
    `);
  },

  saveUser(id) {
    const u = (window.USERS || []).find(u => u.id === id);
    if (u) {
      u.name   = document.getElementById('eu-name')?.value  || u.name;
      u.email  = document.getElementById('eu-email')?.value || u.email;
      u.role   = document.getElementById('eu-role')?.value  || u.role;
      u.team   = document.getElementById('eu-team')?.value  || u.team;
      u.target = parseInt(document.getElementById('eu-target')?.value) || u.target;
    }
    closeModal();
    window.APP.showToast('success','✅ Saved', 'User updated successfully');
    this.switchSection('users');
  },

  toggleUser(id) {
    const u = (window.USERS || []).find(u => u.id === id);
    if (u) {
      u.status = u.status === 'active' ? 'inactive' : 'active';
      window.APP.showToast('info','🔒', `${u.name} ${u.status === 'active' ? 'activated' : 'deactivated'}`);
      this.switchSection('users');
    }
  },

  saveSettings() {
    window.APP.showToast('success','💾 Settings Saved', 'All changes have been saved successfully');
  },
};

function showUserMenu() {
  const user = Auth.currentUser;
  if (!user) return;
  showModal('👤 Account', `
    <div style="text-align:center;padding:16px 0 24px;">
      <div class="user-avatar" style="width:64px;height:64px;font-size:24px;background:${user.color};margin:0 auto 12px;">${user.avatar}</div>
      <div style="font-size:18px;font-weight:700;color:var(--text-primary);">${user.name}</div>
      <div style="font-size:13px;color:var(--text-muted);">${user.email}</div>
      <span class="badge badge-proposal mt-8">${user.role}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <button class="btn btn-secondary btn-full" onclick="closeModal();window.APP.showPage('settings')">⚙️ Settings</button>
      <button class="btn btn-danger btn-full" onclick="closeModal();handleLogout()">🚪 Sign Out</button>
    </div>
  `);
}
