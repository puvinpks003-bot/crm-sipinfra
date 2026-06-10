// ============================================================
// SOLAR CRM — DATA LAYER
// Mock data: users, leads, activities, notifications
// ============================================================

// ── Pricing ─────────────────────────────────────────────────
const PRICING = {
  costPerKW: 55000,           // ₹55,000 per kW
  gstRate: 0.12,              // 12% GST
  subsidyPerKW: 14588,        // PM Kusum subsidy ~₹14,588/kW
  installationPercent: 0.08,  // 8% of system cost
  maintenancePerYear: 2500,   // per kW per year
  annualGenPerKW: 1400,       // kWh per kW per year
  electricityCostPerUnit: 8,  // ₹8 per kWh
};

// ── Users ─────────────────────────────────────────────────── 
let USERS = [
  { id: 'u1', name: 'Rahul Kumar',    email: 'caller@sipinfra.in',   password: 'demo1234', role: 'telecaller', avatar: 'RK', color: '#F59E0B', phone: '9876543210', status: 'active', team: 'Mumbai Alpha', leads: 42, won: 12, target: 20 },
  { id: 'u2', name: 'Priya Sharma',   email: 'priya@sipinfra.in',    password: 'demo1234', role: 'telecaller', avatar: 'PS', color: '#14B8A6', phone: '9876543211', status: 'active', team: 'Mumbai Alpha', leads: 38, won: 10, target: 20 },
  { id: 'u3', name: 'Amit Singh',     email: 'amit@sipinfra.in',     password: 'demo1234', role: 'telecaller', avatar: 'AS', color: '#A855F7', phone: '9876543212', status: 'idle',   team: 'Pune Beta',   leads: 29, won: 8,  target: 15 },
  { id: 'u4', name: 'Neha Patel',     email: 'neha@sipinfra.in',     password: 'demo1234', role: 'telecaller', avatar: 'NP', color: '#3B82F6', phone: '9876543213', status: 'busy',   team: 'Pune Beta',   leads: 51, won: 15, target: 20 },
  { id: 'u5', name: 'Vijay Rao',      email: 'vijay@sipinfra.in',    password: 'demo1234', role: 'telecaller', avatar: 'VR', color: '#EF4444', phone: '9876543214', status: 'active', team: 'Nashik Gamma',leads: 33, won: 9,  target: 15 },
  { id: 'u6', name: 'Sunita Desai',   email: 'sunita@sipinfra.in',   password: 'demo1234', role: 'telecaller', avatar: 'SD', color: '#EC4899', phone: '9876543215', status: 'active', team: 'Mumbai Alpha', leads: 27, won: 7,  target: 15 },
  { id: 'm1', name: 'Ravi Gupta',     email: 'manager@sipinfra.in',  password: 'demo1234', role: 'manager',    avatar: 'RG', color: '#F59E0B', phone: '9876543220', status: 'active', team: 'All Teams',   leads: 220, won: 61, target: 80 },
  { id: 'm2', name: 'Kavita Joshi',   email: 'kavita@sipinfra.in',   password: 'demo1234', role: 'manager',    avatar: 'KJ', color: '#14B8A6', phone: '9876543221', status: 'active', team: 'Pune & Nashik',leads: 113, won: 32, target: 50 },
  { id: 'a1', name: 'Admin User',     email: 'admin@sipinfra.in',    password: 'demo1234', role: 'admin',      avatar: 'AU', color: '#A855F7', phone: '9876543230', status: 'active', team: 'HQ',          leads: 333, won: 93, target: 100 },
];

let LEADS = [];
let ACTIVITIES = [];
let FOLLOW_UPS = [];
let QUOTES = [];


// ── Lead Sources ─────────────────────────────────────────────
const LEAD_SOURCES = ['Website', 'Facebook Ad', 'Google Ad', 'Referral', 'Cold Call', 'WhatsApp', 'Exhibition', 'Newspaper Ad', 'TV Ad'];
const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const SYSTEM_TYPES = ['Residential KW', 'Commercial KW', 'Industrial MW'];
const CITIES = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Thane', 'Navi Mumbai', 'Ahmednagar'];
const STATES = ['Maharashtra'];
const NOTES_SAMPLE = [
  'Customer interested in 5kW rooftop system. Has sufficient roof space.',
  'Discussed subsidy schemes. Customer wants to compare prices.',
  'Site survey scheduled for next week.',
  'Customer confirmed interest. Sending proposal.',
  'Follow up needed - customer was busy.',
  'Very interested. Has already spoken to competitor.',
  'Wants financing option. Check with finance team.',
  'Agreed to proceed. Need to prepare agreement.',
  'Customer has 3-phase connection. Good for larger system.',
  'Reference from existing customer Ramesh Jain.',
];


const API_BASE = 'http://localhost:8000/api';

