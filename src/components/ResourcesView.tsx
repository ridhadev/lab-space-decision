import React, { useState } from "react";
import { DRIVE_RESOURCES, METHODOLOGY_NOTES } from "../data/specs";
import { BEDASHING_BRANCHES } from "../data/branches";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const ResourcesView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<string>("ai-case-study.docx");

  return (
    <div className="space-y-4 text-slate-200">
      {/* Top Banner */}
      <div className="bg-[#161B22] p-4 rounded-lg border border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
              Folder ID: 1fjPVxav6Zp-I9U0sPh1uHVEgqJwXt-cA
            </span>
            <h2 className="text-base font-bold text-white mt-1.5 uppercase tracking-tight">
              DECISION SPACE RESOURCE LIBRARY & SPECIFICATION PRECEDENCE
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
              The application logic strictly incorporates all six resources provided in the Google Drive repository, observing the mandatory hierarchy of precedence whenever requirements conflict.
            </p>
          </div>
        </div>

        {/* Precedence Hierarchy */}
        <div className="mt-4 pt-3 border-t border-slate-700/80">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Strict Precedence Rules (From Client Briefing)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/80">
              <span className="font-bold text-indigo-400 block font-mono text-[11px]">1. ai-case-study.docx</span>
              <span className="text-slate-400 text-[11px]">Wins on requirements. The requirement source of truth.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/80">
              <span className="font-bold text-indigo-400 block font-mono text-[11px]">2. FUNCTIONAL_SPEC.md</span>
              <span className="text-slate-400 text-[11px]">Wins on behaviour. What the application does (FR-1 to FR-11).</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/80">
              <span className="font-bold text-indigo-400 block font-mono text-[11px]">3. APPROACH.md</span>
              <span className="text-slate-400 text-[11px]">Wins on definitions & formulas. Thresholds, weights, scoring math.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/80">
              <span className="font-bold text-indigo-400 block font-mono text-[11px]">4. IMPLEMENTATION_SPEC.md</span>
              <span className="text-slate-400 text-[11px]">Wins on structure. Files, layout, libraries, phase order.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: List of 6 Resources */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            The 6 Repository Files
          </h3>
          {DRIVE_RESOURCES.map((file) => (
            <div
              key={file.name}
              onClick={() => setActiveDoc(file.name)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                activeDoc === file.name
                  ? "bg-indigo-950/40 text-white border-indigo-500 shadow-sm"
                  : "bg-[#161B22] text-slate-300 border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-xs flex items-center space-x-2">
                  <FileText className={`w-3.5 h-3.5 ${activeDoc === file.name ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{file.name}</span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    activeDoc === file.name
                      ? "bg-indigo-900/50 text-indigo-300 border border-indigo-700/50"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {file.category}
                </span>
              </div>
              <p className={`text-[11px] line-clamp-2 ${activeDoc === file.name ? "text-slate-300" : "text-slate-400"}`}>
                {file.description}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                <span className={`font-semibold flex items-center space-x-1 ${activeDoc === file.name ? "text-emerald-400" : "text-emerald-400"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{file.status}</span>
                </span>
                <span className="text-slate-500">
                  {file.size}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Detailed Document Viewer */}
        <div className="lg:col-span-8 bg-[#161B22] p-5 rounded-lg border border-slate-700 shadow-sm text-slate-200">
          {activeDoc === "README.md" && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                    GitHub Quick Start & Installation Reference • /README.md
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">README.md (Developer Quick Start)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Local Installation
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-900/90 rounded border border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-white text-xs">🚀 1-Minute Quick Start (From Cloned GitHub Repo):</h4>
                  <pre className="font-mono text-[11px] text-indigo-300 bg-black/40 p-2.5 rounded overflow-x-auto">
{`# 1. Clone repository
git clone https://github.com/your-org/decision-space.git
cd decision-space

# 2. Install dependencies
npm install

# 3. Configure environment file
cp .env.example .env

# 4. Start full-stack development server
npm run dev

# -> Open http://localhost:3000 in your browser`}
                  </pre>
                </div>

                <div className="p-3 bg-slate-900/90 rounded border border-slate-700 space-y-2">
                  <h4 className="font-bold text-white text-xs">🔑 API Keys Summary & Requirements:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-700 text-[10px] uppercase font-mono">
                          <th className="pb-1.5">Service</th>
                          <th className="pb-1.5">Required?</th>
                          <th className="pb-1.5">Config Location</th>
                          <th className="pb-1.5">Behavior If Not Set</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-[10px]">
                        <tr>
                          <td className="py-1.5 font-bold text-slate-200">CARTO Tiles</td>
                          <td className="py-1.5 text-emerald-400">⚡ Pre-Configured</td>
                          <td className="py-1.5 text-indigo-300">.env (VITE_CARTO_API_KEY)</td>
                          <td className="py-1.5 text-slate-400">Authenticated key eliminates "API key required" watermark flag</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold text-slate-200">Scoring Engine</td>
                          <td className="py-1.5 text-emerald-400">❌ No API Key</td>
                          <td className="py-1.5 text-slate-400">None needed</td>
                          <td className="py-1.5 text-slate-400">100% offline mathematical execution</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold text-slate-200">Gemini 3.8 Flash</td>
                          <td className="py-1.5 text-amber-400">⚡ Optional</td>
                          <td className="py-1.5 text-indigo-300">.env (GEMINI_API_KEY)</td>
                          <td className="py-1.5 text-slate-400">Zero-downtime deterministic fallback synthesis</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded border border-slate-700 space-y-1 text-[11px]">
                  <h4 className="font-bold text-white text-xs">📦 Production Build Commands:</h4>
                  <p className="text-slate-400">
                    To compile static assets and bundle the server for container or standalone production:
                  </p>
                  <pre className="font-mono text-[11px] text-slate-300 bg-black/40 p-2 rounded">
npm run build && npm start
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeDoc === "ai-case-study.docx" && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Resource #1 • Requirements Source of Truth
                </span>
                <h3 className="text-base font-bold text-white mt-1">ai-case-study.docx</h3>
              </div>
              <div className="space-y-3">
                <p>
                  <strong>Context & Objective:</strong> Bedashing is an established luxury women's beauty lounge chain operating 23 branches across the UAE (14 in Abu Dhabi, 5 in Dubai, 2 in Sharjah, 1 in Fujairah, 1 in Ras Al Khaimah). Executive leadership requires a robust, AI-enabled geospatial decision-support application to answer two core strategic questions:
                </p>
                <div className="p-3 bg-slate-900/90 rounded border border-slate-700 space-y-1">
                  <div><strong>1. Existing Branches:</strong> Which branches to PROTECT, HOLD, or SHRINK?</div>
                  <div><strong>2. Candidate Areas:</strong> Which prospective UAE zones to GROW, WATCH, or SKIP?</div>
                </div>
                <p>
                  <strong>Deterministic Foundation:</strong> Both classifications must stem from a deterministic weighted scoring model whose inputs, weights, and rules are visible and fully adjustable in the user interface.
                </p>
                <p>
                  <strong>AI Grounding Mandate:</strong> A language model sits on top to explain results and answer strategic questions, grounded strictly in the computed numbers. <em>It never computes a score.</em>
                </p>
              </div>
            </div>
          )}

          {activeDoc === "FUNCTIONAL_SPEC.md" && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Resource #2 • Application Behaviour
                </span>
                <h3 className="text-base font-bold text-white mt-1">FUNCTIONAL_SPEC.md</h3>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white">Key Functional Requirements:</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-slate-300">
                  <li><strong>FR-1 (Branch Scoring):</strong> Compute deterministic scores for all 23 Bedashing branches across Reputation, Catchment Demand, Cannibalization, and Competition.</li>
                  <li><strong>FR-2 (Branch Classification):</strong> Classify branches into PROTECT, HOLD, or SHRINK based on user-adjustable thresholds.</li>
                  <li><strong>FR-3 (Candidate Scoring):</strong> Compute expansion attractiveness across Unmet Demand, Affluence, Retail Gravity, and Sister Separation.</li>
                  <li><strong>FR-4 (Candidate Classification):</strong> Classify expansion zones into GROW, WATCH, or SKIP.</li>
                  <li><strong>FR-5 (Interactive Weight Tuning):</strong> Provide interactive controls to adjust scoring weights with live recalculation in &lt;100ms.</li>
                  <li><strong>FR-6 (Geospatial Visualization):</strong> Render interactive map of the UAE with branch and candidate markers, 3km buffer circles, and cannibalization conflict vectors.</li>
                  <li><strong>FR-7 (Audit Tracing):</strong> Expose exact mathematical formula strings for every evaluated branch and candidate.</li>
                  <li><strong>FR-8 (Grounded AI Reasoning):</strong> Integrate LLM that explains decisions strictly referencing the computed numbers.</li>
                  <li><strong>FR-9 (Board Memorandum Generation):</strong> One-click synthesis of executive board memorandum with copy and print formats.</li>
                </ul>
              </div>
            </div>
          )}

          {activeDoc === "APPROACH.md" && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Resource #3 • Definitions, Lexicon & Formulas
                </span>
                <h3 className="text-base font-bold text-white mt-1">APPROACH.md</h3>
              </div>
              <div className="space-y-3">
                <p>
                  <strong>Scoring Model Dimensions & Normalization:</strong>
                </p>
                <div className="p-3 bg-black/60 text-slate-200 rounded border border-slate-800 font-mono text-[11px] space-y-1">
                  <div>Reputation Score = 0.7 × ((Rating - 3.5)/1.5 × 100) + 0.3 × (Reviews / 1400 × 100)</div>
                  <div>Demand Score = Catchment Affluence Index (0-100)</div>
                  <div>Cannibalization Factor = Proximity to nearest sister (&lt;2km = 25, &gt;5km = 100)</div>
                  <div>Competition Score = Salon density in 3km (&le;3 salons = 100, &ge;25 = 30)</div>
                  <div>Final Score = Weighted Average of 4 Dimensions</div>
                </div>
                <p>
                  <strong>Threshold Archetypes:</strong> Default branch thresholds set at 72 (PROTECT) and 52 (HOLD / SHRINK). Default candidate thresholds set at 76 (GROW) and 56 (WATCH / SKIP).
                </p>
              </div>
            </div>
          )}

          {activeDoc === "IMPLEMENTATION_SPEC.md" && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Resource #4 • Technical Architecture
                </span>
                <h3 className="text-base font-bold text-white mt-1">IMPLEMENTATION_SPEC.md</h3>
              </div>
              <div className="space-y-2 text-slate-300">
                <p>
                  <strong>Stack:</strong> React 19 + TypeScript + Vite + Express + Tailwind CSS.
                </p>
                <p>
                  <strong>Geospatial:</strong> Leaflet with CartoDB Dark tiles, SVG overlay markers, buffer circles, and dynamic cannibalization vectors.
                </p>
                <p>
                  <strong>AI Integration:</strong> Google Gen AI SDK (`@google/genai`) with `gemini-3.8-flash` on server-side `/api/ai/*` routes.
                </p>
                <p>
                  <strong>Drive Integration:</strong> Client-side Firebase Google Auth with scope `https://www.googleapis.com/auth/drive.readonly` and in-memory access token management.
                </p>
              </div>
            </div>
          )}

          {activeDoc === "branches_raw.csv" && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Resource #5 • Raw Extracted Data
                </span>
                <h3 className="text-base font-bold text-white mt-1">branches_raw.csv (23 Branches)</h3>
              </div>
              <div className="max-h-96 overflow-y-auto font-mono text-[10px] bg-slate-900/90 p-3 rounded border border-slate-700 text-slate-300">
                <div className="font-bold text-indigo-400 border-b border-slate-700 pb-1 mb-1">
                  id,name,emirate,area,latitude,longitude,rating,reviews
                </div>
                {BEDASHING_BRANCHES.map((b) => (
                  <div key={b.id} className="py-0.5 border-b border-slate-800">
                    {b.id},{b.name},{b.emirate},{b.area},{b.lat.toFixed(4)},{b.lng.toFixed(4)},{b.googleRating},{b.reviewCount}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDoc === "01_branches.py" && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Resource #6 • Collector Script
                </span>
                <h3 className="text-base font-bold text-white mt-1">01_branches.py</h3>
              </div>
              <pre className="p-4 bg-black/70 text-emerald-400 rounded overflow-x-auto font-mono text-[11px] leading-relaxed border border-slate-800">
{`import csv
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

print("Loaded 23 Bedashing branches. Haversine sister-branch distance matrix calculated.")
`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
