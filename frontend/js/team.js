// ============================================================
// SOLAR CRM — TEAM MODULE
// ============================================================

const TeamModule = {
  team: [],

  async init() {
    this.team = await MockAPI.getTeam();
  },

  renderTeam() {
    const leads = window.LEADS || [];
    const teamList = this.team || [];
    const totalWon = teamList.reduce((s, u) => s + u.won, 0);
    const avgConv  = teamList.length > 0 
      ? (teamList.reduce((s, u) => {
          const myLeads = leads.filter(l => String(l.assignedTo) === String(u.id));
          return s + (myLeads.length > 0 ? u.won / myLeads.length : 0);
        }, 0) / teamList.length * 100).toFixed(1)
      : 0;

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">👥 Team Management</h1>
          <p class="page-subtitle">${teamList.length} tele-callers • ${totalWon} total conversions</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary" onclick="TeamModule.showBulkAssign()">📋 Bulk Assign</button>
          ${Auth.currentUser?.role === 'admin' ? `<button class="btn btn-primary" onclick="TeamModule.showAddMember()">➕ Add Member</button>` : ''}
        </div>
      </div>

      <!-- Team Summary -->
      <div class="stats-grid" style="margin-bottom:24px;">
        <div class="stat-card blue">
          <div class="stat-header"><div class="stat-icon blue">👥</div></div>
          <div class="stat-value">${teamList.length}</div>
          <div class="stat-label">Active Callers</div>
        </div>
        <div class="stat-card green">
          <div class="stat-header"><div class="stat-icon green">🏆</div></div>
          <div class="stat-value">${totalWon}</div>
          <div class="stat-label">Total Wins (Team)</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-header"><div class="stat-icon gold">📊</div></div>
          <div class="stat-value">${avgConv}%</div>
          <div class="stat-label">Avg Conversion Rate</div>
        </div>
        <div class="stat-card teal">
          <div class="stat-header"><div class="stat-icon teal">📋</div></div>
          <div class="stat-value">${leads.filter(l => !l.assignedTo).length}</div>
          <div class="stat-label">Unassigned Leads</div>
        </div>
      </div>

      <!-- Team Cards Grid -->
      <div class="team-grid" id="team-grid">
        ${teamList.length === 0 
          ? '<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-icon">👥</div><div class="empty-title">No team members found</div></div>'
          : teamList.map(u => this.renderTeamCard(u, leads)).join('')}
      </div>

      <!-- Unassigned Leads -->
      ${leads.filter(l => !l.assignedTo).length > 0 ? `
      <div class="card mt-24">
        <div class="card-header">
          <div class="card-title">⚠️ Unassigned Leads (${leads.filter(l => !l.assignedTo).length})</div>
          <button class="btn btn-primary btn-sm" onclick="TeamModule.showBulkAssign()">Assign All</button>
        </div>
        <div class="card-body" style="padding:0;">
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Lead</th><th>City</th><th>System</th><th>Source</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>
                ${leads.filter(l => !l.assignedTo).slice(0, 10).map(l => `
                  <tr>
                    <td><div class="td-lead-name"><div class="lead-initials" style="background:${Utils.leadColor(l.id)};">${Utils.initials(l.name)}</div>${l.name}</div></td>
                    <td>${l.city}</td>
                    <td>${Utils.formatKW(l.kwSize)}</td>
                    <td style="font-size:12px;color:var(--text-muted);">${l.source}</td>
                    <td style="font-size:12px;color:var(--text-muted);">${Utils.timeAgo(l.createdAt)}</td>
                    <td><button class="btn btn-secondary btn-sm" onclick="LeadsModule.showAssign('${l.id}')">Assign</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>` : ''}
    `;
  },

  renderTeamCard(user, leads) {
    const myLeads   = leads.filter(l => String(l.assignedTo) === String(user.id));
    const won       = myLeads.filter(l => l.status === 'Won').length;
    const pending   = myLeads.filter(l => !['Won','Lost'].includes(l.status)).length;
    const conv      = myLeads.length > 0 ? ((won / myLeads.length) * 100).toFixed(1) : 0;
    const revenue   = myLeads.filter(l => l.status === 'Won').reduce((s, l) => s + l.netCost, 0);
    const target    = user.target || 20;
    const targetPct = Math.min((won / target) * 100, 100);
    const overdueCount = (window.FOLLOW_UPS || []).filter(f => String(f.assignedTo) === String(user.id) && f.isOverdue).length;

    const statusColors = { active: 'var(--green-400)', idle: 'var(--text-muted)', busy: 'var(--orange-400)' };

    return `
      <div class="team-card">
        <div class="team-card-top">
          <div class="team-avatar-lg" style="background:${user.color};">${user.avatar}</div>
          <div style="flex:1;min-width:0;">
            <div class="team-name">${user.name}</div>
            <div class="team-role">${user.team}</div>
            <div class="team-status mt-4">
              <div class="status-dot" style="background:${statusColors[user.status]};width:7px;height:7px;border-radius:50%;"></div>
              <span style="color:${statusColors[user.status]};font-size:12px;">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
              ${overdueCount > 0 ? `<span class="badge badge-lost" style="font-size:10px;">⚠️ ${overdueCount} overdue</span>` : ''}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;">
            ${Utils.progressCircle(targetPct, 52)}
            <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${won}/${target} target</div>
          </div>
        </div>

        <div class="team-stats">
          <div class="team-stat">
            <span class="team-stat-val">${myLeads.length}</span>
            <span class="team-stat-label">Assigned</span>
          </div>
          <div class="team-stat">
            <span class="team-stat-val" style="color:var(--gold-400);">${won}</span>
            <span class="team-stat-label">Won</span>
          </div>
          <div class="team-stat">
            <span class="team-stat-val" style="color:var(--teal-400);">${conv}%</span>
            <span class="team-stat-label">Conv.</span>
          </div>
        </div>

        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;">
            <span>Revenue</span>
            <span style="color:var(--gold-400);font-weight:600;">${Utils.formatINR(revenue)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
            <span>Active Pipeline</span>
            <span style="color:var(--teal-400);">${pending} leads</span>
          </div>
        </div>

        <div style="display:flex;gap:6px;margin-top:12px;">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="TeamModule.viewMemberLeads('${user.id}')">📋 View Leads</button>
          ${Auth.currentUser?.role !== 'telecaller' ? `<button class="btn btn-ghost btn-sm" style="flex:1;" onclick="TeamModule.showMemberDetail('${user.id}')">📊 Stats</button>` : ''}
        </div>
      </div>
    `;
  },

  viewMemberLeads(userId) {
    LeadsModule.applyFilters({ assignedTo: userId });
    window.APP.showPage('leads');
    setTimeout(() => {
      const sel = document.getElementById('f-caller');
      if (sel) sel.value = userId;
    }, 200);
  },

  showMemberDetail(userId) {
    const user  = (window.USERS || []).find(u => String(u.id) === String(userId));
    const leads = (window.LEADS || []).filter(l => String(l.assignedTo) === String(userId));
    const won   = leads.filter(l => l.status === 'Won');
    const revenue = won.reduce((s, l) => s + l.netCost, 0);

    showModal(`📊 ${user.name} — Performance`, `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        ${[
          ['📋 Total Leads', leads.length, 'var(--blue-400)'],
          ['🏆 Won', won.length, 'var(--green-400)'],
          ['📊 Conversion', leads.length > 0 ? ((won.length/leads.length)*100).toFixed(1) + '%' : '0%', 'var(--gold-400)'],
          ['💰 Revenue', Utils.formatINR(revenue), 'var(--purple-400)'],
        ].map(([l,v,c]) => `<div style="background:var(--bg-elevated);border-radius:var(--radius-md);padding:14px;text-align:center;">
          <div style="font-size:20px;font-weight:700;color:${c};">${v}</div>
          <div style="font-size:12px;color:var(--text-muted);">${l}</div>
        </div>`).join('')}
      </div>
      <div style="margin-bottom:12px;font-size:13px;font-weight:600;color:var(--text-secondary);">Status Breakdown</div>
      ${LEAD_STATUSES.map(s => {
        const count = leads.filter(l => l.status === s).length;
        const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
        return `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span>${Utils.statusBadge(s)}</span>
            <span style="color:var(--text-muted);">${count} (${pct.toFixed(0)}%)</span>
          </div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%;background:var(--gold-500);"></div></div>
        </div>`;
      }).join('')}
      <div style="margin-top:16px;">
        <button class="btn btn-secondary btn-sm" onclick="TeamModule.viewMemberLeads('${userId}');closeModal()">📋 View All Leads</button>
      </div>
    `);
  },

  showAddMember() {
    showModal('➕ Add Team Member', `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="form-row">
          <div class="field"><label>Full Name *</label><input type="text" id="nm-name" placeholder="Full name" /></div>
          <div class="field"><label>Email *</label><input type="email" id="nm-email" placeholder="email@company.com" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Phone</label><input type="tel" id="nm-phone" placeholder="Mobile number" /></div>
          <div class="field"><label>Role</label>
            <select id="nm-role">
              <option value="telecaller">Tele-Caller</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>Team</label><input type="text" id="nm-team" placeholder="Team name" /></div>
          <div class="field"><label>Monthly Target</label><input type="number" id="nm-target" value="20" min="1" /></div>
        </div>
        <button class="btn btn-primary btn-full" onclick="TeamModule.saveMember()">✅ Add Member</button>
      </div>
    `);
  },

  async saveMember() {
    const name = document.getElementById('nm-name')?.value?.trim();
    const email= document.getElementById('nm-email')?.value?.trim();
    if (!name || !email) { window.APP.showToast('error','⚠️','Name and email required'); return; }
    const colors = ['#F59E0B','#14B8A6','#A855F7','#3B82F6','#EF4444'];
    const newUser = {
      name, email, password: 'demo1234', // Default password
      role: document.getElementById('nm-role')?.value || 'telecaller',
      avatar: Utils.initials(name),
      color: colors[Math.floor(Math.random() * colors.length)],
      phone: document.getElementById('nm-phone')?.value || '',
      status: 'active',
      team: document.getElementById('nm-team')?.value || 'Default Team',
      target: parseInt(document.getElementById('nm-target')?.value) || 20,
    };
    
    try {
        const savedUser = await MockAPI.createUser(newUser);
        
        // Refresh users list
        window.USERS = await MockAPI.getUsers();
        this.team = window.USERS.filter(u => u.role === 'telecaller');
        
        closeModal();
        window.APP.showToast('success','✅ Member Added', `${name} has been added to the team (Password: demo1234)`);
        window.APP.showPage('team');
    } catch (err) {
        window.APP.showToast('error', '❌ Failed to Add Member', err.message);
    }
  },

  showBulkAssign() {
    const unassigned = (window.LEADS || []).filter(l => !l.assignedTo);
    if (!unassigned.length) { window.APP.showToast('info','✅','No unassigned leads!'); return; }
    showModal('📋 Bulk Assign Leads', `
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px;">${unassigned.length} unassigned leads will be distributed equally among selected callers.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;" id="bulk-callers">
        ${(this.team || []).map(u => `
          <label style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-elevated);border-radius:var(--radius-md);cursor:pointer;">
            <input type="checkbox" checked value="${u.id}" style="accent-color:var(--gold-500);" />
            <div class="user-avatar" style="width:30px;height:30px;font-size:12px;background:${u.color};">${u.avatar}</div>
            <span style="color:var(--text-primary);">${u.name}</span>
            <span style="margin-left:auto;font-size:12px;color:var(--text-muted);">${(window.LEADS || []).filter(l => String(l.assignedTo) === String(u.id)).length} current leads</span>
          </label>
        `).join('')}
      </div>
      <button class="btn btn-primary btn-full" onclick="TeamModule.doBulkAssign()">📋 Distribute ${unassigned.length} Leads</button>
    `);
  },

  async doBulkAssign() {
    const checked = [...document.querySelectorAll('#bulk-callers input:checked')].map(i => i.value);
    if (!checked.length) { window.APP.showToast('error','⚠️','Select at least one caller'); return; }
    const unassigned = (window.LEADS || []).filter(l => !l.assignedTo);
    try {
      await Promise.all(unassigned.map((lead, i) => {
        const callerId = parseInt(checked[i % checked.length]);
        lead.assignedTo = callerId;
        return MockAPI.updateLead(lead.id, { assignedTo: callerId });
      }));
      closeModal();
      window.APP.showToast('success','✅ Distributed', `${unassigned.length} leads assigned to ${checked.length} callers`);
      window.APP.showPage('team');
    } catch (err) {
      window.APP.showToast('error', '❌ Bulk Assignment Failed', err.message);
    }
  },
};
