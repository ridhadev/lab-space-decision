# Decision Space | Retail Geospatial Intelligence Platform

**Current Release: V.01 (Baseline Snapshot)** | [Version Changelog](./VERSIONS.md)

> **Geospatial decision-support system and portfolio optimization engine for Bedashing Beauty Lounge's 23-store network across the United Arab Emirates.**

<div align="center">
  <img src="./docs/decision-space-dashboard.png" alt="Decision Space - Retail Geospatial Intelligence Platform Executive Dashboard" width="100%" />
  <p><em>Decision Space Executive Geospatial Interface: UAE network health, cannibalization overlap monitoring, thermal competitor saturation, and sensitivity decision drawer.</em></p>
</div>

---

## 1. Business Context & Strategic Purpose

**Bedashing Beauty Lounge** is one of the UAE's premier beauty and wellness operators, running **23 locations** across Abu Dhabi, Dubai, and the Northern Emirates. As the brand expands within rapidly growing master-planned communities, corporate leadership faces key capital allocation and spatial dilemmas:

1. **Portfolio Defense vs. Rightsizing**: Which existing branches represent high-margin "crown jewels" requiring priority CapEx protection, versus underperforming locations suffering from severe local competitor saturation?
2. **Sister-Branch Cannibalization**: Rapid urban expansion has placed several branches within competing trade areas (< 4.0 km separation), dividing foot traffic rather than capturing incremental revenue.
3. **White-Space Expansion Prioritization**: Where among the UAE's high-growth residential corridors (e.g., Dubai Hills, Saadiyat Cultural District) should new capital be deployed to capture unmet luxury demand without cannibalizing existing stores?

**Decision Space** delivers a unified, deterministic, and AI-grounded intelligence platform to answer these questions for executive management, investment committees, and the Board of Directors.

---

## 2. Core Capabilities & Features

- **Interactive Geospatial Network Map**:
  Leaflet-powered map utilizing CartoDB Dark Matter basemaps. Displays all 23 Bedashing lounges, 10 candidate growth zones, 3 km primary catchment radii, dynamic sister-proximity lines, a **Thermal Competition Density & Saturation Heatmap** (Blue-to-Red thermal gradient mapping local salon saturation from low-density moats to hyper-saturated retail corridors), a **Coverage Gap & "White Space" Analysis Layer** (cyan/teal opportunity auras and directional reach vectors highlighting unserved high-affluence trade pockets), and an **Expandable/Collapsible Map Layers Panel** with one-click hide/show controls and automated **Center of Gravity Camera Navigation** that centers and scales map viewports directly on the weighted geographic centroid of any selected emirate (`UAE`, `AD`, `DXB`, `SHJ`, `FUJ`, `RAK`).
- **Market Saturation Metric in Summary Badges & Tables**:
  4-tier competitive saturation classification (`Monopolistic Moat 1–4`, `Balanced 5–9`, `Saturated 10–17`, `Hyper-Saturated 18+`). Integrated into the Executive Summary portfolio banner strip, interactive filter chips, and sortable table columns across all 23 branches and 10 candidate growth zones, with deep-dive audit tooltips and modal breakdowns.
- **Deterministic Multi-Factor Scoring Engine & Live Simulation Switcher**:
  Auditable, mathematically transparent evaluation:
  - **Existing Branches**: Classified into `PROTECT` (≥ 80), `HOLD` (70–79), or `SHRINK` (< 70) based on reputation, catchment affluence, sister distance, and competitor saturation.
  - **Candidate Zones**: Ranked into `GROW` (≥ 80), `WATCH` (65–79), or `SKIP` (< 65) based on unmet demand, affluence, retail anchors, and safety buffers.
  - **Executive Simulation Scenarios**: 4 one-click presets accessible from the top header and configuration drawer:
    - *Portfolio Rightsizing (3 Shrink - Default)*: Identifies 3 sister branches (Delma, Khaleej Al Arabi, Ministries Complex) suffering from cannibalization and margin drag for station reduction and lease consolidation.
    - *Strict Cannibalization (4 Shrink - Stress Test)*: Expands sister-conflict radius to 4.5km, adding Baniyas East to the SHRINK list.
    - *Targeted Downsizing (1 Shrink)*: Isolates intervention strictly to the lowest-scoring lounge (Delma, 64/100).
    - *Legacy Baseline (0 Shrink)*: Permissive historical baseline where all branches remain HOLD or PROTECT.
- **Brand Identity & Dual Vector/Raster Assets**:
  Bedashing brand icon (`/bedashing-logo.svg` & `/bedashing-logo.png`) positioned in the top application header alongside the "Decision Space" title mark, board presentation modal, and browser favicon.
- **Automated Cannibalization Detection**:
  Continuous monitoring of sister-store proximity using spherical Haversine calculations ($R=6,371\\text{ km}$). Lounges with < 4.0 km separation are flagged with revenue-at-risk dilution alerts.
