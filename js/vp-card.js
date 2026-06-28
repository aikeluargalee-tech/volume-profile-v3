// vp-card.js — Volume Profile V3.0 Card Decision Engine
// Reads vp_card.json, auto-computes shape/state, renders card grid

const VP_JSON_PATH = './data/vp_card.json';

// ── Shape config with visual explanations ─────────
const SHAPE_CONFIG = {
  D: { cls: 'shape--D', label: 'Balanced Range (D)',    desc: 'Volume centered (looks like D) — buy floor, sell ceiling' },
  P: { cls: 'shape--P', label: 'Bullish Trend (P)',  desc: 'Volume high (looks like P) — buy pullback, follow breakout' },
  b: { cls: 'shape--b', label: 'Bearish Trend (b)', desc: 'Volume low (looks like b) — sell rally, follow breakdown' },
  B: { cls: 'shape--B', label: 'Double Range (B)',  desc: 'Two volume peaks (looks like B) — volatile, wait for breakout' },
};

// ── Auto-compute shape from pipeline data ─────────
function computeShape(d) {
  const { btc_price, vah, val, consecutive_closes_outside_va: closes } = d;
  if (closes >= 2 && btc_price > vah) return 'P';
  if (closes >= 2 && btc_price < val) return 'b';
  if (btc_price >= val && btc_price <= vah && closes < 2) return 'D';
  return d.shape || 'D'; // fallback
}

// ── Auto-compute accept/reject state ──────────────
function computeState(d) {
  const closes = d.consecutive_closes_outside_va;
  if (closes >= 2 && d.btc_price > d.vah) return 'REJECTION_UP';
  if (closes >= 2 && d.btc_price < d.val) return 'REJECTION_DOWN';
  return 'ACCEPTANCE';
}

// ── Probability tier pill ─────────────────────────
function probPill(tier) {
  const tips = {
    VERY_HIGH:  'Very high signal conviction — multiple structural confluences',
    HIGH:       'High signal conviction',
    REINFORCED: 'Signal reinforced by extra factors',
    BASELINE:   'Standard baseline signal',
  };
  const map = {
    VERY_HIGH:  ['pill--very-high',  'VERY HIGH SIGNAL'],
    HIGH:       ['pill--high',       'HIGH SIGNAL'],
    REINFORCED: ['pill--reinforced', 'REINFORCED SIGNAL'],
    BASELINE:   ['pill--baseline',   'STANDARD SIGNAL'],
  };
  const [cls, label] = map[tier] || ['pill--baseline', tier];
  const tip = tips[tier] || '';
  return `<span class="vp-pill ${cls}" title="${tip}">${label}</span>`;
}

// ── Strategy bias pill ────────────────────────────
function biasPill(bias) {
  const tips = {
    FADE:   'Trade the Range — buy support (floor), sell resistance (ceiling)',
    FOLLOW: 'Trade the Trend — follow breakout momentum',
    WAIT:   'Wait for Setup — stand aside, no clean signal',
  };
  const map = {
    FADE:   ['pill--fade',   'TRADE THE RANGE (FADE)'],
    FOLLOW: ['pill--follow', 'TRADE THE TREND (FOLLOW)'],
    WAIT:   ['pill--wait',   'WAIT FOR SETUP'],
  };
  const [cls, label] = map[bias] || ['pill--wait', bias];
  const tip = tips[bias] || '';
  return `<span class="vp-pill ${cls}" title="${tip}">${label}</span>`;
}

// ── State pill ────────────────────────────────────
function statePill(state) {
  const tips = {
    ACCEPTANCE:     'Price is inside the normal range — sideways rotation',
    REJECTION_UP:   'Price broke above the ceiling and held — bullish breakout',
    REJECTION_DOWN: 'Price broke below the floor and held — bearish breakdown',
  };
  const map = {
    ACCEPTANCE:     ['pill--acceptance',     'INSIDE NORMAL RANGE'],
    REJECTION_UP:   ['pill--rejection-up',   'BULLISH BREAKOUT ↑'],
    REJECTION_DOWN: ['pill--rejection-down', 'BEARISH BREAKDOWN ↓'],
  };
  const [cls, label] = map[state] || ['pill--baseline', state];
  const tip = tips[state] || '';
  return `<span class="vp-pill ${cls}" title="${tip}">${label}</span>`;
}

