// vp-chart.js — Volume Profile Vertical Histogram (HTML/CSS Div-based)
// Reads chart_data and vp_card from vp_card.json, renders as vertical distribution chart

const TYPE_PRIORITY = {
  poc: 5,
  vah: 4,
  val: 3,
  hvn: 2,
  normal: 1,
  lvn: 0
};

function renderVPChart(raw, containerId = 'vp-chart-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const chartData = raw.chart_data;
  const vpCard = raw.vp_card;
  if (!chartData || !chartData.bins || chartData.bins.length === 0) {
    container.innerHTML = `<div style="padding: 12px; color: #6b7280;">No chart bins available</div>`;
    return;
  }

  const { bins, bin_size } = chartData;

  // Sort bins descending (highest price at top, lowest at bottom)
  const sortedBins = [...bins].sort((a, b) => Number(b.price) - Number(a.price));
  const minPrice = Number(sortedBins[sortedBins.length - 1].price);
  const maxPrice = Number(sortedBins[0].price);
  const range = (maxPrice - minPrice) || 1;

  // Compact — Group bins into a maximum number of bars (e.g., 35) to keep it clean
  const maxBars = 35;
  const step = Math.max(1, Math.ceil(sortedBins.length / maxBars));
  const groupedBars = [];

  for (let i = 0; i < sortedBins.length; i += step) {
    let stepVol = 0;
    let stepPrice = 0;
    let highestPriorityType = 'lvn';
    let highestPriority = -1;

    for (let j = 0; j < step && (i + j) < sortedBins.length; j++) {
      const bin = sortedBins[i + j];
      const vol = Number(bin.volume);
      if (vol > stepVol) {
        stepVol = vol;
        stepPrice = Number(bin.price);
      }
      
      const type = bin.type || 'normal';
      const priority = TYPE_PRIORITY[type] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        highestPriorityType = type;
      }
    }

    groupedBars.push({
      volume: stepVol,
      price: stepPrice,
      type: highestPriorityType
    });
  }

  // Find max volume in grouped bars to normalize width
  const vols = groupedBars.map(b => b.volume).filter(v => Number.isFinite(v) && v > 0);
  const maxVol = vols.length ? Math.max(...vols) : 1;

  // Calculate top percentage position (highest price at top = 0%)
  const getTopPct = (price) => {
    const rawPct = ((maxPrice - Number(price)) / range) * 100;
    return Math.max(2, Math.min(98, rawPct));
  };

  // Render NOW marker
  const btcNow = vpCard?.btc_price || null;
  let nowHtml = '';
  if (btcNow && btcNow >= minPrice && btcNow <= maxPrice) {
    const nowPct = getTopPct(btcNow);
    nowHtml = `
      <div class="vp-price-tracker-line" style="top: ${nowPct}%">
        <div class="vp-price-tracker-label">NOW $${Math.round(btcNow).toLocaleString()}</div>
      </div>
    `;
  }

  let chartHtml = `
    <div class="vp-chart-container-vertical">
      <div class="vp-chart-vertical-bars">
  `;

  // Draw horizontal bars extending to the right, stacked from top to bottom
  for (const bar of groupedBars) {
    const pct = Math.max(2, (bar.volume / maxVol) * 100);
    const barClass = bar.type; // poc, vah, val, hvn, lvn, normal
    chartHtml += `
      <div class="vp-bar-row" title="$${bar.price.toLocaleString()} — Vol: ${bar.volume.toFixed(2)}">
        <div class="vp-bar-fill ${barClass}" style="width: ${pct}%"></div>
      </div>
    `;
  }

  chartHtml += `
      </div>
  `;

  // Draw threshold markers: VAL, POC, VAH
  if (vpCard?.val != null) {
    chartHtml += `
      <div class="vp-horizontal-threshold val-line" style="top: ${getTopPct(vpCard.val)}%">
        <div class="vp-level-chart-label val">VAL $${Number(vpCard.val).toLocaleString()}</div>
      </div>`;
  }
  if (vpCard?.poc != null) {
    chartHtml += `
      <div class="vp-horizontal-threshold poc-line" style="top: ${getTopPct(vpCard.poc)}%">
        <div class="vp-level-chart-label poc">POC $${Number(vpCard.poc).toLocaleString()}</div>
      </div>`;
  }
  if (vpCard?.vah != null) {
    chartHtml += `
      <div class="vp-horizontal-threshold vah-line" style="top: ${getTopPct(vpCard.vah)}%">
        <div class="vp-level-chart-label vah">VAH $${Number(vpCard.vah).toLocaleString()}</div>
      </div>`;
  }

  // Draw price NOW line tracker
  chartHtml += nowHtml;

  chartHtml += `
    </div>
  `;

  // Info label
  const totalVol = bins.reduce((sum, b) => sum + Number(b.volume), 0);
  chartHtml += `
    <div class="vp-chart-info-label">
      ${bins.length} bins · bin size $${bin_size} · ${(totalVol / 1000).toFixed(1)}K total volume
    </div>
  `;

  container.innerHTML = chartHtml;
}
