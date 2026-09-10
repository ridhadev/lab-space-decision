import React, { useState, useEffect } from "react";
import { BranchEvaluation, CandidateEvaluation, BranchScoringWeights } from "../types";
import { getMarketSaturationInfo } from "../services/scoringEngine";
import { getStoredAiRationale, setStoredAiRationale } from "../services/aiStorage";
import {
  X,
  Star,
  Sparkles,
  AlertTriangle,
  Bot,
  Calculator,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface BranchDetailModalProps {
  branchEval: BranchEvaluation | null;
  candidateEval: CandidateEvaluation | null;
  branchWeights: BranchScoringWeights;
  onClose: () => void;
}

export const BranchDetailModal: React.FC<BranchDetailModalProps> = ({
  branchEval,
  candidateEval,
  branchWeights,
  onClose,
}) => {
  const subjectKey = branchEval
    ? `branch_${branchEval.branch.id}`
    : candidateEval
    ? `candidate_${candidateEval.candidate.id}`
    : null;

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync state whenever selected branch/candidate changes or mounts
  useEffect(() => {
    if (!subjectKey) {
      setAiExplanation(null);
      setAiGeneratedAt(null);
      setIsAiLoading(false);
      setAiError(null);
      return;
    }

    setIsAiLoading(false);
    setAiError(null);

    const cached = getStoredAiRationale(subjectKey);
    if (cached) {
      setAiExplanation(cached.text);
      setAiGeneratedAt(cached.generatedAt);
    } else {
      setAiExplanation(null);
      setAiGeneratedAt(null);
    }
  }, [subjectKey]);

  if (!branchEval && !candidateEval) return null;

  const handleRequestAi = async () => {
    if (!subjectKey) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const isBranch = !!branchEval;
      const subjectData = isBranch ? branchEval : candidateEval;
      const query = isBranch
        ? `Explain in detail why ${branchEval?.branch.name} is classified as ${branchEval?.classification} with score ${branchEval?.finalScore}/100. Reference its exact rating, review count, sister branch proximity (${branchEval?.branch.nearestSisterDistanceKm}km), catchment affluence, and competitors.`
        : `Explain why candidate expansion area ${candidateEval?.candidate.name} is classified as ${candidateEval?.classification} with score ${candidateEval?.finalScore}/100. Reference unmet demand, retail gravity, and sister branch proximity.`;

      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          subjectType: isBranch ? "branch" : "candidate",
          subjectData,
          modelContext: { branchWeights },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const explanation = data.explanation || "";
      setAiExplanation(explanation);
      const now = new Date().toISOString();
      setAiGeneratedAt(now);
      setStoredAiRationale(subjectKey, explanation);
    } catch (err: any) {
      setAiError(err.message || "Failed to contact Gemini advisor.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Render for Branch
  if (branchEval) {
    const { branch, finalScore, classification, cannibalizationWarning, auditFormula } =
      branchEval;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-700 bg-[#1C2128] flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                    classification === "PROTECT"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : classification === "HOLD"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {classification} ({finalScore}/100)
                </span>
                <span className="text-xs text-slate-400">
                  {branch.emirate} • {branch.area}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {branch.name} Lounge
              </h2>
              <p className="text-[11px] text-slate-400">{branch.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
            {/* Warning banner if cannibalization */}
            {cannibalizationWarning && (
              <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded flex items-start space-x-2 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Cannibalization Overlap Warning:</span> Located only{" "}
                  <strong>{branch.nearestSisterDistanceKm} km</strong> from nearest sister lounge.
                  High risk of splitting customer base and compressing operating margins.
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Reputation</div>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-mono font-bold text-white">{branch.googleRating.toFixed(1)}</span>
                </div>
                <div className="text-[10px] text-slate-400">{branch.reviewCount} reviews</div>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Affluence</div>
                <div className="text-sm font-mono font-bold text-indigo-400 mt-1">
                  {branch.catchmentAffluenceIndex}
                  <span className="text-[10px] font-normal text-slate-500">/100</span>
                </div>
                <div className="text-[10px] text-slate-400">3km spend index</div>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sister Distance</div>
                <div
                  className={`text-sm font-mono font-bold mt-1 ${
                    cannibalizationWarning ? "text-rose-400" : "text-slate-200"
                  }`}
                >
                  {branch.nearestSisterDistanceKm} km
                </div>
                <div className="text-[10px] text-slate-400">
                  {cannibalizationWarning ? "Critical overlap" : "Safe spacing"}
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Local Salons & Saturation</div>
                {(() => {
                  const satInfo = getMarketSaturationInfo(branch.competitorDensity3km);
                  return (
                    <>
                      <div className="text-sm font-mono font-bold text-slate-200 mt-1 flex items-center justify-between">
                        <span>{branch.competitorDensity3km} <span className="text-[10px] font-normal text-slate-400">salons</span></span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${satInfo.badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: satInfo.dotColor }}></span>
                          <span>{satInfo.label}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={satInfo.description}>
                        {satInfo.description}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Deterministic Mathematical Audit Trace */}
            <div className="bg-black/60 text-slate-200 p-3 rounded border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-sans font-bold text-xs uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                <span>Deterministic Scoring Trace</span>
              </div>
              <div className="text-slate-300 text-[11px] break-all">
                {auditFormula}
              </div>
              <div className="pt-2 text-[10px] text-slate-400 flex flex-wrap gap-x-4 border-t border-slate-800">
                <span>Reputation: <strong>{branchEval.reputationScore}</strong></span>
                <span>Demand: <strong>{branchEval.demandScore}</strong></span>
                <span>Separation: <strong>{branchEval.cannibalizationScore}</strong></span>
                <span>Resilience: <strong>{branchEval.competitionScore}</strong></span>
              </div>
            </div>

            {/* Strategic Notes */}
            {branch.strategicNotes && (
              <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700 text-slate-300">
                <span className="font-bold text-indigo-300">Field Intelligence: </span>
                {branch.strategicNotes}
              </div>
            )}

            {/* Grounded AI Advisor */}
            <div className="border border-slate-700 rounded p-3 bg-[#1C2128] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-slate-200 text-xs">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Grounded AI Strategic Reasoning</span>
                </div>
                {!aiExplanation && !isAiLoading && (
                  <button
                    onClick={handleRequestAi}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate AI Rationale</span>
                  </button>
                )}
                {isAiLoading && (
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    <span>Processing Deep Dive...</span>
                  </div>
                )}
              </div>

              {aiError && (
                <div className="text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-500/30 text-xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>AI Reasoning Error</span>
                  </div>
                  <p>{aiError}</p>
                  <button
                    onClick={handleRequestAi}
                    className="text-[11px] underline hover:text-rose-300 cursor-pointer font-medium"
                  >
                    Retry Consultation
                  </button>
                </div>
              )}

              {/* Active Loading State Animation */}
              {isAiLoading && (
                <div className="bg-indigo-950/30 rounded-lg border border-indigo-500/40 p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shrink-0">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white tracking-wide">
                          Synthesizing Grounded Strategic Reasoning...
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                          Gemini 3.8 Flash
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Auditing rating ({branch.googleRating}★), sister distance ({branch.nearestSisterDistanceKm}km), affluence &amp; saturation...
                      </p>
                    </div>
                  </div>

                  {/* Shimmer / Skeleton Animation */}
                  <div className="space-y-2 pt-2 border-t border-indigo-500/20">
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-full"></div>
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-5/6"></div>
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              )}

              {/* Cached AI Explanation Output */}
              {!isAiLoading && aiExplanation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-700/60">
                    <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cached Branch Rationale</span>
                      {aiGeneratedAt && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          ({new Date(aiGeneratedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleRequestAi}
                      disabled={isAiLoading}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="Re-run AI analysis with current model weights"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded border border-slate-700 text-slate-200 leading-relaxed font-sans text-xs">
                    <MarkdownRenderer content={aiExplanation} />
                  </div>
                </div>
              )}

              {/* Initial Empty State (First Time Visit) */}
              {!isAiLoading && !aiExplanation && !aiError && (
                <div className="p-3.5 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/40 text-center space-y-2.5">
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                    No strategic rationale generated yet for <strong className="text-slate-200">{branch.name}</strong>. Click below to consult Google Gemini, strictly grounded in this branch's computed score ({finalScore}/100), sister separation ({branch.nearestSisterDistanceKm} km), and competition density.
                  </p>
                  <button
                    onClick={handleRequestAi}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:shadow-indigo-500/20 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Strategic Rationale</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-700 bg-[#1C2128] flex justify-end">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render for Candidate Area
  if (candidateEval) {
    const { candidate, finalScore, classification, auditFormula, recommendationSummary } =
      candidateEval;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 border-b border-slate-700 bg-[#1C2128] flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                    classification === "GROW"
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      : classification === "WATCH"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {classification} ({finalScore}/100)
                </span>
                <span className="text-xs text-slate-400">
                  {candidate.emirate} • {candidate.zoneType}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {candidate.name}
              </h2>
              <p className="text-[11px] text-slate-400">{candidate.notes}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Unmet Demand</div>
                <div className="text-sm font-mono font-bold text-teal-400 mt-1">
                  {candidate.unmetDemandIndex}/100
                </div>
                <div className="text-[10px] text-slate-400">Beauty spend gap</div>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Demographics</div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {candidate.targetDemographicPopulation.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">Females in 5km</div>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Retail Gravity</div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {candidate.retailGravityScore}/100
                </div>
                <div className="text-[10px] text-slate-400">Mall & footfall draw</div>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sister Separation</div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {candidate.nearestBedashingDistanceKm} km
                </div>
                <div className="text-[10px] text-slate-400">To nearest Bedashing</div>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-700/80 col-span-2 sm:col-span-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Saturation Tier</div>
                {(() => {
                  const satInfo = getMarketSaturationInfo(candidate.competitorCount);
                  return (
                    <>
                      <div className="text-sm font-mono font-bold text-slate-200 mt-1 flex items-center justify-between">
                        <span>{candidate.competitorCount} <span className="text-[10px] font-normal text-slate-400">salons</span></span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${satInfo.badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: satInfo.dotColor }}></span>
                          <span>{satInfo.label}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={satInfo.description}>
                        {satInfo.description}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Formula Audit */}
            <div className="bg-black/60 text-slate-200 p-3 rounded border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex items-center space-x-1.5 text-teal-400 font-sans font-bold text-xs uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                <span>Expansion Formula Trace</span>
              </div>
              <div className="text-slate-300 text-[11px] break-all">{auditFormula}</div>
            </div>

            {/* Recommendation Summary */}
            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700">
              <span className="font-bold text-teal-400">Strategic Directive: </span>
              <span className="text-slate-300">{recommendationSummary}</span>
            </div>

            {/* AI Advisor Button & Box */}
            <div className="border border-slate-700 rounded p-3 bg-[#1C2128] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-slate-200 text-xs">
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                  <span>AI Expansion Feasibility Assessment</span>
                </div>
                {!aiExplanation && !isAiLoading && (
                  <button
                    onClick={handleRequestAi}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate AI Feasibility</span>
                  </button>
                )}
                {isAiLoading && (
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-teal-950/70 text-teal-300 border border-teal-500/30 text-xs font-medium">
                    <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                    <span>Processing Feasibility...</span>
                  </div>
                )}
              </div>

              {aiError && (
                <div className="text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-500/30 text-xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>AI Feasibility Error</span>
                  </div>
                  <p>{aiError}</p>
                  <button
                    onClick={handleRequestAi}
                    className="text-[11px] underline hover:text-rose-300 cursor-pointer font-medium"
                  >
                    Retry Consultation
                  </button>
                </div>
              )}

              {/* Active Loading State Animation */}
              {isAiLoading && (
                <div className="bg-teal-950/30 rounded-lg border border-teal-500/40 p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 text-teal-400 shrink-0">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white tracking-wide">
                          Synthesizing Expansion Feasibility...
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                          Gemini 3.8 Flash
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Auditing unmet demand ({candidate.unmetDemandIndex}/100), {candidate.targetDemographicPopulation.toLocaleString()} females &amp; retail gravity...
                      </p>
                    </div>
                  </div>

                  {/* Shimmer / Skeleton Animation */}
                  <div className="space-y-2 pt-2 border-t border-teal-500/20">
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-full"></div>
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-5/6"></div>
                    <div className="h-2 bg-gradient-to-r from-slate-700/80 via-slate-600/50 to-slate-700/80 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              )}

              {/* Cached AI Explanation Output */}
              {!isAiLoading && aiExplanation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-700/60">
                    <span className="flex items-center gap-1.5 text-teal-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cached Feasibility Assessment</span>
                      {aiGeneratedAt && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          ({new Date(aiGeneratedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleRequestAi}
                      disabled={isAiLoading}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="Re-run AI feasibility assessment with current model weights"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded border border-slate-700 text-slate-200 leading-relaxed font-sans text-xs">
                    <MarkdownRenderer content={aiExplanation} />
                  </div>
                </div>
              )}

              {/* Initial Empty State (First Time Visit) */}
              {!isAiLoading && !aiExplanation && !aiError && (
                <div className="p-3.5 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/40 text-center space-y-2.5">
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                    No feasibility assessment generated yet for <strong className="text-slate-200">{candidate.name}</strong>. Click below to consult Google Gemini, strictly grounded in candidate demand, retail gravity, and sister spacing.
                  </p>
                  <button
                    onClick={handleRequestAi}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:shadow-teal-500/20 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Feasibility</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-slate-700 bg-[#1C2128] flex justify-end">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
