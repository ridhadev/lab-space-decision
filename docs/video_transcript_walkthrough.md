# Decision Space | 5-Minute Video Walkthrough & User Guide
**Companion Script & Transcript for Executive Product Demonstration**

* **Target Video Runtime:** 05:00 minutes (approx. 720 words spoken narration at 144 WPM)
* **Audience:** C-Suite Leadership, Board of Directors, Investment & Spatial Planning Committees, Retail Operations Heads
* **Document Reference:** Aligned with `ai-case-study.docx`, `FUNCTIONAL_SPEC.md`, `APPROACH.md`, and `IMPLEMENTATION_SPEC.md`
* **Application URL:** [Decision Space Platform](https://ais-pre-wk43pofrzsbcg24helvwmu-140218746653.europe-west1.run.app)

---

## Executive Overview & Requirement Traceability

The table below connects each scene of this demonstration to the foundational business mandates defined in the client brief (`ai-case-study.docx`):

| Video Scene | Timeline | Core Application Features Shown | Business Requirement Grounding (`ai-case-study.docx`) |
| :--- | :---: | :--- | :--- |
| **Scene 1: Context & Shell** | `0:00 - 0:45` | 3-Zone Shell Architecture, 74px Left Nav Rail, 60px App Header with ⌘K Search, Live Portfolio Status | **FR-1**: Unified executive portfolio visibility across all 23 Bedashing UAE lounges; clear distinction between navigation ("Where am I") and action ("What can I do"). |
| **Scene 2: Geospatial Engine** | `0:45 - 1:45` | CartoDB Dark Matter Basemap, 3km Catchments, &lt;4.0km Cannibalization Vectors, Competition Saturation Heatmap, White Spaces, Center of Gravity Camera Navigation | **FR-2 & FR-7**: Spatial conflict detection (sister cannibalization dilution within 4.0km); competitor saturation mapping; identification of unserved prime trade corridors. |
| **Scene 3: Portfolio Health** | `1:45 - 2:30` | Collapsible KPI Band, Decision Pills (`PROTECT`, `HOLD`, `SHRINK`), Branches Table, Density Controls, Right Audit Drawer | **FR-3**: Transparent deterministic scoring matrix; classifying existing branches into capital defense (`PROTECT ≥ 85`), maintenance (`HOLD 70–84`), and restructuring (`SHRINK < 70`). |
| **Scene 4: Growth Pipeline** | `2:30 - 3:30` | Growth View, 10 Candidate Expansion Zones, Unmet Demand & Affluence Gauges, Overview Triage Dashboard | **FR-4 & FR-8**: Data-driven white-space growth; evaluating expansion zones into `GROW ≥ 80`, `WATCH 65–79`, and `SKIP < 65` without cannibalizing the sister network. |
| **Scene 5: Model & AI Advisor** | `3:30 - 4:30` | Right Drawer `config` Sliders (Real-time sensitivity analysis), `advisor` (Gemini 3.8 Flash), Formal Board Memo Generator | **FR-5 & FR-9**: Dynamic what-if weighting; zero-hallucination AI advisory grounded strictly in mathematical metrics; automated C-Suite executive memorandums. |
| **Scene 6: Data & Governance** | `4:30 - 5:00` | Data Sources Panel, 3-Tier Provenance Matrix, Drive Sync, Static Technical Documentation (`/docs`) | **FR-10 & FR-11**: Strict data provenance separation (API Extracted vs. Deterministic Math vs. AI-Curated Proxies); reproducible governance under `AGENTS.md`. |

---

## 5-Minute Scene-by-Scene Video Transcript

```
================================================================================
SCENE 1: STRATEGIC BUSINESS CONTEXT & THE 3-ZONE SHELL (0:00 – 0:45)
================================================================================
```

### Visual Directives
* **Camera / Screen:** Screen begins on the clean, high-contrast dark navy workspace (`#08111E`).
* **Mouse Cursor:** Hovers over the 74px Left Nav Rail, showing the four primary icons: **Map**, **Growth**, **Branches**, and **Overview**.
* **Action:** Cursor taps the global search bar in the 60px Header (`⌘K` chip pinned inside), briefly types `"Khalidiya"`, showing the instant search flyout, then hits `Escape`.

### Audio Narration (Presenter / Voiceover)
> *"Welcome to Decision Space, the executive geospatial intelligence platform built specifically for Bedashing Beauty Lounge's 23-store retail network across the United Arab Emirates.*
>
> *As Bedashing scales within the UAE's premier commercial and residential master developments, leadership faces three critical capital allocation questions:*
> *First: Which existing salons are high-margin crown jewels that must be protected, and which locations are under severe pressure from local competition?*
> *Second: Where is rapid expansion causing sister branches to cannibalize each other?*
> *And third: Where in the UAE's emerging luxury corridors should we deploy new capital for maximum return?*
>
> *To answer these questions, Decision Space organizes intelligence into three clear structural zones: the Left Navigation Rail answers 'Where am I'; the Top Header answers 'What can I do'; and the Contextual Right Panel delivers on-demand deep dives."*

---

```
================================================================================
SCENE 2: INTERACTIVE GEOSPATIAL INTELLIGENCE & CANNIBALIZATION (0:45 – 1:45)
================================================================================
```

### Visual Directives
* **Camera / Screen:** Full view of the **Map** canvas powered by CartoDB Dark Matter.
* **Action 1:** In the floating **Map Layers Panel** (236px width), presenter toggles the **3km Catchment Buffers** on. The 3,000-meter primary trade circles illuminate in cyan.
* **Action 2:** Presenter toggles **Cannibalization Vectors (<4km)**. Red dashed lines connect nearby sister branches (e.g., Delma ↔ Khaleej Al Arabi at 1.9km, and Westyas ↔ Noya Plaza at 4.0km).
* **Action 3:** Presenter clicks the **Competition Saturation** checkbox. The screen transitions into a vivid density gradient—revealing blue monopolistic moats in Al Dhafra, shifting to fiery red hyper-saturated corridors along Jumeirah Beach Road and Downtown Dubai.
* **Action 4:** Presenter clicks the **DXB** chip, and the camera dynamically flies to the weighted Center of Gravity of Dubai, then clicks the **AD** chip to glide smoothly to Abu Dhabi.

### Audio Narration
> *"Let's explore the Map view. Every Bedashing lounge is plotted using verified GPS geocodes, surrounded by a 3-kilometer primary catchment buffer representing the standard 5-to-10 minute consumer transit window in the UAE.*
>
> *Notice these red dashed connectors: our engine runs continuous spherical Haversine distance calculations ($R=6,371\text{ km}$) across the entire network. Any sister salons within 4 kilometers—such as Delma and Khaleej Al Arabi at just 1.9 kilometers apart—are immediately flagged for customer dilution and revenue cannibalization.*
>
> *When we activate the Competition Saturation layer, the map reveals local competitor density within 3 kilometers: low-density moats in blue, transitioning to hyper-saturated zones in crimson where over 18 competing salons compress operating margins.*
>
> *Using the Center of Gravity camera controls, one click centers the viewport directly on the geographic centroid of Dubai, Abu Dhabi, or the Northern Emirates."*

---

```
================================================================================
SCENE 3: PORTFOLIO HEALTH BAND & BRANCHES AUDIT (1:45 – 2:30)
================================================================================
```

### Visual Directives
* **Camera / Screen:** Transition from Map to **Branches** view via the Left Nav Rail.
* **Action 1:** Presenter expands the top **Portfolio Health Band**. The 3 summary cards drop down (`CapEx Protection`, `Cannibalization Alert: 8 Branches`, `Expansion Pipeline: 10 Zones`).
* **Action 2:** Presenter clicks the `SHRINK (3)` filter pill. The table instantly filters to the 3 vulnerable branches.
* **Action 3:** Presenter toggles table density from `Default` to `Compact` and clicks **Inspect** on *Bedashing Beauty Lounge - Delma*.
* **Action 4:** The 368px **Right Drawer Panel** slides open, displaying Delma's full audit card, multi-factor breakdown, and the exact mathematical formula.

### Audio Narration
> *"Beneath the header sits the collapsible Portfolio Health Band. It gives leadership an immediate breakdown of network health: 14 branches in Protect, 6 in Hold, and 3 requiring Shrink or rightsizing intervention.*
>
> *Navigating to the Branches view, we see our deterministic scoring engine at work. Unlike black-box models, every score is mathematically transparent, balancing Google customer ratings at 25%, catchment affluence at 35%, sister cannibalization safety at 20%, and local competition resilience at 20%.*
>
> *Selecting Delma opens our deep-dive audit drawer. Delma holds an excellent 4.6-star rating, but because it sits within 1.9 kilometers of Khaleej Al Arabi and faces 14 local competitors, its cannibalization score drops to 25%, pulling its overall health into the SHRINK category. This provides clear empirical backing for lease renegotiation or chair consolidation."*

---

```
================================================================================
SCENE 4: EXPANSION PRIORITIZATION & WHITE-SPACE ANALYSIS (2:30 – 3:30)
================================================================================
```

### Visual Directives
* **Camera / Screen:** Switch to the **Growth** view on the Left Nav Rail.
* **Action 1:** View displays 10 expansion candidate cards sorted by strategic priority (`GROW`, `WATCH`, `SKIP`).
* **Action 2:** Presenter hovers over **Dubai Hills Mall** (Score: 88/100, `GROW`) and **Saadiyat Cultural District** (Score: 84/100, `GROW`), highlighting the horizontal factor bars (Unmet Demand, Affluence, Sister Proximity Safety).
* **Action 3:** Presenter clicks **View on Map** on Dubai Hills Mall. The app switches to the map, auto-centering on Dubai Hills, showing the glowing cyan **White Space Opportunity Aura** (3.5km radius) and the dashed Reach Vector to the nearest sister branch.
* **Action 4:** Switch to the **Overview** view to show the 'Needs a Decision This Cycle' triage panel.

### Audio Narration
> *"Now let's examine future expansion in the Growth view. Here, we evaluate 10 prospective development corridors against four growth drivers: unmet demand, target demographic affluence, retail mall gravity, and sister safety distance.*
>
> *Dubai Hills Mall and Saadiyat Cultural District emerge as tier-one GROW priorities, each scoring above 84 out of 100. They combine unmet demand indices above 88 with high-discretionary affluence, while maintaining a safe buffer greater than 4 kilometers from existing lounges.*
>
> *On the map, our White Space Opportunity layer renders a 3.5-kilometer catchment aura and an unserved reach vector, confirming that expanding here captures incremental market share without cannibalizing current revenue.*
>
> *In the Overview view, leadership receives an instant triage list of locations requiring immediate action this quarterly cycle."*

---

```
================================================================================
SCENE 5: SENSITIVITY MODELING & GROUNDED AI STRATEGIC ADVISOR (3:30 – 4:30)
================================================================================
```

### Visual Directives
* **Camera / Screen:** In the Top Header, presenter clicks the grouped **Config** switcher.
* **Action 1:** The Right Drawer opens to the `config` panel. Presenter drags the **Cannibalization Weight** slider from `20%` up to `40%`, and the **Affluence Weight** down to `20%`.
* **Action 2:** Background table and KPI pills recalculate instantly without any page reload.
* **Action 3:** Presenter clicks **Reset to Defaults**, then toggles the switcher to **AI Advisor** (`Sparkles` icon).
* **Action 4:** Presenter selects the suggested prompt: *"Provide an executive network health assessment"*. The pulsing radar indicator animates, and Gemini 3.8 Flash streams a structured Markdown briefing with headers, key findings, and action recommendations.
* **Action 5:** Presenter clicks **Generate Board Memo**, opening the modal with an editable, exportable C-Suite memo.

### Audio Narration
> *"One of Decision Space's most powerful capabilities is real-time What-If Sensitivity Modeling. In the Configuration panel, executive teams can adjust scoring coefficients on the fly. If the board decides to adopt a more conservative posture toward cannibalization, dragging the cannibalization weight to 40% immediately updates every classification across the network in real time.*
>
> *Next to Config is our AI Strategic Advisor, powered by Google Gemini 3.8 Flash. Our architecture adheres to a strict zero-hallucination mandate: the model cannot invent scores or financial figures. It is grounded exclusively in the verified metrics and spatial distances computed by our deterministic engine.*
>
> *With one click, the Advisor synthesizes network-wide risks and can draft a formal Board of Directors Memorandum—complete with executive summaries, capital redeployment priorities, and operational directives ready for executive review."*

---

```
================================================================================
SCENE 6: DATA PROVENANCE, GOVERNANCE & CONCLUSION (4:30 – 5:00)
================================================================================
```

### Visual Directives
* **Camera / Screen:** Presenter clicks the user avatar in the top right and selects **Data Sources & Provenance**.
* **Action 1:** The Right Drawer displays the Provenance Matrix, clearly categorizing every dataset into *Real API Extracted*, *Deterministic Math*, and *AI-Curated Proxies*.
* **Action 2:** Presenter clicks **Technical Documentation**, opening `/docs/index.html` in a clean embedded frame.
* **Action 3:** Camera pans back to the full UAE Map canvas with all layers harmonized.

### Audio Narration
> *"Decision Space prioritizes absolute governance and auditability. In the Data Sources panel, our three-tier provenance matrix clearly distinguishes between verified ground truth—such as Google Places ratings and geocodes—and modeled operational proxies like chair counts and foot traffic tiers.*
>
> *Full mathematical proofs, assumptions, and formulas are published in our integrated technical documentation, maintained in strict synchronization under our governance protocols.*
>
> *By uniting deterministic spatial mathematics with grounded AI intelligence, Decision Space transforms complex network data into confident, boardroom-ready expansion and portfolio optimization decisions.*
>
> *Thank you for watching."*

---

## Presenter Delivery & Demo Flow Checklist

Before recording or delivering the live 5-minute walkthrough, verify the following setup steps:

1. **Window Resolution:** Set browser window to `1920x1080` (16:9 aspect ratio) with zoom set to `100%`.
2. **Initial State:** 
   - View: `Map` view selected.
   - KPI Band: Expanded (default on map).
   - Focus Emirate: `All` (UAE overview).
   - Map Layers: `Existing Branches` checked; `Buffers`, `Cannibalization`, and `Competition Saturation` ready to be toggled.
   - Right Drawer: Closed (`activePanel: null`).
3. **Pacing Milestones:**
   - `0:45`: Transition from Shell overview to Map layers.
   - `1:45`: Transition from Map to Branches table.
   - `2:30`: Transition from Branches to Growth candidate cards.
   - `3:30`: Open Right Drawer for Sensitivity Sliders and AI Advisor.
   - `4:30`: Open Data Provenance / Technical Docs and conclude.
4. **Key Talking Points to Emphasize:**
   - **Deterministic first, AI second:** Math determines the numbers; AI explains them.
   - **Real geocodes & ratings:** All 23 Bedashing locations reflect verified public ground truth.
   - **Zero-downtime resilience:** Built-in deterministic fallback ensures briefings always generate even without external API connectivity.
