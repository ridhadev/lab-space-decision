# Decision Space - Version Registry & Changelog

This document tracks all version snapshots, architectural baselines, and release histories for the **Decision Space** retail geospatial platform.

---

## Version Summary
- **Total Versions to Date**: **1**
- **Current Active Version**: **V.01**
- **Release Date**: September 10, 2026
- **Git Tag**: `V.01` (`1cab8c9`)
- **Archive Snapshot**: `/snapshots/V.01/snapshot-v01.tar.gz`

---

## Release History

### Version V.01 (Current Release)
- **Tag**: `V.01`
- **Semantic Version**: `0.1.0`
- **Release Date**: 2026-09-10
- **Summary**: Initial complete production baseline for UAE multi-branch salon network decision-support.

#### Key Capabilities & Modules
1. **Deterministic Multi-Factor Scoring Engine** (`/src/services/scoringEngine.ts`):
   - 4-pillar lounge classification: `PROTECT` (≥ 85), `HOLD` (70–84), `SHRINK` (< 70).
   - Candidate ranking: `GROW` (≥ 80), `WATCH` (65–79), `SKIP` (< 65).
   - Spherical Haversine distance calculator ($R=6,371\text{ km}$) with 4.0km cannibalization alert buffer.
2. **Curated Datasets**:
   - 23 verified Bedashing lounges across 5 Emirates with Google ratings (4.1–4.8★), review volumes (280–1,420), and capacity metrics.
   - 10 high-potential expansion candidate zones with unmet demand and demographic catchment counts.
3. **Interactive Geospatial Interface** (`/src/components/GeospatialMap.tsx`):
   - Leaflet map with CartoDB Dark Matter tiles, custom SVG markers, sister distance connectors, and cannibalization rings.
4. **Grounded AI Strategic Reasoning & Board Memorandum** (`server.ts`):
   - Gemini 3.8 Flash natural language briefings grounded strictly in computed mathematical scores.
   - Zero-downtime deterministic fallback for 503 upstream conditions or missing credentials.
   - Rich Markdown presentation pipeline (`react-markdown` + `remark-gfm`).
5. **Per-Location AI Rationale Isolation & Caching** (`/src/services/aiStorage.ts`):
   - Isolated browser `localStorage` caching per location with ISO timestamps.
   - Active real-time loading feedback with pulsed neural radar and shimmering skeleton rows.
   - On-demand regeneration controls.
6. **Executive Dynamic Sensitivity Modeling**:
   - Real-time sliders for live portfolio recalculation and what-if exploration.
7. **Built-In Documentation**:
   - Integrated technical guide hosted at `/docs` with data provenance and mathematical proofs.