// ── Direction badge ──────────────────────────────
function directionBadge(dir) {
  const map = {
    LONG:  ['dir--long',  'TRADE BIAS: LONG (BUY)',  'Looking for Buy setups'],
    SHORT: ['dir--short', 'TRADE BIAS: SHORT (SELL)', 'Looking for Sell setups'],
    DUAL:  ['dir--dual',  'TRADE BIAS: DUAL (WATCH)',  'Dual setup possibilities'],
  };
  const [cls, label, tip] = map[dir] || ['dir--long', dir, ''];
  return `<span class="vp-pill vp-dir-badge ${cls}" title="${tip}">${label}</span>`;
}

// ── Primary trade setup from data ──────────────────
function getPrimarySetup(d) {
  if (d.trade_setups && d.trade_setups.length > 0) return d.trade_setups[0];
  return {
    direction: d.direction || 'LONG',
    entry: d.entry_level,
    t1: d.t1,
    t2: d.t2,
    stop_loss: d.stop_loss,
    invalidation: d.invalidation,
    rr_t1: d.rr_t1,
    rr_t2: d.rr_t2,
  };
}

// ── Format price ──────────────────────────────────
const fmt = (n) => n ? `$${Number(n).toLocaleString()}` : '—';
const fmtTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC';
  } catch { return iso; }
};

