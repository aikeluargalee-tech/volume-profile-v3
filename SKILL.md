# Volume Profile V3.0 — Complete Skill
**Source:** GetClaw | **For:** Wilee | **Date:** 2026-06-27  
**Version:** V1.0 (Shapes) → V2.0 (Physics + Patterns) → V3.0 (Acceptance/Rejection + Decision Tree)

---

## MODULE 1 — Core Concepts

| Term | Definition | AMT Field |
|------|-----------|-----------|
| **POC** | Price level with MOST volume. Market's "fairest price" | `POC` |
| **VAH** | Upper boundary — 70% of volume | `Range` upper |
| **VAL** | Lower boundary — 70% of volume | `Range` lower |
| **HVN** | Dense volume cluster — magnet | `HVN` |
| **LVN** | Thin gap — price blows through | implied (B-shape) |
| **Value Area** | Zone between VAH and VAL | `Range` |

> **Core Principle:** Volume = Agreements. High volume = agreed. Low = nobody agreed → price moves fast.

---

## MODULE 2 — Why Price Returns To Value (The Physics)

1. **Balance Point** — Returns to rebalance before trending
2. **Order Flow** — Limit orders at POC/VA boundaries pull price back
3. **Institutional Execution** — Large fills only inside VA
4. **Market Efficiency** — Return to traded zones to complete price discovery
5. **Multiple Touch Reinforcement** — More touches = higher probability

---

## MODULE 3 — The Four Shapes

| Shape | Description | Strategy |
|-------|-------------|----------|
| **D-Shape** | Bell curve, POC middle. BALANCE = UNCERTAINTY | Fade extremes: buy VAL, sell VAH, target POC. Don't pick direction. |
| **P-Shape** | Volume heavy at TOP. BULLS IN CONTROL | Buy pullbacks to VA/POC. VAH = new support. |
| **b-Shape** | Volume heavy at BOTTOM. BEARS IN CONTROL | Sell rallies to VA/POC. VAL = new resistance. |
| **B-Shape** | Two HVNs, LVN middle. TWO AUCTIONS | Respect both POCs. Never stop in LVN. |

---

## MODULE 4 — Shape Transition Logic

| From | To | Trigger |
|------|----|---------|
| D | P | 2 closes above VAH + volume migrating up |
| D | b | 2 closes below VAL + volume migrating down |
| D | B | Two HVNs with LVN between |
| b | D | Returns VA, volume redistributes evenly |
| P | D | Returns VA, bull momentum stalls |
| Any | B | News/event creates two auction zones |

---

## MODULE 5 — Three Reaction Patterns

### Pattern 1: Rejection At Value Area
Price enters VA → rejected → reverse. Entry on rejection candle. Target: opposite VA boundary.

### Pattern 2: POC Magnet
Price drawn to POC by order density. Every rally/dip gravitates back. Primary target for all fade trades. POC must be cleared before targeting VAH.

### Pattern 3: Value Hold → Continuation
Price returns to VA edge → holds → volume re-accumulates → continuation same direction. Not reversal — continuation. Difference from Pattern 1: hold + retest vs bounce OFF.

---

## MODULE 6 — Probability Stacking (Touch Count)

| Touch Count | Probability Tier | Action |
|-------------|-----------------|--------|
| 1 | BASELINE | Note the level |
| 2 | HIGH | Standard size |
| 3+ | VERY HIGH | Full conviction |
| Failed break | REINFORCED | Highest — trapped traders |

---

## MODULE 7 — VP × AMT Brief Translation Table

| AMT Signal | VP Meaning |
|------------|-----------|
| `DEVELOPING_BALANCE` | D-shape forming — wait |
| `VAL_ABSORPTION` | Buy orders at VAL — potential bounce |
| `HVN: range` | Core magnet zone |
| `POC value` | Highest density — primary magnet |
| `State: TRENDING` | P or b dominant — follow |
| `ADX > 35` | Trending confirmed |
| `ADX < 25` | D-shape zone — balance |
| `Delta flip: True` | Momentum shifting — transition signal |
| `Absorption: DETECTED` | Level being defended — reinforced |

