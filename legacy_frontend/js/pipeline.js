// ============================================================
// SOLAR CRM — PIPELINE (KANBAN) MODULE
// ============================================================

const PipelineModule = {
  leads: [],
  draggedId: null,

  async init() {
    this.leads = await MockAPI.getLeads();
  },

  renderPipeline() {
    const statuses = LEAD_STATUSES;
    const colors = {
      'New':           '#3B82F6',
      'Contacted':     '#FACC15',
      'Qualified':     '#A855F7',
      'Proposal Sent': '#F97316',
      'Won':           '#22C55E',
      'Lost':          '#EF4444',
    };

    const byStatus = {};
    const leadsList = this.leads || [];
    statuses.forEach(s => { byStatus[s] = leadsList.filter(l => l.status === s); });
    const totalValue = leadsList.filter(l => !['Won','Lost'].includes(l.status)).reduce((s,l)=>s+l.netCost,0);

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">🔄 Pipeline Board</h1>
          <p class="page-subtitle">Pipeline Value: <span style="color:var(--gold-400);font-weight:700;">${Utils.formatINR(totalValue)}</span></p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary" onclick="PipelineModule.filterPipeline()">
            <select id="pipeline-caller-filter" style="background:none;border:none;color:inherit;font-family:inherit;font-size:inherit;cursor:pointer;" onchange="PipelineModule.filterPipeline()">
              <option value="all">All Team</option>
              ${(window.USERS || []).filter(u=>u.role==='telecaller').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </button>
          <button class="btn btn-primary" onclick="LeadsModule.showAddLead()">➕ Add Lead</button>
        </div>
      </div>

      <!-- Pipeline Summary -->
      <div class="summary-bar">
        ${statuses.map(s => {
          const items = byStatus[s];
          const val   = items.reduce((sum, l) => sum + l.netCost, 0);
          return `<div class="summary-bar-item">
            <div class="sb-val" style="color:${colors[s]}">${items.length}</div>
            <div class="sb-label">${s}</div>
            ${val > 0 ? `<div class="sb-change" style="color:${colors[s]};font-size:10px;">${Utils.formatINR(val)}</div>` : ''}
          </div>`;
        }).join('')}
      </div>

      <div class="kanban-board" id="kanban-board">
        ${statuses.map(s => this.renderColumn(s, byStatus[s], colors[s])).join('')}
      </div>
    `;
  },

  renderColumn(status, leads, color) {
    const value = leads.reduce((s, l) => s + l.netCost, 0);
    return `
      <div class="kanban-col" data-status="${status}">
        <div class="kanban-col-header">
          <div class="kanban-col-title">
            <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;"></div>
            ${status}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${value > 0 ? `<span class="kanban-col-value">${Utils.formatINR(value)}</span>` : ''}
            <div class="kanban-col-count">${leads.length}</div>
          </div>
        </div>
        <div class="kanban-col-body" id="col-${status.replace(/ /g,'_')}"
          ondragover="PipelineModule.onDragOver(event)"
          ondrop="PipelineModule.onDrop(event,'${status}')">
          ${leads.length === 0 
            ? `<div style="text-align:center;padding:24px 12px;color:var(--text-disabled);font-size:12px;">Drop leads here</div>`
            : leads.map(l => this.renderCard(l)).join('')}
        </div>
      </div>
    `;
  },

  renderCard(lead) {
    const caller = Utils.getUser(lead.assignedTo);
    const color  = Utils.leadColor(lead.id);
    return `
      <div class="kanban-card" draggable="true" data-id="${lead.id}"
        ondragstart="PipelineModule.onDragStart(event,'${lead.id}')"
        ondragend="PipelineModule.onDragEnd(event)"
        onclick="LeadsModule.openDrawer('${lead.id}')">
        <div class="kanban-card-header">
          <div>
            <div class="kanban-card-name">${lead.name}</div>
            <div class="kc-meta"><span>📍</span>${lead.city}</div>
          </div>
          ${Utils.tempBadge(lead.temperature)}
        </div>
        <div class="kanban-card-body">
          <div class="kc-meta"><span>${lead.systemType.includes('MW') ? '⚡' : '☀️'}</span>${Utils.formatKW(lead.kwSize)}</div>
          <div class="kc-meta"><span>📡</span>${lead.source}</div>
          ${lead.nextFollowUp ? `<div class="kc-meta" style="${Utils.isOverdue(lead.nextFollowUp)?'color:var(--red-400)':''}"><span>📅</span>${Utils.formatDate(lead.nextFollowUp)}</div>` : ''}
        </div>
        <div class="kc-footer">
          <div style="color:var(--gold-400);font-weight:700;font-size:13px;">${Utils.formatINR(lead.netCost)}</div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${caller.id ? `<div class="user-avatar" style="width:22px;height:22px;font-size:9px;background:${caller.color};">${caller.avatar}</div>` : ''}
            <button class="lead-action-btn" style="width:24px;height:24px;" onclick="event.stopPropagation();LeadsModule.initiateCall('${lead.id}')">📞</button>
          </div>
        </div>
      </div>
    `;
  },

  // ── Drag and Drop ──────────────────────────────────────────
  onDragStart(e, id) {
    this.draggedId = id;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  },

  onDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.kanban-col-body').forEach(c => c.classList.remove('drag-over'));
  },

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  },

  async onDrop(e, newStatus) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!this.draggedId) return;
    const lead = (window.LEADS || []).find(l => String(l.id) === String(this.draggedId));
    if (!lead || lead.status === newStatus) return;
    const oldStatus = lead.status;
    await MockAPI.updateLeadStatus(this.draggedId, newStatus);
    lead.status = newStatus;
    this.draggedId = null;

    window.APP.showToast('success', '🔄 Status Updated', `${lead.name}: ${oldStatus} → ${newStatus}`);
    if (newStatus === 'Won') window.APP.showToast('success', '🎉 Deal Won!', `${Utils.formatINR(lead.netCost)} added to revenue!`);

    // Re-render board
    document.getElementById('page-content').innerHTML = this.renderPipeline();
  },

  filterPipeline() {
    const callerId = document.getElementById('pipeline-caller-filter')?.value;
    if (!callerId || callerId === 'all') {
      this.leads = window.LEADS || [];
    } else {
      this.leads = (window.LEADS || []).filter(l => String(l.assignedTo) === String(callerId));
    }
    document.getElementById('page-content').innerHTML = this.renderPipeline();
  },
};