// ── Dynamic Decision Path Checklist ───────────────
function renderDecisionChecklist(d, shape, state) {
  const price = d.btc_price || 0;
  const poc = d.poc;
  const vah = d.vah;
  const val = d.val;
  const bias = d.strategy_bias;
  const sizeRec = d.size_recommendation;
  const lockout = d.amt_lockout;

  // Step 1: Shape Details
  let step1Desc = '';
  if (shape === 'D') step1Desc = 'Balanced Range (D) — sideways distribution';
  else if (shape === 'P') step1Desc = 'Bullish Trend (P) — volume concentrated at top';
  else if (shape === 'b') step1Desc = 'Bearish Trend (b) — volume concentrated at bottom';
  else if (shape === 'B') step1Desc = 'Double Range (B) — two active balanced zones';

  // Step 2: Key Levels
  const step2Desc = `Floor: ${fmt(val)} | Center (POC): ${fmt(poc)} | Ceiling: ${fmt(vah)}`;

  // Step 3: Range State check
  let step3Desc = '';
  if (state === 'ACCEPTANCE') {
    step3Desc = `Price accepts normal range (${fmt(price)} is inside)`;
  } else if (state === 'REJECTION_UP') {
    step3Desc = `Price rejects ceiling (${fmt(price)} broke above VAH)`;
  } else if (state === 'REJECTION_DOWN') {
    step3Desc = `Price rejects floor (${fmt(price)} broke below VAL)`;
  }

  // Step 4: Strategy selection
  let step4Desc = '';
  if (bias === 'FADE') {
    step4Desc = 'Trade the Range (fade floor/ceiling, target center POC)';
  } else if (bias === 'FOLLOW') {
    step4Desc = 'Trade the Trend (buy breakouts, sell breakdowns)';
  } else {
    step4Desc = 'Wait for Setup (no clear direction)';
  }

  // Step 5: Risk & Sizing
  let step5Desc = '';
  if (lockout) {
    step5Desc = 'Bot Active warning ➔ Size recommendations are skipped';
  } else {
    const sizeLabel = {
      SKIP: 'Skip Trade',
      '50_PERCENT': 'Half Size',
      STANDARD: 'Standard Size',
      FULL: 'Full Position'
    }[sizeRec] || sizeRec;
    step5Desc = `No Bot conflict ➔ Sizing: ${sizeLabel}`;
  }

  return `
  <div class="live-checklist-card">
    <div class="checklist-title">🧠 Live Decision Path</div>
    <div class="checklist-steps">
      <div class="checklist-step completed">
        <div class="step-check">✓</div>
        <div class="step-details">
          <span class="step-num-label">Step 1: Market Shape</span>
          <span class="step-desc-text">${step1Desc}</span>
        </div>
      </div>
      <div class="checklist-step completed">
        <div class="step-check">✓</div>
        <div class="step-details">
          <span class="step-num-label">Step 2: Key levels mapped</span>
          <span class="step-desc-text">${step2Desc}</span>
        </div>
      </div>
      <div class="checklist-step completed">
        <div class="step-check">✓</div>
        <div class="step-details">
          <span class="step-num-label">Step 3: Range State check</span>
          <span class="step-desc-text">${step3Desc}</span>
        </div>
      </div>
      <div class="checklist-step completed">
        <div class="step-check">✓</div>
        <div class="step-details">
          <span class="step-num-label">Step 4: Selected Strategy</span>
          <span class="step-desc-text">${step4Desc}</span>
        </div>
      </div>
      <div class="checklist-step ${sizeRec === 'SKIP' ? 'warning' : 'completed'}">
        <div class="step-check">${sizeRec === 'SKIP' ? '⚠' : '✓'}</div>
        <div class="step-details">
          <span class="step-num-label">Step 5: Sizing & Conviction</span>
          <span class="step-desc-text">${step5Desc}</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Visual Thermometer Gauge Rendering ───────────
function renderTradeSetup(setup, label, session, btcPrice) {
  const dir = setup.direction || 'LONG';
  
  // Collect all levels to scale the bounds
  const prices = [setup.entry, setup.t1, setup.t2, setup.stop_loss];
  if (setup.invalidation) prices.push(setup.invalidation);
  
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const span = (maxPrice - minPrice) || 1;

  const getPct = (p) => ((p - minPrice) / span) * 100;

  const entryPct = getPct(setup.entry);
  const stopPct = getPct(setup.stop_loss);
  const t1Pct = getPct(setup.t1);
  const t2Pct = getPct(setup.t2);
  const invalidPct = setup.invalidation ? getPct(setup.invalidation) : null;

  // Calculate Green/Red fills
  let greenBottom, greenHeight, redBottom, redHeight;
  if (dir === 'LONG') {
    greenBottom = entryPct;
    greenHeight = t2Pct - entryPct;
    redBottom = stopPct;
    redHeight = entryPct - stopPct;
  } else {
    greenBottom = t2Pct;
    greenHeight = entryPct - t2Pct;
    redBottom = entryPct;
    redHeight = stopPct - entryPct;
  }

  // Live Price locator
  let nowIndicator = '';
  if (btcPrice && btcPrice >= minPrice && btcPrice <= maxPrice) {
    const nowPct = getPct(btcPrice);
    nowIndicator = `
      <div class="vp-gauge-now-marker" style="bottom: ${nowPct}%">
        <span class="now-pulse"></span>
        <span class="now-label">NOW ($${Math.round(btcPrice).toLocaleString()})</span>
      </div>`;
  }

  return `
  <div class="vp-trade-gauge-wrapper">
    <div class="gauge-header">
      <span class="gauge-title">${label}</span>
      <span class="gauge-subtitle">${session || ''} Session</span>
    </div>
    
    <div class="gauge-body">
      <!-- Thermometer Bar -->
      <div class="vp-gauge-track-col">
        <!-- Target (Green) Fill -->
        <div class="vp-gauge-fill vp-gauge-fill--green" style="bottom: ${greenBottom}%; height: ${greenHeight}%"></div>
        <!-- Stop (Red) Fill -->
        <div class="vp-gauge-fill vp-gauge-fill--red" style="bottom: ${redBottom}%; height: ${redHeight}%"></div>
        
        <!-- Key level nodes -->
        <div class="vp-gauge-marker t2" style="bottom: ${t2Pct}%">
          <span class="marker-dot dot-t2"></span>
          <span class="marker-text"><strong>T2:</strong> ${fmt(setup.t2)} ${setup.rr_t2 != null ? `<span class="rr-badge">${setup.rr_t2}:1 R:R</span>` : ''}</span>
        </div>
        <div class="vp-gauge-marker t1" style="bottom: ${t1Pct}%">
          <span class="marker-dot dot-t1"></span>
          <span class="marker-text"><strong>T1 (POC):</strong> ${fmt(setup.t1)} ${setup.rr_t1 != null ? `<span class="rr-badge">${setup.rr_t1}:1 R:R</span>` : ''}</span>
        </div>
        <div class="vp-gauge-marker entry" style="bottom: ${entryPct}%">
          <span class="marker-dot dot-entry"></span>
          <span class="marker-text"><strong>Entry:</strong> ${fmt(setup.entry)}</span>
        </div>
        <div class="vp-gauge-marker stop" style="bottom: ${stopPct}%">
          <span class="marker-dot dot-stop"></span>
          <span class="marker-text"><strong>Stop:</strong> ${fmt(setup.stop_loss)}</span>
        </div>
        ${setup.invalidation ? `
        <div class="vp-gauge-marker invalidation" style="bottom: ${invalidPct}%">
          <span class="marker-dot dot-invalid"></span>
          <span class="marker-text"><strong>Invalid:</strong> ${fmt(setup.invalidation)}</span>
        </div>` : ''}
        
        ${nowIndicator}
      </div>
    </div>
  </div>`;
}

// ── Human-readable verdict dashboard ──────────────
function renderVerdict(d, shape, state) {
  const price = d.btc_price || 0;
  const poc = d.poc;
  const vah = d.vah;
  const val = d.val;
  const hvn = d.hvn_range;
  const bias = d.strategy_bias;
  const dir = d.direction || 'LONG';
  const amtLock = d.amt_lockout;
  const sizeRec = d.size_recommendation;

  const bullets = [];

  // Range alignment
  if (state === 'ACCEPTANCE') {
    bullets.push(`Price is at <strong>${fmt(price)}</strong> — inside the normal range (stable sideways rotation)`);
  } else if (state === 'REJECTION_UP') {
    bullets.push(`Price is at <strong>${fmt(price)}</strong> — <span class="t-green">above the ceiling</span> (bullish breakout in progress)`);
  } else {
    bullets.push(`Price is at <strong>${fmt(price)}</strong> — <span class="t-red">below the floor</span> (bearish breakdown in progress)`);
  }

  // POC magnet
  bullets.push(`Busiest price level is at <strong>${fmt(poc)}</strong> — acts as a magnet where price is drawn`);

  // Touch count
  const vahT = d.touch_count_vah || 0;
  const valT = d.touch_count_val || 0;
  if (vahT === 0 && valT === 0) {
    bullets.push(`No ceiling or floor touches yet — price boundaries haven't been tested`);
  } else {
    if (vahT > 0) bullets.push(`Ceiling (VAH) touched <strong>${vahT}×</strong> — resistance is active`);
    if (valT > 0) bullets.push(`Floor (VAL) touched <strong>${valT}×</strong> — support is active`);
  }

  // HVN
  if (hvn && hvn !== 'N/A') {
    bullets.push(`High activity zone is at <strong>$${hvn.replace(/-/g, '–$')}</strong> — heavy trading, strong support/resistance`);
  }

  // Strategy summary
  const biasSummary = {
    FADE: 'Trade the Range — buy support floor, sell resistance ceiling',
    FOLLOW: 'Trade the Trend — ride breakout momentum',
    WAIT: 'Wait for Setup — stand aside',
  };
  const dirSummary = {
    LONG: 'looking to buy',
    SHORT: 'looking to sell',
    DUAL: 'watching both directions',
  };
  bullets.push(`Strategy: <strong>${biasSummary[bias] || bias}</strong>, ${dirSummary[dir] || dir}`);

  // Risk Sizing
  const sizeMapShort = {
    SKIP: 'Skip Trade',
    '50_PERCENT': 'Half Size (Low Conviction)',
    STANDARD: 'Standard Size',
    FULL: 'Full Position'
  };
  bullets.push(`Position sizing: <strong>${sizeMapShort[sizeRec] || sizeRec}</strong>`);

  if (amtLock) {
    bullets.push(`<span class="t-orange">⚠ Auto-Trader Active</span> — automated bot executing orders, expect sudden swings`);
  }

  return `<div class="vp-verdict">
    <div class="verdict-title">📋 Summary Dashboard</div>
    <ul class="verdict-list">
      ${bullets.map(b => `<li>${b}</li>`).join('\n      ')}
    </ul>
  </div>`;
}