function getHeaders() {
  const user = JSON.parse(localStorage.getItem('SIP INFRA_user') || '{}');
  return {
    'Content-Type': 'application/json',
    ...(user.token ? { 'Authorization': `Token ${user.token}` } : {})
  };
}

const MockAPI = {
  async fetchWithAuth(url, options = {}) {
    options.headers = getHeaders();
    const res = await fetch(url, options);
    if (res.status === 401) {
      Auth.logout();
      throw new Error('Session expired. Please log in again.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || 'API Request Failed');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    
    const user = data.user;
    user.token = data.token;
    return user;
  },

  async signup(userData) {
    throw new Error('Signup disabled. Contact Admin to create account.');
  },

  async getLeads(filters = {}) {
    let result = await this.fetchWithAuth(`${API_BASE}/leads/`);
    if (filters.status)     result = result.filter(l => l.status === filters.status);
    if (filters.assignedTo) result = result.filter(l => String(l.assignedTo) === String(filters.assignedTo));
    if (filters.source)     result = result.filter(l => l.source === filters.source);
    if (filters.search)     {
      const q = filters.search.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.city || '').toLowerCase().includes(q));
    }
    return result;
  },

  async getLead(id) {
    return await this.fetchWithAuth(`${API_BASE}/leads/${id}/`);
  },

  async createLead(leadData) {
    return await this.fetchWithAuth(`${API_BASE}/leads/`, {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  },

  async updateLead(id, data) {
    return await this.fetchWithAuth(`${API_BASE}/leads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async updateLeadStatus(id, status) {
    return await this.fetchWithAuth(`${API_BASE}/leads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async addNote(leadId, text, userId) {
    return await this.fetchWithAuth(`${API_BASE}/notes/`, {
      method: 'POST',
      body: JSON.stringify({ lead: leadId, text, addedBy: userId })
    });
  },

  async getActivities(leadId) {
    let acts = await this.fetchWithAuth(`${API_BASE}/activities/`);
    if (leadId) {
      return acts.filter(a => String(a.leadId) === String(leadId));
    }
    return acts;
  },

  async createActivity(activityData) {
    return await this.fetchWithAuth(`${API_BASE}/activities/`, {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  },

  async getNotifications() {
    return await this.fetchWithAuth(`${API_BASE}/notifications/`);
  },

  async getTeam() {
    let users = await this.fetchWithAuth(`${API_BASE}/users/`);
    return users.filter(u => u.role === 'telecaller');
  },

  async getUsers() {
    return await this.fetchWithAuth(`${API_BASE}/users/`);
  },

  async getFollowUps(userId) {
    let res = await this.fetchWithAuth(`${API_BASE}/followups/`);
    res.forEach(f => { f.leadId = f.lead; });
    if (userId) {
      res = res.filter(f => String(f.assignedTo) === String(userId));
    }
    return res;
  },
  
  async createFollowUp(followUpData) {
    const res = await this.fetchWithAuth(`${API_BASE}/followups/`, {
      method: 'POST',
      body: JSON.stringify(followUpData)
    });
    res.leadId = res.lead;
    return res;
  },
  
  async getQuotes() {
    let res = await this.fetchWithAuth(`${API_BASE}/quotes/`);
    res.forEach(q => { q.id = q.quoteId; });
    return res;
  },

  async createQuote(quoteData) {
    const res = await this.fetchWithAuth(`${API_BASE}/quotes/`, {
      method: 'POST',
      body: JSON.stringify(quoteData)
    });
    res.id = res.quoteId;
    return res;
  },

  async syncGlobals() {
    const safeFetch = async (promise, fallback = []) => {
      try {
        return await promise;
      } catch (e) {
        console.warn("Failed to fetch collection:", e.message);
        return fallback;
      }
    };
    try {
      const [leads, activities, followUps, quotes, users] = await Promise.all([
        safeFetch(this.getLeads()),
        safeFetch(this.getActivities()),
        safeFetch(this.getFollowUps()),
        safeFetch(this.getQuotes()),
        safeFetch(this.getUsers())
      ]);
      window.LEADS = leads || [];
      window.ACTIVITIES = activities || [];
      window.FOLLOW_UPS = followUps || [];
      window.QUOTES = quotes || [];
      window.USERS = users || [];
    } catch (err) {
      console.error("Global synchronization failed:", err);
    }
  },

  async getStats(userId) {
    try {
      const leads = await this.getLeads();
      const userLeads = userId ? leads.filter(l => String(l.assignedTo) === String(userId)) : leads;
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
        convRate: userLeads.length > 0 ? ((userLeads.filter(l => l.status === 'Won').length / userLeads.length) * 100).toFixed(1) : "0.0",
      };
    } catch (err) {
      return { total: 0, new: 0, contacted: 0, qualified: 0, proposal: 0, won: 0, lost: 0, revenue: 0, pipeline: 0, convRate: "0.0" };
    }
  }
};

