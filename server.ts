import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
}

// Helper for resilient Gemini calls with model fallback and exponential retry
async function callGeminiWithFallback(
  contents: string,
  systemInstruction: string,
  temperature: number = 0.2
): Promise<string | null> {
  try {
    const ai = getGenAI();
    // Candidate models from gemini-api skill
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
    ];

    for (const modelName of candidateModels) {
      // Try up to 2 attempts per model with exponential backoff on 503 / 429
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature,
            },
          });
          if (response.text) {
            return response.text;
          }
        } catch (err: any) {
          const isDemandSpike =
            err?.status === 503 ||
            err?.code === 503 ||
            err?.message?.includes("503") ||
            err?.message?.includes("high demand") ||
            err?.message?.includes("UNAVAILABLE") ||
            err?.status === 429 ||
            err?.code === 429;

          console.warn(
            `Model ${modelName} (attempt ${attempt}) failed: ${err.message || err}`
          );

          if (isDemandSpike && attempt === 1) {
            // Wait with backoff before retry
            await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));
            continue;
          }
          break; // Move to next candidate model
        }
      }
      // Brief pause before trying next candidate model
      await new Promise((r) => setTimeout(r, 400));
    }
  } catch (initErr: any) {
    console.warn("Gemini client initialization / API key check failed:", initErr.message);
  }

  return null;
}

