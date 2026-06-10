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
    ...(user.token ? { 'Authorization': `Bearer ${user.token}` } : {})
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
    if (!res.ok) {
      let errMsg = 'API Request Failed';
      if (data && typeof data === 'object') {
        if (data.detail) {
          errMsg = data.detail;
        } else if (data.error) {
          errMsg = data.error;
        } else {
          const errors = [];
          for (const key in data) {
            const val = data[key];
            const fieldLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
            if (Array.isArray(val)) {
              errors.push(`${fieldLabel}: ${val.join(', ')}`);
            } else if (typeof val === 'string') {
              errors.push(`${fieldLabel}: ${val}`);
            } else {
              errors.push(`${fieldLabel}: ${JSON.stringify(val)}`);
            }
          }
          if (errors.length > 0) {
            errMsg = errors.join(' | ');
          }
        }
      } else if (typeof data === 'string') {
        errMsg = data;
      }
      throw new Error(errMsg);
    }
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || 'Invalid credentials');
    
    // We get 'access' and 'refresh' tokens from SimpleJWT
    // Now we need to fetch user details using this token
    const userRes = await fetch(`${API_BASE}/accounts/users/me/`, {
      headers: { 'Authorization': `Bearer ${data.access}` }
    });
    
    let user = {};
    if (userRes.ok) {
        let dbUser = await userRes.json();
        user = {
            id: dbUser.id,
            name: dbUser.full_name || dbUser.username || 'User',
            email: dbUser.email || dbUser.username,
            role: dbUser.role || 'telecaller',
            avatar: dbUser.avatar || 'U',
            color: dbUser.color || '#3B82F6',
            team: dbUser.team || '',
            status: dbUser.status || 'active'
        };
    } else {
        // Fallback user if /users/me/ doesn't exist
        user = {
            id: 'a1',
            name: 'Admin User',
            email: email,
            role: 'admin',
            avatar: 'A',
            color: '#3B82F6'
        };
    }
    
    user.token = data.access; // Save token for future requests
    return user;
  },

  async signup(userData) {
    throw new Error('Signup disabled. Contact Admin to create account.');
  },

  async getLeads(filters = {}, limit = 50, offset = 0) {
    const params = new URLSearchParams({ limit, offset });
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.assignedTo && filters.assignedTo !== 'all') params.append('assigned_to', filters.assignedTo);
    if (filters.source && filters.source !== 'all') params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    
    let response = await this.fetchWithAuth(`${API_BASE}/leads/?${params.toString()}`);
    
    // Map Django snake_case to Legacy JS camelCase expected by old UI
    let mappedResults = (response.results || response).map(l => ({
        ...l,
        kwSize: l.kw_size || 0,
        netCost: l.estimated_value || 0,
        systemCost: l.estimated_value || 0,
        installCost: 0,
        gst: 0,
        subsidy: 0,
        systemType: l.system_type || 'Residential KW',
        assignedTo: l.assigned_to_id || l.assigned_to || null,
        createdAt: l.created_at,
        nextFollowUp: null, // we can map followups later if needed
        calls: 0
    }));

    return {
        count: response.count !== undefined ? response.count : mappedResults.length,
        results: mappedResults
    };
  },

  async getLead(id) {
    let l = await this.fetchWithAuth(`${API_BASE}/leads/${id}/`);
    return {
        ...l,
        kwSize: l.kw_size || 0,
        netCost: l.estimated_value || 0,
        systemCost: l.estimated_value || 0,
        installCost: 0,
        gst: 0,
        subsidy: 0,
        systemType: l.system_type || 'Residential KW',
        assignedTo: (l.assigned_to && l.assigned_to.id) ? l.assigned_to.id : l.assigned_to,
        createdAt: l.created_at,
        nextFollowUp: null,
        calls: 0,
        notes: (l.notes || []).map(n => ({ ...n, timestamp: n.created_at, text: n.text, addedBy: n.added_by_name }))
    };
  },

  async createLead(leadData) {
    const payload = {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email || '',
        city: leadData.city,
        address: leadData.address || '',
        pincode: leadData.pincode || '',
        kw_size: leadData.kwSize,
        system_type: leadData.systemType,
        source: leadData.source,
        estimated_value: leadData.netCost || (leadData.kwSize * 55000),
        assigned_to_id: leadData.assignedTo || null,
        status: leadData.status || 'New',
        temperature: leadData.temperature || 'Warm'
    };
    return await this.fetchWithAuth(`${API_BASE}/leads/`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateLead(id, data) {
    const payload = {};
    if (data.assignedTo !== undefined) payload.assigned_to_id = data.assignedTo;
    if (data.status) payload.status = data.status;
    if (data.nextFollowUp) payload.next_follow_up = data.nextFollowUp;
    if (data.calls !== undefined) payload.calls = data.calls;
    
    return await this.fetchWithAuth(`${API_BASE}/leads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
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
    let res = await this.fetchWithAuth(`${API_BASE}/activities/`);
    let acts = res.results || res || [];
    if (leadId) {
      acts = acts.filter(a => String(a.lead) === String(leadId) || String(a.leadId) === String(leadId));
    }
    return acts.map(a => ({
        ...a,
        leadId: a.lead,
        userId: a.user,
        data: a.metadata,
        timestamp: a.created_at
    }));
  },

  async createActivity(activityData) {
    const actType = activityData.type ? (activityData.type.charAt(0).toUpperCase() + activityData.type.slice(1)) : 'System';
    const payload = {
        lead: activityData.leadId,
        type: actType,
        user: activityData.userId,
        metadata: activityData.data,
        description: activityData.data ? JSON.stringify(activityData.data) : ''
    };
    return await this.fetchWithAuth(`${API_BASE}/activities/`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getNotifications() {
    let res = await this.fetchWithAuth(`${API_BASE}/notifications/`);
    return res.results || res || [];
  },

  async getTeam() {
    let res = await this.fetchWithAuth(`${API_BASE}/accounts/users/`);
    let users = res.results || res || [];
    return users.filter(u => u.role === 'telecaller');
  },

  async getUsers() {
    let res = await this.fetchWithAuth(`${API_BASE}/accounts/users/`);
    return res.results || res || [];
  },

  async createUser(userData) {
    const payload = {
        username: userData.email, // using email as username
        email: userData.email,
        password: userData.password,
        first_name: userData.name.split(' ')[0],
        last_name: userData.name.split(' ').slice(1).join(' ') || '',
        role: userData.role,
        phone: userData.phone || ''
    };
    return await this.fetchWithAuth(`${API_BASE}/accounts/users/`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getFollowUps(userId) {
    let res = await this.fetchWithAuth(`${API_BASE}/followups/`);
    let acts = res.results || res || [];
    acts.forEach(f => { f.leadId = f.lead; });
    if (userId) {
      acts = acts.filter(f => String(f.assignedTo) === String(userId));
    }
    return acts;
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
    let quotes = res.results || res || [];
    quotes.forEach(q => { q.id = q.quoteId; });
    return quotes;
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
      const [leadsRes, activities, followUps, quotes, users] = await Promise.all([
        safeFetch(this.getLeads({}, 1000, 0)), // Fetch up to 1000 globally for the legacy kanban/UI
        safeFetch(this.getActivities()),
        safeFetch(this.getFollowUps()),
        safeFetch(this.getQuotes()),
        safeFetch(this.getUsers())
      ]);
      window.LEADS = leadsRes.results || leadsRes || [];
      LEADS = window.LEADS;
      window.ACTIVITIES = activities || [];
      ACTIVITIES = window.ACTIVITIES;
      window.FOLLOW_UPS = followUps || [];
      FOLLOW_UPS = window.FOLLOW_UPS;
      window.QUOTES = quotes || [];
      QUOTES = window.QUOTES;
      window.USERS = users || [];
      USERS = window.USERS;
    } catch (err) {
      console.error("Global synchronization failed:", err);
    }
  },

  async getStats(userId) {
    try {
      const leadsRes = await this.getLeads({}, 500, 0); // Fetch up to 500 for stats
      const leads = leadsRes.results || leadsRes || [];
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

