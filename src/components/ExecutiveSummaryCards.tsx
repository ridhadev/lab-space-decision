import React from "react";
import { NetworkSummary, BranchEvaluation, CandidateEvaluation } from "../types";
import {
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface ExecutiveSummaryCardsProps {
  summary: NetworkSummary;
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  onSelectBranch: (branchEval: BranchEvaluation) => void;
  onSelectCandidate: (candidateEval: CandidateEvaluation) => void;
}

export const ExecutiveSummaryCards: React.FC<ExecutiveSummaryCardsProps> = ({
  summary,
  branchEvals,
  candidateEvals,
  onSelectBranch,
  onSelectCandidate,
}) => {
  const cannibalizedBranches = branchEvals.filter((b) => b.cannibalizationWarning);
  const shrinkBranches = branchEvals.filter((b) => b.classification === "SHRINK");
  const topGrowCandidates = candidateEvals.filter((c) => c.classification === "GROW");

  return (
    <div className="mb-4 space-y-2.5">
      {/* Operations Section Header (As in the uploaded screenshot) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold tracking-[0.22em] ds-text-primary uppercase">
                P O R T F O L I O &nbsp; O P E R A T I O N S
              </h2>
            </div>
            <p className="text-[11px] ds-text-secondary mt-0.5">
              23 Bedashing Lounges • Health Score {summary.averageHealthScore}/100 • 10 Prospective Zones
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#142842] border border-[#1D3452] text-cyan-300 uppercase">
            ACTIVE CYCLE
          </span>
        </div>
      </div>

      {/* Market Saturation Portfolio Profile Strip */}
      <div className="ds-card p-2.5 px-3 border shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            COMPETITION SATURATION PROFILE:
          </span>
          <span className="text-[11px] ds-text-secondary hidden sm:inline">
            3km salon density across 23 lounges
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs"></span>
            <span className="font-semibold">Monopolistic Moat (1–4):</span>
            <span className="font-bold font-mono text-cyan-200">{summary.saturationBreakdown?.monopolistic ?? 0}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-xs"></span>
            <span className="font-semibold">Balanced (5–9):</span>
            <span className="font-bold font-mono text-amber-200">{summary.saturationBreakdown?.balanced ?? 0}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/25 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-orange-400 shadow-xs"></span>
            <span className="font-semibold">Saturated (10–17):</span>
            <span className="font-bold font-mono text-orange-200">{summary.saturationBreakdown?.saturated ?? 0}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/25 text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-xs"></span>
            <span className="font-semibold">Hyper-Saturated (18+):</span>
            <span className="font-bold font-mono text-rose-200">{summary.saturationBreakdown?.hyperSaturated ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 3 Operations Metric Cards (from the screenshot structure) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Core Capital Moat (PROTECT) */}
          <div className="ds-card p-4 border shadow-sm flex flex-col justify-between relative group hover:border-cyan-500/40 transition-all">
            <div>
              {/* Top Row with Rounded Icon Badge & Nav Arrows */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1 text-slate-500">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {Math.round((summary.protectCount / summary.totalBranches) * 100)}% High-Moat
                  </span>
                </div>
              </div>

              {/* Spaced Metric Caption (Image Style) */}
              <div className="mt-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  PROTECT ALLOCATION
                </span>
                <div className="text-3xl font-bold tracking-tight ds-text-primary mt-0.5">
                  {summary.protectCount} <span className="text-base font-normal text-slate-400">/ 23</span>
                </div>
                <p className="text-[11px] ds-text-secondary mt-1">
                  14 Abu Dhabi • 5 Dubai • 2 Sharjah • 1 FUJ • 1 RAK
                </p>
              </div>
            </div>

            {/* Bottom Status Pill */}
            <div className="mt-4 pt-2.5 border-t ds-border-subtle flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Zero Sister Conflict • Safe Cashflow</span>
              </span>
              <span className="text-[10px] ds-text-muted">HOLD: {summary.holdCount} • SHRINK: {summary.shrinkCount}</span>
            </div>
          </div>

          {/* Card 2: Cannibalization Conflict Alerts */}
          <div className="ds-card p-4 border shadow-sm flex flex-col justify-between relative group hover:border-rose-500/40 transition-all">
            <div>
              {/* Top Row with Rounded Clock/Alert Badge */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    {cannibalizedBranches.length} Conflicts
                  </span>
                </div>
              </div>

              {/* Spaced Metric Caption (Image Style) */}
              <div className="mt-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {shrinkBranches.length > 0 ? "SHRINK & CANNIBALIZATION" : "CANNIBALIZATION ALERTS"}
                </span>
                <div className="text-3xl font-bold tracking-tight ds-text-primary mt-0.5 flex items-baseline gap-2">
                  <span className="text-rose-400 font-bold">{shrinkBranches.length}</span>
                  <span className="text-xs font-semibold text-rose-300 font-mono">
                    SHRINK ({cannibalizedBranches.length} &lt;4.0km)
                  </span>
                </div>
                <p className="text-[11px] ds-text-secondary mt-1">
                  {shrinkBranches.length > 0
                    ? `${shrinkBranches.map((s) => s.branch.name.split(" ")[0]).join(", ")} designated for rightsizing`
                    : "Overlapping catchment radii diluting revenue per chair"}
                </p>
              </div>

              {/* Quick interactive mini-chips for shrink / cannibalized branches */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(shrinkBranches.length > 0 ? shrinkBranches : cannibalizedBranches.slice(0, 3)).map((item) => (
                  <button
                    key={item.branch.id}
                    onClick={() => onSelectBranch(item)}
                    className="px-2 py-1 rounded-lg ds-card-subtle hover:border-rose-500/50 border text-[10px] ds-text-secondary flex items-center gap-1 transition-colors cursor-pointer"
                    title="Click to audit branch rightsizing"
                  >
                    <span className="font-semibold text-rose-400">{item.branch.name.split(" ")[0]}</span>
                    <span className="font-mono text-rose-300 font-bold">({item.finalScore} / SHRINK)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Trend Pill (Screenshot variance badge style) */}
            <div className="mt-3 pt-2.5 border-t ds-border-subtle flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold border border-rose-500/25">
                <TrendingDown className="w-3 h-3" />
                <span>Action: Downsize chairs or renegotiate lease</span>
              </span>
            </div>
          </div>

          {/* Card 3: Expansion Pipeline (GROW) */}
          <div className="ds-card p-4 border shadow-sm flex flex-col justify-between relative group hover:border-cyan-500/40 transition-all">
            <div>
              {/* Top Row with Rounded Arrow/Target Badge */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {summary.growCount} GROW Targets
                  </span>
                </div>
              </div>

              {/* Spaced Metric Caption (Image Style) */}
              <div className="mt-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  EXPANSION PIPELINE
                </span>
                <div className="text-3xl font-bold tracking-tight ds-text-primary mt-0.5">
                  +56 Chairs{" "}
                  <span className="text-xs font-normal text-cyan-400 font-mono">
                    (Target Capacity)
                  </span>
                </div>
                <p className="text-[11px] ds-text-secondary mt-1">
                  10 UAE Candidates Analyzed • Unserved affluent catchments
                </p>
              </div>

              {/* Quick interactive mini-chips for GROW candidates */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {topGrowCandidates.slice(0, 3).map((item) => (
                  <button
                    key={item.candidate.id}
                    onClick={() => onSelectCandidate(item)}
                    className="px-2 py-1 rounded-lg ds-card-subtle hover:border-cyan-500/50 border text-[10px] ds-text-secondary flex items-center gap-1 transition-colors"
                    title="Click to inspect candidate specs"
                  >
                    <span className="font-semibold text-cyan-400">{item.candidate.name.split(" ")[0]}</span>
                    <span>(Score {item.finalScore})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Trend Pill */}
            <div className="mt-3 pt-2.5 border-t ds-border-subtle flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-semibold border border-cyan-500/25">
                <TrendingUp className="w-3 h-3" />
                <span>Priority: Dubai Hills, Al Reem, Saadiyat</span>
              </span>
            </div>
          </div>
        </div>
      </div>
  );
};
