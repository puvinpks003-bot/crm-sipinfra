// ============================================================
// SOLAR CRM — UTILITIES
// ============================================================

const Utils = {
  // Format currency in INR
  formatINR(amount) {
    if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    if (amount >= 100000)   return '₹' + (amount / 100000).toFixed(2) + ' L';
    if (amount >= 1000)     return '₹' + (amount / 1000).toFixed(1) + 'K';
    return '₹' + amount.toLocaleString('en-IN');
  },

  // Format number with Indian locale
  formatNum(n) {
    return Number(n).toLocaleString('en-IN');
  },

  // Format date
  formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  // Format datetime
  formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  },

  // Relative time
  timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return mins + 'm ago';
    if (hrs < 24)   return hrs + 'h ago';
    if (days < 7)   return days + 'd ago';
    return Utils.formatDate(iso);
  },

  // Format system size
  formatKW(kw) {
    if (kw >= 1000) return (kw / 1000).toFixed(1) + ' MW';
    return kw + ' kW';
  },

  // Get user by ID
  getUser(id) {
    return (window.USERS || []).find(u => String(u.id) === String(id)) || { name: 'Unknown', avatar: '?', color: '#888' };
  },

  // Get initials
  initials(name) {
    if (!name || typeof name !== 'string') return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  },

  // Status badge HTML
  statusBadge(status) {
    const map = {
      'New':           'badge-new',
      'Contacted':     'badge-contacted',
      'Qualified':     'badge-qualified',
      'Proposal Sent': 'badge-proposal',
      'Won':           'badge-won',
      'Lost':          'badge-lost',
    };
    return `<span class="badge ${map[status] || 'badge-new'}">${status || 'New'}</span>`;
  },

  // Temperature badge HTML
  tempBadge(temp) {
    const map = { Hot: 'badge-hot', Warm: 'badge-warm', Cold: 'badge-cold' };
    const icon = { Hot: '🔥', Warm: '☀️', Cold: '❄️' };
    return `<span class="badge ${map[temp] || 'badge-cold'}">${icon[temp] || ''} ${temp || 'Cold'}</span>`;
  },

  // System type badge
  systemBadge(type) {
    if (!type || typeof type !== 'string') return '<span class="badge badge-kw">☀️ KW</span>';
    if (type.includes('MW')) return '<span class="badge badge-mw">⚡ MW</span>';
    return '<span class="badge badge-kw">☀️ KW</span>';
  },

  // Avatar HTML
  avatarHtml(user, size = 34) {
    return `<div class="user-avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.4)}px;background:${user.color || '#F59E0B'};flex-shrink:0;">${user.avatar || Utils.initials(user.name)}</div>`;
  },

  // Lead avatar color
  leadColor(id) {
    if (!id || typeof id !== 'string') return '#F59E0B';
    const colors = ['#F59E0B','#14B8A6','#A855F7','#3B82F6','#EF4444','#10B981','#EC4899','#F97316'];
    const idx = id.length > 1 ? id.charCodeAt(1) % colors.length : id.charCodeAt(0) % colors.length;
    return colors[idx] || '#F59E0B';
  },

  // Debounce
  debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  },

  // Random between
  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Is today
  isToday(iso) {
    return new Date(iso).toDateString() === new Date().toDateString();
  },

  // Is overdue
  isOverdue(iso) {
    return iso && new Date(iso) < new Date() && !Utils.isToday(iso);
  },

  // Progress circle SVG
  progressCircle(pct, size = 60, color = '#F59E0B') {
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
        stroke-dasharray="${dash} ${c}" stroke-dashoffset="${c/4}" stroke-linecap="round"
        style="transition:stroke-dasharray 0.8s ease;"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central"
        fill="${color}" font-size="${size*0.22}" font-weight="700" font-family="Space Grotesk">${Math.round(pct)}%</text>
    </svg>`;
  },

  // Simple bar chart in SVG
  barChart(data, w = 300, h = 120) {
    if (!data || !data.length) return '';
    const max = Math.max(...data.map(d => d.value), 1);
    const bw = Math.floor((w - 20) / data.length) - 6;
    const bars = data.map((d, i) => {
      const bh = Math.round((d.value / max) * (h - 30));
      const x  = 10 + i * (bw + 6);
      const y  = h - 20 - bh;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="${d.color || '#F59E0B'}" opacity="0.85"/>
              <text x="${x + bw/2}" y="${h - 4}" text-anchor="middle" fill="#8FA3C5" font-size="9">${d.label || d.value}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;">${bars}</svg>`;
  },

  // Generate a quote number
  quoteId() {
    return 'Q' + (2024001 + (window.QUOTES || []).length + Math.floor(Math.random() * 100));
  },

  // Convert YYYY-MM to month name
  monthName(n) {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][n-1] || '';
  },

  // Animate number count-up
  animateNum(el, target, duration = 800, prefix = '', suffix = '') {
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(eased * target).toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  // Clamp
  clamp(val, min, max) { return Math.min(Math.max(val, min), max); },

  // Format percent
  pct(val, total) {
    if (!total) return '0%';
    return ((val / total) * 100).toFixed(1) + '%';
  },

  // Current month stats for a lead array
  monthStats(leads) {
    const now = new Date();
    const thisMonth = leads.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      total: thisMonth.length,
      won:   thisMonth.filter(l => l.status === 'Won').length,
      revenue: thisMonth.filter(l => l.status === 'Won').reduce((s, l) => s + l.netCost, 0),
    };
  },
};