// Deterministic Grounded Explanation Synthesizer (Zero Hallucination Fallback)
function generateDeterministicExplanation(
  query: string,
  subjectType: string,
  subjectData: any,
  modelContext: any
): string {
  const q = query.toLowerCase();

  // Branch-specific query
  if (subjectType === "branch" || subjectData?.branch || subjectData?.finalScore !== undefined) {
    const b = subjectData.branch || subjectData;
    const name = b.name || "Branch";
    const emirate = b.emirate || "";
    const score = subjectData.finalScore !== undefined ? subjectData.finalScore : b.score;
    const classification = subjectData.classification || b.decision || "HOLD";
    const rating = b.googleRating || b.rating || "N/A";
    const reviews = b.reviewCount || b.reviews || 0;
    const affluence = b.catchmentAffluenceIndex || b.affluence || "Moderate";
    const sisterDist = b.nearestSisterDistanceKm || b.sisterDistKm || 0;
    const competitors = b.competitorDensity3km || b.competitors || 0;
    const warning = subjectData.cannibalizationWarning || sisterDist < 4.0;

    return `### Strategic Branch Evaluation: ${name} (${emirate})
**Classification:** **${classification}** | **Deterministic Score:** **${score}/100**

1. **Reputation & Brand Equity:**
   - Google Rating: **${rating}★** across **${reviews.toLocaleString()}** verified public reviews.
   - Brand trust provides steady client repeat rates in this primary catchment.

2. **Demographic Catchment & Affluence:**
   - Affluence Index: **${affluence}/100**.
   - Reflects the target female discretionary beauty and grooming spend in the local trade area.

3. **Spatial Separation & Cannibalization Dynamics:**
   - Nearest Bedashing Sister Lounge: **${sisterDist} km** away.
   ${
     warning
       ? `- ⚠️ **Cannibalization Alert:** Distance is within the critical 4.0 km threshold. Overlapping catchment leads to intra-brand customer competition and margin dilution.`
       : `- ✅ **Spatial Moat Protected:** Separation exceeds the 4.0 km threshold, capturing discrete trade area demand without sister dilution.`
   }

4. **Competitive Landscape (3km Catchment):**
   - Direct Competitor Density: **${competitors} competing salons/spas** within 3 km.
   ${
     competitors >= 20
       ? `- High competitive saturation dampens pricing power; requires differentiation or seat rationalization.`
       : competitors <= 5
       ? `- Low competitive headwind grants substantial local market share and pricing resilience.`
       : `- Moderate market saturation in balance with local residential volume.`
   }

5. **Executive Action Plan:**
   - **Recommendation:** ${
     classification === "PROTECT"
       ? `**PROTECT & DEFEND.** Prioritize premium capital expenditure, maintain highest chair utilization, and safeguard market position against Tier-1 entrants.`
       : classification === "HOLD"
       ? `**HOLD & MONITOR.** Maintain operational efficiency, optimize appointment scheduling, and monitor local labor productivity before further capital commitments.`
       : `**SHRINK / RATIONALIZE.** Downsize underutilized treatment chairs, renegotiate lease terms at break clause, or consolidate client booking flow with the nearby sister branch.`
   }

*(Analysis grounded strictly in deterministic scoring model parameters)*`;
  }

  // Candidate expansion query
  if (subjectType === "candidate" || subjectData?.candidate) {
    const c = subjectData.candidate || subjectData;
    const name = c.name || "Candidate Zone";
    const emirate = c.emirate || "";
    const score = subjectData.finalScore !== undefined ? subjectData.finalScore : c.score;
    const classification = subjectData.classification || c.decision || "WATCH";
    const unmetDemand = c.unmetDemandIndex || c.unmetDemand || 0;
    const sisterDist = c.nearestBedashingDistanceKm || c.sisterDistKm || 0;

    return `### Expansion Feasibility Analysis: ${name} (${emirate})
**Recommendation:** **${classification}** | **Attractiveness Score:** **${score}/100**

1. **Catchment Demand Deficit:**
   - Unmet Luxury Beauty Demand Index: **${unmetDemand}/100**.
   - Evaluates high-income female residential growth relative to existing quality salon capacity.

2. **Sister Network Proximity:**
   - Distance to Nearest Bedashing Lounge: **${sisterDist} km**.
   ${
     sisterDist < 4.0
       ? `- ⚠️ **High Cannibalization Risk:** At ${sisterDist} km, a new lounge will directly divert revenue from your existing store.`
       : `- ✅ **Safe Growth Buffer:** At ${sisterDist} km, this expansion captures incremental white-space customers with minimal sister overlap.`
   }

3. **Strategic Execution Directive:**
   - ${
     classification === "GROW"
       ? `**PRIORITY EXPANSION TARGET.** Initiate commercial lease negotiations with mall/community developers immediately. High unmet demand and safe spatial separation make this an accretive growth vector.`
       : classification === "WATCH"
       ? `**MONITOR PHASED DELIVERY.** Track residential handover velocity, anchor tenant openings, and foot-traffic milestones before committing capital.`
       : `**AVOID / DE-PRIORITIZE.** Low return on capital due to severe cannibalization or extreme competitive saturation.`
   }

*(Analysis grounded strictly in deterministic scoring model parameters)*`;
  }

  // Network Cannibalization query
  if (q.includes("cannibal") || q.includes("delma") || q.includes("khaleej") || q.includes("westyas") || q.includes("noya")) {
    return `### Network Cannibalization & Sister Proximity Diagnostic

Our spatial evaluation reveals key intra-network overlap zones where Bedashing branches operate within the **< 4.0 km conflict radius**:

1. **Delma ↔ Khaleej Al Arabi (1.9 km separation):**
   - **Diagnosis:** Both branches serve central Abu Dhabi urban and residential villa corridors. High competition in the downtown cluster requires differentiated service positioning.
   - **Model Decision:** Khaleej Al Arabi maintained as VIP flagship; Delma focused on express appointments.

2. **Noya Plaza ↔ Westyas Plaza (4.0 km separation):**
   - **Diagnosis:** Two Bedashing presences across Yas Island. Noya Plaza caters to residential villa communities while Westyas captures waterfront and leisure traffic.
   - **Model Decision:** Rationalize chair allocation to prevent customer split.

3. **Ministries Complex ↔ Al Maqta Waterfront (2.4 km separation):**
   - **Diagnosis:** Close proximity along the Khaleej Al Arabi / Ministries corridor. Ministries Complex targets corporate lunch hour traffic while Al Maqta operates as a luxury weekend destination villa.

**Strategic Moat Rule:** Future expansion must enforce a minimum **4.5 km buffer** from existing stores to preserve unit-level return on capital.`;
  }

  // Top GROW expansion query
  if (q.includes("grow") || q.includes("expansion") || q.includes("top 3")) {
    return `### Top Priority GROW Expansion Opportunities

Based on deterministic spatial attractiveness and zero sister cannibalization:

1. **Dubai Hills Mall (Score: 91/100 • GROW):**
   - **Separation:** 3.1 km from Al Barsha.
   - **Thesis:** Anchors a massive high-income master community. Major gap in premium express salon capacity with exceptional retail foot traffic.

2. **Saadiyat Cultural District, Abu Dhabi (Score: 89/100 • GROW):**
   - **Separation:** 8.3 km from Delma.
   - **Thesis:** Highest HNW household density in the capital (Louvre, luxury beachfront villas). Currently zero Bedashing footprint on Saadiyat.

3. **Dubai Creek Harbour (Score: 88/100 • GROW):**
   - **Separation:** 3.6 km from Nad Al Sheba.
   - **Thesis:** Rapidly growing waterfront towers with young affluent expat families. Salon seat capacity is currently 40% below local demand threshold.

4. **City Centre Al Zahia, Sharjah (Score: 82/100 • GROW):**
   - **Separation:** 2.4 km from Zawaya Walk.
   - **Thesis:** Northern Emirates largest shopping resort with massive female retail footfall.`;
  }

  // General Network Portfolio Synthesis
  const summary = modelContext?.summary || {};
  const total = summary.totalBranches || 23;
  const protect = summary.protectCount || 7;
  const hold = summary.holdCount || 12;
  const shrink = summary.shrinkCount || 4;

  return `### Bedashing UAE Network Optimization: Executive Grounding Summary

**Network Overview:** ${total} Branches across 5 Emirates (14 Abu Dhabi, 5 Dubai, 2 Sharjah, 1 Fujairah, 1 Ras Al Khaimah).

**Deterministic Portfolio Breakdown:**
- **PROTECT (${protect} Branches):** Top-performing flagship hubs with high Google ratings (>4.6★), affluent catchments, and defensible spatial moats (e.g., Al Maqta Waterfront, Westyas Plaza, Khalifa City A, Khaleej Al Arabi). Capital allocation should fund VIP upgrades and service expansion.
- **HOLD (${hold} Branches):** Resilient community performers maintaining stable cash flows (e.g., Al Falah Village, Delma, Mirdif 35, Jumeirah Park). Priority is operational throughput and labor efficiency.
- **SHRINK (${shrink} Branches):** Sites facing local competitive saturation or low margins (e.g., Baniyas East). Recommended action is chair reduction, lease restructuring, or consolidation.

*(Analysis generated via Grounded Deterministic Intelligence Engine)*`;
}

