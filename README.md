# Decision Space | Retail Geospatial Intelligence Platform

> **Geospatial decision-support system and portfolio optimization engine for Bedashing Beauty Lounge's 24-store network across the United Arab Emirates.**

---

## 1. Business Context & Strategic Purpose

**Bedashing Beauty Lounge** is one of the UAE's premier beauty and wellness operators, running **24 locations** across Abu Dhabi, Dubai, and the Northern Emirates. As the brand expands within rapidly growing master-planned communities, corporate leadership faces key capital allocation and spatial dilemmas:

1. **Portfolio Defense vs. Rightsizing**: Which existing branches represent high-margin "crown jewels" requiring priority CapEx protection, versus underperforming locations suffering from severe local competitor saturation?
2. **Sister-Branch Cannibalization**: Rapid urban expansion has placed several branches within competing trade areas (< 4.0 km separation), dividing foot traffic rather than capturing incremental revenue.
3. **White-Space Expansion Prioritization**: Where among the UAE's high-growth residential corridors (e.g., Dubai Hills, Saadiyat Cultural District) should new capital be deployed to capture unmet luxury demand without cannibalizing existing stores?

**Decision Space** delivers a unified, deterministic, and AI-grounded intelligence platform to answer these questions for executive management, investment committees, and the Board of Directors.

---

## 2. Core Capabilities & Features

- **Interactive Geospatial Network Map**:
  Leaflet-powered map utilizing CartoDB Dark Matter basemaps. Displays all 24 Bedashing lounges, 10 candidate growth zones, 3 km primary catchment radii, and dynamic sister-proximity lines.
- **Deterministic Multi-Factor Scoring Engine**:
  Auditable, mathematically transparent evaluation:
  - **Existing Branches**: Classified into \`PROTECT\` (≥ 85), \`HOLD\` (70–84), or \`SHRINK\` (< 70) based on reputation, catchment affluence, sister distance, and competitor saturation.
  - **Candidate Zones**: Ranked into \`GROW\` (≥ 80), \`WATCH\` (65–79), or \`SKIP\` (< 65) based on unmet demand, affluence, retail anchors, and safety buffers.
- **Automated Cannibalization Detection**:
  Continuous monitoring of sister-store proximity using spherical Haversine calculations ($R=6,371\\text{ km}$). Lounges with < 4.0 km separation are flagged with revenue-at-risk dilution alerts.
- **Dynamic What-If Sensitivity Modeling**:
  Interactive slider controls enabling executives to adjust weighting matrices in real time, with instant client-side recalculation.
- **Grounded AI Advisor & Board Memorandum**:
  Dual-path executive briefing engine powered by Google Gemini 3.8 Flash with a zero-downtime deterministic fallback. Generates formal Board of Directors strategic memoranda.
- **Built-In Architecture & Methodology Documentation**:
  Interactive technical reference with complete data provenance and mathematical proofs served directly at \`/docs\` and embedded within the app.

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

### Step 3: Configure Environment Variables & API Keys

Copy the sample environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

Open \`.env\` in your text editor:
\`\`\`env
# Google Gemini API Key (Optional)
# Required for natural-language AI Advisor chat & Board Memo LLM generation.
# If omitted, the platform uses its built-in deterministic briefing generator.
GEMINI_API_KEY=

# Google Drive Sync (Optional)
GOOGLE_DRIVE_FOLDER_ID=1fjPVxav6Zp-I9U0sPh1uHVEgqJwXt-cA
GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY=
\`\`\`

#### 🔑 API Key Reference Guide:

| Integration | API Key Required? | Where to Set | Notes |
| :--- | :---: | :--- | :--- |
| **CARTO / Basemap Tiles** | ❌ **No** | *None* | Uses free, public CartoDB Dark Matter / OpenStreetMap raster tile endpoints. No key or account required. |
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
│   └── index.html             # Standalone searchable documentation web page
├── public/                    # Static assets served directly
│   └── docs/index.html        # Production mirror of the documentation web page
└── src/                       # Client-side React 19 application
    ├── App.tsx                # Main layout, tab navigation, and modal controllers
    ├── types.ts               # Central TypeScript interfaces (Branch, Candidate, Evaluation)
    ├── data/
    │   ├── branches.ts        # Verified dataset of 24 Bedashing UAE locations
    │   ├── candidates.ts      # 10 prospective rollout zones with demographics
    │   └── specs.ts           # Technical specifications from client brief
    ├── services/
    │   ├── scoringEngine.ts   # Pure deterministic math: Haversine, scores, classifications
    │   └── firebaseAuth.ts    # Authentication and user session handler
    └── components/
        ├── GeospatialMap.tsx  # Leaflet map with 3km catchments & custom markers
        ├── BranchTable.tsx    # Interactive sorting and filtering table of branches
        ├── CandidateTable.tsx # Expansion ranking and ROI prioritization table
        ├── AiAdvisor.tsx      # Grounded strategic advisory dialogue
        ├── BoardMemoModal.tsx # Formal C-Suite & Board memo generator
        └── Header.tsx         # Navigation bar with quick link to documentation
\`\`\`

---

## 5. Data Provenance & Grounding Notice

- **Collected Data**: Store names, physical street addresses, geocodes (lat/lng), and Google star ratings/review counts are collected from public records and geocoded via Google Maps.
- **Calculated Math**: Distance matrices between all branches and candidate areas are derived using the spherical Haversine formula ($R=6,371\\text{ km}$).
- **Modeled Proxies**: Local competitor density counts within 3 km, catchment affluence indices, chair counts, and visitor volumes are modeled benchmarks (Bedashing internal POS records remain confidential).
- For complete audit details, view the **Provenance Matrix** in the documentation at \`/docs\`.

---

## 6. Documentation Maintenance Protocol

This project includes a dedicated governance agent protocol documented in **\`AGENTS.md\`**. Any AI agent modifying this codebase is mandated to:
1. Verify and update both **\`docs/index.html\`** and **\`README.md\`** whenever formulas, thresholds, data records, or server configurations are modified.
2. Keep all mathematical formulas, scoring cutoffs (\`PROTECT\` ≥ 85, \`HOLD\` 70–84, \`SHRINK\` < 70), and buffer distances (4.0km sister buffer, 3.0km competitor radius) in 100% lockstep across code and documentation.
