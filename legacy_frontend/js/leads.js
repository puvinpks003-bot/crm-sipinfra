// ============================================================
// SOLAR CRM — LEADS MODULE
// All Leads page + My Leads page + Lead Detail Drawer
// ============================================================

const LeadsModule = {
  allLeads: [],
  filtered: [],
  currentPage: 1,
  pageSize: 15,
  currentLead: null,
  sortCol: 'createdAt',
  sortAsc: false,

  async init() {
    this.allLeads = await MockAPI.getLeads();
    this.filtered = [...this.allLeads];
  },

  // ── Filter & Search ────────────────────────────────────────
  applyFilters(filters = {}) {
    let data = Array.isArray(this.allLeads) ? [...this.allLeads] : [];
    if (filters.status && filters.status !== 'all')
      data = data.filter(l => l.status === filters.status);
    if (filters.source && filters.source !== 'all')
      data = data.filter(l => l.source === filters.source);
    if (filters.systemType && filters.systemType !== 'all')
      data = data.filter(l => l.systemType === filters.systemType);
    if (filters.assignedTo && filters.assignedTo !== 'all')
      data = data.filter(l => l.assignedTo === filters.assignedTo);
    if (filters.temperature && filters.temperature !== 'all')
      data = data.filter(l => l.temperature === filters.temperature);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        String(l.id).toLowerCase().includes(q)
      );
    }
    this.filtered = data;
    this.currentPage = 1;
  },

  getPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  },

  totalPages() {
    return Math.ceil(this.filtered.length / this.pageSize);
  },

  // ── All Leads Page ─────────────────────────────────────────
  renderAllLeads() {
    const leads = this.getPage();
    const callers = USERS.filter(u => u.role === 'telecaller');

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">📊 All Leads</h1>
          <p class="page-subtitle">${this.filtered.length} leads found</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary" onclick="LeadsModule.exportCSV()">📥 Export CSV</button>
          <button class="btn btn-primary" onclick="LeadsModule.showAddLead()">➕ Add Lead</button>
        </div>
      </div>

      <div class="filter-bar" id="leads-filter-bar">
        <div class="search-box">
          <span class="s-icon">🔍</span>
          <input type="text" id="leads-search" placeholder="Search name, phone, city..." onkeyup="LeadsModule.onSearch(this.value)" />
        </div>
        <select class="filter-chip" onchange="LeadsModule.onFilter()" id="f-status">
          <option value="all">All Status</option>
          ${LEAD_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <select class="filter-chip" onchange="LeadsModule.onFilter()" id="f-source">
          <option value="all">All Sources</option>
          ${LEAD_SOURCES.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <select class="filter-chip" onchange="LeadsModule.onFilter()" id="f-type">
          <option value="all">KW + MW</option>
          ${SYSTEM_TYPES.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <select class="filter-chip" onchange="LeadsModule.onFilter()" id="f-temp">
          <option value="all">All Temp</option>
          <option value="Hot">🔥 Hot</option>
          <option value="Warm">☀️ Warm</option>
          <option value="Cold">❄️ Cold</option>
        </select>
        <select class="filter-chip" onchange="LeadsModule.onFilter()" id="f-caller">
          <option value="all">All Callers</option>
          ${callers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </div>

      <div class="leads-table-wrap card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th onclick="LeadsModule.sort('name')">Lead Name ↕</th>
                <th>Phone</th>
                <th onclick="LeadsModule.sort('city')">City ↕</th>
                <th onclick="LeadsModule.sort('kwSize')">System Size ↕</th>
                <th>Source</th>
                <th>Temperature</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th onclick="LeadsModule.sort('netCost')">Value ↕</th>
                <th onclick="LeadsModule.sort('createdAt')">Created ↕</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="leads-tbody">
              ${this.renderRows(leads)}
            </tbody>
          </table>
        </div>
        <div class="pagination" id="leads-pagination">
          ${this.renderPagination()}
        </div>
      </div>
    `;
  },

  renderRows(leads) {
    if (!leads.length) return `<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No leads found</div><div class="empty-desc">Try adjusting your filters</div></div></td></tr>`;
    return leads.map(l => {
      const caller = Utils.getUser(l.assignedTo);
      const color  = Utils.leadColor(l.id);
      return `<tr onclick="LeadsModule.openDrawer('${l.id}')">
        <td>
          <div class="td-lead-name">
            <div class="lead-initials" style="background:${color};">${Utils.initials(l.name)}</div>
            <div>
              <div style="font-weight:600;color:var(--text-primary);">${l.name}</div>
              <div style="font-size:11px;color:var(--text-muted);">${l.id}</div>
            </div>
          </div>
        </td>
        <td><a href="tel:${l.phone}" onclick="event.stopPropagation()" style="color:var(--teal-400);">${l.phone}</a></td>
        <td>${l.city}</td>
        <td>${Utils.systemBadge(l.systemType)} ${Utils.formatKW(l.kwSize)}</td>
        <td style="color:var(--text-muted);font-size:12px;">${l.source}</td>
        <td>${Utils.tempBadge(l.temperature)}</td>
        <td>${Utils.statusBadge(l.status)}</td>
        <td>
          ${caller.id 
            ? `<div style="display:flex;align-items:center;gap:6px;"><div class="user-avatar" style="width:24px;height:24px;font-size:10px;background:${caller.color};">${caller.avatar}</div><span style="font-size:12px;">${caller.name.split(' ')[0]}</span></div>`
            : '<span style="color:var(--text-muted);font-size:12px;">Unassigned</span>'}
        </td>
        <td style="color:var(--gold-400);font-weight:600;">${Utils.formatINR(l.netCost)}</td>
        <td style="font-size:12px;color:var(--text-muted);">${Utils.timeAgo(l.createdAt)}</td>
        <td onclick="event.stopPropagation()">
          <div class="lead-actions">
            <button class="lead-action-btn" title="View Detail" onclick="LeadsModule.openDrawer('${l.id}')">👁</button>
            <button class="lead-action-btn" title="Log Call" onclick="LeadsModule.logCall('${l.id}')">📞</button>
            <button class="lead-action-btn" title="Assign" onclick="LeadsModule.showAssign('${l.id}')">👤</button>
            <button class="lead-action-btn" title="WhatsApp" onclick="LeadsModule.sendWhatsApp('${l.id}')">💬</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  renderPagination() {
    const total = this.totalPages();
    const cur   = this.currentPage;
    if (total <= 1) return `<div class="pagination-info">Showing ${this.filtered.length} leads</div>`;

    const start = (cur - 1) * this.pageSize + 1;
    const end   = Math.min(cur * this.pageSize, this.filtered.length);

    let pages = '';
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - 1 && i <= cur + 1)) {
        pages += `<button class="pg-btn ${i === cur ? 'active' : ''}" onclick="LeadsModule.goPage(${i})">${i}</button>`;
      } else if (i === cur - 2 || i === cur + 2) {
        pages += `<button class="pg-btn" style="cursor:default;pointer-events:none">…</button>`;
      }
    }

    return `
      <div class="pagination-info">Showing ${start}–${end} of ${this.filtered.length}</div>
      <div class="pagination-controls">
        <button class="pg-btn" onclick="LeadsModule.goPage(${cur - 1})" ${cur === 1 ? 'disabled' : ''}>‹</button>
        ${pages}
        <button class="pg-btn" onclick="LeadsModule.goPage(${cur + 1})" ${cur === total ? 'disabled' : ''}>›</button>
      </div>
    `;
  },

  goPage(p) {
    const total = this.totalPages();
    this.currentPage = Utils.clamp(p, 1, total);
    document.getElementById('leads-tbody').innerHTML = this.renderRows(this.getPage());
    document.getElementById('leads-pagination').innerHTML = this.renderPagination();
  },

  onSearch: Utils.debounce(function(val) {
    const f = LeadsModule.getFilters();
    f.search = val;
    LeadsModule.applyFilters(f);
    document.getElementById('leads-tbody').innerHTML = LeadsModule.renderRows(LeadsModule.getPage());
    document.getElementById('leads-pagination').innerHTML = LeadsModule.renderPagination();
    document.querySelector('.page-subtitle').textContent = LeadsModule.filtered.length + ' leads found';
  }, 300),

  onFilter() {
    const f = this.getFilters();
    this.applyFilters(f);
    document.getElementById('leads-tbody').innerHTML = this.renderRows(this.getPage());
    document.getElementById('leads-pagination').innerHTML = this.renderPagination();
    document.querySelector('.page-subtitle').textContent = this.filtered.length + ' leads found';
  },

  getFilters() {
    return {
      status:     document.getElementById('f-status')?.value,
      source:     document.getElementById('f-source')?.value,
      systemType: document.getElementById('f-type')?.value,
      temperature:document.getElementById('f-temp')?.value,
      assignedTo: document.getElementById('f-caller')?.value,
      search:     document.getElementById('leads-search')?.value,
    };
  },

  sort(col) {
    if (this.sortCol === col) this.sortAsc = !this.sortAsc;
    else { this.sortCol = col; this.sortAsc = true; }
    this.filtered.sort((a, b) => {
      let av = a[col], bv = b[col];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return this.sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    document.getElementById('leads-tbody').innerHTML = this.renderRows(this.getPage());
  },

  // ── My Leads (Tele-Caller view) ────────────────────────────
  renderMyLeads() {
    const user = Auth.currentUser;
    const leadsList = this.allLeads || [];
    const myLeads = leadsList.filter(l => l.assignedTo === user.id);
    const activeSelected = myLeads.find(l => l.id === this.selectedLeadId) || myLeads[0];
    this.selectedLeadId = activeSelected?.id || null;

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">📞 My Leads</h1>
          <p class="page-subtitle">${myLeads.length} leads assigned to you • ${myLeads.filter(l => l.status === 'Won').length} converted</p>
        </div>
        <div class="page-header-right">
          ${activeSelected ? `<button class="btn btn-teal" onclick="LeadsModule.openDrawer('${activeSelected.id}')">📋 View Details</button>` : ''}
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:20px;">
        ${[
          { label:'Total Assigned', val: myLeads.length, icon:'📋', cls:'gold' },
          { label:'New', val: myLeads.filter(l=>l.status==='New').length, icon:'🌟', cls:'blue' },
          { label:'Follow-ups Today', val: myLeads.filter(l=>l.nextFollowUp && Utils.isToday(l.nextFollowUp)).length, icon:'📅', cls:'teal' },
          { label:'Won', val: myLeads.filter(l=>l.status==='Won').length, icon:'🏆', cls:'green' },
          { label:'Pipeline Value', val: Utils.formatINR(myLeads.filter(l=>!['Won','Lost'].includes(l.status)).reduce((s,l)=>s+l.netCost,0)), icon:'💰', cls:'purple', noAnim:true },
        ].map(s => `
          <div class="stat-card ${s.cls}">
            <div class="stat-header">
              <div class="stat-icon ${s.cls}">${s.icon}</div>
            </div>
            <div class="stat-value">${s.noAnim ? s.val : s.val}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `).join('')}
      </div>

      <div class="my-leads-layout">
        <!-- Lead List -->
        <div>
          <div class="filter-bar">
            <div class="search-box">
              <span class="s-icon">🔍</span>
              <input type="text" id="my-leads-search" placeholder="Search leads..." onkeyup="LeadsModule.filterMyLeads(this.value)" />
            </div>
            <select class="filter-chip" id="my-status-filter" onchange="LeadsModule.filterMyLeads('')">
              <option value="all">All Status</option>
              ${LEAD_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <select class="filter-chip" id="my-temp-filter" onchange="LeadsModule.filterMyLeads('')">
              <option value="all">All Temp</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">☀️ Warm</option>
              <option value="Cold">❄️ Cold</option>
            </select>
          </div>
          <div class="leads-table-wrap card">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>System</th>
                    <th>Temperature</th>
                    <th>Status</th>
                    <th>Next Follow-up</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="my-leads-tbody">
                  ${this.renderMyRows(myLeads)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Call Panel -->
        ${activeSelected ? this.renderCallPanel(activeSelected) : '<div class="card"><div class="empty-state"><div class="empty-icon">📞</div><div class="empty-title">No leads assigned</div></div></div>'}
      </div>
    `;
  },

  selectedLeadId: null,

  renderMyRows(leads) {
    if (!leads.length) return `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No leads found</div></div></td></tr>`;
    return leads.map(l => {
      const color  = Utils.leadColor(l.id);
      const overdue = l.nextFollowUp && Utils.isOverdue(l.nextFollowUp);
      const today   = l.nextFollowUp && Utils.isToday(l.nextFollowUp);
      return `<tr onclick="LeadsModule.selectLead('${l.id}')" class="${this.selectedLeadId === l.id ? 'selected' : ''}">
        <td>
          <div class="td-lead-name">
            <div class="lead-initials" style="background:${color};">${Utils.initials(l.name)}</div>
            <div>
              <div style="font-weight:600;color:var(--text-primary);">${l.name}</div>
              <div style="font-size:11px;color:var(--text-muted);">${l.phone}</div>
            </div>
          </div>
        </td>
        <td>${Utils.systemBadge(l.systemType)} ${Utils.formatKW(l.kwSize)}</td>
        <td>${Utils.tempBadge(l.temperature)}</td>
        <td>${Utils.statusBadge(l.status)}</td>
        <td style="font-size:12px;${overdue ? 'color:var(--red-400)' : today ? 'color:var(--teal-400)' : 'color:var(--text-muted)'}">
          ${l.nextFollowUp ? (overdue ? '⚠️ ' : today ? '📅 ' : '') + Utils.formatDate(l.nextFollowUp) : '—'}
        </td>
        <td style="color:var(--gold-400);font-weight:600;">${Utils.formatINR(l.netCost)}</td>
        <td>
          <div class="lead-actions">
            <button class="lead-action-btn" title="View" onclick="event.stopPropagation();LeadsModule.openDrawer('${l.id}')">👁</button>
            <button class="lead-action-btn" title="Call" onclick="event.stopPropagation();LeadsModule.initiateCall('${l.id}')">📞</button>
            <button class="lead-action-btn" title="WhatsApp" onclick="event.stopPropagation();LeadsModule.sendWhatsApp('${l.id}')">💬</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  filterMyLeads: Utils.debounce(function(val) {
    const user = Auth.currentUser;
    let leads = LeadsModule.allLeads.filter(l => l.assignedTo === user.id);
    const search = val || document.getElementById('my-leads-search')?.value || '';
    const status = document.getElementById('my-status-filter')?.value;
    const temp   = document.getElementById('my-temp-filter')?.value;
    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q));
    }
    if (status && status !== 'all') leads = leads.filter(l => l.status === status);
    if (temp   && temp   !== 'all') leads = leads.filter(l => l.temperature === temp);
    document.getElementById('my-leads-tbody').innerHTML = LeadsModule.renderMyRows(leads);
  }, 200),

  selectLead(id) {
    this.selectedLeadId = id;
    window.APP.showPage('my-leads');
  },

  renderCallPanel(lead) {
    return `
      <div class="call-panel">
        <div class="call-panel-header">
          <div class="call-panel-title">📞 Quick Call Panel</div>
          <div style="font-size:11px;color:var(--text-muted);">${lead.name}</div>
        </div>
        <div class="call-display">
          <div class="call-status-indicator" id="call-indicator">📞</div>
          <div class="call-number">${lead.phone}</div>
          <div class="call-name">${lead.name} • ${Utils.formatKW(lead.kwSize)} System</div>
          <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-teal btn-sm" onclick="LeadsModule.initiateCall('${lead.id}')">📞 Call Now</button>
            <button class="btn btn-secondary btn-sm" onclick="LeadsModule.sendWhatsApp('${lead.id}')">💬 WhatsApp</button>
          </div>
        </div>
        <div class="call-keypad">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Call Outcome</div>
          <div style="display:flex;flex-direction:column;gap:6px;" id="outcome-btns">
            ${['Interested','Not Interested','Not Reachable','Call Back','Qualified','Busy'].map(o =>
              `<button class="btn btn-secondary btn-sm" onclick="LeadsModule.logOutcome('${lead.id}','${o}')" style="text-align:left;justify-content:flex-start;">${o}</button>`
            ).join('')}
          </div>
        </div>
        <div class="call-outcome">
          <div class="call-outcome-title">Quick Note</div>
          <textarea id="quick-note-input" placeholder="Add note about this call..." style="width:100%;padding:10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-body);font-size:13px;resize:none;min-height:80px;"></textarea>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button class="btn btn-primary btn-sm" onclick="LeadsModule.saveNote('${lead.id}')">💾 Save Note</button>
            <select class="filter-chip" id="status-quick" style="flex:1;font-size:12px;">
              <option value="">Change Status...</option>
              ${LEAD_STATUSES.map(s => `<option value="${s}" ${lead.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
            <label style="font-size:11px;color:var(--text-muted);">Follow-up:</label>
            <input type="date" id="followup-date-input" style="padding:4px 8px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:12px;" value="${lead.nextFollowUp ? lead.nextFollowUp.split('T')[0] : ''}" />
            <button class="btn btn-ghost btn-sm" onclick="LeadsModule.setFollowUp('${lead.id}')">Set</button>
          </div>
        </div>
      </div>
    `;
  },

  // ── Lead Drawer ────────────────────────────────────────────
  async openDrawer(id) {
    const lead = (window.LEADS || []).find(l => String(l.id) === String(id));
    if (!lead) return;
    this.currentLead = lead;
    const activities = (window.ACTIVITIES || []).filter(a => String(a.leadId) === String(id)).slice(0, 10);
    const drawer = document.getElementById('lead-drawer');
    const drawerContent = document.getElementById('drawer-content');
    document.getElementById('drawer-title').textContent = `${lead.name} — ${lead.id}`;
    drawerContent.innerHTML = this.renderLeadDetail(lead, activities);
    drawer.classList.add('open');
    document.getElementById('overlay').classList.add('active');
  },

  renderLeadDetail(lead, activities) {
    const caller = Utils.getUser(lead.assignedTo);
    return `
      <div class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('detail-tab','tab-overview')">Overview</button>
        <button class="tab-btn" onclick="switchTab('detail-tab','tab-activity')">Activity (${activities.length})</button>
        <button class="tab-btn" onclick="switchTab('detail-tab','tab-notes')">Notes (${(lead.notes || []).length})</button>
        <button class="tab-btn" onclick="switchTab('detail-tab','tab-quote')">Quote</button>
      </div>

      <div id="detail-tab">
        <!-- Overview Tab -->
        <div id="tab-overview">
          <!-- Lead Status Bar -->
          <div style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <span style="font-size:13px;color:var(--text-muted);">Pipeline Status</span>
              <select onchange="LeadsModule.updateStatus('${lead.id}',this.value)" style="padding:6px 10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:13px;">
                ${LEAD_STATUSES.map(s => `<option value="${s}" ${s===lead.status?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;gap:4px;">${LEAD_STATUSES.map((s,i) => `<div style="flex:1;height:4px;border-radius:9999px;background:${LEAD_STATUSES.indexOf(lead.status)>=i?'var(--gold-500)':'var(--bg-hover)'}"></div>`).join('')}</div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
            ${Utils.tempBadge(lead.temperature)}
            ${Utils.systemBadge(lead.systemType)}
            ${(lead.tags || []).map(t => `<span class="badge badge-followup">${t}</span>`).join('')}
          </div>

          <div class="detail-section">
            <div class="detail-section-title">Contact Information</div>
            <div class="detail-grid">
              <div class="detail-item"><div class="detail-label">Full Name</div><div class="detail-value">${lead.name}</div></div>
              <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value"><a href="tel:${lead.phone}" style="color:var(--teal-400);">${lead.phone}</a></div></div>
              <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value" style="font-size:12px;">${lead.email}</div></div>
              <div class="detail-item"><div class="detail-label">City</div><div class="detail-value">${lead.city}</div></div>
              <div class="detail-item detail-grid" style="grid-column:1/-1;"><div class="detail-label">Address</div><div class="detail-value" style="font-size:13px;">${lead.address}, ${lead.city} — ${lead.pincode}</div></div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section-title">System Details</div>
            <div class="detail-grid">
              <div class="detail-item"><div class="detail-label">System Type</div><div class="detail-value">${lead.systemType}</div></div>
              <div class="detail-item"><div class="detail-label">System Size</div><div class="detail-value" style="color:var(--gold-400);font-weight:700;">${Utils.formatKW(lead.kwSize)}</div></div>
              <div class="detail-item"><div class="detail-label">System Cost</div><div class="detail-value">${Utils.formatINR(lead.systemCost)}</div></div>
              <div class="detail-item"><div class="detail-label">Installation</div><div class="detail-value">${Utils.formatINR(lead.installCost)}</div></div>
              <div class="detail-item"><div class="detail-label">GST (12%)</div><div class="detail-value">${Utils.formatINR(lead.gst)}</div></div>
              <div class="detail-item"><div class="detail-label">PM Subsidy</div><div class="detail-value" style="color:var(--green-400);">-${Utils.formatINR(lead.subsidy)}</div></div>
              <div class="detail-item" style="background:rgba(245,158,11,0.06);border-radius:var(--radius-md);padding:10px;">
                <div class="detail-label">NET COST</div>
                <div class="detail-value" style="color:var(--gold-400);font-size:20px;font-weight:700;">${Utils.formatINR(lead.netCost)}</div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section-title">Lead Information</div>
            <div class="detail-grid">
              <div class="detail-item"><div class="detail-label">Source</div><div class="detail-value">${lead.source}</div></div>
              <div class="detail-item"><div class="detail-label">Priority</div><div class="detail-value">${lead.priority}</div></div>
              <div class="detail-item"><div class="detail-label">Assigned To</div><div class="detail-value">${caller.name || 'Unassigned'}</div></div>
              <div class="detail-item"><div class="detail-label">Total Calls</div><div class="detail-value">${lead.calls}</div></div>
              <div class="detail-item"><div class="detail-label">Created</div><div class="detail-value">${Utils.formatDate(lead.createdAt)}</div></div>
              <div class="detail-item"><div class="detail-label">Next Follow-up</div><div class="detail-value" style="${Utils.isOverdue(lead.nextFollowUp)?'color:var(--red-400)':'color:var(--teal-400)'}">${Utils.formatDate(lead.nextFollowUp)}</div></div>
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
            <button class="btn btn-teal btn-sm" onclick="LeadsModule.initiateCall('${lead.id}')">📞 Call</button>
            <button class="btn btn-secondary btn-sm" onclick="LeadsModule.sendWhatsApp('${lead.id}')">💬 WhatsApp</button>
            <button class="btn btn-secondary btn-sm" onclick="LeadsModule.sendEmail('${lead.id}')">✉️ Email</button>
            <button class="btn btn-primary btn-sm" onclick="QuotesModule.openFromLead('${lead.id}');closeDrawer()">📄 Generate Quote</button>
            ${Auth.currentUser.role !== 'telecaller' ? `<button class="btn btn-ghost btn-sm" onclick="LeadsModule.showAssign('${lead.id}')">👤 Reassign</button>` : ''}
          </div>
        </div>

        <!-- Activity Tab (hidden initially) -->
        <div id="tab-activity" class="hidden">
          <div class="timeline">
            ${activities.length === 0 
              ? '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No activity yet</div></div>'
              : activities.map(a => this.renderActivityItem(a)).join('')}
          </div>
        </div>

        <!-- Notes Tab (hidden initially) -->
        <div id="tab-notes" class="hidden">
          <div style="margin-bottom:16px;">
            <textarea id="new-note-input" placeholder="Add a note..." style="width:100%;padding:12px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-body);font-size:14px;resize:none;min-height:80px;"></textarea>
            <button class="btn btn-primary btn-sm mt-8" onclick="LeadsModule.addNote('${lead.id}')">💾 Save Note</button>
          </div>
          <div id="notes-list">
            ${(lead.notes || []).map(n => {
              const u = Utils.getUser(n.addedBy);
              return `<div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <div class="user-avatar" style="width:26px;height:26px;font-size:10px;background:${u.color};">${u.avatar}</div>
                  <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">${u.name}</span>
                  <span style="font-size:11px;color:var(--text-muted);">${Utils.timeAgo(n.timestamp)}</span>
                </div>
                <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${n.text}</p>
              </div>`;
            }).join('') || '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">No notes yet</div></div>'}
          </div>
        </div>

        <!-- Quote Tab (hidden initially) -->
        <div id="tab-quote" class="hidden">
          ${QuotesModule.renderMiniQuote(lead)}
        </div>
      </div>
    `;
  },

  renderActivityItem(a) {
    const user = Utils.getUser(a.userId);
    const typeMap = {
      call:          { icon: '📞', color: 'rgba(45,212,191,0.15)' },
      note:          { icon: '📝', color: 'rgba(245,158,11,0.15)' },
      status_change: { icon: '🔄', color: 'rgba(168,85,247,0.15)' },
      email:         { icon: '✉️', color: 'rgba(59,130,246,0.15)' },
      whatsapp:      { icon: '💬', color: 'rgba(74,222,128,0.15)' },
      site_visit:    { icon: '🏠', color: 'rgba(249,115,22,0.15)' },
    };
    const t = typeMap[a.type] || { icon: '📋', color: 'rgba(255,255,255,0.1)' };
    let desc = '';
    if (a.type === 'call')          desc = `Call: <strong>${a.data.outcome}</strong> (${a.data.duration})`;
    else if (a.type === 'note')     desc = a.data.text;
    else if (a.type === 'status_change') desc = `Status: <strong>${a.data.from}</strong> → <strong>${a.data.to}</strong>`;
    else if (a.type === 'email')    desc = `Email sent: <em>${a.data.subject}</em>`;
    else if (a.type === 'whatsapp') desc = a.data.message;
    else if (a.type === 'site_visit') desc = a.data.note;

    return `<div class="timeline-item">
      <div class="timeline-dot" style="background:${t.color};">${t.icon}</div>
      <div class="timeline-line"></div>
      <div class="timeline-content">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <div class="user-avatar" style="width:22px;height:22px;font-size:9px;background:${user.color};">${user.avatar}</div>
          <span class="timeline-title">${user.name.split(' ')[0]}</span>
          <span class="timeline-time">${Utils.timeAgo(a.timestamp)}</span>
        </div>
        <div class="timeline-body">${desc}</div>
      </div>
    </div>`;
  },

  // ── Actions ────────────────────────────────────────────────
  async updateStatus(id, status) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    if (lead) {
      try {
        await MockAPI.updateLeadStatus(id, status);
        lead.status = status;
        window.APP.showToast('success', '✅ Status Updated', `${lead.name} → ${status}`);
        if (status === 'Won') {
          window.APP.showToast('success', '🎉 Deal Won!', `${Utils.formatINR(lead.netCost)} revenue recorded!`);
        }
      } catch (err) {
        window.APP.showToast('error', '❌ Status Update Failed', err.message);
      }
    }
  },

  async initiateCall(id) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    if (!lead) return;
    try {
      lead.calls++;
      await MockAPI.updateLead(id, { calls: lead.calls });
      await MockAPI.createActivity({ leadId: String(id), type: 'call', userId: Auth.currentUser.id, data: { outcome: 'Dialed', duration: '0 min' } });
      window.APP.showToast('info', '📞 Calling...', `Dialing ${lead.name} on ${lead.phone}`);
      setTimeout(() => window.APP.showToast('success', '📞 Connected', `Call with ${lead.name} in progress`), 2000);
    } catch (err) {
      window.APP.showToast('error', '❌ Call Failed', err.message);
    }
  },

  sendWhatsApp(id) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    if (!lead) return;
    showModal('💬 Send WhatsApp', `
      <div class="field"><label>To</label><input type="text" value="${lead.name} (${lead.phone})" readonly style="background:var(--bg-surface);"/></div>
      <div class="field mt-12"><label>Message</label>
        <textarea id="wa-msg" style="min-height:120px;width:100%;padding:10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-body);resize:none;">Dear ${lead.name},

Thank you for your interest in solar panel installation!

We are excited to share that a ${Utils.formatKW(lead.kwSize)} solar system will:
✅ Cost only ${Utils.formatINR(lead.netCost)} (after PM subsidy)
☀️ Generate ~${Math.round(lead.kwSize * PRICING.annualGenPerKW).toLocaleString()} units/year
💰 Save ₹${Math.round(lead.kwSize * PRICING.annualGenPerKW * PRICING.electricityCostPerUnit).toLocaleString()}/year on electricity

Would you like to proceed with a free site survey?

Regards,
SIP INFRA Team</textarea>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px;">
        <button class="btn btn-teal btn-full" onclick="LeadsModule.confirmSendWA('${id}')">💬 Send via WhatsApp</button>
      </div>
    `);
  },

  async confirmSendWA(id) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    closeModal();
    try {
      await MockAPI.createActivity({ leadId: String(id), type: 'whatsapp', userId: Auth.currentUser.id, data: { message: 'Sent proposal and pricing details via WhatsApp' } });
      window.APP.showToast('success', '💬 WhatsApp Sent', `Message delivered to ${lead ? lead.name : id}`);
    } catch (err) {
      window.APP.showToast('error', '❌ WhatsApp Logging Failed', err.message);
    }
  },

  sendEmail(id) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    if (!lead) return;
    showModal('✉️ Send Email', `
      <div class="field"><label>To</label><input type="text" value="${lead.email}" readonly style="background:var(--bg-surface);"/></div>
      <div class="field mt-12"><label>Subject</label><input type="text" id="email-subject" value="Solar Panel Proposal — ${Utils.formatKW(lead.kwSize)} System" style="width:100%;padding:10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-body);" /></div>
      <div class="field mt-12"><label>Message</label><textarea id="email-body" style="min-height:140px;width:100%;padding:10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-family:var(--font-body);resize:none;">Dear ${lead.name},\n\nPlease find attached the solar panel proposal for your ${Utils.formatKW(lead.kwSize)} system.\n\nTotal Investment: ${Utils.formatINR(lead.totalCost)}\nSubsidy: -${Utils.formatINR(lead.subsidy)}\nNet Cost: ${Utils.formatINR(lead.netCost)}\n\nKindly review and revert.\n\nRegards,\nSolar Team</textarea></div>
      <button class="btn btn-primary btn-full mt-12" onclick="LeadsModule.confirmSendEmail('${id}')">✉️ Send Email</button>
    `);
  },

  async confirmSendEmail(id) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    closeModal();
    try {
      await MockAPI.createActivity({ leadId: String(id), type: 'email', userId: Auth.currentUser.id, data: { subject: document.getElementById('email-subject')?.value || 'Proposal', message: 'Emailed solar proposal' } });
      window.APP.showToast('success', '✉️ Email Sent', `Proposal emailed to ${lead ? lead.email : id}`);
    } catch (err) {
      window.APP.showToast('error', '❌ Email Logging Failed', err.message);
    }
  },

  async logOutcome(id, outcome) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    if (!lead) return;
    try {
      lead.calls++;
      const statusMap = { 'Interested': 'Contacted', 'Qualified': 'Qualified', 'Call Back': 'Contacted' };
      if (statusMap[outcome]) lead.status = statusMap[outcome];
      
      await MockAPI.updateLead(id, { calls: lead.calls, status: lead.status });
      await MockAPI.createActivity({ leadId: String(id), type: 'call', userId: Auth.currentUser.id, data: { outcome, duration: (Math.floor(Math.random()*10)+1) + ' min' } });
      
      window.APP.showToast('success', '📞 Call Logged', `Outcome: ${outcome}`);
    } catch (err) {
      window.APP.showToast('error', '❌ Call Logging Failed', err.message);
    }
  },

  async addNote(id) {
    const input = document.getElementById('new-note-input');
    if (!input || !input.value.trim()) return;
    try {
      const note = await MockAPI.addNote(id, input.value.trim(), Auth.currentUser.id);
      input.value = '';
      window.APP.showToast('success', '📝 Note Saved', 'Activity logged successfully');
      
      const lead = LEADS.find(l => String(l.id) === String(id));
      if (lead) {
        if (!lead.notes) lead.notes = [];
        lead.notes.unshift(note);
        
        const u = Utils.getUser(note.addedBy);
        const nl = document.getElementById('notes-list');
        if (nl) nl.insertAdjacentHTML('afterbegin', `<div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div class="user-avatar" style="width:26px;height:26px;font-size:10px;background:${u.color};">${u.avatar}</div>
            <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">${u.name}</span>
            <span style="font-size:11px;color:var(--text-muted);">just now</span>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${note.text}</p>
        </div>`);
      }
    } catch (err) {
      window.APP.showToast('error', '❌ Note Save Failed', err.message);
    }
  },

  async saveNote(leadId) {
    const input = document.getElementById('quick-note-input');
    const statusSel = document.getElementById('status-quick');
    try {
      if (input?.value.trim()) {
        await MockAPI.addNote(leadId, input.value.trim(), Auth.currentUser.id);
        input.value = '';
        window.APP.showToast('success', '📝 Note Saved', 'Activity recorded');
      }
      if (statusSel?.value) {
        await MockAPI.updateLeadStatus(leadId, statusSel.value);
        const lead = LEADS.find(l => String(l.id) === String(leadId));
        if (lead) lead.status = statusSel.value;
        window.APP.showToast('success', '🔄 Status Updated', `Lead marked as ${statusSel.value}`);
      }
    } catch (err) {
      window.APP.showToast('error', '❌ Action Failed', err.message);
    }
  },

  async setFollowUp(leadId) {
    const inp = document.getElementById('followup-date-input');
    if (!inp?.value) return;
    try {
      const followUpDate = inp.value + 'T10:00:00.000Z';
      await MockAPI.updateLead(leadId, { nextFollowUp: followUpDate });
      
      const lead = LEADS.find(l => String(l.id) === String(leadId));
      if (lead) lead.nextFollowUp = followUpDate;
      window.APP.showToast('success', '📅 Follow-up Set', `Scheduled for ${Utils.formatDate(followUpDate)}`);
    } catch (err) {
      window.APP.showToast('error', '❌ Follow-up Save Failed', err.message);
    }
  },

  showAssign(id) {
    const lead = LEADS.find(l => String(l.id) === String(id));
    if (!lead) return;
    const callers = USERS.filter(u => u.role === 'telecaller');
    showModal('👤 Assign Lead', `
      <div style="margin-bottom:16px;">
        <p style="color:var(--text-secondary);font-size:14px;">Assign <strong>${lead.name}</strong> to:</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${callers.map(c => `
          <div class="role-card ${String(lead.assignedTo)===String(c.id)?'active':''}" style="display:flex;align-items:center;gap:12px;text-align:left;padding:12px 14px;" onclick="LeadsModule.assignLead('${id}','${c.id}')">
            <div class="user-avatar" style="width:36px;height:36px;font-size:14px;background:${c.color};">${c.avatar}</div>
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${c.name}</div>
              <div style="font-size:12px;color:var(--text-muted);">${LEADS.filter(l => String(l.assignedTo) === String(c.id)).length} leads • ${LEADS.filter(l => String(l.assignedTo) === String(c.id) && l.status === 'Won').length} won</div>
            </div>
            <div class="badge ${c.status==='active'?'badge-won':c.status==='busy'?'badge-proposal':'badge-new'}" style="margin-left:auto;">${c.status}</div>
          </div>
        `).join('')}
      </div>
    `);
  },

  async assignLead(leadId, userId) {
    try {
      const parsedUserId = userId ? parseInt(userId) : null;
      await MockAPI.updateLead(leadId, { assignedTo: parsedUserId });
      
      const lead = LEADS.find(l => String(l.id) === String(leadId));
      if (lead) lead.assignedTo = parsedUserId;
      closeModal();
      const user = USERS.find(u => String(u.id) === String(userId));
      window.APP.showToast('success', '✅ Lead Assigned', `${lead ? lead.name : leadId} assigned to ${user ? user.name : userId}`);
    } catch (err) {
      window.APP.showToast('error', '❌ Lead Assignment Failed', err.message);
    }
  },

  showAddLead() {
    showModal('➕ Add New Lead', `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="form-row">
          <div class="field"><label>Full Name *</label><input type="text" id="nl-name" placeholder="Customer name" required /></div>
          <div class="field"><label>Phone *</label><input type="tel" id="nl-phone" placeholder="10-digit mobile" required /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Email</label><input type="email" id="nl-email" placeholder="email@example.com" /></div>
          <div class="field"><label>City</label><select id="nl-city">${CITIES.map(c => `<option>${c}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="field"><label>System Type</label><select id="nl-type">${SYSTEM_TYPES.map(s => `<option>${s}</option>`).join('')}</select></div>
          <div class="field"><label>System Size (kW)</label><input type="number" id="nl-kw" min="1" max="10000" value="5" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Lead Source</label><select id="nl-source">${LEAD_SOURCES.map(s => `<option>${s}</option>`).join('')}</select></div>
          <div class="field"><label>Assign To</label><select id="nl-caller">
            <option value="">Unassigned</option>
            ${USERS.filter(u=>u.role==='telecaller').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select></div>
        </div>
        <div class="field"><label>Address</label><input type="text" id="nl-address" placeholder="Street address" /></div>
        <button class="btn btn-primary btn-full mt-8" onclick="LeadsModule.saveNewLead()">✅ Add Lead</button>
      </div>
    `);
  },

  async saveNewLead() {
    const name = document.getElementById('nl-name')?.value?.trim();
    const phone = document.getElementById('nl-phone')?.value?.trim();
    if (!name || !phone) { window.APP.showToast('error','⚠️ Error','Name and phone are required'); return; }
    const kw = parseInt(document.getElementById('nl-kw')?.value) || 5;
    const systemCost = kw * PRICING.costPerKW;
    const installCost = Math.round(systemCost * PRICING.installationPercent);
    const totalBeforeGST = systemCost + installCost;
    const gst = Math.round(totalBeforeGST * PRICING.gstRate);
    const totalCost = totalBeforeGST + gst;
    const subsidy = Math.min(Math.round(kw * PRICING.subsidyPerKW), 78000);
    
    const callerId = document.getElementById('nl-caller')?.value;
    const leadData = {
      name, phone,
      email: document.getElementById('nl-email')?.value || '',
      city:  document.getElementById('nl-city')?.value || 'Mumbai',
      state: 'Maharashtra',
      address: document.getElementById('nl-address')?.value || '',
      pincode: '',
      source: document.getElementById('nl-source')?.value || 'Cold Call',
      status: 'New',
      temperature: 'Warm',
      systemType: document.getElementById('nl-type')?.value || 'Residential KW',
      kwSize: kw, systemCost, installCost, gst, totalCost, subsidy, netCost: totalCost - subsidy,
      assignedTo: callerId ? parseInt(callerId) : null,
      calls: 0, documents: 0, priority: 'Medium', tags: [],
    };
    try {
      const savedLead = await MockAPI.createLead(leadData);
      LEADS.unshift(savedLead);
      this.allLeads = LEADS;
      this.filtered = LEADS;
      closeModal();
      window.APP.showToast('success','✅ Lead Added', `${savedLead.name} added successfully`);
      window.APP.showPage('leads');
    } catch (err) {
      window.APP.showToast('error', '❌ Error Adding Lead', err.message);
    }
  },

  exportCSV() {
    const headers = ['ID','Name','Phone','City','System','Size(kW)','Status','Source','Net Cost','Created'];
    const rows = this.filtered.map(l => [l.id, l.name, l.phone, l.city, l.systemType, l.kwSize, l.status, l.source, l.netCost, Utils.formatDate(l.createdAt)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'SIP INFRA-leads-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    window.APP.showToast('success', '📥 Exported', 'CSV downloaded successfully');
  },
};

// ── Tab switching ────────────────────────────────────────────
function switchTab(containerId, activeTabId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  // Hide all siblings of the target tab
  container.querySelectorAll(':scope > div').forEach(d => d.classList.add('hidden'));
  document.getElementById(activeTabId)?.classList.remove('hidden');
  // Update tab bar buttons
  const tabBar = container.previousElementSibling;
  if (tabBar && tabBar.classList.contains('tab-bar')) {
    tabBar.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const idx = ['tab-overview','tab-activity','tab-notes','tab-quote'].indexOf(activeTabId);
    if (idx >= 0) tabBar.querySelectorAll('.tab-btn')[idx]?.classList.add('active');
  }
}

// ── Drawer / Modal helpers ───────────────────────────────────
function closeDrawer() {
  document.getElementById('lead-drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

function showModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

function globalSearch(val) {
  if (!val || val.length < 2) return;
  LeadsModule.applyFilters({ search: val });
  window.APP.showPage('leads');
}
