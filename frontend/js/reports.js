// ============================================================
// SOLAR CRM — REPORTS & ANALYTICS MODULE
// ============================================================

const ReportsModule = {
  async render() {
    const stats = await MockAPI.getStats();
    const team  = await MockAPI.getTeam();
    return this.renderReports(stats, team);
  },

  renderReports(stats, team) {
    const leads = window.LEADS || [];
    const teamList = team || [];
    const byMonth = this.getMonthlyData(leads);
    const bySource = this.getSourceData(leads);
    const topPerformers = teamList.map(u => {
      const myLeads = leads.filter(l => l.assignedTo === u.id);
      const won = myLeads.filter(l => l.status === 'Won').length;
      const rev = myLeads.filter(l => l.status === 'Won').reduce((s, l) => s + l.netCost, 0);
      return { ...u, _won: won, _rev: rev };
    }).sort((a, b) => b._rev - a._rev || b._won - a._won).slice(0, 6);
    const convRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : "0.0";
    const wonRevenue = leads.filter(l => l.status === 'Won').reduce((s, l) => s + l.netCost, 0);

    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">📈 Reports & Analytics</h1>
          <p class="page-subtitle">Performance overview — Last 90 days</p>
        </div>
        <div class="page-header-right">
          <select class="filter-chip" onchange="ReportsModule.changeRange(this.value)" id="report-range">
            <option value="90">Last 90 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
          </select>
          <button class="btn btn-secondary" onclick="ReportsModule.exportReport()">📥 Export</button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid">
        ${[
          { label:'Total Leads', val: stats.total, icon:'📋', cls:'blue', trend:'+18%', up:true },
          { label:'Won Deals', val: stats.won, icon:'🏆', cls:'green', trend:'+24%', up:true },
          { label:'Conversion Rate', val: convRate + '%', icon:'📊', cls:'gold', trend:'+3.2%', up:true, noAnim:true },
          { label:'Total Revenue', val: Utils.formatINR(wonRevenue), icon:'💰', cls:'purple', trend:'+31%', up:true, noAnim:true },
          { label:'Pipeline Value', val: Utils.formatINR(stats.pipeline), icon:'🔄', cls:'teal', noAnim:true },
          { label:'Lost Leads', val: stats.lost, icon:'❌', cls:'red', trend:'-5%', up:false },
        ].map(s => `
          <div class="stat-card ${s.cls}">
            <div class="stat-header">
              <div class="stat-icon ${s.cls}">${s.icon}</div>
              ${s.trend ? `<div class="stat-trend ${s.up ? 'up' : 'down'}">${s.up ? '↑' : '↓'} ${s.trend}</div>` : ''}
            </div>
            <div class="stat-value">${s.val}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `).join('')}
      </div>

      <div class="reports-layout">
        <!-- Row 1 -->
        <div class="reports-row">
          <!-- Monthly Trend -->
          <div class="report-card">
            <div class="report-card-header">
              <div class="report-card-title">📅 Monthly Lead Trend</div>
              <span style="font-size:12px;color:var(--text-muted);">Last 6 months</span>
            </div>
            <div class="report-card-body">
              ${this.renderMonthlyBars(byMonth)}
            </div>
          </div>

          <!-- Conversion Funnel -->
          <div class="report-card">
            <div class="report-card-header">
              <div class="report-card-title">🔻 Conversion Funnel</div>
              <span style="font-size:12px;color:var(--text-muted);">Full pipeline</span>
            </div>
            <div class="report-card-body">
              ${this.renderFunnel(stats)}
            </div>
          </div>
        </div>

        <!-- Row 2 -->
        <div class="reports-row">
          <!-- Lead Source Distribution -->
          <div class="report-card">
            <div class="report-card-header">
              <div class="report-card-title">📡 Lead Sources</div>
            </div>
            <div class="report-card-body">
              ${this.renderSourceBars(bySource)}
            </div>
          </div>

          <!-- System Type Donut -->
          <div class="report-card">
            <div class="report-card-header">
              <div class="report-card-title">☀️ System Type Split</div>
            </div>
            <div class="report-card-body">
              ${this.renderSystemDonut(leads)}
            </div>
          </div>
        </div>

        <!-- Team Performance Table -->
        <div class="report-card">
          <div class="report-card-header">
            <div class="report-card-title">👥 Team Performance Leaderboard</div>
            <span style="font-size:12px;color:var(--text-muted);">${team.length} active callers</span>
          </div>
          <div class="report-card-body" style="padding:0;">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team Member</th>
                    <th>Leads Assigned</th>
                    <th>Contacted</th>
                    <th>Won</th>
                    <th>Conversion</th>
                    <th>Revenue</th>
                    <th>Target Progress</th>
                  </tr>
                </thead>
                <tbody>
                  ${topPerformers.map((u, i) => {
                    const myLeads  = leads.filter(l => l.assignedTo === u.id);
                    const contacted = myLeads.filter(l => l.status !== 'New').length;
                    const won      = myLeads.filter(l => l.status === 'Won').length;
                    const conv     = myLeads.length > 0 ? ((won / myLeads.length) * 100).toFixed(1) : 0;
                    const revenue  = myLeads.filter(l => l.status === 'Won').reduce((s, l) => s + l.netCost, 0);
                    const pct      = Math.min((won / (u.target || 20)) * 100, 100);
                    const medals   = ['🥇','🥈','🥉'];
                    return `<tr>
                      <td><span style="font-size:18px;">${medals[i] || (i+1)}</span></td>
                      <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                          <div class="user-avatar" style="width:34px;height:34px;font-size:13px;background:${u.color};">${u.avatar}</div>
                          <div>
                            <div style="font-weight:600;color:var(--text-primary);">${u.name}</div>
                            <div style="font-size:11px;color:var(--text-muted);">${u.team}</div>
                          </div>
                        </div>
                      </td>
                      <td style="font-weight:600;">${myLeads.length}</td>
                      <td>${contacted}</td>
                      <td style="color:var(--green-400);font-weight:700;">${won}</td>
                      <td>
                        <span style="color:${conv >= 25 ? 'var(--green-400)' : conv >= 15 ? 'var(--gold-400)' : 'var(--red-400)'}; font-weight:700;">${conv}%</span>
                      </td>
                      <td style="color:var(--gold-400);font-weight:700;">${Utils.formatINR(revenue)}</td>
                      <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                          <div class="progress-bar-wrap" style="flex:1;min-width:80px;">
                            <div class="progress-bar-fill" style="width:${pct}%;background:${pct >= 100 ? 'var(--green-500)' : pct >= 60 ? 'var(--gold-500)' : 'var(--red-500)'};"></div>
                          </div>
                          <span style="font-size:12px;color:var(--text-muted);white-space:nowrap;">${won}/${u.target}</span>
                        </div>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Revenue by City -->
        <div class="reports-row">
          <div class="report-card">
            <div class="report-card-header">
              <div class="report-card-title">🏙️ Revenue by City</div>
            </div>
            <div class="report-card-body">
              ${this.renderCityRevenue(leads)}
            </div>
          </div>
          <div class="report-card">
            <div class="report-card-header">
              <div class="report-card-title">🌡️ Lead Temperature Analysis</div>
            </div>
            <div class="report-card-body">
              ${this.renderTempAnalysis(leads)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  getMonthlyData(leads) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      const year  = d.getFullYear();
      const monthLeads = leads.filter(l => {
        const ld = new Date(l.createdAt);
        return ld.getMonth() === month && ld.getFullYear() === year;
      });
      months.push({
        label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month],
        total: monthLeads.length,
        won:   monthLeads.filter(l => l.status === 'Won').length,
      });
    }
    return months;
  },

  renderMonthlyBars(byMonth) {
    const maxVal = Math.max(...byMonth.map(m => m.total), 1);
    return `
      <div style="display:flex;align-items:flex-end;gap:8px;height:150px;padding:0 8px;">
        ${byMonth.map(m => {
          const h   = Math.round((m.total / maxVal) * 120);
          const hw  = Math.round((m.won   / maxVal) * 120);
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="font-size:10px;color:var(--text-muted);">${m.total}</div>
            <div style="width:100%;display:flex;flex-direction:column;justify-content:flex-end;height:130px;position:relative;">
              <div style="width:100%;height:${h}px;background:rgba(245,158,11,0.25);border-radius:4px 4px 0 0;position:absolute;bottom:0;"></div>
              <div style="width:100%;height:${hw}px;background:var(--gold-500);border-radius:4px 4px 0 0;position:absolute;bottom:0;"></div>
            </div>
            <div style="font-size:11px;color:var(--text-secondary);">${m.label}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:16px;margin-top:12px;justify-content:center;font-size:11px;color:var(--text-muted);">
        <span><span style="color:rgba(245,158,11,0.25);font-size:16px;">■</span> Total Leads</span>
        <span><span style="color:var(--gold-500);font-size:16px;">■</span> Won</span>
      </div>
    `;
  },

  renderFunnel(stats) {
    const steps = [
      { label: 'Total Leads',   val: stats.total,    color: '#3B82F6', pct: 100 },
      { label: 'Contacted',     val: stats.contacted, color: '#FACC15', pct: stats.total > 0 ? Math.round(stats.contacted/stats.total*100) : 0 },
      { label: 'Qualified',     val: stats.qualified, color: '#A855F7', pct: stats.total > 0 ? Math.round(stats.qualified/stats.total*100) : 0 },
      { label: 'Proposal Sent', val: stats.proposal,  color: '#F97316', pct: stats.total > 0 ? Math.round(stats.proposal/stats.total*100)  : 0 },
      { label: 'Won',           val: stats.won,       color: '#22C55E', pct: stats.total > 0 ? Math.round(stats.won/stats.total*100)        : 0 },
    ];
    return `<div class="funnel">
      ${steps.map(s => `
        <div class="funnel-step">
          <div class="funnel-bar" style="background:${s.color}20;border:1px solid ${s.color}30;width:${s.pct + 20}%;max-width:100%;min-width:40%;">
            <span class="funnel-label" style="color:${s.color};">${s.label}</span>
            <span class="funnel-count">${s.val}</span>
            <span class="funnel-pct">${s.pct}%</span>
          </div>
        </div>
      `).join('')}
    </div>`;
  },

  getSourceData(leads) {
    const counts = {};
    leads.forEach(l => { counts[l.source] = (counts[l.source] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  },

  renderSourceBars(sources) {
    if (!sources || sources.length === 0) return `<div style="text-align:center;color:var(--text-muted);padding:24px;">No source data available.</div>`;
    const max = Math.max(...sources.map(s => s[1]), 1);
    const colors = ['#F59E0B','#14B8A6','#A855F7','#3B82F6','#EF4444','#10B981','#EC4899','#F97316'];
    return sources.map(([name, count], i) => `
      <div class="chart-bar-row">
        <div class="chart-bar-label">${name}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${Math.round((count/max)*100)}%;background:${colors[i % colors.length]};"></div>
        </div>
        <div class="chart-bar-val">${count} (${Utils.pct(count, (window.LEADS || []).length)})</div>
      </div>
    `).join('');
  },

  renderSystemDonut(leads) {
    const residential = leads.filter(l => l.systemType.includes('Residential')).length;
    const commercial  = leads.filter(l => l.systemType.includes('Commercial')).length;
    const industrial  = leads.filter(l => l.systemType.includes('Industrial')).length;
    const total = leads.length || 1;
    const r = 50, c = 2 * Math.PI * r;
    const segments = [
      { label: 'Residential KW', val: residential, color: '#F59E0B', pct: residential/total },
      { label: 'Commercial KW',  val: commercial,  color: '#14B8A6', pct: commercial/total },
      { label: 'Industrial MW',  val: industrial,  color: '#A855F7', pct: industrial/total },
    ];
    let offset = 0;
    const arcs = segments.map(s => {
      const len  = s.pct * c;
      const arc  = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${s.color}" stroke-width="16"
        stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset + c/4}" stroke-linecap="round" opacity="0.85"/>`;
      offset += len;
      return arc;
    }).join('');

    return `
      <div class="donut-wrap">
        <div class="donut-chart">
          <svg class="donut-svg" width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="16"/>
            ${arcs}
          </svg>
          <div class="donut-center">
            <div class="donut-center-val">${total}</div>
            <div class="donut-center-label">Total</div>
          </div>
        </div>
        <div class="donut-legend">
          ${segments.map(s => `
            <div class="donut-legend-item">
              <div class="legend-dot" style="background:${s.color};"></div>
              <div class="legend-label">${s.label}</div>
              <div class="legend-val">${s.val} (${(s.pct * 100).toFixed(0)}%)</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderCityRevenue(leads) {
    const cityRevMap = {};
    leads.filter(l => l.status === 'Won').forEach(l => {
      cityRevMap[l.city] = (cityRevMap[l.city] || 0) + l.netCost;
    });
    const sorted = Object.entries(cityRevMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!sorted.length) return '<div class="empty-state"><div class="empty-icon">🏙️</div><div class="empty-title">No revenue data yet</div></div>';
    const max = Math.max(...sorted.map(s => s[1]), 1);
    const colors = ['#F59E0B','#14B8A6','#A855F7','#3B82F6','#EF4444','#10B981','#EC4899','#F97316'];
    return sorted.map(([city, rev], i) => `
      <div class="chart-bar-row">
        <div class="chart-bar-label">${city}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${Math.round((rev/max)*100)}%;background:${colors[i % colors.length]};"></div>
        </div>
        <div class="chart-bar-val">${Utils.formatINR(rev)}</div>
      </div>
    `).join('');
  },

  renderTempAnalysis(leads) {
    const hot  = leads.filter(l => l.temperature === 'Hot').length;
    const warm = leads.filter(l => l.temperature === 'Warm').length;
    const cold = leads.filter(l => l.temperature === 'Cold').length;
    const total = hot + warm + cold || 1;
    const hotWon  = leads.filter(l => l.temperature === 'Hot'  && l.status === 'Won').length;
    const warmWon = leads.filter(l => l.temperature === 'Warm' && l.status === 'Won').length;
    const coldWon = leads.filter(l => l.temperature === 'Cold' && l.status === 'Won').length;
    return `
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${[
          { label:'🔥 Hot', count: hot, won: hotWon, color: '#EF4444' },
          { label:'☀️ Warm', count: warm, won: warmWon, color: '#F97316' },
          { label:'❄️ Cold', count: cold, won: coldWon, color: '#3B82F6' },
        ].map(t => {
          const pct = t.count > 0 ? ((t.won / t.count) * 100).toFixed(0) : 0;
          return `<div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:13px;font-weight:600;color:${t.color};">${t.label}</span>
              <span style="font-size:12px;color:var(--text-muted);">${t.count} leads • ${t.won} won • ${pct}% conv</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width:${Math.round((t.count/total)*100)}%;background:${t.color};opacity:0.7;"></div>
            </div>
          </div>`;
        }).join('')}
        <div style="margin-top:8px;padding:12px;background:var(--bg-elevated);border-radius:var(--radius-md);font-size:13px;color:var(--text-secondary);">
          💡 <strong>Tip:</strong> Hot leads convert at ${hot > 0 ? ((hotWon/hot)*100).toFixed(0) : 0}% vs Cold at ${cold > 0 ? ((coldWon/cold)*100).toFixed(0) : 0}%. Prioritize hot leads!
        </div>
      </div>
    `;
  },

  changeRange(days) {
    window.APP.showToast('info','📊 Refreshing', `Showing last ${days} days`);
    window.APP.showPage('reports');
  },

  exportReport() {
    window.APP.showToast('success','📥 Report Exported', 'Analytics data downloaded as CSV');
  },
};
