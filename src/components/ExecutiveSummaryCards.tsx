import React from "react";
import { NetworkSummary, BranchEvaluation, CandidateEvaluation } from "../types";
import {
  AlertTriangle,
  Sparkles,
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
  const topGrowCandidates = candidateEvals.filter((c) => c.classification === "GROW");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {/* Card 1: Network Health & Breakdown */}
      <div className="bg-[#161B22] p-3.5 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Network Health Matrix
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
              Score: {summary.averageHealthScore}/100
            </span>
          </div>
          <h3 className="text-base font-semibold tracking-tight text-white mt-1">
            23 UAE Lounges
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            14 Abu Dhabi • 5 Dubai • 2 Sharjah • 1 Fujairah • 1 RAK
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-emerald-400 font-mono font-bold text-base">
                {summary.protectCount}
              </div>
              <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                PROTECT
              </div>
            </div>

            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <div className="text-amber-400 font-mono font-bold text-base">
                {summary.holdCount}
              </div>
              <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                HOLD
              </div>
            </div>

            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
              <div className="text-rose-400 font-mono font-bold text-base">
                {summary.shrinkCount}
              </div>
              <div className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                SHRINK
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Capital Allocation:</span>
          <span className="font-semibold text-emerald-400">
            {Math.round((summary.protectCount / summary.totalBranches) * 100)}% Core High-Moat
          </span>
        </div>
      </div>

      {/* Card 2: Cannibalization Conflict Alerts */}
      <div className="bg-[#161B22] p-3.5 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Cannibalization Conflicts</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {cannibalizedBranches.length} Overlaps
            </span>
          </div>
          <h3 className="text-base font-semibold tracking-tight text-white mt-1">
            Network Overlaps (&lt;4km)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sister lounges competing in the same hyper-local catchment
          </p>

          <div className="space-y-1.5 mt-2.5 max-h-28 overflow-y-auto pr-1">
            {cannibalizedBranches.slice(0, 3).map((item) => (
              <div
                key={item.branch.id}
                onClick={() => onSelectBranch(item)}
                className="p-1.5 px-2.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-rose-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-slate-200">{item.branch.name}</span>
                  <div className="text-[10px] text-slate-400">{item.branch.emirate}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-400 text-xs">
                    {item.branch.nearestSisterDistanceKm} km
                  </span>
                  <div className="text-[9px] text-slate-500">to sister</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-700/80 text-[10px] text-slate-400">
          Action: Downsize chairs or renegotiate leases for overlapping branches.
        </div>
      </div>

      {/* Card 3: Top Expansion Opportunities */}
      <div className="bg-[#161B22] p-3.5 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Expansion Pipeline</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {summary.growCount} GROW Targets
            </span>
          </div>
          <h3 className="text-base font-semibold tracking-tight text-white mt-1">
            High-Potential Zones
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Underserved high-affluence catchments with zero sister overlap
          </p>

          <div className="space-y-1.5 mt-2.5 max-h-28 overflow-y-auto pr-1">
            {topGrowCandidates.slice(0, 3).map((c) => (
              <div
                key={c.candidate.id}
                onClick={() => onSelectCandidate(c)}
                className="p-1.5 px-2.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-teal-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-medium text-slate-200">{c.candidate.name}</span>
                  <div className="text-[10px] text-slate-400">{c.candidate.emirate} • {c.candidate.zoneType}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-teal-400 text-xs">Score {c.finalScore}</span>
                  <div className="text-[9px] text-slate-500">Demand: {c.demandScore}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-700/80 text-[10px] text-slate-400">
          Target: Add ~56 high-efficiency beauty chairs across priority locations.
        </div>
      </div>
    </div>
  );
};