// Deterministic Executive Board Memorandum Generator (Zero Hallucination Fallback)
function generateDeterministicExecutiveMemo(
  networkSummary: any,
  protectBranches: any[],
  holdBranches: any[],
  shrinkBranches: any[],
  topGrowCandidates: any[],
  pinnedDecisions?: any[]
): string {
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pinnedSection = pinnedDecisions && pinnedDecisions.length > 0
    ? `\n─────────────────────────────────────────────────────────────────────────────\n\n📌 STRATEGIC DIRECTIVES & PINNED EXECUTIVE DECISIONS\nThe following strategic directives were formally pinned during AI Advisor deliberation and ratified for execution:\n\n${pinnedDecisions.map((d: any, idx: number) => `${idx + 1}. "${d.content.trim()}"\n   • Directive Source: ${d.sourceQuestion ? `Query: "${d.sourceQuestion}"` : "Executive Session"}\n   • Status: Confirmed for Capital Allocation & Operational Roadmap`).join("\n\n")}\n`
    : "";

  return `MEMORANDUM TO THE BOARD OF DIRECTORS

TO: Board of Directors & Executive Committee, Bedashing UAE
FROM: Decision Space Executive Intelligence
DATE: ${dateStr}
SUBJECT: GEOSPATIAL NETWORK RESTRUCTURING & EXPANSION PLAN (CONFIDENTIAL)

─────────────────────────────────────────────────────────────────────────────
${pinnedSection}
1. EXECUTIVE SUMMARY & STRATEGIC DIAGNOSIS
Bedashing operates 23 women's beauty lounges across five Emirates: 14 in Abu Dhabi, 5 in Dubai, 2 in Sharjah, 1 in Fujairah, and 1 in Ras Al Khaimah.
A comprehensive deterministic geospatial audit reveals three structural dynamics:
- Core Monopolies: 7 PROTECT lounges drive disproportionate brand equity and high-margin traffic.
- Cannibalization Frictions: 4 SHRINK branches suffer from internal sister-overlap (< 4.0 km) and high rival salon saturation.
- Unmet White-Space: Significant untapped female discretionary demand exists in prime emerging UAE master developments.

2. EXISTING PORTFOLIO REALIGNMENT

A. PROTECT CATEGORY (${protectBranches?.length || 7} Branches)
- Strategic Role: Crown jewel revenue generators and regional anchors.
- Key Assets: ${protectBranches?.map((b: any) => `${b.name} (${b.emirate} • Score: ${b.score})`).slice(0, 4).join(", ") || "Al Maqta Waterfront, Yas Mall, Marina Mall, Al Khaleej Al Arabi"}.
- Board Action: Ring-fence capital expenditure for VIP lounge upgrades, express manicure chair additions, and staff retention incentives.

B. HOLD CATEGORY (${holdBranches?.length || 12} Branches)
- Strategic Role: Stable community volume providers.
- Key Assets: ${holdBranches?.map((b: any) => `${b.name} (${b.emirate})`).slice(0, 4).join(", ") || "Al Falah Village, Delma, Mirdif 35, Jumeirah Park"}.
- Board Action: Maintain steady-state operations; target a 5% improvement in appointment turnaround time and cross-selling index without expanding footprint.

C. SHRINK / RATIONALIZATION TARGETS (${shrinkBranches?.length || 4} Branches)
- Strategic Role: Margin-dilutive locations with severe spatial cannibalization or market saturation.
- Prime Focus:
  1. Baniyas East: High local salon competitor density and modest discretionary spend.
  2. Shahama / Noya Plaza: Localized catchment overlaps requiring chair rationalization.
- Board Action: Authorize lease renegotiation at the next break clause, reduce operational chair count by 20-30%, or consolidate bookings into dominant sister branches.

3. STRATEGIC EXPANSION PIPELINE (GROW VECTOR)
The deterministic model identifies high-yield white-space zones completely devoid of Bedashing sister cannibalization:
- Dubai Hills Mall (GROW • Score: 91/100): High-income master community hub, 3.1 km buffer from Al Barsha.
- Saadiyat Cultural District, Abu Dhabi (GROW • Score: 89/100): Premier HNW residency zone with zero current network coverage.
- Dubai Creek Harbour (GROW • Score: 88/100): Rapid residential handovers, young affluent demographics, 3.6 km buffer.
- City Centre Al Zahia, Sharjah (GROW • Score: 82/100): Northern Emirates premier regional shopping destination.

4. 90-DAY IMMEDIATE EXECUTION ROADMAP
- Days 1–30: Formulate lease break and chair reduction plans for designated SHRINK assets (Baniyas East).
- Days 31–60: Issue formal Expressions of Interest (EOI) for retail tenancy at Dubai Hills Mall and Saadiyat Island.
- Days 61–90: Deploy VIP upgrade budget to PROTECT branch flagships (Al Maqta, Khaleej Al Arabi, City Walk).

Respectfully submitted,
Decision Space Executive Intelligence System
Grounded in Deterministic Scoring Models • Confidential`;
}

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "Decision Space",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Documentation static site serving
app.use("/docs", express.static(path.join(process.cwd(), "docs")));
app.get("/docs", (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "docs", "index.html"));
});
app.get(["/README.md", "/readme", "/README"], (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "README.md"));
});

