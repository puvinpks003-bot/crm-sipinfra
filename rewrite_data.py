import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Keep everything before "Generate Mock Leads"
header_end = text.find('// ── Generate Mock Leads')
header_text = text[:header_end]

api_text = """
const API_BASE = 'http://localhost:8000/api';

function getHeaders() {
  const user = JSON.parse(localStorage.getItem('SIP INFRA_user') || '{}');
  return {
    'Content-Type': 'application/json',
    ...(user.token ? { 'Authorization': Token  } : {})
  };
}

const MockAPI = {
  async login(email, password) {
    const res = await fetch(${API_BASE}/auth/login/, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    // Save token to data.user
    const user = data.user;
    user.token = data.token;
    return user;
  },

  async signup(userData) {
    // For simplicity, just error out. Admin can create users in Django admin.
    throw new Error('Signup disabled. Contact Admin to create account.');
  },

  async getLeads(filters = {}) {
    const res = await fetch(${API_BASE}/leads/, { headers: getHeaders() });
    let result = await res.json();
    if (filters.status)     result = result.filter(l => l.status === filters.status);
    if (filters.assignedTo) result = result.filter(l => l.assignedTo === filters.assignedTo);
    if (filters.source)     result = result.filter(l => l.source === filters.source);
    if (filters.search)     {
      const q = filters.search.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.city || '').toLowerCase().includes(q));
    }
    return result;
  },

  async getLead(id) {
    const res = await fetch(${API_BASE}/leads//, { headers: getHeaders() });
    return await res.json();
  },

  async updateLeadStatus(id, status) {
    const res = await fetch(${API_BASE}/leads//, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async addNote(leadId, text, userId) {
    const res = await fetch(${API_BASE}/notes/, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ lead: leadId, text, addedBy: userId })
    });
    return await res.json();
  },

  async getActivities(leadId) {
    const res = await fetch(${API_BASE}/activities/, { headers: getHeaders() });
    let acts = await res.json();
    return acts.filter(a => String(a.leadId) === String(leadId));
  },

  async getNotifications() {
    const res = await fetch(${API_BASE}/notifications/, { headers: getHeaders() });
    return await res.json();
  },

  async getTeam() {
    const res = await fetch(${API_BASE}/users/, { headers: getHeaders() });
    let users = await res.json();
    return users.filter(u => u.role === 'telecaller');
  },

  async getFollowUps(userId) {
    return []; // Placeholder until backend model added
  },
  
  async getQuotes() {
    return []; // Placeholder until backend model added
  },

  async getStats(userId) {
    const leads = await this.getLeads();
    const userLeads = userId ? leads.filter(l => l.assignedTo === userId) : leads;
    return {
      total:    userLeads.length,
      new:      userLeads.filter(l => l.status === 'New').length,
      contacted:userLeads.filter(l => l.status === 'Contacted').length,
      qualified:userLeads.filter(l => l.status === 'Qualified').length,
      proposal: userLeads.filter(l => l.status === 'Proposal Sent').length,
      won:      userLeads.filter(l => l.status === 'Won').length,
      lost:     userLeads.filter(l => l.status === 'Lost').length,
      revenue:  userLeads.filter(l => l.status === 'Won').reduce((s, l) => s + l.netCost, 0),
      pipeline: userLeads.filter(l => !['Won','Lost'].includes(l.status)).reduce((s, l) => s + l.netCost, 0),
      convRate: userLeads.length > 0 ? ((userLeads.filter(l => l.status === 'Won').length / userLeads.length) * 100).toFixed(1) : 0,
    };
  }
};
"""

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(header_text + api_text)

print('Updated js/data.js')