// ── Plain English Legend ─────────────────────────
function renderPillLegend(direction, state, bias, prob, amtLock) {
  return `<details class="vp-legend">
    <summary class="legend-toggle">ℹ️ What do these labels mean?</summary>
    <div class="legend-body">
      <div class="legend-item">
        <span class="legend-key dir--short">TRADE BIAS</span>
        <span class="legend-desc">Preferred direction (LONG = buy setups, SHORT = sell setups, DUAL = watch both).</span>
      </div>
      <div class="legend-item">
        <span class="legend-key pill--acceptance">NORMAL RANGE</span>
        <span class="legend-desc">Price is <strong>inside</strong> the Value Area (Ceiling/Floor) — stable sideways market.</span>
      </div>
      <div class="legend-item">
        <span class="legend-key pill--fade">TRADE THE RANGE</span>
        <span class="legend-desc">Strategy bias — buy near the Floor (VAL) and sell near the Ceiling (VAH), targeting the center (POC).</span>
      </div>
      <div class="legend-item">
        <span class="legend-key pill--baseline">SIGNAL CONFIDENCE</span>
        <span class="legend-desc">Conviction tier based on touches and indicators (Standard, High, Very High, Reinforced).</span>
      </div>
      <div class="legend-item">
        <span class="legend-key pill--lockout">BOT ACTIVE</span>
        <span class="legend-desc">An automated tape-reading system is running. Expect high volatility; retail sizing is reduced.</span>
      </div>
    </div>
  </details>`;
}

