const API_BASE = 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
    }

    setTokens(access, refresh) {
        this.token = access;
        this.refreshToken = refresh;
        if (access) localStorage.setItem('access_token', access);
        else localStorage.removeItem('access_token');
        
        if (refresh) localStorage.setItem('refresh_token', refresh);
        else localStorage.removeItem('refresh_token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            let response = await fetch(url, config);

            // Handle 401 Unauthorized (Token Expiration)
            if (response.status === 401 && this.refreshToken) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    headers['Authorization'] = `Bearer ${this.token}`;
                    response = await fetch(url, { ...config, headers });
                } else {
                    this.setTokens(null, null);
                    window.location.hash = '#login';
                    throw new Error("Session expired. Please login again.");
                }
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw { status: response.status, data: errData };
            }

            // Return JSON if present, else null
            const text = await response.text();
            return text ? JSON.parse(text) : null;

        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    }

    async refreshAccessToken() {
        try {
            const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: this.refreshToken })
            });
            if (res.ok) {
                const data = await res.json();
                this.setTokens(data.access, this.refreshToken);
                return True;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    // CRUD Helpers
    get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
    post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
    put(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
    patch(endpoint, data) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiService();
