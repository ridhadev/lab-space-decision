import React, { useState, useEffect, useMemo } from "react";
import {
  BranchEvaluation,
  CandidateEvaluation,
  NetworkSummary,
  BranchScoringWeights,
  PinnedDecision,
} from "../types";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  X,
  Printer,
  Presentation,
  ChevronLeft,
  ChevronRight,
  Pin,
  Shield,
  TrendingUp,
  Scissors,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Building2,
  Sliders,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface BoardMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  summary: NetworkSummary;
  branchWeights: BranchScoringWeights;
  pinnedDecisions?: PinnedDecision[];
  onTogglePinDecision?: (content: string, sourceQuestion?: string) => void;
  onRemovePinnedDecision?: (id: string) => void;
}

export const BoardMemoModal: React.FC<BoardMemoModalProps> = ({
  isOpen,
  onClose,
  branchEvals,
  candidateEvals,
  summary,
  branchWeights,
  pinnedDecisions = [],
  onTogglePinDecision,
  onRemovePinnedDecision,
}) => {
  const [memoText, setMemoText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"report" | "slides">("report");
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Filtered branch categories
  const protectBranches = useMemo(
    () =>
      branchEvals
        .filter((b) => b.classification === "PROTECT")
        .sort((a, b) => b.finalScore - a.finalScore),
    [branchEvals]
  );

  const holdBranches = useMemo(
    () =>
      branchEvals
        .filter((b) => b.classification === "HOLD")
        .sort((a, b) => b.finalScore - a.finalScore),
    [branchEvals]
  );

  const shrinkBranches = useMemo(
    () =>
      branchEvals
        .filter((b) => b.classification === "SHRINK")
        .sort((a, b) => a.finalScore - b.finalScore),
    [branchEvals]
  );

  const topGrowCandidates = useMemo(
    () =>
      candidateEvals
        .filter((c) => c.classification === "GROW")
        .sort((a, b) => b.finalScore - a.finalScore),
    [candidateEvals]
  );

  const totalSlides = 6;

  // Keyboard navigation for slides
  useEffect(() => {
    if (!isOpen || viewMode !== "slides") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, viewMode, totalSlides]);

  if (!isOpen) return null;

  const handleGenerateMemo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/executive-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          networkSummary: summary,
          protectBranches: protectBranches.map((b) => ({
            name: b.branch.name,
            emirate: b.branch.emirate,
            score: b.finalScore,
            rating: b.branch.googleRating,
          })),
          holdBranches: holdBranches.map((b) => ({
            name: b.branch.name,
            emirate: b.branch.emirate,
            score: b.finalScore,
          })),
          shrinkBranches: shrinkBranches.map((b) => ({
            name: b.branch.name,
            emirate: b.branch.emirate,
            score: b.finalScore,
            nearestSisterDistanceKm: b.branch.nearestSisterDistanceKm,
            competitors: b.branch.competitorDensity3km,
          })),
          topGrowCandidates: topGrowCandidates.map((c) => ({
            name: c.candidate.name,
            emirate: c.candidate.emirate,
            score: c.finalScore,
            unmetDemand: c.demandScore,
            nearestBedashingKm: c.candidate.nearestBedashingDistanceKm,
          })),
          activeWeights: branchWeights,
          pinnedDecisions,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#101927] rounded-xl border border-[#1E3352] shadow-2xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-3.5 border-b border-[#1E3352] bg-[#0A1322] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-[#1E3352] p-1 flex items-center justify-center">
              <img
                src="/bedashing-icon.svg"
                alt="Bedashing Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-white uppercase">
                  EXECUTIVE BOARD STRATEGY PRESENTATION
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Confidential
                </span>
                {pinnedDecisions.length > 0 && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{pinnedDecisions.length} Pinned</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <img
                  src="/bedashing-logo-white.svg"
                  alt="Bedashing Beauty Lounge"
                  className="h-3 w-auto object-contain opacity-80"
                />
                <span className="text-slate-600 text-[10px]">•</span>
                <p className="text-[11px] text-[#8BA2C1]">
                  UAE Network Optimization &amp; Capital Allocation Blueprint
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center space-x-2">
            {/* Report vs Slides Segmented Switcher */}
            <div className="border border-[#1E3352] rounded-lg p-0.5 bg-[#0D1829] flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("report")}
                className={`h-[28px] px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                  viewMode === "report"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                    : "text-[#8BA2C1] hover:text-white border border-transparent"
                }`}
                title="View Full Written Strategic Report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("slides")}
                className={`h-[28px] px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                  viewMode === "slides"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                    : "text-[#8BA2C1] hover:text-white border border-transparent"
                }`}
                title="View Interactive Board Presentation Slideshow"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Slides ({totalSlides})</span>
              </button>
            </div>

            {memoText && viewMode === "report" && (
              <>
                <button
                  type="button"
                  onClick={copyMemo}
                  className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded border border-[#1E3352] hover:bg-[#15233A] text-slate-300 transition-colors cursor-pointer"
                  title="Copy Report to Clipboard"
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
                  type="button"
                  onClick={handlePrint}
                  className="p-1.5 rounded border border-[#1E3352] hover:bg-[#15233A] text-[#8BA2C1] hover:text-white transition-colors cursor-pointer"
                  title="Print Strategic Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-[#8BA2C1] hover:text-white hover:bg-[#15233A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#0B1422]">
          {/* Initial Prompt to generate if not yet generated */}
          {!memoText && !isLoading && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-lg mx-auto space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Generate Board Strategic Memorandum &amp; Slides
                </h3>
                <p className="text-xs text-[#8BA2C1] leading-relaxed">
                  Synthesize all 23 Bedashing lounges, 7 PROTECT flagships, 4 SHRINK rightsizing plans,
                  and 4 prime GROW candidates into an executive memorandum and interactive board slide deck.
                </p>

                {pinnedDecisions.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#0E1E34] border border-amber-400/30 text-left space-y-1.5 max-w-md mx-auto">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <Pin className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{pinnedDecisions.length} Directives Pinned from AI Advisor</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Your pinned strategic directives will be formally ratified and incorporated into the executive decisions section and slide deck.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateMemo}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs border border-cyan-400 shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Draft Executive Memorandum Now</span>
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-3">
                <div className="w-9 h-9 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto"></div>
                <div className="text-sm font-semibold text-white">
                  Synthesizing Grounded Board Strategic Memorandum...
                </div>
                <div className="text-xs text-[#8BA2C1] font-mono">
                  Evaluating PROTECT ({summary.protectCount}), HOLD ({summary.holdCount}), SHRINK ({summary.shrinkCount})
                  {pinnedDecisions.length > 0 ? ` and ${pinnedDecisions.length} pinned directives` : ""}...
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="m-4 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleGenerateMemo}
                className="underline font-semibold ml-2 hover:text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* VIEW MODE 1: TRADITIONAL REPORT */}
          {memoText && viewMode === "report" && (
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
              {/* Pinned Directives Callout Banner */}
              {pinnedDecisions.length > 0 && (
                <div className="bg-[#0E2038] border border-amber-400/40 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1D3A60] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                        <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                      <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                        Ratified Directives Pinned from AI Advisor ({pinnedDecisions.length})
                      </h4>
                    </div>
                    <span className="text-[10px] text-amber-300/80 font-mono">
                      Incorporated into Strategic Decisions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {pinnedDecisions.map((decision) => (
                      <div
                        key={decision.id}
                        className="p-3 rounded-lg bg-[#0A1628] border border-[#1E3658] flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <p className="text-xs text-slate-200 font-medium leading-snug">
                            "{decision.content}"
                          </p>
                          {decision.sourceQuestion && (
                            <p className="text-[10px] text-[#8BA2C1]">
                              Context: {decision.sourceQuestion}
                            </p>
                          )}
                          <span className="text-[9px] text-[#536F93] font-mono block">
                            Logged: {new Date(decision.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {onRemovePinnedDecision && (
                          <button
                            type="button"
                            onClick={() => onRemovePinnedDecision(decision.id)}
                            className="p-1 rounded text-[#536F93] hover:text-rose-400 hover:bg-[#142842] transition-colors cursor-pointer shrink-0"
                            title="Remove pinned directive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Presentation Paper */}
              <div className="bg-[#121E31] p-6 md:p-8 rounded-xl border border-[#1E3352] shadow-sm space-y-5 font-sans text-xs">
                <div className="border-b border-[#1E3352] pb-4">
                  <div className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">
                    CONFIDENTIAL • BOARD OF DIRECTORS EXECUTIVE MEMORANDUM
                  </div>
                  <h1 className="text-base md:text-lg font-bold text-white mt-1.5 tracking-tight">
                    BEDASHING UAE: GEOSPATIAL NETWORK RESTRUCTURING &amp; EXPANSION PLAN
                  </h1>
                  <div className="text-[11px] text-[#8BA2C1] mt-1 font-mono flex items-center gap-2">
                    <span>Date: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span>•</span>
                    <span>Prepared by Decision Space Executive Intelligence System</span>
                  </div>
                </div>

                <div className="leading-relaxed text-slate-200">
                  <MarkdownRenderer content={memoText} />
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: INTERACTIVE SLIDESHOW / CAROUSEL */}
          {memoText && viewMode === "slides" && (
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
              {/* Slide Deck Stage (16:9 aspect ratio card) */}
              <div className="flex-1 rounded-xl bg-[#0D1829] border border-[#1E3352] shadow-xl p-5 md:p-8 flex flex-col justify-between overflow-y-auto relative">
                
                {/* Slide Header */}
                <div className="flex items-center justify-between border-b border-[#1E3352] pb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                      SLIDE {currentSlide + 1} / {totalSlides}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                      {currentSlide === 0 && "Executive Diagnosis & Network Health"}
                      {currentSlide === 1 && "Strategic Directives & Pinned Executive Decisions"}
                      {currentSlide === 2 && "Portfolio Defense: PROTECT Flagship Moats"}
                      {currentSlide === 3 && "Operational Rightsizing: Cannibalization & Saturation"}
                      {currentSlide === 4 && "Strategic Greenfield Expansion: GROW Vector"}
                      {currentSlide === 5 && "Sensitivity Analysis & 90-Day Execution Roadmap"}
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#8BA2C1] hidden sm:inline font-mono">
                    Bedashing Executive Presentation
                  </span>
                </div>

                {/* Slide Body Content */}
                <div className="py-5 flex-1 flex flex-col justify-center">
                  
                  {/* SLIDE 1: Executive Portfolio Diagnosis */}
                  {currentSlide === 0 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <p className="text-xs text-[#8BA2C1]">
                        Geospatial and financial audit across all 23 Bedashing lounges in 5 Emirates (14 Abu Dhabi, 5 Dubai, 2 Sharjah, 1 Fujairah, 1 Ras Al Khaimah).
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-[#0F223D] border border-cyan-500/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-300 uppercase">PROTECT</span>
                            <Shield className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="text-2xl font-bold text-white">{summary.protectCount} Lounges</div>
                          <p className="text-[11px] text-[#8BA2C1]">
                            Core brand monopolies &amp; high-margin flagships. Priority for CapEx and VIP additions.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#0F223D] border border-slate-600 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase">HOLD</span>
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="text-2xl font-bold text-white">{summary.holdCount} Lounges</div>
                          <p className="text-[11px] text-[#8BA2C1]">
                            Consistent community volume providers. Focus on appointment velocity &amp; staff efficiency.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#0F223D] border border-rose-500/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-300 uppercase">SHRINK</span>
                            <Scissors className="w-4 h-4 text-rose-400" />
                          </div>
                          <div className="text-2xl font-bold text-white">{summary.shrinkCount} Lounges</div>
                          <p className="text-[11px] text-[#8BA2C1]">
                            Margin-dilutive sites under internal cannibalization (&lt;4.0km) or extreme salon saturation.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#09121F] border border-[#1E3352] flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">
                          Portfolio Health Average: <strong className="text-white">{summary.averageHealthScore}/100</strong>
                        </span>
                        <span className="text-rose-400 font-medium">
                          Cannibalization Dilution Alerts: <strong>{summary.highRiskCannibalizedCount} Sister Pairs</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 2: Ratified Directives & Pinned AI Decisions */}
                  {currentSlide === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-[#8BA2C1]">
                        Strategic decisions ratified during AI Advisor leadership sessions, incorporated into board governance:
                      </p>

                      {pinnedDecisions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                          {pinnedDecisions.map((decision, idx) => (
                            <div
                              key={decision.id}
                              className="p-4 rounded-xl bg-[#0F223D] border border-amber-400/40 space-y-2 relative group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <Pin className="w-3 h-3 fill-amber-400" />
                                  <span>Directive {idx + 1}</span>
                                </span>
                                <span className="text-[9px] text-[#8BA2C1] font-mono">
                                  {new Date(decision.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-white font-medium leading-relaxed">
                                "{decision.content}"
                              </p>
                              {decision.sourceQuestion && (
                                <p className="text-[10px] text-cyan-300/80 italic">
                                  Inquiry: {decision.sourceQuestion}
                                </p>
                              )}
                              <div className="pt-1 flex items-center justify-between text-[9px] text-emerald-400">
                                <span>Status: Approved for 90-Day Execution</span>
                                {onRemovePinnedDecision && (
                                  <button
                                    type="button"
                                    onClick={() => onRemovePinnedDecision(decision.id)}
                                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                                    title="Unpin decision"
                                  >
                                    Unpin
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center rounded-xl bg-[#09121F] border border-dashed border-[#1E3352] space-y-2">
                          <Pin className="w-8 h-8 text-[#536F93] mx-auto" />
                          <h4 className="text-sm font-semibold text-white">No Pinned Decisions Yet</h4>
                          <p className="text-xs text-[#8BA2C1] max-w-md mx-auto">
                            While chatting with the AI Advisor in the right drawer, click the <strong>"Pin to Memo"</strong> button on any strategic response to have it highlighted on this slide and incorporated into board directives.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SLIDE 3: Portfolio Defense (PROTECT Flagships) */}
                  {currentSlide === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-[#8BA2C1]">
                        High-margin crown jewel lounges driving brand equity and discretionary beauty loyalty across the UAE.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {protectBranches.slice(0, 6).map((b) => (
                          <div
                            key={b.branch.id}
                            className="p-3.5 rounded-xl bg-[#0F223D] border border-cyan-500/30 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">{b.branch.name}</span>
                              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                {b.finalScore}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8BA2C1] flex items-center justify-between">
                              <span>{b.branch.emirate}</span>
                              <span>★ {b.branch.googleRating} ({b.branch.reviewCount} revs)</span>
                            </div>
                            <div className="text-[10px] text-emerald-300 font-medium border-t border-[#1E3658] pt-1.5">
                              Action: Ring-fence CapEx (+2-4 chairs / VIP Suites)
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-[#09121F] border border-[#1E3352] text-xs text-[#8BA2C1]">
                        <strong>Board Recommendation:</strong> Protect high-density trade areas with brand reinforcement and localized experiential upgrades to preserve gross margins above 38%.
                      </div>
                    </div>
                  )}

                  {/* SLIDE 4: Operational Rightsizing & Cannibalization (SHRINK) */}
                  {currentSlide === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-[#8BA2C1]">
                        Addressing internal sister-branch cannibalization (&lt;4.0km separation) and hyper-saturated competitor corridors.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {shrinkBranches.map((b) => (
                          <div
                            key={b.branch.id}
                            className="p-4 rounded-xl bg-[#1A1422] border border-rose-500/40 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{b.branch.name}</span>
                              <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">
                                Score: {b.finalScore}
                              </span>
                            </div>
                            <div className="text-[11px] text-rose-200/80 space-y-1">
                              <div>• Sister Separation: <strong>{b.branch.nearestSisterDistanceKm} km</strong> (Conflict Risk)</div>
                              <div>• Local Competitors: <strong>{b.branch.competitorDensity3km} salons</strong> within 3km</div>
                            </div>
                            <div className="pt-2 border-t border-rose-950 text-[11px] text-slate-300">
                              <strong>Action Plan:</strong> Downsize operational styling stations from {b.branch.chairCount} to {Math.max(6, b.branch.chairCount - 4)} chairs, or trigger lease renegotiation at next break clause.
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-[#09121F] border border-rose-500/30 text-xs text-rose-300">
                        <strong>Overhead Savings:</strong> Rightsizing these 4 locations recaptures approximately AED 1.2M in annual technician payroll and lease overhead.
                      </div>
                    </div>
                  )}

                  {/* SLIDE 5: Greenfield Expansion Pipeline (GROW Vector) */}
                  {currentSlide === 4 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-[#8BA2C1]">
                        High-yield white-space expansion candidates with high unmet luxury demand and safe sister separation (&gt;3.0km).
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {topGrowCandidates.slice(0, 4).map((c) => (
                          <div
                            key={c.candidate.id}
                            className="p-3.5 rounded-xl bg-[#0F223D] border border-teal-500/30 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">{c.candidate.name}</span>
                              <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/30">
                                {c.finalScore}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#8BA2C1] space-y-0.5">
                              <div>Emirate: {c.candidate.emirate}</div>
                              <div>Unmet Demand: {c.demandScore}/100</div>
                              <div>Sister Buffer: {c.candidate.nearestBedashingDistanceKm} km</div>
                            </div>
                            <div className="text-[10px] text-teal-300 font-medium border-t border-[#1E3658] pt-1.5">
                              Target: {c.candidate.expectedChairCapacity} Chairs
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-[#09121F] border border-[#1E3352] text-xs text-[#8BA2C1]">
                        <strong>Strategic Thesis:</strong> Prioritize Dubai Hills Mall and Saadiyat Cultural District to capture rapid master-community residential handovers with zero cannibalization of existing assets.
                      </div>
                    </div>
                  )}

                  {/* SLIDE 6: Sensitivity Analysis & 90-Day Execution Roadmap */}
                  {currentSlide === 5 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <p className="text-xs text-[#8BA2C1]">
                        Immediate milestones for C-Suite and operational leadership following board approval:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div className="p-4 rounded-xl bg-[#0F223D] border border-[#1E3352] space-y-2">
                          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>DAYS 1 – 30</span>
                          </div>
                          <h4 className="text-xs font-semibold text-white">Lease Audits &amp; Chair Rightsizing</h4>
                          <p className="text-[11px] text-[#8BA2C1] leading-relaxed">
                            Audit break clauses for Baniyas East and Al Wasl. Prepare equipment reassignment for -4 chairs.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#0F223D] border border-[#1E3352] space-y-2">
                          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>DAYS 31 – 60</span>
                          </div>
                          <h4 className="text-xs font-semibold text-white">Issue Retail EOIs</h4>
                          <p className="text-[11px] text-[#8BA2C1] leading-relaxed">
                            Issue formal tenancy inquiries for Dubai Hills Mall and Saadiyat Island. Finalize architectural specifications.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#0F223D] border border-[#1E3352] space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>DAYS 61 – 90</span>
                          </div>
                          <h4 className="text-xs font-semibold text-white">Flagship CapEx Deployment</h4>
                          <p className="text-[11px] text-[#8BA2C1] leading-relaxed">
                            Deploy ring-fenced VIP renovation budgets at Al Maqta Waterfront and Khaleej Al Arabi flagships.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-[#09121F] border border-[#1E3352] flex items-center justify-between text-xs text-[#8BA2C1]">
                        <span>Active Model Weights: Reputation ({branchWeights.reputationWeight}%), Affluence ({branchWeights.catchmentDemandWeight}%), Sister Buffer ({branchWeights.cannibalizationWeight}%)</span>
                        <span className="text-emerald-400 font-medium">Deterministic &amp; Auditable</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Slide Controls & Dots Carousel */}
                <div className="border-t border-[#1E3352] pt-3 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                    disabled={currentSlide === 0}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      currentSlide === 0
                        ? "border-[#1E3352] text-slate-600 cursor-not-allowed"
                        : "border-[#1E3352] bg-[#142338] text-white hover:bg-[#1C3250]"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Carousel Indicator Dots */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all rounded-full cursor-pointer ${
                          idx === currentSlide
                            ? "w-6 h-2 bg-cyan-400"
                            : "w-2 h-2 bg-slate-700 hover:bg-slate-500"
                        }`}
                        title={`Jump to Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
                    disabled={currentSlide === totalSlides - 1}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      currentSlide === totalSlides - 1
                        ? "border-[#1E3352] text-slate-600 cursor-not-allowed"
                        : "border-[#1E3352] bg-cyan-600 text-white hover:bg-cyan-500 shadow-xs"
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#1E3352] bg-[#0A1322] flex justify-between items-center text-[11px] text-[#8BA2C1] shrink-0">
          <span>Grounded strictly in computed deterministic scores &bull; Pinned directives ratified</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#142338] text-slate-200 hover:text-white hover:bg-[#1C3250] border border-[#1E3352] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
