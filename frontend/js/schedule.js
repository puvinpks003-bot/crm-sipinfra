// ============================================================
// SOLAR CRM — SCHEDULE MODULE
// Follow-up Calendar & Scheduler
// ============================================================

const ScheduleModule = {
  followUps: [],
  selectedDate: null,
  viewMonth: null,
  viewYear: null,

  async init() {
    this.followUps = await MockAPI.getFollowUps(
      Auth.currentUser?.role === 'telecaller' ? Auth.currentUser.id : null
    ) || [];
    const now = new Date();
    this.viewMonth = now.getMonth();
    this.viewYear  = now.getFullYear();
  },

  renderSchedule() {
    const today = new Date();
    const followUpsList = this.followUps || [];
    const overdueCount = followUpsList.filter(f => f.isOverdue).length;
    const todayCount   = followUpsList.filter(f => f.isToday).length;
    const upcomingCount= followUpsList.filter(f => !f.isOverdue && !f.isToday).length;

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">📅 Follow-up Schedule</h1>
          <p class="page-subtitle">${overdueCount > 0 ? `⚠️ ${overdueCount} overdue •` : ''} ${todayCount} today • ${upcomingCount} upcoming</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" onclick="ScheduleModule.showAddFollowUp()">➕ Schedule Follow-up</button>
        </div>
      </div>

      <!-- Quick summary -->
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px;">
        <div class="stat-card red" style="cursor:pointer;" onclick="ScheduleModule.filterByType('overdue')">
          <div class="stat-header"><div class="stat-icon red">⚠️</div></div>
          <div class="stat-value" style="color:var(--red-400);">${overdueCount}</div>
          <div class="stat-label">Overdue</div>
        </div>
        <div class="stat-card gold" style="cursor:pointer;" onclick="ScheduleModule.filterByType('today')">
          <div class="stat-header"><div class="stat-icon gold">📅</div></div>
          <div class="stat-value" style="color:var(--gold-400);">${todayCount}</div>
          <div class="stat-label">Today</div>
        </div>
        <div class="stat-card teal" style="cursor:pointer;" onclick="ScheduleModule.filterByType('upcoming')">
          <div class="stat-header"><div class="stat-icon teal">⏰</div></div>
          <div class="stat-value" style="color:var(--teal-400);">${upcomingCount}</div>
          <div class="stat-label">Upcoming</div>
        </div>
      </div>

      <div class="schedule-layout">
        <!-- Full Calendar -->
        <div>
          <div class="card">
            <div class="card-header">
              <button class="mini-cal-nav" onclick="ScheduleModule.prevMonth()">‹</button>
              <div class="card-title">${['January','February','March','April','May','June','July','August','September','October','November','December'][this.viewMonth]} ${this.viewYear}</div>
              <button class="mini-cal-nav" onclick="ScheduleModule.nextMonth()">›</button>
            </div>
            <div class="card-body">
              ${this.renderFullCalendar()}
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="schedule-sidebar">
          <!-- Overdue -->
          ${overdueCount > 0 ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="color:var(--red-400);">⚠️ Overdue (${overdueCount})</div>
            </div>
            <div class="card-body" style="padding:12px;">
              <div class="followup-list">
                ${followUpsList.filter(f => f.isOverdue).map(f => this.renderFollowUpCard(f)).join('')}
              </div>
            </div>
          </div>` : ''}

          <!-- Today -->
          ${todayCount > 0 ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="color:var(--teal-400);">📅 Today (${todayCount})</div>
            </div>
            <div class="card-body" style="padding:12px;">
              <div class="followup-list">
                ${followUpsList.filter(f => f.isToday).map(f => this.renderFollowUpCard(f)).join('')}
              </div>
            </div>
          </div>` : ''}

          <!-- Upcoming -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">⏰ Upcoming</div>
            </div>
            <div class="card-body" style="padding:12px;">
              <div class="followup-list">
                ${followUpsList.filter(f => !f.isOverdue && !f.isToday).slice(0, 8).map(f => this.renderFollowUpCard(f)).join('')}
                ${followUpsList.filter(f => !f.isOverdue && !f.isToday).length === 0
                  ? '<div class="empty-state" style="padding:20px;"><div class="empty-icon" style="font-size:32px;">✅</div><div class="empty-title">All clear!</div></div>'
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderFullCalendar() {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const daysInPrev  = new Date(this.viewYear, this.viewMonth, 0).getDate();
    const today = new Date();

    const cells = [];
    // Prev month filler
    for (let i = firstDay - 1; i >= 0; i--)
      cells.push({ day: daysInPrev - i, current: false, date: new Date(this.viewYear, this.viewMonth - 1, daysInPrev - i) });
    // Current month
    for (let i = 1; i <= daysInMonth; i++)
      cells.push({ day: i, current: true, date: new Date(this.viewYear, this.viewMonth, i) });
    // Next month filler
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++)
      cells.push({ day: i, current: false, date: new Date(this.viewYear, this.viewMonth + 1, i) });

    return `
      <div class="calendar-grid">
        ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div class="cal-header-cell">${d}</div>`).join('')}
        ${cells.map(cell => {
          const dateStr = cell.date.toDateString();
          const isToday = dateStr === today.toDateString();
          const events  = (this.followUps || []).filter(f => new Date(f.date).toDateString() === dateStr);
          const isOverdue = cell.current && !isToday && cell.date < today && events.some(f => f.isOverdue);
          return `<div class="cal-cell ${isToday ? 'today' : ''} ${!cell.current ? 'other-month' : ''}"
            onclick="ScheduleModule.showDayEvents(${JSON.stringify(cell.date)})">
            <div class="cal-day">${cell.day}</div>
            ${events.slice(0, 3).map(e => `<div class="cal-event ${e.type === 'Call' ? 'call' : e.type === 'Site Visit' ? 'site' : 'follow'}">${e.type}: ${e.leadName.split(' ')[0]}</div>`).join('')}
            ${events.length > 3 ? `<div class="cal-event" style="background:rgba(255,255,255,0.05);color:var(--text-muted);">+${events.length - 3} more</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    `;
  },

  renderFollowUpCard(f) {
    const lead = (window.LEADS || []).find(l => String(l.id) === String(f.leadId));
    const color = f.isOverdue ? 'overdue' : f.isToday ? 'today' : '';
    return `
      <div class="followup-card ${color}" onclick="LeadsModule.openDrawer('${f.leadId}')">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div class="followup-name">${f.leadName}</div>
          <span class="badge ${f.type === 'Call' ? 'badge-contacted' : f.type === 'Site Visit' ? 'badge-won' : 'badge-qualified'}">${f.type}</span>
        </div>
        <div class="followup-time">${Utils.formatDate(f.date)} ${lead ? '• ' + Utils.formatKW(lead.kwSize) : ''}</div>
        <div class="followup-type" style="color:${f.isOverdue ? 'var(--red-400)' : f.isToday ? 'var(--teal-400)' : 'var(--text-muted)'};">
          ${f.isOverdue ? '⚠️ Overdue' : f.isToday ? '📅 Today' : '⏰ ' + f.notes}
        </div>
      </div>
    `;
  },

  prevMonth() {
    this.viewMonth--;
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
    document.getElementById('page-content').innerHTML = this.renderSchedule();
  },

  nextMonth() {
    this.viewMonth++;
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
    document.getElementById('page-content').innerHTML = this.renderSchedule();
  },

  showDayEvents(dateStr) {
    const date = new Date(dateStr);
    const events = this.followUps.filter(f => new Date(f.date).toDateString() === date.toDateString());
    if (!events.length) return;
    showModal(`📅 ${Utils.formatDate(dateStr)}`, `
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${events.map(f => `
          <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;cursor:pointer;" onclick="closeModal();LeadsModule.openDrawer('${f.leadId}')">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-weight:600;color:var(--text-primary);">${f.leadName}</span>
              <span class="badge ${f.type === 'Call' ? 'badge-contacted' : 'badge-won'}">${f.type}</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);">${f.notes}</div>
          </div>
        `).join('')}
      </div>
    `);
  },

  showAddFollowUp() {
    const leads = (window.LEADS || []).filter(l => !['Won','Lost'].includes(l.status));
    showModal('📅 Schedule Follow-up', `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="field">
          <label>Lead</label>
          <select id="sched-lead">
            <option value="">Select lead...</option>
            ${leads.map(l => `<option value="${l.id}">${l.name} (${l.phone})</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="field"><label>Date</label><input type="date" id="sched-date" min="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="field"><label>Type</label>
            <select id="sched-type">
              <option>Call</option>
              <option>Site Visit</option>
              <option>Meeting</option>
            </select>
          </div>
        </div>
        <div class="field"><label>Notes</label><textarea id="sched-notes" placeholder="Purpose of follow-up..." style="min-height:70px;"></textarea></div>
        <button class="btn btn-primary btn-full" onclick="ScheduleModule.saveFollowUp()">📅 Schedule</button>
      </div>
    `);
  },

  async saveFollowUp() {
    const leadId = document.getElementById('sched-lead')?.value;
    const date   = document.getElementById('sched-date')?.value;
    const type   = document.getElementById('sched-type')?.value;
    const notes  = document.getElementById('sched-notes')?.value;
    if (!leadId || !date) { window.APP.showToast('error','⚠️','Please select a lead and date'); return; }
    try {
      const lead = (window.LEADS || []).find(l => String(l.id) === String(leadId));
      const followUpData = {
        lead: parseInt(leadId),
        leadName: lead ? lead.name : '',
        type: type,
        date: date + 'T10:00:00.000Z',
        notes: notes || '',
        assignedTo: Auth.currentUser.id
      };
      await MockAPI.createFollowUp(followUpData);
      
      // Also update lead's nextFollowUp field
      await MockAPI.updateLead(leadId, { nextFollowUp: date + 'T10:00:00.000Z' });
      if (lead) lead.nextFollowUp = date + 'T10:00:00.000Z';
      
      closeModal();
      window.APP.showToast('success','📅 Scheduled', `Follow-up set for ${Utils.formatDate(date)}`);
      await this.init();
      window.APP.showPage('schedule');
    } catch (err) {
      window.APP.showToast('error', '❌ Error Scheduling', err.message);
    }
  },

  filterByType(type) {
    // Scroll to the appropriate section
    window.APP.showToast('info', '🔍 Filtered', `Showing ${type} follow-ups`);
  },
};