---

## MODULE 8 — MTF + HTF Confluence (VP × AMT Integration)

Volume Profile tells WHERE. AMT tells WHEN.

### Four Confluence Zones

| Zone | Condition | Action |
|------|-----------|--------|
| **ZONE 1** — STRONG | VP level + all 4 AMT layers aligned | Full size, tight stop |
| **ZONE 2** — MODERATE | VP level + 3 of 4 layers. LOCKOUT on 1D | No trade. Watchlist. |
| **ZONE 3** — WEAK | VP level + only 1H/15m aligned | Skip or paper trade |
| **ZONE 4** — ANTI | VP says one thing, AMT says opposite | Do nothing. Wait. |

### HTF Alignment Matrix

| Timeframe | VP Role | Weight |
|-----------|---------|--------|
| Weekly | Sets macro VA | Highest |
| Daily (1D) | Regime master — LOCKOUT if bearish | High |
| 4H | Directional engine | High |
| 1H | Timing confirmation | Medium |
| 15m | Trigger only | Low |

> **Rule:** NEVER trade a VP level that conflicts with the Daily regime. 1D overrides.

---

## MODULE 9 — Quick Reference Card

| Shape | Market State | One-Line Strategy |
|-------|-------------|-------------------|
| D | Balance/Uncertainty | Fade VAH and VAL, target POC, wait for break |
| P | Bulls in control | Buy pullbacks to VA, ride continuation |
| b | Bears in control | Sell rallies to VA, ride continuation |
| B | Two auctions/transition | Respect both POCs, avoid LVN |

**Decision shortcut:**
- Price inside VA → ACCEPTANCE → fade extremes
- Price outside VA with 2 closes → REJECTION → follow direction

---

## MODULE 10 — Dashboard Integration

### JSON Schema

```json
{
  "vp_card": {
    "shape": "D | P | b | B",
    "poc": 59800,
    "vah": 60760,
    "val": 58500,
    "hvn_range": "59100-60600",
    "lvn_above": 62000,
    "lvn_below": 57000,
    "touch_count_val": 2,
    "touch_count_vah": 1,
    "probability_tier_val": "HIGH",
    "probability_tier_vah": "BASELINE",
    "acceptance_rejection_state": "ACCEPTANCE | REJECTION_UP | REJECTION_DOWN",
    "rejection_direction": "UP | DOWN | null",
    "consecutive_closes_outside_va": 0,
    "confirmation_status": "PENDING | CONFIRMED",
    "active_pattern": "POC_MAGNET | REJECTION_AT_VA | VALUE_HOLD | DUAL_POC",
    "strategy_bias": "FADE | FOLLOW | WAIT",
    "confluence_zone": "ZONE_1 | ZONE_2 | ZONE_3 | ZONE_4",
    "amt_lockout": true,
    "amt_verdict": "NO_TRADE | LONG | SHORT",
    "adx": 31.8,
    "absorption_active": true,
    "absorption_level": 60500,
    "absorption_side": "buy",
    "entry_level": 58250,
    "t1": 59800,
    "t2": 60760,
    "t3": 62000,
    "stop_loss": 57400,
    "invalidation": 61761,
    "rr_t1": 1.8,
    "rr_t2": 2.95,
    "size_recommendation": "50_PERCENT | STANDARD | FULL | SKIP",
    "btc_price": 60490,
    "session": "LONDON | NY | ASIA | WEEKEND",
    "last_updated": "2026-06-27T08:02:00Z"
  }
}
```

### Auto-Logic Rules