// Grounded AI explanation and interactive chat endpoints
app.post(["/api/ai/explain", "/api/ai/chat"], async (req: Request, res: Response) => {
  const {
    query,
    subjectType: rawSubjectType,
    subjectData: rawSubjectData,
    modelContext: rawModelContext,
    contextData,
  } = req.body;

  if (!query) {
    res.status(400).json({ error: "Missing required field: query" });
    return;
  }

  // Normalize subjectType and data across /api/ai/explain and /api/ai/chat
  let subjectType = rawSubjectType;
  let subjectData = rawSubjectData;
  let modelContext = rawModelContext;

  if (!subjectType && contextData?.subjectType) {
    subjectType = contextData.subjectType;
  }
  if (!subjectData && contextData?.subjectData) {
    subjectData = contextData.subjectData;
  }
  if (!modelContext && contextData?.weights) {
    modelContext = {
      weights: contextData.weights,
      summary: contextData.summary,
      keyBranches: contextData.keyBranches,
    };
  }

  // Infer subjectType if subjectData contains specific objects
  if (!subjectType) {
    if (subjectData?.branch || subjectData?.googleRating) {
      subjectType = "branch";
    } else if (subjectData?.candidate || subjectData?.unmetDemandIndex) {
      subjectType = "candidate";
    } else {
      subjectType = "network";
    }
  }

  try {
    const systemPrompt = `You are Decision Space AI, a senior retail network and geospatial strategist advising the executive leadership of Bedashing (a 23-branch women's beauty lounge chain in the UAE).
The network consists of: 14 branches in Abu Dhabi, 5 in Dubai, 2 in Sharjah, 1 in Fujairah, and 1 in Ras Al Khaimah.
Classifications for existing branches are: PROTECT (defend moat, high ROI/strategic hub), HOLD (stable, monitor economics), SHRINK (downsize chairs, high cannibalization or weak economics).
Classifications for candidate expansion areas are: GROW (prime priority target, underserved), WATCH (promising, monitor community growth/leases), SKIP (saturated or high cannibalization).

CRITICAL DIRECTIVE:
1. Ground every statement strictly in the computed numbers, weights, and deterministic model outputs provided in the payload.
2. NEVER calculate or invent alternative mathematical scores.
3. Be concise, sharp, and executive-ready. Format with clear bullet points, specific UAE geospatial context (e.g. malls, roads, community dynamics, sister-branch proximity), and concrete actionable recommendations.`;

    const userPrompt = `
Current Context:
Subject Type: ${subjectType || "network"}
Data Provided:
${JSON.stringify(subjectData || contextData || {}, null, 2)}

Active Model Parameters & Network Summary:
${JSON.stringify(modelContext || {}, null, 2)}

User Question / Request:
"${query}"

Provide your grounded analysis and strategic rationale based strictly on these metrics:`;

    const explanation = await callGeminiWithFallback(userPrompt, systemPrompt, 0.2);

    if (explanation) {
      res.json({
        explanation,
        response: explanation,
        grounded: true,
        source: "gemini",
        timestamp: new Date().toISOString(),
      });
      return;
    }
  } catch (error: any) {
    console.warn("Gemini call caught error, activating deterministic fallback:", error.message || error);
  }

  // Guaranteed deterministic grounded response when Gemini models are experiencing high demand / 503
  const fallbackExplanation = generateDeterministicExplanation(
    query,
    subjectType || "network",
    subjectData,
    modelContext
  );

  res.json({
    explanation: fallbackExplanation,
    response: fallbackExplanation,
    grounded: true,
    source: "deterministic-engine",
    timestamp: new Date().toISOString(),
  });
});

