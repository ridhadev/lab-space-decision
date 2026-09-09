import React, { useState } from "react";
import {
  BranchEvaluation,
  CandidateEvaluation,
  NetworkSummary,
  BranchScoringWeights,
} from "../types";
import { FileText, Sparkles, Copy, Check, X, Printer } from "lucide-react";

interface BoardMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  summary: NetworkSummary;
  branchWeights: BranchScoringWeights;
}

export const BoardMemoModal: React.FC<BoardMemoModalProps> = ({
  isOpen,
  onClose,
  branchEvals,
  candidateEvals,
  summary,
  branchWeights,
}) => {
  const [memoText, setMemoText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateMemo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const protectBranches = branchEvals
        .filter((b) => b.classification === "PROTECT")
        .map((b) => ({ name: b.branch.name, emirate: b.branch.emirate, score: b.finalScore, rating: b.branch.googleRating }));

      const holdBranches = branchEvals
        .filter((b) => b.classification === "HOLD")
        .map((b) => ({ name: b.branch.name, emirate: b.branch.emirate, score: b.finalScore }));

      const shrinkBranches = branchEvals
        .filter((b) => b.classification === "SHRINK")
        .map((b) => ({
          name: b.branch.name,
          emirate: b.branch.emirate,
          score: b.finalScore,
          nearestSisterDistanceKm: b.branch.nearestSisterDistanceKm,
          competitors: b.branch.competitorDensity3km,
        }));

      const topGrowCandidates = candidateEvals
        .filter((c) => c.classification === "GROW")
        .map((c) => ({
          name: c.candidate.name,
          emirate: c.candidate.emirate,
          score: c.finalScore,
          unmetDemand: c.demandScore,
          nearestBedashingKm: c.candidate.nearestBedashingDistanceKm,
        }));

      const res = await fetch("/api/ai/executive-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          networkSummary: summary,
          protectBranches,
          holdBranches,
          shrinkBranches,
          topGrowCandidates,
          activeWeights: branchWeights,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      setMemoText(data.briefing);
    } catch (err: any) {
      setError(err.message || "Failed to generate executive briefing.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyMemo = () => {
    if (memoText) {
      navigator.clipboard.writeText(memoText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-700 bg-[#1C2128] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white uppercase">
                EXECUTIVE BOARD DECISION MEMORANDUM
              </h2>
              <p className="text-[11px] text-slate-400">
                Bedashing UAE Network Optimization & Expansion Strategy • Confidential
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {memoText && (
              <>
                <button
                  onClick={copyMemo}
                  className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Print Memorandum"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#0F1115] text-slate-200 leading-relaxed text-xs">
          {!memoText && !isLoading && (
            <div className="text-center py-16 max-w-md mx-auto space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Generate Board-Level Strategic Memorandum
              </h3>
              <p className="text-xs text-slate-400">
                Synthesize all 24 existing Bedashing branches, PROTECT/HOLD/SHRINK decisions, and GROW expansion candidates into an authoritative executive memorandum.
              </p>
              <button
                onClick={handleGenerateMemo}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border border-indigo-500 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Draft Executive Memo Now</span>
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
              <div className="text-sm font-semibold text-slate-200">
                Generating Executive Board Memo via Grounded Gemini...
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Synthesizing PROTECT ({summary.protectCount}), HOLD ({summary.holdCount}), SHRINK ({summary.shrinkCount}) & GROW targets...
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded text-rose-300 text-xs">
              {error}
            </div>
          )}

          {memoText && (
            <div className="bg-[#161B22] p-5 rounded border border-slate-700 shadow-sm space-y-4 font-sans text-xs">
              <div className="border-b border-slate-700 pb-3 mb-4">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  CONFIDENTIAL • BOARD OF DIRECTORS PRESENTATION
                </div>
                <h1 className="text-base font-bold text-white mt-1">
                  BEDASHING UAE: GEOSPATIAL NETWORK RESTRUCTURING & EXPANSION PLAN
                </h1>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Date: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} • Prepared by Decision Space Executive Intelligence
                </div>
              </div>

              <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                {memoText}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-[#1C2128] flex justify-between items-center text-[11px] text-slate-400">
          <span>Grounded strictly in computed data • No hallucinated financial figures</span>
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
};