```
// Shape determination
closes_outside >= 2 AND price > vah → shape="P", bias="FOLLOW", direction="UP"
closes_outside >= 2 AND price < val → shape="b", bias="FOLLOW", direction="DOWN"
price BETWEEN val/vah AND closes_outside < 2 → shape="D", bias="FADE", state="ACCEPTANCE"
2 distinct HVN clusters + LVN gap → shape="B", bias="WAIT", pattern="DUAL_POC"

// Probability tier
touch_count 1→BASELINE | 2→HIGH | 3+→VERY_HIGH | failed_break→REINFORCED

// Size
amt_lockout → "50_PERCENT"
!lockout AND ZONE_1 → "FULL"
!lockout AND ZONE_2 → "STANDARD"
ZONE_3 OR ZONE_4 → "SKIP"
```

### 5 Integration Questions

1. Static HTML or dynamically populated from JSON/pipeline?
2. Framework — React, Vue, or vanilla JS?
3. Shape label — live from AMT pipeline or manually set per brief?
4. Which dashboard sections should the VP card link to?
5. Mobile-first or desktop-first layout for the card?

---

## MODULE 11 — Acceptance vs Rejection Framework

### Two States Only

**ACCEPTANCE** — Price stays inside VA
- Lower volatility. Rotation.
- Strategy: FADE extremes → trade toward POC
- Buy VAL, sell VAH, target POC

**REJECTION** — Price leaves VA AND doesn't come back
- Higher volatility. Trend potential.
- Strategy: FOLLOW the strength
- Buy break above VAH, sell break below VAL. Use pullbacks to broken edge. Never fade.

### The Golden Rule

> "Price ACCEPTS value when it stays in the value area."  
> "Price REJECTS value when it leaves AND DOESN'T LOOK BACK."

**The "doesn't look back" clause:**
- Wick outside + close back inside = still ACCEPTANCE
- Two consecutive closes outside = REJECTION confirmed

### Confirmation Checklists

**ACCEPTANCE:** Price in VA ✓ · No 2 closes outside ✓ · ADX < 30 ✓ · Volume around POC ✓  
**REJECTION:** 2 closes outside ✓ · ADX > 35 ✓ · Volume leaving old POC ✓ · CVD confirms direction ✓

---

## MODULE 12 — Complete 5-Step Decision Tree

```
STEP 1: IDENTIFY THE SHAPE
  D? P? b? B? → Sets macro context. Every decision flows from this.

STEP 2: MAP KEY LEVELS
  POC → primary magnet, first target
  VAH → upper extreme · VAL → lower extreme
  HVN → secondary magnets · LVN → fast-move zones
  Draw once. Respect all session.

STEP 3: ACCEPTANCE OR REJECTION?
  Inside VA → ACCEPTANCE → Step 4a
  2 closes outside → REJECTION → Step 4b
  1 close + wick back = still ACCEPTANCE. Wait.

STEP 4a: ACCEPTANCE TRADE
  Buy VAL / Sell VAH (touch count ≥ 2)
  Target: POC → opposite VA edge
  Stop: outside VA with buffer

STEP 4b: REJECTION TRADE
  Break above VAH → wait retest → buy. Target: next VA. Stop: inside VA.
  Break below VAL → wait retest → sell. Target: next VA. Stop: inside VA.
  NEVER chase the initial break. Always wait for retest.

STEP 5: STACK THE PROBABILITY
  Touch count ≥ 2 → standard size
  Touch count ≥ 3 → full size
  AMT 4-Layer aligned → full conviction
  CVD + Absorption → highest probability
  All aligning = only time for maximum size
```

---

## APPENDIX — Infographic to Module Map

| Infographic | Core Teaching | Modules |
|-------------|--------------|---------|
| #1 — Four Shapes | Shape recognition, trading strategy | M3, M4, M9 |
| #2 — Why Price Returns | 5 physics, reaction patterns, probability | M2, M5, M6 |
| #3 — Acceptance vs Rejection | Two-state framework, confirmation rules | M11, M12 |