// ── Render card ───────────────────────────────────
function renderVPCard(raw, mountId = 'vp-card-mount') {
  const d = raw.vp_card;
  const shape = computeShape(d);
  const state = computeState(d);
  const sc = SHAPE_CONFIG[shape];
  const direction = d.direction || 'LONG';
  const setups = d.trade_setups || [];
  const isDual = direction === 'DUAL' && setups.length === 2;

  const lockoutPill = d.amt_lockout
    ? `<span class="vp-pill pill--lockout" title="Automated trading bot is active — high risk">BOT ACTIVE</span>`
    : `<span class="vp-pill pill--clear" title="Automated trading bot is inactive — normal market">BOT INACTIVE</span>`;

  // Sizing recommendations
  const sizeMap = {
    SKIP: 'Skip Trade',
    '50_PERCENT': 'Half Position Size (Low Conviction)',
    STANDARD: 'Standard Position Size',
    FULL: 'Full Conviction Position Size',
  };

  // Trade setups
  let tradeBlock = '';
  if (isDual) {
    tradeBlock = `
    <div class="vp-trade-container-flex">
      ${renderTradeSetup(setups[0], '🔵 LONG Setup', d.session, d.btc_price)}
      ${renderTradeSetup(setups[1], '🔴 SHORT Setup', d.session, d.btc_price)}
    </div>`;
  } else if (setups.length > 0) {
    tradeBlock = `
    <div class="vp-trade-container-flex">
      ${renderTradeSetup(setups[0], `${direction} Setup`, d.session, d.btc_price)}
    </div>`;
  } else {
    // Backward compat
    const primary = getPrimarySetup(d);
    tradeBlock = `
    <div class="vp-trade-container-flex">
      ${renderTradeSetup(primary, `${direction} Setup`, d.session, d.btc_price)}
    </div>`;
  }

  const html = `
<div class="vp-card">

  <div class="vp-card___header">
    <span class="vp-cardtitle">Volume Profile V3.0</span>
    <span class="vp-card___updated">Updated ${fmtTime(d.last_updated)}</span>
  </div>

  <div class="vp-card-grid">
    <!-- Left Column: Vertical Chart -->
    <div class="vp-card-col-chart">
      <div id="vp-chart-container"></div>
    </div>

    <!-- Right Column: Info & Strategy -->
    <div class="vp-card-col-info">
      <div class="vp-shape-badge ${sc.cls}" title="Market structure: ${sc.label} — ${sc.desc}">
        <span class="shape-label">${sc.label}</span>
        <span class="shape-desc">${sc.desc}</span>
      </div>

      <div class="vp-state-row">
        ${directionBadge(direction)}
        ${statePill(state)}
        ${biasPill(d.strategy_bias)}
        ${probPill(d.probability_tier)}
        ${lockoutPill}
      </div>
      
      ${renderPillLegend(direction, state, d.strategy_bias, d.probability_tier, d.amt_lockout)}

      ${renderDecisionChecklist(d, shape, state)}

      <div class="vp-levels">
        <div class="vp-level-item level-poc" title="Point of Control: Busiest price level. Primary magnet.">
          <div class="level-label">POC (Busiest Price)</div>
          <div class="level-value">${fmt(d.poc)}</div>
          <div class="level-sub">Primary magnet</div>
        </div>
        <div class="vp-level-item level-vah" title="Value Area High: Price Ceiling. Breakout boundary.">
          <div class="level-label">VAH (Price Ceiling)</div>
          <div class="level-value">${fmt(d.vah)}</div>
          <div class="level-sub">Touches: ${d.touch_count_vah}</div>
        </div>
        <div class="vp-level-item level-val" title="Value Area Low: Price Floor. Support boundary.">
          <div class="level-label">VAL (Price Floor)</div>
          <div class="level-value">${fmt(d.val)}</div>
          <div class="level-sub">Touches: ${d.touch_count_val}</div>
        </div>
        <div class="vp-level-item level-hvn" title="High Volume Node: Dense trading area. Pausing zone.">
          <div class="level-label">HVN (High Activity)</div>
          <div class="level-value">${d.hvn_range ? '$' + d.hvn_range.replace('-', '–$') : '—'}</div>
          <div class="level-sub">Magnet zone</div>
        </div>
      </div>

      ${renderVerdict(d, shape, state)}

      ${tradeBlock}

      <div class="vp-card-row">
        <span class="trade-label">Risk Sizing Recommendation</span>
        <span class="trade-value trade-size">
          ${sizeMap[d.size_recommendation] || (d.size_recommendation || '—').replace('_', ' ')}
        </span>
      </div>

      <div class="vp-links">
        <a class="vp-link-btn" href="#amt-status-card">↗ AMT Status + VP×AMT Table</a>
        <a class="vp-link-btn" href="#liquidity-card">↗ Liquidity — CVD/Absorption</a>
      </div>
    </div>
  </div>

</div>`;

  const mount = document.getElementById(mountId);
  if (mount) mount.innerHTML = html;

  // Render vertical chart inside the left column container
  if (raw.chart_data && raw.chart_data.bins) {
    renderVPChart(raw, 'vp-chart-container');
  }
}

