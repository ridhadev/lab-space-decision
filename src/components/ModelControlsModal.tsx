import React from "react";
import {
  BranchScoringWeights,
  CandidateScoringWeights,
  ThresholdConfig,
  NetworkSummary,
} from "../types";
import {
  DEFAULT_BRANCH_WEIGHTS,
  DEFAULT_CANDIDATE_WEIGHTS,
  DEFAULT_THRESHOLDS,
} from "../services/scoringEngine";
import { X, RotateCcw, Sliders } from "lucide-react";

interface ModelControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchWeights: BranchScoringWeights;
  setBranchWeights: React.Dispatch<React.SetStateAction<BranchScoringWeights>>;
  candidateWeights: CandidateScoringWeights;
  setCandidateWeights: React.Dispatch<React.SetStateAction<CandidateScoringWeights>>;
  thresholds: ThresholdConfig;
  setThresholds: React.Dispatch<React.SetStateAction<ThresholdConfig>>;
  summary: NetworkSummary;
}

export const ModelControlsModal: React.FC<ModelControlsModalProps> = ({
  isOpen,
  onClose,
  branchWeights,
  setBranchWeights,
  candidateWeights,
  setCandidateWeights,
  thresholds,
  setThresholds,
  summary,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    setBranchWeights(DEFAULT_BRANCH_WEIGHTS);
    setCandidateWeights(DEFAULT_CANDIDATE_WEIGHTS);
    setThresholds(DEFAULT_THRESHOLDS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-700 bg-[#1C2128] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white uppercase">
                MODEL WEIGHTING CONFIGURATION & THRESHOLDS
              </h2>
              <p className="text-[11px] text-slate-400">
                Transparent deterministic scoring model. Sliders re-evaluate in &lt;100ms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Scenario Impact Bar */}
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/50 flex items-center justify-between text-xs">
          <span className="font-semibold text-indigo-300 text-[11px] uppercase tracking-wider">Live Decision Impact:</span>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span className="text-emerald-400">PROTECT: {summary.protectCount}</span>
            <span className="text-amber-400">HOLD: {summary.holdCount}</span>
            <span className="text-rose-400">SHRINK: {summary.shrinkCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-teal-400">GROW: {summary.growCount}</span>
            <span className="text-slate-400">WATCH: {summary.watchCount}</span>
          </div>
        </div>

        {/* Sliders Content */}
        <div className="p-4 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Section 1: Branch Weights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                1. Existing Branch Scoring Weights
              </h3>
              <span className="text-[11px] font-mono text-indigo-400">
                Total: {branchWeights.reputationWeight + branchWeights.catchmentDemandWeight + branchWeights.cannibalizationWeight + branchWeights.competitionWeight}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reputation */}
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700/80">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-200">Reputation & Reviews</span>
                  <span className="font-mono font-bold text-indigo-400">{branchWeights.reputationWeight}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(branchWeights.reputationWeight / 60) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={branchWeights.reputationWeight}
                  onChange={(e) =>
                    setBranchWeights({ ...branchWeights, reputationWeight: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Google rating (3.5-5.0★) & review volume</span>
              </div>

              {/* Demand */}
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700/80">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-200">Catchment Demand & Affluence</span>
                  <span className="font-mono font-bold text-indigo-400">{branchWeights.catchmentDemandWeight}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(branchWeights.catchmentDemandWeight / 60) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={branchWeights.catchmentDemandWeight}
                  onChange={(e) =>
                    setBranchWeights({ ...branchWeights, catchmentDemandWeight: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Household beauty discretionary spend in 3km</span>
              </div>

              {/* Cannibalization */}
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700/80">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-200">Sister Separation Factor</span>
                  <span className="font-mono font-bold text-indigo-400">{branchWeights.cannibalizationWeight}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(branchWeights.cannibalizationWeight / 60) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={branchWeights.cannibalizationWeight}
                  onChange={(e) =>
                    setBranchWeights({ ...branchWeights, cannibalizationWeight: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Penalizes distance &lt; 5km to another Bedashing</span>
              </div>

              {/* Competition */}
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700/80">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-200">Competition Resilience</span>
                  <span className="font-mono font-bold text-indigo-400">{branchWeights.competitionWeight}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(branchWeights.competitionWeight / 60) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={branchWeights.competitionWeight}
                  onChange={(e) =>
                    setBranchWeights({ ...branchWeights, competitionWeight: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Salon density in 3km buffer</span>
              </div>
            </div>
          </div>

          {/* Section 2: Branch Classification Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                2. Branch Decision Cutoff Thresholds
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-950/20 p-2.5 rounded border border-emerald-500/30">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-emerald-300">PROTECT Cutoff</span>
                  <span className="font-mono font-bold text-emerald-400">≥ {thresholds.protectCutoff}/100</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="85"
                  step="1"
                  value={thresholds.protectCutoff}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, protectCutoff: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-emerald-400/80">At or above this score: classified PROTECT</span>
              </div>

              <div className="bg-rose-950/20 p-2.5 rounded border border-rose-500/30">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-rose-300">SHRINK Cutoff</span>
                  <span className="font-mono font-bold text-rose-400">&lt; {thresholds.holdCutoff}/100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="65"
                  step="1"
                  value={thresholds.holdCutoff}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, holdCutoff: Number(e.target.value) })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-rose-400/80">Below this score: classified SHRINK</span>
              </div>
            </div>
          </div>

          {/* Section 3: Candidate Scoring & Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                3. Expansion Area Rules (GROW / WATCH / SKIP)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700/80">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-200">GROW Cutoff</span>
                  <span className="font-mono font-bold text-teal-400">≥ {thresholds.growCutoff}</span>
                </div>
                <input
                  type="range"
                  min="65"
                  max="90"
                  step="1"
                  value={thresholds.growCutoff}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, growCutoff: Number(e.target.value) })
                  }
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700/80">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-200">WATCH Cutoff</span>
                  <span className="font-mono font-bold text-amber-400">≥ {thresholds.watchCutoff}</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="70"
                  step="1"
                  value={thresholds.watchCutoff}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, watchCutoff: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700/80">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-200">Overlap Radius</span>
                  <span className="font-mono font-bold text-indigo-400">{thresholds.sisterBufferKm} km</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={thresholds.sisterBufferKm}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, sisterBufferKm: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-[#1C2128] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition-colors shadow-xs"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
