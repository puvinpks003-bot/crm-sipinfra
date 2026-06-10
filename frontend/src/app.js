import { store } from './store/index.js';
import { api } from './services/api.js';

class AppRouter {
    constructor() {
        this.routes = {
            'login': this.renderLogin.bind(this),
            'dashboard': this.renderDashboard.bind(this),
            // We will migrate other pages component by component
        };

        window.addEventListener('hashchange', () => this.handleRoute());
    }

    async init() {
        if (!api.token) {
            if (window.location.hash !== '#login') {
                window.location.hash = '#login';
            } else {
                this.handleRoute();
            }
            return;
        }

        try {
            // Verify token / fetch user info
            // For now, if we have a token, we assume we're logged in.
            // In a full implementation, we'd fetch `/api/users/me/`
            if (!window.location.hash || window.location.hash === '#login') {
                window.location.hash = '#dashboard';
            } else {
                this.handleRoute();
            }
        } catch (error) {
            window.location.hash = '#login';
        }
    }

    handleRoute() {
        const hash = window.location.hash.replace('#', '') || 'login';
        const route = this.routes[hash] || this.routes['dashboard'];
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = ''; // Clear loader
        route(appDiv);
    }

    renderLogin(container) {
        container.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                .login-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
                    font-family: 'Inter', sans-serif;
                }
                .login-card {
                    background: #ffffff;
                    width: 100%;
                    max-width: 420px;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05);
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                }
                .login-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 6px;
                    background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
                }
                .brand-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .brand-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                }
                .brand-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                }
                .brand-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                }
                .input-group {
                    margin-bottom: 20px;
                }
                .input-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 8px;
                }
                .input-field {
                    width: 100%;
                    padding: 14px 16px;
                    font-size: 15px;
                    color: #0f172a;
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 10px;
                    outline: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                .input-field:focus {
                    background: #ffffff;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .submit-btn {
                    width: 100%;
                    padding: 14px 16px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    background: #2563eb;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    font-family: 'Inter', sans-serif;
                }
                .submit-btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }
                .submit-btn:active {
                    transform: translateY(1px);
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
                }
            </style>
            
            <div class="login-wrapper">
                <div class="login-card">
                    <div class="brand-header">
                        <div class="brand-icon">☀️</div>
                        <h1 class="brand-title">SIP INFRA</h1>
                        <p class="brand-subtitle">Enterprise CRM Login</p>
                    </div>
                    <form id="login-form">
                        <div class="input-group">
                            <label class="input-label" for="email">Email Address</label>
                            <input type="email" id="email" class="input-field" placeholder="admin@sipinfra.in" required>
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="password">Password</label>
                            <input type="password" id="password" class="input-field" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="submit-btn" id="submit-btn">Sign In</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Signing In...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            try {
                const res = await api.post('/auth/token/', {
                    username: e.target.email.value,
                    password: e.target.password.value
                });
                api.setTokens(res.access, res.refresh);
                window.location.hash = '#dashboard';
            } catch (err) {
                alert("Login Failed: Invalid credentials");
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
    }

    renderDashboard(container) {
        container.innerHTML = `
            <style>
                :root {
                    --sidebar-width: 260px;
                    --header-height: 64px;
                    --bg-main: #f8fafc;
                    --bg-sidebar: #0f172a;
                    --text-sidebar: #94a3b8;
                    --text-sidebar-hover: #ffffff;
                    --primary: #3b82f6;
                    --border-color: #e2e8f0;
                }
                .dashboard-wrapper {
                    display: flex;
                    height: 100vh;
                    overflow: hidden;
                    background: var(--bg-main);
                    font-family: 'Inter', sans-serif;
                }
                .sidebar {
                    width: var(--sidebar-width);
                    background: var(--bg-sidebar);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                    z-index: 10;
                }
                .sidebar-header {
                    height: var(--header-height);
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    font-weight: 700;
                    font-size: 20px;
                    letter-spacing: 1px;
                }
                .sidebar-nav {
                    flex: 1;
                    padding: 24px 12px;
                    overflow-y: auto;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    color: var(--text-sidebar);
                    border-radius: 8px;
                    margin-bottom: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    font-weight: 500;
                }
                .nav-item:hover, .nav-item.active {
                    background: rgba(255,255,255,0.1);
                    color: var(--text-sidebar-hover);
                }
                .nav-icon {
                    margin-right: 12px;
                    font-size: 18px;
                }
                .main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .top-header {
                    height: var(--header-height);
                    background: #ffffff;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    z-index: 5;
                }
                .header-search {
                    display: flex;
                    align-items: center;
                    background: #f1f5f9;
                    border-radius: 8px;
                    padding: 8px 16px;
                    width: 300px;
                }
                .header-search input {
                    border: none;
                    background: transparent;
                    outline: none;
                    margin-left: 8px;
                    width: 100%;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .action-btn {
                    background: transparent;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #64748b;
                    position: relative;
                    transition: color 0.2s;
                }
                .action-btn:hover { color: #0f172a; }
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    padding-left: 16px;
                    border-left: 1px solid var(--border-color);
                }
                .avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                }
                .page-container {
                    flex: 1;
                    padding: 32px;
                    overflow-y: auto;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .page-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .primary-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
                    transition: all 0.2s;
                }
                .primary-btn:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }
                
                /* Stats Grid Demo */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .stat-card {
                    background: white;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid var(--border-color);
                }
                .stat-title {
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }
                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                }
            </style>

            <div class="dashboard-wrapper">
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <span style="color:var(--primary);margin-right:8px;">☀️</span> SIP INFRA
                    </div>
                    <nav class="sidebar-nav">
                        <div class="nav-item active"><span class="nav-icon">📊</span> Dashboard</div>
                        <div class="nav-item"><span class="nav-icon">👥</span> Leads Hub</div>
                        <div class="nav-item"><span class="nav-icon">🔄</span> Pipeline Kanban</div>
                        <div class="nav-item"><span class="nav-icon">📄</span> Quotes & Proposals</div>
                        <div class="nav-item"><span class="nav-icon">📅</span> Site Surveys</div>
                        <div class="nav-item"><span class="nav-icon">📈</span> Reports</div>
                        
                        <div style="margin: 32px 16px 8px; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase;">Preferences</div>
                        <div class="nav-item"><span class="nav-icon">⚙️</span> Settings</div>
                        <div class="nav-item" id="nav-logout"><span class="nav-icon">🚪</span> Logout</div>
                    </nav>
                </aside>
                
                <main class="main-content">
                    <header class="top-header">
                        <div class="header-search">
                            🔍 <input type="text" placeholder="Search across all modules...">
                        </div>
                        <div class="header-actions">
                            <button class="action-btn">🔔<span style="position:absolute;top:0;right:0;width:8px;height:8px;background:#ef4444;border-radius:50%;"></span></button>
                            <button class="action-btn">💬</button>
                            <div class="user-profile">
                                <div style="text-align:right;">
                                    <div style="font-size:14px;font-weight:600;color:#0f172a;">Admin User</div>
                                    <div style="font-size:12px;color:#64748b;">System Admin</div>
                                </div>
                                <div class="avatar">A</div>
                            </div>
                        </div>
                    </header>
                    
                    <div class="page-container" id="page-container">
                        <div class="page-header">
                            <h2 class="page-title">Executive Dashboard</h2>
                            <button class="primary-btn"><span>➕</span> Create Lead</button>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-title">Total Active Leads</div>
                                <div class="stat-value">1,248</div>
                                <div style="color:#10b981;font-size:13px;margin-top:8px;font-weight:500;">↑ 12% this week</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">Pipeline Value (kW)</div>
                                <div class="stat-value">345 kW</div>
                                <div style="color:#10b981;font-size:13px;margin-top:8px;font-weight:500;">↑ 5% this week</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">Pending Surveys</div>
                                <div class="stat-value">18</div>
                                <div style="color:#f59e0b;font-size:13px;margin-top:8px;font-weight:500;">Action required</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">Revenue Generated</div>
                                <div class="stat-value">₹4.2 Cr</div>
                                <div style="color:#10b981;font-size:13px;margin-top:8px;font-weight:500;">↑ 22% this month</div>
                            </div>
                        </div>
                        
                        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);height:400px;display:flex;align-items:center;justify-content:center;color:#94a3b8;flex-direction:column;">
                            <div style="font-size:48px;margin-bottom:16px;">📈</div>
                            <h3>Analytics Engine initializing...</h3>
                            <p style="margin-top:8px;color:#cbd5e1;">Real-time pipeline data will appear here.</p>
                        </div>
                    </div>
                </main>
            </div>
        `;

        document.getElementById('nav-logout').addEventListener('click', () => {
            api.setTokens(null, null);
            window.location.hash = '#login';
            window.location.reload();
        });
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    const router = new AppRouter();
    router.init();
});