// ── Fetch + render ────────────────────────────────
async function loadVPCard(mountId = 'vp-card-mount') {
  try {
    const res = await fetch(`${VP_JSON_PATH}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderVPCard(data, mountId);
  } catch (err) {
    const mount = document.getElementById(mountId);
    if (mount) mount.innerHTML =
      `<div class="vp-card" style="color:#f87171">VP card load failed: ${err.message}</div>`;
  }
}

// ── Compact/Expert Mode persistence logic ──────────
function initExpertMode() {
  const toggleBtn = document.getElementById('expert-toggle');
  if (!toggleBtn) return;

  const isExpert = localStorage.getItem('vp_expert_mode') === 'true';
  
  const updateUI = (active) => {
    document.body.classList.toggle('expert-mode', active);
    const textEl = toggleBtn.querySelector('.toggle-text');
    const iconEl = toggleBtn.querySelector('.toggle-icon');
    if (active) {
      if (textEl) textEl.textContent = 'Switch to Beginner Mode';
      if (iconEl) iconEl.textContent = '🎓';
      toggleBtn.classList.add('active');
    } else {
      if (textEl) textEl.textContent = 'Switch to Expert Mode';
      if (iconEl) iconEl.textContent = '👁️';
      toggleBtn.classList.remove('active');
    }
  };

  updateUI(isExpert);

  toggleBtn.addEventListener('click', () => {
    const active = !document.body.classList.contains('expert-mode');
    localStorage.setItem('vp_expert_mode', active);
    updateUI(active);
  });
}

// Auto-run load and auto-refresh
loadVPCard();
setInterval(() => loadVPCard(), 60_000);

// Initialize compact toggle on DOM load
initExpertMode();
