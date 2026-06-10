// ============================================================
// SOLAR CRM — QUOTES MODULE
// Quote builder with auto-pricing ₹55,000/kW
// ============================================================

const QuotesModule = {
  currentQuote: null,
  quotes: [],

  async init() {
    this.quotes = await MockAPI.getQuotes();
  },

  // ── Quotes List Page ───────────────────────────────────────
  renderQuotesList() {
    const quotesList = this.quotes || [];
    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">📄 Quotes & Proposals</h1>
          <p class="page-subtitle">${quotesList.length} quotes generated</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" onclick="QuotesModule.renderBuilderPage()">✨ New Quote</button>
        </div>
      </div>

      <!-- Quotes Table -->
      <div class="card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>System</th>
                <th>Total Value</th>
                <th>Net Cost</th>
                <th>Payback</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${quotesList.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align:center;color:var(--text-muted);padding:24px;">No quotes generated yet.</td>
                </tr>
              ` : quotesList.map(q => {
                const caller = Utils.getUser(q.createdBy);
                return `<tr onclick="QuotesModule.showQuoteDetail('${q.id}')">
                  <td><span style="color:var(--gold-400);font-weight:700;">${q.id}</span></td>
                  <td>${q.leadName}<br><span style="font-size:11px;color:var(--text-muted);">${q.leadCity}</span></td>
                  <td>${Utils.systemBadge(q.systemType)} ${Utils.formatKW(q.kwSize)}</td>
                  <td style="color:var(--text-primary);font-weight:600;">${Utils.formatINR(q.totalCost)}</td>
                  <td style="color:var(--gold-400);font-weight:700;">${Utils.formatINR(q.netCost)}</td>
                  <td style="color:var(--teal-400);">${q.paybackYears} yrs</td>
                  <td><span class="badge ${q.status==='Accepted'?'badge-won':'badge-proposal'}">${q.status}</span></td>
                  <td style="font-size:12px;color:var(--text-muted);">${Utils.formatDate(q.createdAt)}</td>
                  <td onclick="event.stopPropagation()">
                    <div class="lead-actions">
                      <button class="lead-action-btn" onclick="QuotesModule.showQuoteDetail('${q.id}')" title="View">👁</button>
                      <button class="lead-action-btn" onclick="QuotesModule.printQuote('${q.id}')" title="Print">🖨</button>
                      <button class="lead-action-btn" onclick="QuotesModule.sendQuote('${q.id}')" title="Send">💬</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ── Quote Builder ──────────────────────────────────────────
  renderBuilderPage(prefill = {}) {
    const leads = (window.LEADS || []).filter(l => l.status !== 'Lost');
    document.getElementById('page-content').innerHTML = this.renderBuilderHTML(prefill, leads);
    this.updateQuotePreview();
  },

  renderBuilderHTML(prefill = {}, leads = []) {
    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">✨ Quote Builder</h1>
          <p class="page-subtitle">Generate professional solar proposals instantly</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary" onclick="QuotesModule.init().then(()=>window.APP.showPage('quotes'))">← Back to Quotes</button>
        </div>
      </div>

      <div class="quote-layout">
        <!-- Builder Form -->
        <div class="quote-form-panel">
          <div class="quote-section">
            <div class="quote-section-title">Customer Information</div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <div class="field">
                <label>Select from Leads</label>
                <select id="q-lead-select" onchange="QuotesModule.fillFromLead(this.value)">
                  <option value="">— Select a lead or enter manually —</option>
                  ${leads.map(l => `<option value="${l.id}" ${prefill.leadId===l.id?'selected':''}>${l.name} (${l.phone}) — ${Utils.formatKW(l.kwSize)}</option>`).join('')}
                </select>
              </div>
              <div class="form-row">
                <div class="field"><label>Customer Name *</label><input type="text" id="q-name" placeholder="Full name" value="${prefill.name||''}" oninput="QuotesModule.updatePreview()" /></div>
                <div class="field"><label>Phone</label><input type="tel" id="q-phone" placeholder="Mobile number" value="${prefill.phone||''}" /></div>
              </div>
              <div class="form-row">
                <div class="field"><label>Email</label><input type="email" id="q-email" placeholder="Email address" value="${prefill.email||''}" /></div>
                <div class="field"><label>City</label><input type="text" id="q-city" placeholder="City" value="${prefill.city||''}" /></div>
              </div>
              <div class="field"><label>Address</label><input type="text" id="q-address" placeholder="Installation address" value="${prefill.address||''}" /></div>
            </div>
          </div>

          <div class="quote-section">
            <div class="quote-section-title">System Configuration</div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <div class="form-row">
                <div class="field">
                  <label>System Type</label>
                  <select id="q-type" onchange="QuotesModule.updateQuotePreview()">
                    ${SYSTEM_TYPES.map(t => `<option value="${t}" ${prefill.systemType===t?'selected':''}>${t}</option>`).join('')}
                  </select>
                </div>
                <div class="field">
                  <label>Project Category</label>
                  <select id="q-category" onchange="QuotesModule.updateQuotePreview()">
                    <option value="residential" selected>Residential (Subsidy)</option>
                    <option value="commercial">Commercial (Depreciation)</option>
                    <option value="industrial">Industrial (Depreciation)</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="field">
                  <label>System Size (kW)</label>
                  <input type="number" id="q-kw" min="1" max="10000" step="0.5" value="${prefill.kwSize||5}" oninput="QuotesModule.updateQuotePreview()" />
                </div>
                <div class="field">
                  <label>Panel Brand</label>
                  <select id="q-brand">
                    <option>Tata Solar</option>
                    <option>Waaree</option>
                    <option>Adani Solar</option>
                    <option>Vikram Solar</option>
                    <option>RenewSys</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="field">
                  <label>Inverter Brand</label>
                  <select id="q-inverter">
                    <option>SolarEdge</option>
                    <option>Fronius</option>
                    <option>Sungrow</option>
                    <option>ABB</option>
                    <option>Delta</option>
                  </select>
                </div>
                <div class="field">
                  <label>Mounting Type</label>
                  <select id="q-mount">
                    <option>Rooftop</option>
                    <option>Ground Mount</option>
                    <option>Carport</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="field">
                  <label>Warranty (Years)</label>
                  <select id="q-warranty">
                    <option value="5">5 Years</option>
                    <option value="10" selected>10 Years</option>
                    <option value="25">25 Years</option>
                  </select>
                </div>
                <div class="field">
                  <label>Apply PM Subsidy</label>
                  <select id="q-subsidy" onchange="QuotesModule.updateQuotePreview()">
                    <option value="yes">Yes (PM Surya Ghar Scheme)</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="field">
                  <label>Financing Option</label>
                  <select id="q-finance">
                    <option value="cash">Full Payment</option>
                    <option value="emi">EMI (0% for 12 months)</option>
                    <option value="loan">Solar Loan (8.5% p.a.)</option>
                  </select>
                </div>
                <div class="field">
                  <label>Corporate Tax Rate (%)</label>
                  <input type="number" id="q-tax-rate" min="0" max="40" value="25" oninput="QuotesModule.updateQuotePreview()" />
                </div>
              </div>
              <div class="field">
                <label>Additional Notes</label>
                <textarea id="q-notes" placeholder="Special requirements, discounts, terms..." style="min-height:70px;"></textarea>
              </div>
            </div>
          </div>

          <div class="quote-actions">
            <button class="btn btn-primary" onclick="QuotesModule.saveQuote()">💾 Save Quote</button>
            <button class="btn btn-teal" onclick="QuotesModule.printCurrentQuote()">🖨 Print / PDF</button>
            <button class="btn btn-secondary" onclick="QuotesModule.sendCurrentQuote()">💬 Send to Customer</button>
          </div>
        </div>

        <!-- Live Preview -->
        <div class="quote-preview-panel">
          <div id="quote-preview-box"></div>
        </div>
      </div>
    `;
  },

  fillFromLead(leadId) {
    if (!leadId) return;
    const lead = (window.LEADS || []).find(l => String(l.id) === String(leadId));
    if (!lead) return;
    document.getElementById('q-name').value    = lead.name;
    document.getElementById('q-phone').value   = lead.phone;
    document.getElementById('q-email').value   = lead.email;
    document.getElementById('q-city').value    = lead.city;
    document.getElementById('q-address').value = lead.address || '';
    document.getElementById('q-kw').value      = lead.kwSize;
    document.getElementById('q-type').value    = lead.systemType;
    this.updateQuotePreview();
  },

  openFromLead(leadId) {
    const lead = (window.LEADS || []).find(l => String(l.id) === String(leadId));
    if (!lead) return;
    window.APP.showPage('quotes');
    setTimeout(() => this.renderBuilderPage(lead), 100);
  },

  calcQuote() {
    const kw = parseFloat(document.getElementById('q-kw')?.value) || 5;
    const category = document.getElementById('q-category')?.value || 'residential';
    const isCommercial = category === 'commercial' || category === 'industrial';
    
    // Scale pricing based on size
    let costPerKW = PRICING.costPerKW;
    if (kw > 50) costPerKW = costPerKW * 0.85; // Volume discount
    if (kw > 500) costPerKW = costPerKW * 0.75; // MW scale discount

    const systemCost    = Math.round(kw * costPerKW);
    const installCost   = Math.round(systemCost * PRICING.installationPercent);
    const totalBefore   = systemCost + installCost;
    const gst           = Math.round(totalBefore * PRICING.gstRate);
    const totalCost     = totalBefore + gst;
    
    let subsidy = 0;
    let depreciationBenefit = 0;
    
    if (!isCommercial) {
        const applySubsidy  = document.getElementById('q-subsidy')?.value !== 'no';
        subsidy = applySubsidy ? Math.min(Math.round(kw * PRICING.subsidyPerKW), 78000) : 0;
    } else {
        // Accelerated Depreciation logic (40% Year 1)
        const taxRate = (parseFloat(document.getElementById('q-tax-rate')?.value) || 25) / 100;
        depreciationBenefit = Math.round(totalCost * 0.40 * taxRate);
    }
    
    const netCost       = totalCost - subsidy - depreciationBenefit;
    const annualGen     = Math.round(kw * PRICING.annualGenPerKW);
    
    // Commercial electricity is more expensive
    const elecCost      = isCommercial ? 9.5 : PRICING.electricityCostPerUnit;
    const annualSaving  = Math.round(annualGen * elecCost);
    const payback       = (netCost / annualSaving).toFixed(1);
    const co2Saving     = Math.round(annualGen * 0.82); // kg CO2/kWh

    return { kw, systemCost, installCost, gst, totalCost, subsidy, depreciationBenefit, isCommercial, netCost, annualGen, annualSaving, payback, co2Saving, elecCost };
  },

  updatePreview() { this.updateQuotePreview(); },

  updateQuotePreview() {
    const box = document.getElementById('quote-preview-box');
    if (!box) return;
    const q = this.calcQuote();
    const name    = document.getElementById('q-name')?.value  || 'Customer Name';
    const city    = document.getElementById('q-city')?.value  || 'City';
    const type    = document.getElementById('q-type')?.value  || 'Residential KW';
    const brand   = document.getElementById('q-brand')?.value || 'Tata Solar';
    const inv     = document.getElementById('q-inverter')?.value || 'Fronius';
    const mount   = document.getElementById('q-mount')?.value || 'Rooftop';
    const warranty= document.getElementById('q-warranty')?.value || '10';
    const finance = document.getElementById('q-finance')?.value || 'cash';
    const quoteNum= 'Q' + (2024000 + (window.QUOTES || []).length + 1);
    const today   = Utils.formatDate(new Date().toISOString());
    const validTil= Utils.formatDate(new Date(Date.now() + 30*86400000).toISOString());

    box.innerHTML = this.buildQuoteHTML({ q, name, city, type, brand, inv, mount, warranty, finance, quoteNum, today, validTil });
  },

  buildQuoteHTML({ q, name, city, type, brand, inv, mount, warranty, finance, quoteNum, today, validTil }) {
    const emiAmt = finance === 'emi' ? Utils.formatINR(Math.round(q.netCost / 12)) + '/mo' : null;
    return `
      <div class="quote-preview" id="printable-quote">
        <div class="quote-header">
          <div class="quote-logo-row">
            <div>
              <div class="quote-company">☀️ SIP INFRA</div>
              <div style="font-size:12px;color:var(--text-muted);">Professional Solar Solutions</div>
              <div style="font-size:11px;color:var(--text-muted);">📧 info@sipinfra.in | 📞 1800-SOLAR-99</div>
            </div>
            <div style="text-align:right;">
              <div class="quote-id" style="font-size:16px;font-weight:700;color:var(--gold-400);">${quoteNum}</div>
              <div style="font-size:11px;color:var(--text-muted);">Date: ${today}</div>
              <div style="font-size:11px;color:var(--text-muted);">Valid Till: ${validTil}</div>
              <span class="badge badge-${q.subsidy > 0 ? 'won' : 'new'} mt-4">${q.subsidy > 0 ? '✅ Subsidy Applied' : 'No Subsidy'}</span>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:var(--radius-md);padding:12px 16px;">
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);">${name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${city}</div>
          </div>
        </div>

        <div class="quote-body">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">${Utils.formatKW(q.kw)} ${type} Solar System</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">${brand} Panels • ${inv} Inverter • ${mount} Mounting • ${warranty} Year Warranty</div>

          <table class="quote-table">
            <thead>
              <tr><th>Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${brand} Solar Panels (${Math.round(q.kw * 250)}W each)</td>
                <td>Panel</td>
                <td>${Math.ceil(q.kw * 4)}</td>
                <td>₹${(PRICING.costPerKW * 0.55).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(q.systemCost * 0.55).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>${inv} Grid-Tie Inverter (${q.kw}kW)</td>
                <td>Unit</td>
                <td>1</td>
                <td>₹${Math.round(q.systemCost * 0.25).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(q.systemCost * 0.25).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Mounting Structure (${mount})</td>
                <td>Set</td>
                <td>1</td>
                <td>₹${Math.round(q.systemCost * 0.1).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(q.systemCost * 0.1).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Wiring, DC/AC Cables, Safety Equipment</td>
                <td>Set</td>
                <td>1</td>
                <td>₹${Math.round(q.systemCost * 0.1).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(q.systemCost * 0.1).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Installation & Commissioning</td>
                <td>Service</td>
                <td>1</td>
                <td>—</td>
                <td>₹${q.installCost.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="background:rgba(255,255,255,0.03);">
                <td colspan="4" style="font-weight:600;">Subtotal</td>
                <td style="font-weight:700;">₹${(q.systemCost + q.installCost).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="4">GST @ 12%</td>
                <td>₹${q.gst.toLocaleString('en-IN')}</td>
              </tr>
              <tr class="quote-total-row">
                <td colspan="4" style="font-size:14px;">TOTAL (incl. GST)</td>
                <td>₹${q.totalCost.toLocaleString('en-IN')}</td>
              </tr>
              ${!q.isCommercial && q.subsidy > 0 ? `
              <tr>
                <td colspan="4" style="color:var(--green-400);">PM Surya Ghar Subsidy</td>
                <td style="color:var(--green-400);">-₹${q.subsidy.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              ${q.isCommercial && q.depreciationBenefit > 0 ? `
              <tr>
                <td colspan="4" style="color:var(--green-400);">Accelerated Depreciation Benefit (Year 1)</td>
                <td style="color:var(--green-400);">-₹${q.depreciationBenefit.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr class="quote-total-row">
                <td colspan="4" style="font-size:15px;">NET EFFECTIVE COST</td>
                <td style="font-size:17px;">₹${q.netCost.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          ${finance !== 'cash' ? `
          <div style="background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.2);border-radius:var(--radius-md);padding:12px;margin:12px 0;">
            <div style="font-size:13px;font-weight:600;color:var(--teal-400);">${finance === 'emi' ? `💳 EMI Option: ${emiAmt} × 12 months (0% Interest)` : `🏦 Solar Loan: ₹${Math.round(q.netCost * 0.1).toLocaleString('en-IN')}/mo @ 8.5% p.a.`}</div>
          </div>` : ''}

          <!-- ROI Section -->
          <div style="background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(45,212,191,0.06));border:1px solid var(--border-gold);border-radius:var(--radius-md);padding:16px;margin-top:16px;">
            <div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:12px;">📊 INVESTMENT RETURNS</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
              <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);padding:12px;">
                <div style="font-size:20px;font-weight:800;color:var(--gold-400);">${q.annualGen.toLocaleString('en-IN')}</div>
                <div style="font-size:11px;color:var(--text-muted);">Units/Year Generated</div>
              </div>
              <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);padding:12px;">
                <div style="font-size:20px;font-weight:800;color:var(--green-400);">₹${q.annualSaving.toLocaleString('en-IN')}</div>
                <div style="font-size:11px;color:var(--text-muted);">Annual Savings</div>
              </div>
              <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);padding:12px;">
                <div style="font-size:20px;font-weight:800;color:var(--teal-400);">${q.payback} Yrs</div>
                <div style="font-size:11px;color:var(--text-muted);">Payback Period</div>
              </div>
              <div style="text-align:center;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);padding:12px;">
                <div style="font-size:20px;font-weight:800;color:var(--purple-400);">${q.co2Saving.toLocaleString('en-IN')} kg</div>
                <div style="font-size:11px;color:var(--text-muted);">CO₂ Saved/Year</div>
              </div>
            </div>
            <div style="margin-top:12px;text-align:center;font-size:13px;color:var(--text-muted);">
              25-year total savings: <strong style="color:var(--gold-400);">${Utils.formatINR(q.annualSaving * 25)}</strong> | 
              ROI: <strong style="color:var(--green-400);">${((q.annualSaving * 25 - q.netCost) / q.netCost * 100).toFixed(0)}%</strong>
            </div>
          </div>

          <div style="margin-top:16px;font-size:11px;color:var(--text-muted);line-height:1.6;border-top:1px solid var(--border);padding-top:12px;">
            <strong>Terms:</strong> This quote is valid for 30 days. Prices subject to change. Installation includes 1-year workmanship warranty. Panel manufacturer warranty ${warranty} years. Government subsidy subject to approval.
          </div>
        </div>
      </div>
    `;
  },

  // ── Mini Quote in Lead Drawer ──────────────────────────────
  renderMiniQuote(lead) {
    const isCommercial = lead.systemType && (lead.systemType.toLowerCase().includes('commercial') || lead.systemType.toLowerCase().includes('industrial'));
    const elecCost = isCommercial ? 9.5 : PRICING.electricityCostPerUnit;
    const taxRate = 0.25; // default 25% corporate tax
    const depBenefit = isCommercial ? Math.round(lead.totalCost * 0.40 * taxRate) : 0;
    const netCost = lead.totalCost - (isCommercial ? depBenefit : lead.subsidy);
    
    return `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;">Auto-Calculated Quote</div>
          <button class="btn btn-primary btn-sm" onclick="QuotesModule.openFromLead('${lead.id}');closeDrawer()">Open Full Builder</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${[
            ['System Size', Utils.formatKW(lead.kwSize), 'var(--gold-400)'],
            ['System Cost', Utils.formatINR(lead.systemCost), 'var(--text-primary)'],
            ['Installation (8%)', Utils.formatINR(lead.installCost), 'var(--text-primary)'],
            ['GST (12%)', Utils.formatINR(lead.gst), 'var(--text-primary)'],
            ['Total Cost', Utils.formatINR(lead.totalCost), 'var(--text-primary)'],
            isCommercial ? ['Depreciation (40%)', '-' + Utils.formatINR(depBenefit), 'var(--green-400)'] : ['PM Subsidy', '-' + Utils.formatINR(lead.subsidy), 'var(--green-400)'],
          ].map(([l,v,c]) => `
            <div style="background:var(--bg-elevated);border-radius:var(--radius-md);padding:10px;">
              <div style="font-size:11px;color:var(--text-muted);">${l}</div>
              <div style="font-size:15px;font-weight:700;color:${c};">${v}</div>
            </div>
          `).join('')}
        </div>
        <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-lg);padding:16px;text-align:center;margin-top:12px;">
          <div style="font-size:12px;color:var(--text-muted);">NET EFFECTIVE COST</div>
          <div style="font-size:28px;font-weight:800;color:var(--gold-400);">${Utils.formatINR(netCost)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
            Annual Saving: <strong style="color:var(--green-400);">₹${Math.round(lead.kwSize * PRICING.annualGenPerKW * elecCost).toLocaleString('en-IN')}</strong> | 
            Payback: <strong style="color:var(--teal-400);">${(netCost / (lead.kwSize * PRICING.annualGenPerKW * elecCost)).toFixed(1)} yrs</strong>
          </div>
        </div>
      </div>
    `;
  },

  showQuoteDetail(id) {
    const q = (this.quotes || []).find(q => q.id === id);
    if (!q) return;
    const html = this.buildQuoteHTML({
      q: { kw: q.kwSize, systemCost: q.systemCost, installCost: q.installCost, gst: q.gst, totalCost: q.totalCost, subsidy: q.subsidy, netCost: q.netCost, annualGen: q.annualGeneration, annualSaving: q.annualSaving, payback: q.paybackYears, co2Saving: Math.round(q.annualGeneration * 0.82) },
      name: q.leadName, city: q.leadCity, type: q.systemType,
      brand: 'Tata Solar', inv: 'Fronius', mount: 'Rooftop', warranty: '10',
      finance: 'cash', quoteNum: q.id, today: Utils.formatDate(q.createdAt), validTil: Utils.formatDate(q.validUntil)
    });
    showModal(`📄 Quote ${q.id}`, html + `<div style="display:flex;gap:8px;margin-top:16px;"><button class="btn btn-primary" onclick="QuotesModule.printCurrentQuote()">🖨 Print</button><button class="btn btn-teal" onclick="closeModal()">✕ Close</button></div>`);
  },

  async saveQuote() {
    const name = document.getElementById('q-name')?.value?.trim();
    if (!name) { window.APP.showToast('error','⚠️','Customer name is required'); return; }
    const q = this.calcQuote();
    const newQ = {
      quoteId: Utils.quoteId(),
      leadName: name,
      leadCity: document.getElementById('q-city')?.value || '',
      leadPhone: document.getElementById('q-phone')?.value || '',
      kwSize: q.kw,
      systemType: document.getElementById('q-type')?.value || '',
      systemCost: q.systemCost,
      installCost: q.installCost,
      gst: q.gst,
      totalCost: q.totalCost,
      subsidy: q.subsidy,
      netCost: q.netCost,
      annualGeneration: q.annualGen,
      annualSaving: q.annualSaving,
      paybackYears: parseFloat(q.payback),
      co2Saving: q.co2Saving,
      validUntil: new Date(Date.now()+30*86400000).toISOString(),
      status: 'Pending',
      createdBy: Auth.currentUser.id,
    };
    try {
      const savedQuote = await MockAPI.createQuote(newQ);
      QUOTES.unshift(savedQuote);
      this.quotes = QUOTES;
      window.APP.showToast('success','💾 Quote Saved', `${savedQuote.quoteId} — ${Utils.formatINR(q.netCost)}`);
      window.APP.showPage('quotes');
    } catch (err) {
      window.APP.showToast('error', '❌ Error Saving Quote', err.message);
    }
  },

  printCurrentQuote() {
    const box = document.getElementById('printable-quote');
    if (!box) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Quote</title><style>body{font-family:Arial,sans-serif;padding:20px;background:#fff;color:#000;} table{width:100%;border-collapse:collapse;} th,td{padding:8px;border:1px solid #ccc;text-align:left;}</style></head><body>${box.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  },

  printQuote(id) { this.showQuoteDetail(id); setTimeout(() => this.printCurrentQuote(), 500); },

  sendCurrentQuote() {
    window.APP.showToast('success','💬 Quote Sent', 'Proposal sent to customer via WhatsApp & Email');
  },

  sendQuote(id) {
    const q = (this.quotes || []).find(q => q.id === id);
    window.APP.showToast('success','💬 Quote Sent', `${q?.id} sent to ${q?.leadName}`);
  },
};