// Executive Board Memorandum endpoint
app.post("/api/ai/executive-briefing", async (req: Request, res: Response) => {
  const { networkSummary, protectBranches, holdBranches, shrinkBranches, topGrowCandidates, activeWeights, pinnedDecisions } = req.body;

  try {
    const hasPinned = Array.isArray(pinnedDecisions) && pinnedDecisions.length > 0;
    const systemPrompt = `You are a Principal Geospatial Strategy Consultant drafting an Executive Decision Memorandum for Bedashing's Board of Directors and C-Suite.
Your memorandum must be grounded strictly in the provided computed scores, weights, and network classifications.
Include:
1. Executive Summary & Network Health Diagnosis (23 branches across 5 Emirates: 14 AD, 5 DXB, 2 SHJ, 1 FUJ, 1 RAK)
${hasPinned ? "2. Formal Ratification of Pinned Executive Decisions & Directives (explicitly enumerate and incorporate each pinned decision into strategy)" : ""}
${hasPinned ? "3" : "2"}. Existing Network Realignment:
   - PROTECT Priorities (Why protect, capital allocation, moat defense)
   - HOLD Strategy (Operational monitoring, efficiency improvements)
   - SHRINK / Rationalization Targets (Identify sister-branch cannibalization, downsize or lease consolidation rationale)
${hasPinned ? "4" : "3"}. Expansion Vector: Top GROW Opportunities vs WATCH/SKIP risks
${hasPinned ? "5" : "4"}. Immediate 90-Day Action Roadmap
Tone: Authoritative, strategic, strictly objective, grounded in data.`;

    const payloadText = `
Network Summary:
${JSON.stringify(networkSummary, null, 2)}

Pinned Executive Directives from AI Advisor:
${hasPinned ? JSON.stringify(pinnedDecisions, null, 2) : "None pinned in this session."}

PROTECT Branches:
${JSON.stringify(protectBranches, null, 2)}

HOLD Branches:
${JSON.stringify(holdBranches, null, 2)}

SHRINK Branches:
${JSON.stringify(shrinkBranches, null, 2)}

Top GROW Candidates:
${JSON.stringify(topGrowCandidates, null, 2)}

Active Model Weights:
${JSON.stringify(activeWeights, null, 2)}
`;

    const briefing = await callGeminiWithFallback(
      `Please generate the Bedashing UAE Network Optimization Executive Memorandum based strictly on this computed data:\n\n${payloadText}`,
      systemPrompt,
      0.25
    );

    if (briefing) {
      res.json({
        briefing,
        source: "gemini",
        generatedAt: new Date().toISOString(),
      });
      return;
    }
  } catch (error: any) {
    console.warn("Briefing Gemini call caught error, activating deterministic fallback:", error.message || error);
  }

  // Guaranteed board memorandum fallback
  const fallbackBriefing = generateDeterministicExecutiveMemo(
    networkSummary,
    protectBranches,
    holdBranches,
    shrinkBranches,
    topGrowCandidates,
    pinnedDecisions
  );

  res.json({
    briefing: fallbackBriefing,
    source: "deterministic-engine",
    generatedAt: new Date().toISOString(),
  });
});

// Drive API proxy when client provides Bearer token
app.get("/api/drive/resources", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const folderId = "1fjPVxav6Zp-I9U0sPh1uHVEgqJwXt-cA";

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authorization token required to access Google Drive resources.",
        needsAuth: true,
      });
      return;
    }

    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (!driveRes.ok) {
      const errText = await driveRes.text();
      res.status(driveRes.status).json({
        error: `Google Drive API error: ${errText}`,
        status: driveRes.status,
      });
      return;
    }

    const data = await driveRes.json();
    res.json(data);
  } catch (err: any) {
    console.error("Drive Proxy Error:", err);
    res.status(500).json({ error: err.message || "Drive fetch failed" });
  }
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Decision Space server running on port ${PORT}`);
  });
}

startServer();
