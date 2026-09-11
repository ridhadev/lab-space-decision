import React from "react";
import {
  NetworkSummary,
  BranchEvaluation,
  CandidateEvaluation,
} from "../types";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface KpiBandProps {
  isOpen: boolean;
  onToggle: () => void;
  summary: NetworkSummary;
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  onOpenDataPanel: () => void;
  onNavigateToMap: () => void;
  onNavigateToGrowth: () => void;
  onSelectBranch: (b: BranchEvaluation) => void;
  onSelectCandidate: (c: CandidateEvaluation) => void;
}

export const KpiBand: React.FC<KpiBandProps> = ({
  isOpen,
  onToggle,
  summary,
  branchEvals,
  candidateEvals,
  onOpenDataPanel,
  onNavigateToMap,
  onNavigateToGrowth,
  onSelectBranch,
  onSelectCandidate,
}) => {
  const cannibalizedBranches = branchEvals.filter((b) => b.cannibalizationWarning);
  const topGrowCandidates = candidateEvals.filter((c) => c.classification === "GROW");

  return (
    <section
      id="kpi-band"
      aria-label="Portfolio Health & Strategic Metrics"
      className="w-full bg-[#0C182A] border-b border-[#1D3452] px-4 sm:px-6 py-2.5 transition-colors shrink-0"
    >
      {/* 10px-padded top strip on raised background */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Clickable Disclosure + Decision Count Pills */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="text-[11px] font-bold tracking-wider text-slate-200 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors uppercase select-none"
            title={isOpen ? "Collapse KPI metrics" : "Expand KPI metrics"}
          >
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#8BA2C1]" />
            )}
            <span>Portfolio Health</span>
          </button>

          {/* Decision Count Pills */}
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Protect {summary.protectCount}</span>
            </span>

            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Hold {summary.holdCount}</span>
            </span>

            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Shrink {summary.shrinkCount}</span>
            </span>

            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-teal-400" />
              <span>Grow {summary.growCount}</span>
            </span>
          </div>
        </div>

        {/* Right: Avg Health + Clickable Data Freshness Chip */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#8BA2C1] hidden sm:flex items-center gap-1.5">
            <span>Network Health:</span>
            <span className="text-xs font-mono font-bold text-white">
              {summary.averageHealthScore}/100
            </span>
          </div>

          {/* Clickable Data Freshness Chip (surfaced here, opens data panel) */}
          <button
            type="button"
            onClick={onOpenDataPanel}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A1424] hover:bg-[#142842] border border-[#1D3452] hover:border-emerald-500/40 text-[10.5px] font-medium text-slate-300 transition-all cursor-pointer shadow-xs group"
            title="Click to audit data provenance and trigger sync"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping shrink-0" />
            <span className="text-[#8BA2C1] group-hover:text-emerald-300">
              data 2h ago
            </span>
          </button>
        </div>
      </div>

      {/* When Expanded: 3 Summary Cards in auto-fit, minmax(260px, 1fr) Grid */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-[#1D3452]/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in-50 duration-150">
          {/* Card 1: Protect Allocation */}
          <div className="bg-[#0F1F35] p-3.5 rounded-xl border border-[#1D3452] shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {Math.round((summary.protectCount / summary.totalBranches) * 100)}% High-Moat
                </span>
              </div>

              <div className="mt-2.5">
                <span className="text-[10px] font-bold tracking-wider text-[#8BA2C1] uppercase">
                  Protect Allocation
                </span>
                <div className="text-2xl font-bold tracking-tight text-white mt-0.5">
                  {summary.protectCount}{" "}
                  <span className="text-xs font-normal text-[#8BA2C1]">/ 23 Lounges</span>
                </div>
                <p className="text-[11px] text-[#8BA2C1] mt-0.5">
                  14 Abu Dhabi · 5 Dubai · 2 Sharjah · 1 FUJ · 1 RAK
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1D3452] flex items-center justify-between text-[10px]">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Zero Sister Conflict</span>
              </span>
              <span className="text-[#536F93]">Safe Cashflow Moat</span>
            </div>
          </div>

          {/* Card 2: Cannibalization (Alert-tinted, Clicks through to Map) */}
          <div
            onClick={onNavigateToMap}
            role="button"
            tabIndex={0}
            className="bg-[#0F1F35] p-3.5 rounded-xl border border-rose-500/30 hover:border-rose-500/60 shadow-xs flex flex-col justify-between cursor-pointer group transition-all"
            title="Click to view cannibalization vectors on the Map"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {cannibalizedBranches.length} Conflicts
                </span>
              </div>

              <div className="mt-2.5">
                <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">
                  Cannibalization Alerts
                </span>
                <div className="text-2xl font-bold tracking-tight text-white mt-0.5">
                  {cannibalizedBranches.length}{" "}
                  <span className="text-xs font-normal text-rose-400 font-mono">
                    (&lt;4.0km Sister Buffer)
                  </span>
                </div>
                <p className="text-[11px] text-[#8BA2C1] mt-0.5">
                  Overlapping catchment radii diluting chair utilization
                </p>
              </div>

              {/* Quick Interactive Chips */}
              <div className="mt-2 flex flex-wrap gap-1">
                {cannibalizedBranches.slice(0, 3).map((item) => (
                  <button
                    key={item.branch.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBranch(item);
                    }}
                    className="px-1.5 py-0.5 rounded bg-[#142842] hover:bg-rose-500/20 border border-[#1D3452] text-[9.5px] text-[#8BA2C1] flex items-center gap-1 transition-colors"
                  >
                    <span className="text-rose-300 font-semibold">{item.branch.name.split(" ")[0]}</span>
                    <span>({item.branch.nearestSisterDistanceKm}km)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1D3452] flex items-center justify-between text-[10px]">
              <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                <TrendingDown className="w-3 h-3" />
                <span>View on Map →</span>
              </span>
              <span className="text-[#536F93]">Downsize chairs</span>
            </div>
          </div>

          {/* Card 3: Expansion Pipeline (Teal-tinted, Clicks through to Growth) */}
          <div
            onClick={onNavigateToGrowth}
            role="button"
            tabIndex={0}
            className="bg-[#0F1F35] p-3.5 rounded-xl border border-teal-500/30 hover:border-teal-500/60 shadow-xs flex flex-col justify-between cursor-pointer group transition-all sm:col-span-2 lg:col-span-1"
            title="Click to inspect prospective candidate growth zones"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  {summary.growCount} GROW Targets
                </span>
              </div>

              <div className="mt-2.5">
                <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">
                  Expansion Pipeline
                </span>
                <div className="text-2xl font-bold tracking-tight text-white mt-0.5">
                  +56 Chairs{" "}
                  <span className="text-xs font-normal text-teal-400 font-mono">
                    (Target Capacity)
                  </span>
                </div>
                <p className="text-[11px] text-[#8BA2C1] mt-0.5">
                  10 UAE Candidates Analyzed · Unmet demand catchments
                </p>
              </div>

              {/* Quick Interactive Chips */}
              <div className="mt-2 flex flex-wrap gap-1">
                {topGrowCandidates.slice(0, 3).map((item) => (
                  <button
                    key={item.candidate.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCandidate(item);
                    }}
                    className="px-1.5 py-0.5 rounded bg-[#142842] hover:bg-teal-500/20 border border-[#1D3452] text-[9.5px] text-[#8BA2C1] flex items-center gap-1 transition-colors"
                  >
                    <span className="text-teal-300 font-semibold">{item.candidate.name.split(" ")[0]}</span>
                    <span>(Score {item.finalScore})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1D3452] flex items-center justify-between text-[10px]">
              <span className="inline-flex items-center gap-1 text-teal-400 font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>View Growth Pipeline →</span>
              </span>
              <span className="text-[#536F93]">Dubai Hills, Saadiyat</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
