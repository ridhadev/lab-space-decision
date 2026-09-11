import React from "react";
import {
  BranchEvaluation,
  BranchScoringWeights,
  NetworkSummary,
} from "../types";
import {
  AlertTriangle,
  ChevronRight,
  Sliders,
  Building2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface OverviewViewProps {
  branchEvals: BranchEvaluation[];
  summary: NetworkSummary;
  branchWeights: BranchScoringWeights;
  onSelectBranch: (b: BranchEvaluation) => void;
  onOpenConfigPanel: () => void;
  onOpenBranchPanel: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  branchEvals,
  summary,
  branchWeights,
  onSelectBranch,
  onOpenConfigPanel,
  onOpenBranchPanel,
}) => {
  // Non-Protect branches (HOLD and SHRINK) that require executive decisions this cycle
  const decisionBranches = branchEvals.filter(
    (b) => b.classification !== "PROTECT"
  );

  // Group decision mix by emirate for stacked bar chart
  const emiratesList = ["Abu Dhabi", "Dubai", "Sharjah", "Ras Al Khaimah", "Fujairah"];
  const emirateData = emiratesList.map((em) => {
    const branchesInEm = branchEvals.filter((b) => b.branch.emirate === em);
    const protect = branchesInEm.filter((b) => b.classification === "PROTECT").length;
    const hold = branchesInEm.filter((b) => b.classification === "HOLD").length;
    const shrink = branchesInEm.filter((b) => b.classification === "SHRINK").length;
    const total = branchesInEm.length;
    return {
      emirate: em,
      protect,
      hold,
      shrink,
      total,
    };
  }).filter((d) => d.total > 0);

  // Helper to generate precise prose justification
  const getProseReason = (b: BranchEvaluation) => {
    if (b.cannibalizationWarning) {
      return `Inside the 4.0 km sister buffer (${b.branch.nearestSisterDistanceKm} km) — chairs are competing with our own network.`;
    }
    if (b.branch.competitorDensity3km >= 18) {
      return `Hyper-saturated competitor pocket (${b.branch.competitorDensity3km} salons in 3km) compressing ticket yield.`;
    }
    if (b.branch.catchmentAffluenceIndex < 78) {
      return `Lower disposable affluence tier (index ${b.branch.catchmentAffluenceIndex}/100) limiting service upsell velocity.`;
    }
    return `Score ${b.finalScore}/100 trails the 85-point network protect benchmark.`;
  };

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Lead with "Needs a decision this cycle" */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Needs a decision this cycle
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {decisionBranches.length} Lounges Flagged
            </span>
          </div>
          <span className="text-[11px] text-[#8BA2C1] hidden sm:inline">
            Non-Protect branches requiring chair adjustments or lease renegotiation
          </span>
        </div>

        {/* Rows of Non-Protect Branches */}
        <div className="space-y-2">
          {decisionBranches.map((b) => {
            const isShrink = b.classification === "SHRINK";
            const proseReason = getProseReason(b);

            return (
              <div
                key={b.branch.id}
                className="p-3.5 rounded-xl bg-[#0F1F35] border border-[#1D3452] hover:border-cyan-500/40 transition-all flex flex-wrap items-center justify-between gap-3 group"
              >
                {/* Name & Reason Block (flex: 1; min-width: 190px) */}
                <div className="flex-1 min-w-[190px]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#8BA2C1]" />
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {b.branch.name}
                    </span>
                    <span className="text-[10px] text-[#536F93]">· {b.branch.emirate}</span>
                  </div>
                  <p className="text-[11px] text-[#8BA2C1] mt-1 leading-relaxed">
                    {proseReason}
                  </p>
                </div>

                {/* Flag Metric */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-[#536F93] block">
                      Flag Metric
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        b.cannibalizationWarning
                          ? "text-rose-400"
                          : b.branch.competitorDensity3km >= 18
                          ? "text-orange-400"
                          : "text-amber-400"
                      }`}
                    >
                      {b.cannibalizationWarning
                        ? `Sister: ${b.branch.nearestSisterDistanceKm}km`
                        : `Competitors: ${b.branch.competitorDensity3km}`}
                    </span>
                  </div>

                  {/* Health Score */}
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-[#536F93] block">
                      Health
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {b.finalScore}/100
                    </span>
                  </div>

                  {/* Decision Badge */}
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold border uppercase shrink-0 ${
                      isShrink
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {b.classification}
                  </span>

                  {/* Review Action */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBranch(b);
                      onOpenBranchPanel();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0A1424] hover:bg-[#193152] border border-[#1D3452] hover:border-cyan-500/60 text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Review</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Two cards below in an auto-fit, minmax(300px, 1fr) grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Card 1: Decision Mix by Emirate (Stacked Bars) */}
        <div className="p-4 rounded-xl bg-[#0F1F35] border border-[#1D3452] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Decision Mix by Emirate
              </h3>
              <span className="text-[10px] font-mono text-[#8BA2C1]">
                23 Lounges
              </span>
            </div>
            <p className="text-[11px] text-[#8BA2C1] mb-3.5">
              Territorial allocation across Protect, Hold, and Shrink bands.
            </p>

            {/* Stacked bars per emirate */}
            <div className="space-y-2.5">
              {emirateData.map((em) => {
                const protectPct = (em.protect / em.total) * 100;
                const holdPct = (em.hold / em.total) * 100;
                const shrinkPct = (em.shrink / em.total) * 100;

                return (
                  <div key={em.emirate} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200">{em.emirate}</span>
                      <span className="font-mono text-[10px] text-[#8BA2C1]">
                        {em.protect}P · {em.hold}H · {em.shrink}S ({em.total})
                      </span>
                    </div>

                    {/* Stacked bar ramp */}
                    <div className="h-2 w-full bg-[#0A1424] rounded-full overflow-hidden flex">
                      {em.protect > 0 && (
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${protectPct}%` }}
                          title={`${em.protect} Protect`}
                        />
                      )}
                      {em.hold > 0 && (
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${holdPct}%` }}
                          title={`${em.hold} Hold`}
                        />
                      )}
                      {em.shrink > 0 && (
                        <div
                          className="h-full bg-rose-500 transition-all"
                          style={{ width: `${shrinkPct}%` }}
                          title={`${em.shrink} Shrink`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-2.5 border-t border-[#1D3452] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Protect</span>
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Hold</span>
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Shrink</span>
              </span>
            </div>
            <span className="text-[#536F93] font-mono">100% Deterministic</span>
          </div>
        </div>

        {/* Card 2: Model in Use */}
        <div className="p-4 rounded-xl bg-[#0F1F35] border border-[#1D3452] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Model in Use</span>
              </h3>
              <button
                type="button"
                onClick={onOpenConfigPanel}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Open Config →</span>
              </button>
            </div>
            <p className="text-[11px] text-[#8BA2C1] mb-3">
              Active coefficients calibrating network health and decision classifications.
            </p>

            {/* List of live weights */}
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-[#0A1424] border border-[#1D3452] flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Google Star Reputation</span>
                <span className="font-mono font-bold text-cyan-400">
                  {(branchWeights.reputationWeight / 100).toFixed(2)} (
                  {branchWeights.reputationWeight}%)
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0A1424] border border-[#1D3452] flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Catchment Affluence</span>
                <span className="font-mono font-bold text-cyan-400">
                  {(branchWeights.catchmentDemandWeight / 100).toFixed(2)} (
                  {branchWeights.catchmentDemandWeight}%)
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0A1424] border border-[#1D3452] flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Sister Distance Safety</span>
                <span className="font-mono font-bold text-cyan-400">
                  {(branchWeights.cannibalizationWeight / 100).toFixed(2)} (
                  {branchWeights.cannibalizationWeight}%)
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0A1424] border border-[#1D3452] flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Competitor Density Moat</span>
                <span className="font-mono font-bold text-cyan-400">
                  {(branchWeights.competitionWeight / 100).toFixed(2)} (
                  {branchWeights.competitionWeight}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-[#1D3452] flex items-center justify-between text-[10px]">
            <span className="text-[#8BA2C1]">Sister Buffer: 4.0km · Competitors: 3.0km</span>
            <button
              type="button"
              onClick={onOpenConfigPanel}
              className="text-cyan-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Adjust Coefficients</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