- **Dynamic What-If Sensitivity Modeling**:
  Interactive slider controls enabling executives to adjust weighting matrices in real time, with instant client-side recalculation.
- **Grounded AI Advisor & Board Memorandum (Report & Slides Carousel)**:
  Dual-path executive briefing engine powered by Google Gemini 3.8 Flash with a zero-downtime deterministic fallback. Generates formal Board of Directors strategic memoranda with an instant segmented switcher between a comprehensive written **Report** and an interactive 6-slide **Board Slideshow / Carousel** with indicator jump pills, next/previous buttons, and keyboard navigation (`ArrowLeft` / `ArrowRight`). Features an **AI Advisor Decision Pinning Protocol** where strategic recommendations can be pinned directly into board directives with browser persistence (`localStorage`), incorporated into both the LLM prompt and deterministic generator, and spotlighted in the board presentation. Also provides per-location session isolation with local storage caching (`/src/services/aiStorage.ts`), Markdown styling (`react-markdown` + `remark-gfm`), and real-time processing states.
- **Built-In Architecture & Methodology Documentation**:
  Interactive technical reference with complete data provenance and mathematical proofs served directly at \`/docs\` and embedded within the app.
- **Guided Tour Workflow Cards**:
  An interactive 6-step executive onboarding tour that seamlessly walks users through the core capabilities of the platform (Interactive Geospatial Map with sister cannibalization monitoring, Saturation & Portfolio Summary, Deterministic Branch Evaluation, Growth Greenfield Pipeline, Sensitivity Modeling, and Grounded AI Strategic Advisor), automatically transitioning the active map viewports, data tables, sensitivity sliders, and AI panels in real time. Can be dismissed at any time, navigated via keyboard arrows, or relaunched anytime via the user menu (Avatar dropdown).

---

## 3. Quick Start: Local Installation & Execution

Follow these steps to run Decision Space locally after downloading or cloning from GitHub.

### Prerequisites
- **Node.js**: Version \`20.x\` or higher (\`18.x\` LTS also supported)
- **npm**: Version \`9.x\` or higher (or \`pnpm\` / \`bun\`)
- **Git**

---

### Step 1: Clone the Repository
\`\`\`bash
git clone https://github.com/your-org/decision-space.git
cd decision-space
\`\`\`

---

### Step 2: Install Dependencies
Install the required frontend and backend packages:
\`\`\`bash
npm install
\`\`\`

---

### Step 3: Configure Environment Variables & API Keys (Optional)

Copy the sample environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

Open \`.env\` in your text editor:
\`\`\`env
#### Google Gemini API Key (Optional)
Required for natural-language AI Advisor chat & Board Memo LLM generation.
If omitted, the platform uses its built-in deterministic briefing generator.
GEMINI_API_KEY=

#### Google Drive Sync (Optional)
GOOGLE_DRIVE_FOLDER_ID=1fjPVxav6Zp-I9U0sPh1uHVEgqJwXt-cA
GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY=

#### CARTO Basemap API Key (Optional)
CARTO appends a watermark flag on raster tiles without an authenticated key.
A default key is pre-configured in the codebase; you can override it here.
CARTO_API_KEY=
VITE_CARTO_API_KEY=
\`\`\`

#### 🔑 API Key Reference Guide:

| Integration | API Key Required? | Where to Set | Notes |
| :--- | :---: | :--- | :--- |
| **CARTO / Basemap Tiles** | ⚡ **Optional** (Pre-set) | \`.env\` (\`VITE_CARTO_API_KEY\`) | Removes the CARTO "API key required" watermark flag from Dark Matter tiles. The app includes a default authenticated key out of the box. |
| **Deterministic Scoring** | ❌ **No** | *None* | All Haversine distance, cannibalization, and scoring formulas execute 100% locally in-memory. |
| **Google Gemini (AI Advisor)** | ⚡ **Optional** | \`.env\` (\`GEMINI_API_KEY\`) | Obtain a free key from [Google AI Studio](https://aistudio.google.com). If not provided, the platform automatically activates its built-in deterministic briefing generator without crashing. |
| **Google Drive Sync** | ⚡ **Optional** | \`.env\` (\`GOOGLE_DRIVE_...\`) | Optional. The app loads verified local snapshots from \`/src/data/specs.ts\` by default. |

---

### Step 4: Run the Development Server
Launch the unified full-stack development environment (Express API + Vite Dev Server):
\`\`\`bash
npm run dev
\`\`\`

Open your browser to:
👉 **\`http://localhost:3000\`**

- The main interactive geospatial dashboard will open immediately.
- To access the technical architecture documentation, click the **"Architecture Docs"** tab or visit **\`http://localhost:3000/docs\`**.

---

### Step 5: Production Build & Deployment (Optional)
To test the production build locally:
\`\`\`bash
# 1. Compile the React client and bundle the Express server into dist/
npm run build

# 2. Run the bundled production server
npm start
\`\`\`
The server will bind to \`http://localhost:3000\`.

---

## 4. Repository & Architecture Structure

\`\`\`
decision-space/
├── AGENTS.md                  # Dedicated AI Agent instructions & synchronization rules
├── README.md                  # Project overview and quick start guide (this file)
├── .env.example               # Template for environment variables
├── package.json               # Node.js project manifest & script commands
├── server.ts                  # Express backend: Gemini AI proxy, Drive sync, and static docs
├── docs/                      # Static technical & strategic documentation
│   ├── index.html             # Standalone searchable documentation web page
│   └── video_transcript_walkthrough.md # 5-minute executive demo video transcript & feature guide
├── public/                    # Static assets served directly
│   └── docs/index.html        # Production mirror of the documentation web page
└── src/                       # Client-side React 19 application
    ├── App.tsx                # Main layout, tab navigation, and modal controllers
    ├── types.ts               # Central TypeScript interfaces (Branch, Candidate, Evaluation)
    ├── data/
    │   ├── branches.ts        # Verified dataset of 23 Bedashing UAE locations
    │   ├── candidates.ts      # 10 prospective rollout zones with demographics
    │   └── specs.ts           # Technical specifications from client brief
    ├── services/
    │   ├── scoringEngine.ts   # Pure deterministic math: Haversine, scores, classifications
    │   └── firebaseAuth.ts    # Authentication and user session handler
    └── components/
        ├── LeftNavRail.tsx       # Fixed 74px left navigation rail (Map, Growth, Branches, Overview)
        ├── AppHeader.tsx         # 60px app header with search (⌘K), view switchers & avatar menu
        ├── KpiBand.tsx           # Collapsible portfolio health band with decision distribution pills
        ├── RightDrawerPanel.tsx  # Full-height right panel (Config, Advisor, Data, Dev, Branch deep-dive)
        ├── OverviewView.tsx      # Strategic portfolio overview & pending decisions
        ├── GrowthView.tsx        # Expansion candidate cards & suitability rankings
        ├── BranchesView.tsx      # Comprehensive 23-lounge audit table with density controls
        ├── GeospatialMap.tsx     # Leaflet map with 3km catchments, thermal saturation & white spaces
        ├── BoardMemoModal.tsx    # Formal C-Suite & Board memo generator
        └── DriveSyncModal.tsx    # Google Drive real-time workspace sync modal
\`\`\`

---

## 5. Data Provenance & Grounding Notice

Decision Space strictly audits and classifies all data dimensions into three distinct tiers:

1. **Real API & Web Extracted**: Store names, physical street addresses, geocodes (lat/lng via Google Geocoding API), Google star ratings, and review counts (via Google Places API) are verified ground truth extracted from public directories and Google Maps Platform.
2. **Deterministic In-Code Math**: Distance matrices between all branches and candidate zones are calculated in memory via the spherical Haversine formula ($R=6,371\text{ km}$), with local cannibalization decay curves and multi-attribute scoring.
3. **AI-Curated & Modeled Proxies**: 
   - **What "Curated" Means**: Generated by the AI assistant using its internal parametric training knowledge (training cutoff: March 2026) and commercial beauty space-planning heuristics.
   - **No Live Database / Private Access**: No automated API or live query was run against the UAE Federal Competitiveness and Statistics Centre (FCSC), and no confidential corporate Point-of-Sale (POS) accounting ledgers or architectural CAD blueprints were accessed.
   - **Catchment Affluence Index (0–100)**: Curated heuristic based on public residential rental brackets (Bayut/PropertyFinder medians: Ultra-Prime 90–95, Affluent Communities 80–86, Outer Suburban 72–78).
   - **Chair Counts & GLA**: Modeled heuristic based on commercial beauty industry space-planning standards (~100–120 sq ft GLA per styling station; 10 to 18 chairs by venue format).
   - **Monthly Visitors**: Modeled throughput equation derived from simulated chairs ($\text{Chairs} \times \text{Daily Turns} \times 30 \times \text{Utilization Rate}$).

For complete audit details, view the interactive **Provenance Matrix** in the documentation at `/docs` (or `/docs/index.html`).

---

## 6. Documentation Maintenance Protocol

This project includes a dedicated governance agent protocol documented in **\`AGENTS.md\`**. Any AI agent modifying this codebase is mandated to:
1. Verify and update both **\`docs/index.html\`** and **\`README.md\`** whenever formulas, thresholds, data records, or server configurations are modified.
2. Keep all mathematical formulas, scoring cutoffs (\`PROTECT\` ≥ 85, \`HOLD\` 70–84, \`SHRINK\` < 70), and buffer distances (4.0km sister buffer, 3.0km competitor radius) in 100% lockstep across code and documentation.
