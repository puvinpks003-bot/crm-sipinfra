# ☀️ SIP INFRA — Solar Panel Installation CRM

A complete, full-featured CRM web application for solar panel installation companies.  
Built as a **pure static SPA** — no build tools, no server, no installation required.

---

## 🚀 How to Run

### Option 1 — Zero install (just open the file)
```
Double-click:  index.html
```

### Option 2 — Serve locally with Python (recommended for full functionality)
```bash
cd "c:\Project\CRM - solar"
python -m http.server 8080
```
Then open **http://localhost:8080** in your browser.

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Tele-Caller** | `caller@sipinfra.in` | `demo1234` |
| **Manager** | `manager@sipinfra.in` | `demo1234` |
| **Admin** | `admin@sipinfra.in` | `demo1234` |

---

## 📁 Project Structure

```
CRM - solar/
├── index.html              ← Main entry point (open this)
├── requirements.txt        ← Dependency notes
├── README.md               ← This file
│
├── styles/
│   ├── main.css            ← Design system (colors, layout, login)
│   ├── components.css      ← Buttons, badges, cards, Kanban, charts
│   ├── pages.css           ← Page-specific layouts
│   └── animations.css      ← Keyframes & micro-animations
│
└── js/
    ├── data.js             ← 120 mock leads + external API simulation
    ├── utils.js            ← INR formatter, SVG charts, date helpers
    ├── auth.js             ← Role-based authentication
    ├── notifications.js    ← Real-time notification panel
    ├── leads.js            ← Lead management, call panel, drawer
    ├── pipeline.js         ← Kanban drag-and-drop pipeline
    ├── quotes.js           ← Quote builder (₹55,000/kW)
    ├── reports.js          ← Analytics & charts
    ├── schedule.js         ← Follow-up calendar
    ├── team.js             ← Team management
    ├── settings.js         ← System settings & API config
    └── app.js              ← Router, dashboard, toast system
```

---

## ✨ Features

### 📞 Tele-Caller Portal
- View assigned leads with status, temperature, system size
- Quick call panel — log outcome, save notes, change status
- WhatsApp compose with pre-filled solar proposal
- Follow-up date scheduler
- Quote generator (instant from lead data)

### 📊 Manager Portal
- Full team lead view with advanced filters
- Kanban pipeline board with drag-and-drop
- Team performance cards with target progress
- Bulk lead assignment across callers
- Reports & analytics dashboard

### ⚙️ Admin Portal
- All manager features +
- User management (add/edit/deactivate)
- API configuration (lead feed, webhooks)
- Twilio WhatsApp integration settings
- Pricing configuration
- System audit log

### 🔧 Advanced CRM Features
| Feature | Details |
|---------|---------|
| Lead Pipeline | New → Contacted → Qualified → Proposal Sent → Won / Lost |
| Quote Builder | Auto-calculates: ₹55,000/kW + 8% install + 12% GST − PM Subsidy |
| Follow-up Calendar | Full calendar view, overdue alerts, scheduling |
| Activity Timeline | Every call, note, WhatsApp, email logged per lead |
| Analytics | Monthly trend, conversion funnel, city revenue, temp analysis |
| Notification Center | Real-time alerts for new leads, overdue follow-ups, won deals |
| API Lead Simulation | New leads auto-appear every 45 seconds (simulating external API) |
| CSV Export | Export any filtered lead list as CSV |
| WhatsApp Compose | Pre-filled message with pricing, ready for Twilio |

---

## 💰 Pricing Configuration (Editable in Settings)

| Parameter | Default Value |
|-----------|--------------|
| Cost per kW | ₹55,000 |
| Installation | 8% of system cost |
| GST | 12% |
| PM Surya Ghar Subsidy | ₹14,588/kW (max ₹78,000) |
| Annual generation | 1,400 kWh/kW/year |
| Electricity rate | ₹8/unit |

---

## 🔌 Future Integration (Twilio WhatsApp)

To enable real WhatsApp sending, add credentials in **Settings → API Configuration → Twilio**:

```python
# Install: pip install twilio
from twilio.rest import Client

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
client.messages.create(
    from_='whatsapp:+14155238886',
    to=f'whatsapp:{customer_phone}',
    body=message_body
)
```

---

## 🌐 Browser Compatibility

| Browser | Version |
|---------|---------|
| Chrome  | 90+ ✅ |
| Firefox | 88+ ✅ |
| Edge    | 90+ ✅ |
| Safari  | 14+ ✅ |

---

## 📦 Technology Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | Vanilla CSS (CSS Custom Properties) |
| Logic | Vanilla JavaScript (ES2020+) |
| Fonts | Google Fonts — Inter + Space Grotesk |
| Icons | Unicode Emoji |
| Charts | Pure SVG (no library needed) |
| State | JavaScript closures + localStorage |
| Data | Mock JSON (swap with REST API) |

---

*SIP INFRA v2.0 — Built for solar installation companies serving KW and MW customers.*
