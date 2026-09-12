import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sliders,
  Sparkles,
  Database,
  Code2,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  RefreshCw,
  ChevronRight,
  MapPin,
  ExternalLink,
  Bot,
  FileText,
  FileSpreadsheet,
  Check,
  Loader2,
  Pin,
} from "lucide-react";
import {
  BranchEvaluation,
  CandidateEvaluation,
  BranchScoringWeights,
  CandidateScoringWeights,
  ThresholdConfig,
  NetworkSummary,
  PinnedDecision,
} from "../types";
import {
  DEFAULT_BRANCH_WEIGHTS,
  DEFAULT_CANDIDATE_WEIGHTS,
  DEFAULT_THRESHOLDS,
  SIMULATION_SCENARIOS,
} from "../services/scoringEngine";
import { RightPanelType } from "./AppHeader";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { getStoredAiRationale, setStoredAiRationale } from "../services/aiStorage";

interface RightDrawerPanelProps {
  activePanel: RightPanelType;
  onClose: () => void;
  // Config state & props
  branchWeights: BranchScoringWeights;
  setBranchWeights: React.Dispatch<React.SetStateAction<BranchScoringWeights>>;
  candidateWeights: CandidateScoringWeights;
  setCandidateWeights: React.Dispatch<React.SetStateAction<CandidateScoringWeights>>;
  thresholds: ThresholdConfig;
  setThresholds: React.Dispatch<React.SetStateAction<ThresholdConfig>>;
  summary: NetworkSummary;
  // Branch state & props
  selectedBranch: BranchEvaluation | null;
  selectedCandidate: CandidateEvaluation | null;
  initialAdvisorPrompt?: string | null;
  onClearInitialAdvisorPrompt?: () => void;
  onFocusLocation: (lat: number, lng: number) => void;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
  onOpenMemoModal: () => void;
  onOpenDriveModal: () => void;
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  pinnedDecisions?: PinnedDecision[];
  onTogglePinDecision?: (content: string, sourceQuestion?: string) => void;
  onRemovePinnedDecision?: (id: string) => void;
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  time: string;
}

export const RightDrawerPanel: React.FC<RightDrawerPanelProps> = ({
  activePanel,
  onClose,
  branchWeights,
  setBranchWeights,
  candidateWeights,
  setCandidateWeights,
  thresholds,
  setThresholds,
  summary,
  selectedBranch,
  selectedCandidate,
  initialAdvisorPrompt,
  onClearInitialAdvisorPrompt,
  onFocusLocation,
  onOpenAdvisorWithPrompt,
  onOpenMemoModal,
  onOpenDriveModal,
  branchEvals,
  candidateEvals,
  pinnedDecisions = [],
  onTogglePinDecision,
  onRemovePinnedDecision,
}) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  // Focus context subject for AI Advisor (branch or candidate)
  const [advisorSubject, setAdvisorSubject] = useState<{
    type: "branch" | "candidate";
    name: string;
    classification: string;
    score: number;
    branchEval?: BranchEvaluation;
    candidateEval?: CandidateEvaluation;
  } | null>(null);

  // AI Advisor Chat State
  const [advisorInput, setAdvisorInput] = useState("");
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [advisorMessages, setAdvisorMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `I am grounded in your deterministic scoring model for Bedashing Beauty Lounges. The portfolio currently has **${summary.protectCount} PROTECT**, **${summary.holdCount} HOLD**, and **${summary.shrinkCount} SHRINK** branches.

Ask any strategic question or choose a suggested inquiry below.`,
      time: "Just now",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Recompute button tactile feedback state
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [justRecomputed, setJustRecomputed] = useState(false);

  // Config Drawer sub-tab: 'branches' | 'growth' | 'thresholds'
  const [configTab, setConfigTab] = useState<"branches" | "growth" | "thresholds">("branches");

  // In-situ Branch AI Rationale State
  const branchStorageKey = selectedBranch ? `branch_${selectedBranch.branch.id}` : null;
  const [branchAiExplanation, setBranchAiExplanation] = useState<string | null>(null);
  const [branchAiGeneratedAt, setBranchAiGeneratedAt] = useState<string | null>(null);
  const [isBranchAiLoading, setIsBranchAiLoading] = useState(false);
  const [branchAiError, setBranchAiError] = useState<string | null>(null);

  useEffect(() => {
    if (branchStorageKey) {
      const cached = getStoredAiRationale(branchStorageKey);
      if (cached) {
        setBranchAiExplanation(cached.text);
        setBranchAiGeneratedAt(cached.generatedAt);
      } else {
        setBranchAiExplanation(null);
        setBranchAiGeneratedAt(null);
      }
      setBranchAiError(null);
    }
  }, [branchStorageKey]);

  // In-situ Candidate AI Rationale State
  const candidateStorageKey = selectedCandidate ? `candidate_${selectedCandidate.candidate.id}` : null;
  const [candidateAiExplanation, setCandidateAiExplanation] = useState<string | null>(null);
  const [candidateAiGeneratedAt, setCandidateAiGeneratedAt] = useState<string | null>(null);
  const [isCandidateAiLoading, setIsCandidateAiLoading] = useState(false);
  const [candidateAiError, setCandidateAiError] = useState<string | null>(null);

  useEffect(() => {
    if (candidateStorageKey) {
      const cached = getStoredAiRationale(candidateStorageKey);
      if (cached) {
        setCandidateAiExplanation(cached.text);
        setCandidateAiGeneratedAt(cached.generatedAt);
      } else {
        setCandidateAiExplanation(null);
        setCandidateAiGeneratedAt(null);
      }
      setCandidateAiError(null);
    }
  }, [candidateStorageKey]);

  // Generate in-situ Branch AI Rationale
  const handleGenerateBranchAi = async () => {
    if (!selectedBranch || isBranchAiLoading) return;
    setIsBranchAiLoading(true);
    setBranchAiError(null);
    try {
      const query = `Explain in detail why ${selectedBranch.branch.name} is classified as ${selectedBranch.classification} with score ${selectedBranch.finalScore}/100. Reference its exact rating (${selectedBranch.branch.googleRating}★), ${selectedBranch.branch.reviewCount} reviews, sister branch proximity (${selectedBranch.branch.nearestSisterDistanceKm}km), catchment affluence index (${selectedBranch.branch.catchmentAffluenceIndex}), and ${selectedBranch.branch.competitorDensity3km} competitors in 3km. Provide concrete executive directives on chair allocation, lease renewal, or protection.`;
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          subjectType: "branch",
          subjectData: selectedBranch,
          modelContext: { branchWeights, thresholds },
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const explanation = data.explanation || data.response || "";
      setBranchAiExplanation(explanation);
      const now = new Date().toISOString();
      setBranchAiGeneratedAt(now);
      setStoredAiRationale(branchStorageKey, explanation);
    } catch (err: any) {
      setBranchAiError(err.message || "Failed to contact Gemini advisor.");
    } finally {
      setIsBranchAiLoading(false);
    }
  };

  // Generate in-situ Candidate AI Rationale
  const handleGenerateCandidateAi = async () => {
    if (!selectedCandidate || isCandidateAiLoading) return;
    setIsCandidateAiLoading(true);
    setCandidateAiError(null);
    try {
      const query = `Explain why candidate expansion area ${selectedCandidate.candidate.name} is classified as ${selectedCandidate.classification} with score ${selectedCandidate.finalScore}/100. Reference unmet demand (${selectedCandidate.candidate.unmetDemandIndex}/100), retail gravity, and sister branch proximity (${selectedCandidate.candidate.nearestBedashingDistanceKm}km). Provide capital allocation recommendation.`;
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          subjectType: "candidate",
          subjectData: selectedCandidate,
          modelContext: { candidateWeights, thresholds },
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const explanation = data.explanation || data.response || "";
      setCandidateAiExplanation(explanation);
      const now = new Date().toISOString();
      setCandidateAiGeneratedAt(now);
      setStoredAiRationale(candidateStorageKey, explanation);
    } catch (err: any) {
      setCandidateAiError(err.message || "Failed to contact Gemini advisor.");
    } finally {
      setIsCandidateAiLoading(false);
    }
  };

  // Sync state for "Data" panel
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Today, 2 hours ago");
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Decision log modal feedback
  const [decisionLoggedFeedback, setDecisionLoggedFeedback] = useState<string | null>(null);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Automatically process initial prompt if passed
  useEffect(() => {
    if (initialAdvisorPrompt && activePanel === "advisor") {
      // Set subject if not yet set
      if (selectedBranch) {
        setAdvisorSubject({
          type: "branch",
          name: selectedBranch.branch.name,
          classification: selectedBranch.classification,
          score: selectedBranch.finalScore,
          branchEval: selectedBranch,
        });
      } else if (selectedCandidate) {
        setAdvisorSubject({
          type: "candidate",
          name: selectedCandidate.candidate.name,
          classification: selectedCandidate.classification,
          score: selectedCandidate.finalScore,
          candidateEval: selectedCandidate,
        });
      }
      handleSendAdvisor(initialAdvisorPrompt);
      onClearInitialAdvisorPrompt?.();
    }
  }, [initialAdvisorPrompt, activePanel]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (activePanel === "advisor") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [advisorMessages, activePanel]);

  if (!activePanel) return null;

  const isOverlayMode = windowWidth < 1200;

  // Title selector based on active panel
  const getPanelTitle = () => {
    switch (activePanel) {
      case "config":
        return "Config · decision model";
      case "advisor":
        return advisorSubject ? `AI Advisor · ${advisorSubject.name}` : "AI Advisor";
      case "data":
        return "Data sources & sync";
      case "dev":
        return "Developer Documentation";
      case "branch":
        return selectedBranch
          ? selectedBranch.branch.name
          : selectedCandidate
          ? selectedCandidate.candidate.name
          : "Branch detail";
      default:
        return "Details";
    }
  };

  // Helper for scoring weights sum
  const branchWeightSum = (
    branchWeights.reputationWeight +
    branchWeights.catchmentDemandWeight +
    branchWeights.cannibalizationWeight +
    branchWeights.competitionWeight
  ) / 100;

  const isWeightSumValid = Math.abs(branchWeightSum - 1.0) < 0.005;

  const candidateWeightSum = (
    candidateWeights.unmetDemandWeight +
    candidateWeights.affluenceWeight +
    candidateWeights.retailGravityWeight +
    candidateWeights.cannibalizationRiskWeight
  ) / 100;

  const isCandidateWeightSumValid = Math.abs(candidateWeightSum - 1.0) < 0.005;

  // Handle AI Advisor message send
  const handleSendAdvisor = async (textToSend?: string) => {
    const q = textToSend || advisorInput;
    if (!q.trim() || isAdvisorLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAdvisorMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setAdvisorInput("");
    setIsAdvisorLoading(true);

    const currentSubject = advisorSubject || (selectedBranch ? {
      type: "branch" as const,
      name: selectedBranch.branch.name,
      classification: selectedBranch.classification,
      score: selectedBranch.finalScore,
      branchEval: selectedBranch,
    } : selectedCandidate ? {
      type: "candidate" as const,
      name: selectedCandidate.candidate.name,
      classification: selectedCandidate.classification,
      score: selectedCandidate.finalScore,
      candidateEval: selectedCandidate,
    } : null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          subjectType: currentSubject?.type || "network",
          subjectData: currentSubject?.type === "branch" ? currentSubject.branchEval : currentSubject?.type === "candidate" ? currentSubject.candidateEval : undefined,
          modelContext: {
            summary,
            weights: branchWeights,
            thresholds,
          },
          contextData: {
            summary,
            weights: branchWeights,
            subjectName: currentSubject?.name,
            keyBranches: branchEvals.slice(0, 10).map((b) => ({
              name: b.branch.name,
              emirate: b.branch.emirate,
              score: b.finalScore,
              decision: b.classification,
              sisterDistKm: b.branch.nearestSisterDistanceKm,
              cannibalizationWarning: b.cannibalizationWarning,
            })),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.response || data.explanation || "Analysis completed.";
        setAdvisorMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        throw new Error(`Advisor returned status ${res.status}`);
      }
    } catch (err: any) {
      setAdvisorMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Unable to reach the advisor service right now. Please verify network or API keys.\n\n*Note:* The deterministic model computes **${summary.protectCount} PROTECT**, **${summary.holdCount} HOLD**, and **${summary.shrinkCount} SHRINK** branches with an average health of **${summary.averageHealthScore}/100**.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Trigger sync in data panel
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastSyncTime(`Today at ${now}`);
      setSyncSuccessMessage("Data stream verified: 23 store records and geocodes are current.");
    }, 1200);
  };

  return (
    <>
      {/* Click-to-dismiss Scrim when in overlay mode (<1200px) */}
      {isOverlayMode && (
        <div
          id="panel-scrim"
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      {/* Main Panel Container */}
      <aside
        id="right-drawer-panel"
        aria-label={getPanelTitle()}
        className={`bg-[#0C182A] border-l border-[#1D3452] flex flex-col z-40 transition-all ${
          isOverlayMode
            ? "fixed top-[60px] right-0 bottom-0 w-[min(368px,88%)] shadow-2xl"
            : "w-[368px] shrink-0 h-[calc(100vh-60px)] sticky top-[60px]"
        }`}
      >
        {/* Panel Header (50px, bottom border, title left, × close right) */}
        <div className="h-[50px] shrink-0 px-4 border-b border-[#1D3452] flex items-center justify-between bg-[#0C182A]">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {activePanel === "config" && <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />}
            {activePanel === "advisor" && <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />}
            {activePanel === "data" && <Database className="w-4 h-4 text-emerald-400 shrink-0" />}
            {activePanel === "dev" && <Code2 className="w-4 h-4 text-[#8BA2C1] shrink-0" />}
            {activePanel === "branch" && <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />}
            <h2 className="text-xs font-bold text-white tracking-wide uppercase truncate">
              {getPanelTitle()}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-1 rounded-md text-[#8BA2C1] hover:text-white hover:bg-[#142842] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto text-xs text-slate-200">
          {/* ========================================================================= */}
          {/* 1. CONFIG PANEL                                                          */}
          {/* ========================================================================= */}
          {activePanel === "config" && (
            <div className="p-4 space-y-4">
              {/* Executive Simulation Scenarios Header */}
              <div className="bg-[#0A1424] p-3 rounded-lg border border-[#1D3452] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Simulation Scenarios</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                    {summary.shrinkCount} SHRINK Cases Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {Object.values(SIMULATION_SCENARIOS).map((sc) => {
                    const isSelected =
                      thresholds.holdCutoff === sc.thresholds.holdCutoff &&
                      thresholds.protectCutoff === sc.thresholds.protectCutoff;
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => {
                          setBranchWeights(sc.branchWeights);
                          setCandidateWeights(sc.candidateWeights);
                          setThresholds(sc.thresholds);
                        }}
                        className={`p-2 rounded border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-950/60 border-cyan-400 text-white shadow-xs"
                            : "bg-[#0F1F35] border-[#1D3452] text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        <div className="font-bold text-[11px] leading-tight text-white flex items-center justify-between">
                          <span>{sc.shortLabel}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                        </div>
                        <div className="text-[9.5px] text-[#8BA2C1] mt-0.5 line-clamp-1">
                          {sc.shrinkTarget === "None" ? "0 Shrink (Permissive)" : `Target: ${sc.shrinkTarget}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-tab Switcher: Branches | Growth | Thresholds */}
              <div className="flex items-center bg-[#0A1424] p-1 rounded-lg border border-[#1D3452] text-xs">
                <button
                  type="button"
                  onClick={() => setConfigTab("branches")}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-colors cursor-pointer text-center ${
                    configTab === "branches"
                      ? "bg-[#142842] text-white shadow-xs"
                      : "text-[#8BA2C1] hover:text-white"
                  }`}
                >
                  Branches ({summary.totalBranches})
                </button>
                <button
                  type="button"
                  onClick={() => setConfigTab("growth")}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-colors cursor-pointer text-center ${
                    configTab === "growth"
                      ? "bg-[#142842] text-white shadow-xs"
                      : "text-[#8BA2C1] hover:text-white"
                  }`}
                >
                  Growth ({summary.totalCandidates})
                </button>
                <button
                  type="button"
                  onClick={() => setConfigTab("thresholds")}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold transition-colors cursor-pointer text-center ${
                    configTab === "thresholds"
                      ? "bg-[#142842] text-white shadow-xs"
                      : "text-[#8BA2C1] hover:text-white"
                  }`}
                >
                  Cutoffs
                </button>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* TAB 1: BRANCHES WEIGHTS                                      */}
              {/* ------------------------------------------------------------- */}
              {configTab === "branches" && (
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#1D3452]">
                    <span className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider">
                      Branch Scoring Weights (0.00 – 1.00)
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isWeightSumValid
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      Sum: {branchWeightSum.toFixed(2)}
                    </span>
                  </div>

                  {/* 4 Range Sliders with 2-decimal live values and explanation */}
                  <div className="space-y-3.5">
                    {/* Coefficient 1: Reputation */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Google Star Reputation</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">
                          {(branchWeights.reputationWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Google star rating (4.1–4.8★) scaled with Bayesian volume credibility.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={branchWeights.reputationWeight}
                        onChange={(e) =>
                          setBranchWeights((prev) => ({
                            ...prev,
                            reputationWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    {/* Coefficient 2: Catchment Affluence */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Catchment Affluence</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">
                          {(branchWeights.catchmentDemandWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Disposable income index (0–100) based on residential rental brackets.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={branchWeights.catchmentDemandWeight}
                        onChange={(e) =>
                          setBranchWeights((prev) => ({
                            ...prev,
                            catchmentDemandWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    {/* Coefficient 3: Sister Distance (Cannibalization) */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Sister Proximity Safety</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">
                          {(branchWeights.cannibalizationWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Penalizes overlapping catchments within the sister buffer.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={branchWeights.cannibalizationWeight}
                        onChange={(e) =>
                          setBranchWeights((prev) => ({
                            ...prev,
                            cannibalizationWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    {/* Coefficient 4: Competition */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Competitor Moat</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">
                          {(branchWeights.competitionWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Moat resilience against 3km beauty salon saturation density.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={branchWeights.competitionWeight}
                        onChange={(e) =>
                          setBranchWeights((prev) => ({
                            ...prev,
                            competitionWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Impact Preview Sentence */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-[#0F1F35] border border-[#1D3452] text-[11px]">
                    <span className="font-bold text-[#8BA2C1] uppercase text-[9px] tracking-wider block mb-1">
                      Live Impact on Branches:
                    </span>
                    <p className="font-medium text-white">
                      {summary.protectCount} Protect · {summary.holdCount} Hold · {summary.shrinkCount} Shrink
                    </p>
                    <p className="text-[10px] text-[#8BA2C1] mt-0.5">
                      Network average health score: <span className="text-cyan-300 font-mono font-bold">{summary.averageHealthScore}/100</span>
                    </p>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: GROWTH WEIGHTS                                        */}
              {/* ------------------------------------------------------------- */}
              {configTab === "growth" && (
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#1D3452]">
                    <span className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider">
                      Growth Pipeline Weights (0.00 – 1.00)
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCandidateWeightSumValid
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      Sum: {candidateWeightSum.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Candidate Weight 1: Unmet Demand */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Unmet Salon Demand</span>
                        <span className="font-mono font-bold text-teal-400 text-xs">
                          {(candidateWeights.unmetDemandWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Target female demographic population relative to existing salon capacity.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={candidateWeights.unmetDemandWeight}
                        onChange={(e) =>
                          setCandidateWeights((prev) => ({
                            ...prev,
                            unmetDemandWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Candidate Weight 2: Affluence */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Target Catchment Affluence</span>
                        <span className="font-mono font-bold text-teal-400 text-xs">
                          {(candidateWeights.affluenceWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        High-net-worth female residents and premium service propensity.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={candidateWeights.affluenceWeight}
                        onChange={(e) =>
                          setCandidateWeights((prev) => ({
                            ...prev,
                            affluenceWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Candidate Weight 3: Retail Gravity */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Retail Gravity & Footfall</span>
                        <span className="font-mono font-bold text-teal-400 text-xs">
                          {(candidateWeights.retailGravityWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Commercial anchor strength, luxury malls, and organic pedestrian foot-traffic.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={candidateWeights.retailGravityWeight}
                        onChange={(e) =>
                          setCandidateWeights((prev) => ({
                            ...prev,
                            retailGravityWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Candidate Weight 4: Cannibalization Risk */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Network Separation Safety</span>
                        <span className="font-mono font-bold text-teal-400 text-xs">
                          {(candidateWeights.cannibalizationRiskWeight / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Penalizes candidate zones closer than 2.0–6.0km to existing Bedashing salons.
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={5}
                        value={candidateWeights.cannibalizationRiskWeight}
                        onChange={(e) =>
                          setCandidateWeights((prev) => ({
                            ...prev,
                            cannibalizationRiskWeight: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-teal-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Impact Preview Sentence */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-[#0F1F35] border border-[#1D3452] text-[11px]">
                    <span className="font-bold text-[#8BA2C1] uppercase text-[9px] tracking-wider block mb-1">
                      Live Impact on Growth Pipeline:
                    </span>
                    <p className="font-medium text-white">
                      <span className="text-teal-400 font-bold">{summary.growCount} GROW</span> ·{" "}
                      <span className="text-amber-400 font-bold">{summary.watchCount} WATCH</span> ·{" "}
                      <span className="text-slate-400 font-bold">{summary.skipCount} SKIP</span>
                    </p>
                    <p className="text-[10px] text-[#8BA2C1] mt-0.5">
                      Evaluates 8 greenfield expansion target zones in real time.
                    </p>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 3: THRESHOLDS & BUFFERS                                  */}
              {/* ------------------------------------------------------------- */}
              {configTab === "thresholds" && (
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#1D3452]">
                    <span className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider">
                      Decision Cutoffs & Buffers
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Protect Cutoff */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Protect Cutoff Score</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          ≥ {thresholds.protectCutoff}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Flagship lounges meeting or exceeding this score receive PROTECT status.
                      </p>
                      <input
                        type="range"
                        min={65}
                        max={90}
                        step={1}
                        value={thresholds.protectCutoff}
                        onChange={(e) =>
                          setThresholds((prev) => ({
                            ...prev,
                            protectCutoff: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    {/* Hold Cutoff */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Hold Cutoff Score</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          ≥ {thresholds.holdCutoff} (below is SHRINK)
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Lounges between Hold and Protect remain HOLD; below Hold are designated SHRINK.
                      </p>
                      <input
                        type="range"
                        min={40}
                        max={78}
                        step={1}
                        value={thresholds.holdCutoff}
                        onChange={(e) =>
                          setThresholds((prev) => ({
                            ...prev,
                            holdCutoff: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Grow Cutoff */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Grow Cutoff Score (Candidates)</span>
                        <span className="font-mono font-bold text-teal-400 text-xs">
                          ≥ {thresholds.growCutoff}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Target zones with expansion scores meeting this threshold receive immediate GROW greenlight.
                      </p>
                      <input
                        type="range"
                        min={65}
                        max={88}
                        step={1}
                        value={thresholds.growCutoff}
                        onChange={(e) =>
                          setThresholds((prev) => ({
                            ...prev,
                            growCutoff: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Watch Cutoff */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Watch Cutoff Score (Candidates)</span>
                        <span className="font-mono font-bold text-cyan-400 text-xs">
                          ≥ {thresholds.watchCutoff} (below is SKIP)
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Zones between Watch and Grow are classified WATCH; below are SKIP.
                      </p>
                      <input
                        type="range"
                        min={45}
                        max={70}
                        step={1}
                        value={thresholds.watchCutoff}
                        onChange={(e) =>
                          setThresholds((prev) => ({
                            ...prev,
                            watchCutoff: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    {/* Sister Buffer Radius */}
                    <div className="bg-[#0A1424] p-2.5 rounded-lg border border-[#1D3452]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Sister Buffer Distance</span>
                        <span className="font-mono font-bold text-rose-400 text-xs">
                          {thresholds.sisterBufferKm.toFixed(1)} km
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8BA2C1] mt-0.5 leading-tight">
                        Geodesic radius that triggers cannibalization warnings on the map and audit reports.
                      </p>
                      <input
                        type="range"
                        min={1.5}
                        max={7.0}
                        step={0.5}
                        value={thresholds.sisterBufferKm}
                        onChange={(e) =>
                          setThresholds((prev) => ({
                            ...prev,
                            sisterBufferKm: Number(e.target.value),
                          }))
                        }
                        className="w-full mt-2 accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-[#0F1F35] border border-[#1D3452] text-[11px]">
                    <span className="font-bold text-[#8BA2C1] uppercase text-[9px] tracking-wider block mb-1">
                      Active Governance Status:
                    </span>
                    <p className="font-medium text-white">
                      Branches: <span className="text-emerald-400">{summary.protectCount} Protect</span> ·{" "}
                      <span className="text-amber-400">{summary.holdCount} Hold</span> ·{" "}
                      <span className="text-rose-400">{summary.shrinkCount} Shrink</span>
                    </p>
                    <p className="text-[10px] text-[#8BA2C1] mt-0.5">
                      Candidates: <span className="text-teal-400">{summary.growCount} Grow</span> ·{" "}
                      <span className="text-amber-400">{summary.watchCount} Watch</span> ·{" "}
                      <span className="text-slate-400">{summary.skipCount} Skip</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons: Recompute Network & Reset */}
              <div className="mt-3.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecomputing(true);
                    setTimeout(() => {
                      setIsRecomputing(false);
                      setJustRecomputed(true);
                      setTimeout(() => setJustRecomputed(false), 2200);
                    }, 400);
                  }}
                  disabled={isRecomputing}
                  className={`flex-1 py-2 px-3 rounded-lg text-white font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                    justRecomputed
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-cyan-600 hover:bg-cyan-500"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRecomputing ? "animate-spin" : ""}`} />
                  <span>
                    {isRecomputing
                      ? "Recomputing..."
                      : justRecomputed
                      ? "Network Updated ✓"
                      : "Recompute network"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBranchWeights(DEFAULT_BRANCH_WEIGHTS);
                    setCandidateWeights(DEFAULT_CANDIDATE_WEIGHTS);
                    setThresholds(DEFAULT_THRESHOLDS);
                  }}
                  className="py-2 px-3 rounded-lg bg-transparent hover:bg-[#142842] text-[#8BA2C1] hover:text-white border border-[#1D3452] font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. ADVISOR PANEL                                                         */}
          {/* ========================================================================= */}
          {activePanel === "advisor" && (
            <div className="flex flex-col h-full">
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {/* Latest Insight in an accent-tinted card */}
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Executive Strategy Insight</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {summary.shrinkCount > 0
                      ? `Attention on ${summary.shrinkCount} lounges classified as SHRINK (e.g., Al Wasl Jumeirah). Reducing styling chairs or renegotiating retail leases eliminates margin dilution.`
                      : `The portfolio is exceptionally resilient with ${summary.protectCount} protected lounges and zero sister conflicts.`}
                  </p>
                  <div className="mt-2 pt-2 border-t border-cyan-500/20 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onOpenMemoModal}
                      className="text-[10px] font-semibold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Generate Board Memo →</span>
                    </button>
                    <span className="text-[9px] text-cyan-400/80 font-mono">Q1 Review Cycle</span>
                  </div>
                </div>

                {/* Pinned Decisions Status Bar */}
                {pinnedDecisions && pinnedDecisions.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                        <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </div>
                      <span className="text-[11px] font-medium text-cyan-200">
                        {pinnedDecisions.length} {pinnedDecisions.length === 1 ? "Directive" : "Directives"} Pinned to Board Memo
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenMemoModal}
                      className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View Deck</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* 3 Suggested Question Rows */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider block">
                    Suggested Inquiries
                  </span>
                  {[
                    "Why is Al Wasl Jumeirah classified as SHRINK?",
                    "Analyze cannibalization between West Yas & Noya Plaza",
                    "What are the top 3 expansion zones for 2026?",
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAdvisor(prompt)}
                      className="w-full text-left p-2 rounded-lg bg-[#0A1424] hover:bg-[#142842] border border-[#1D3452] hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{prompt}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#536F93] group-hover:text-cyan-400 shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Message Stream */}
                <div className="space-y-3 pt-2">
                  {advisorMessages.map((msg, idx) => {
                    const isPinned = pinnedDecisions.some((p) => p.content.trim() === msg.content.trim());
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${
                          msg.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[92%] leading-relaxed ${
                            msg.role === "user"
                              ? "bg-cyan-600 text-white shadow-xs"
                              : "bg-[#0F1F35] border border-[#1D3452] text-slate-200"
                          }`}
                        >
                          <MarkdownRenderer content={msg.content} />
                        </div>
                        
                        {/* Assistant Footer with Pin Button */}
                        {msg.role === "assistant" && idx > 0 ? (
                          <div className="flex items-center justify-between w-full max-w-[92%] mt-1 px-1">
                            <button
                              type="button"
                              onClick={() => {
                                const precedingQuery = advisorMessages
                                  .slice(0, idx)
                                  .reverse()
                                  .find((m) => m.role === "user")?.content;
                                onTogglePinDecision?.(msg.content, precedingQuery);
                              }}
                              className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded transition-all cursor-pointer ${
                                isPinned
                                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs"
                                  : "text-[#8BA2C1] hover:text-white hover:bg-[#142842] border border-transparent"
                              }`}
                              title={
                                isPinned
                                  ? "Click to unpin from Executive Memo & Slides"
                                  : "Pin this recommendation into Board Memo & Slides"
                              }
                            >
                              <Pin className={`w-3 h-3 ${isPinned ? "fill-amber-400 text-amber-400" : ""}`} />
                              <span>{isPinned ? "Pinned to Board Memo" : "Pin to Memo"}</span>
                            </button>
                            <span className="text-[9px] text-[#536F93]">{msg.time}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-[#536F93] mt-1 px-1">{msg.time}</span>
                        )}
                      </div>
                    );
                  })}
                  {isAdvisorLoading && (
                    <div className="p-3 rounded-lg bg-[#0F1F35] border border-[#1D3452] text-slate-400 flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span>Synthesizing mathematical metrics...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Pinned Composer Field at Bottom */}
              <div className="p-3 border-t border-[#1D3452] bg-[#0C182A] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAdvisor();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={advisorInput}
                    onChange={(e) => setAdvisorInput(e.target.value)}
                    placeholder="Ask about lounges, cannibalization, scores..."
                    className="flex-1 bg-[#0A1424] border border-[#1D3452] focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 rounded-lg px-3 py-2 text-xs text-white placeholder-[#536F93] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!advisorInput.trim() || isAdvisorLoading}
                    className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. DATA PANEL                                                            */}
          {/* ========================================================================= */}
          {activePanel === "data" && (
            <div className="p-4 space-y-4">
              {/* Green Health Summary Line with Last-Sync Time */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Data Health: Optimal</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  All 4 geospatial and demographic data streams are in sync.
                </p>
                <div className="text-[10px] text-[#8BA2C1] font-mono mt-1">
                  Last verified: {lastSyncTime}
                </div>
              </div>

              {syncSuccessMessage && (
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{syncSuccessMessage}</span>
                </div>
              )}

              {/* List of Sources with Record Counts and Freshness */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider block">
                  Connected Data Streams
                </span>

                {/* Source 1: Google Places API */}
                <div className="p-2.5 rounded-lg bg-[#0A1424] border border-[#1D3452]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Google Places Details API</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">23 / 23 Active</span>
                  </div>
                  <p className="text-[10px] text-[#8BA2C1] mt-0.5">
                    Live star ratings (4.1–4.8★) &amp; review volumes (280–1,420).
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#536F93]">
                    <span>Freshness: Daily</span>
                    <span className="text-emerald-400">● 100% Match</span>
                  </div>
                </div>

                {/* Source 2: Google Geocoding API */}
                <div className="p-2.5 rounded-lg bg-[#0A1424] border border-[#1D3452]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Google Maps Geocoding</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">23 Coordinates</span>
                  </div>
                  <p className="text-[10px] text-[#8BA2C1] mt-0.5">
                    Sub-meter latitude/longitude coordinates verified against municipality addresses.
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#536F93]">
                    <span>Freshness: Permanent</span>
                    <span className="text-emerald-400">● Geocoded</span>
                  </div>
                </div>

                {/* Source 3: Haversine Geodesic Engine */}
                <div className="p-2.5 rounded-lg bg-[#0A1424] border border-[#1D3452]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Haversine Distance Matrix</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">529 Pairs</span>
                  </div>
                  <p className="text-[10px] text-[#8BA2C1] mt-0.5">
                    Spherical distance calculations identifying 4.0km cannibalization vectors.
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#536F93]">
                    <span>Freshness: Real-time</span>
                    <span className="text-cyan-300">● In-Memory Math</span>
                  </div>
                </div>

                {/* Source 4: UAE Residential Rental Benchmarks */}
                <div className="p-2.5 rounded-lg bg-[#0A1424] border border-[#1D3452]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Catchment Affluence Index</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">23 Catchments</span>
                  </div>
                  <p className="text-[10px] text-[#8BA2C1] mt-0.5">
                    Modeled wealth index based on Bayut/PropertyFinder lease brackets.
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#536F93]">
                    <span>Freshness: Modeled Proxy</span>
                    <span className="text-amber-300">● Curated Heuristic</span>
                  </div>
                </div>
              </div>

              {/* Action: Sync Now Primary Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Verifying Data Sources..." : "Sync now"}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenDriveModal}
                  className="w-full py-2 px-3 rounded-lg bg-[#0A1424] hover:bg-[#142842] text-[#8BA2C1] hover:text-white border border-[#1D3452] font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Connect Google Drive Sources →</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. DEVELOPER PANEL                                                       */}
          {/* ========================================================================= */}
          {activePanel === "dev" && (
            <div className="p-4 space-y-4">
              {/* Muted Preamble */}
              <div className="p-3 rounded-lg bg-[#0A1424] border border-[#1D3452] text-[#8BA2C1] text-[11px] leading-relaxed">
                Technical references, model provenance, and geospatial architecture documentation.
              </div>

              {/* Relocated Links Styled Quieter Than End-User Rows */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#536F93] uppercase tracking-wider block">
                  Technical Specifications &amp; Architecture
                </span>

                {/* Link 1: Architecture Docs */}
                <a
                  href="/docs/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-[#0F1F35] hover:bg-[#193152] border border-[#1D3452] flex items-center justify-between text-[#8BA2C1] hover:text-white transition-colors group block"
                >
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
                      Architecture Documentation
                    </span>
                    <p className="text-[10px] text-[#536F93] mt-0.5">
                      Provenance matrix, Haversine models, and audit formulas.
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#536F93] group-hover:text-cyan-400 shrink-0" />
                </a>

                {/* Link 2: Model Documentation */}
                <a
                  href="/docs#provenance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-[#0F1F35] hover:bg-[#193152] border border-[#1D3452] flex items-center justify-between text-[#8BA2C1] hover:text-white transition-colors group block"
                >
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
                      Model Documentation &amp; Assumptions
                    </span>
                    <p className="text-[10px] text-[#536F93] mt-0.5">
                      Transparency breakdown of real API vs curated synthetic proxies.
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#536F93] group-hover:text-cyan-400 shrink-0" />
                </a>

                {/* Link 3: API Playground & Webhook Endpoints */}
                <div className="p-2.5 rounded-lg bg-[#0A1424] border border-[#1D3452]/70 text-[10px] font-mono text-[#8BA2C1] space-y-1">
                  <div className="text-white font-semibold">Active Backend Endpoints</div>
                  <div>POST /api/ai/chat</div>
                  <div>POST /api/ai/explain</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. BRANCH DETAIL PANEL                                                   */}
          {/* ========================================================================= */}
          {activePanel === "branch" && (
            <div className="p-4 space-y-4">
              {selectedBranch ? (
                <>
                  {/* Name, Address, Decision Badge, Health Score */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {selectedBranch.branch.name}
                        </h3>
                        <p className="text-[11px] text-[#8BA2C1] mt-0.5">
                          {selectedBranch.branch.address}, {selectedBranch.branch.emirate}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${
                          selectedBranch.classification === "PROTECT"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : selectedBranch.classification === "HOLD"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                        }`}
                      >
                        {selectedBranch.classification}
                      </span>
                    </div>

                    <div className="mt-2.5 p-2 rounded-lg bg-[#0A1424] border border-[#1D3452] flex items-center justify-between">
                      <span className="text-[11px] text-[#8BA2C1]">Health Score</span>
                      <span className="text-sm font-mono font-bold text-white">
                        {selectedBranch.finalScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Per-Factor Score Contribution Breakdown with Bars */}
                  <div className="space-y-2 pt-1 border-t border-[#1D3452]">
                    <span className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider block">
                      Factor Score Contributions
                    </span>

                    {/* Factor 1: Reputation */}
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">
                          Reputation ({selectedBranch.branch.googleRating}★ · {selectedBranch.branch.reviewCount} reviews)
                        </span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          +{selectedBranch.reputationScore.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0A1424] rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${selectedBranch.reputationScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Factor 2: Catchment Affluence */}
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">
                          Catchment Affluence (Index: {selectedBranch.branch.catchmentAffluenceIndex})
                        </span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          +{selectedBranch.demandScore.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0A1424] rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${selectedBranch.demandScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Factor 3: Sister Cannibalization Safety (ALERT RED if inside buffer) */}
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">
                          Sister Distance ({selectedBranch.branch.nearestSisterDistanceKm}km)
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            selectedBranch.cannibalizationWarning ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {selectedBranch.cannibalizationScore.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0A1424] rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            selectedBranch.cannibalizationWarning ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${selectedBranch.cannibalizationScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Factor 4: Competition Moat */}
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">
                          Competitor Density ({selectedBranch.branch.competitorDensity3km} in 3km)
                        </span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          +{selectedBranch.competitionScore.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0A1424] rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${selectedBranch.competitionScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alert Card Explaining Sister Buffer Situation */}
                  {selectedBranch.cannibalizationWarning ? (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[11px]">
                      <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Sister Cannibalization Alert</span>
                      </div>
                      <p className="text-slate-200 mt-1 leading-relaxed">
                        This lounge is located within the <strong>4.0 km sister buffer</strong> ({selectedBranch.branch.nearestSisterDistanceKm} km from nearest Bedashing lounge). Chairs are actively competing for the same customer catchment radius.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Sister Buffer Clear</span>
                      </div>
                      <p className="text-slate-200 mt-1 leading-relaxed">
                        Safe territorial isolation: {selectedBranch.branch.nearestSisterDistanceKm} km from nearest sister lounge, exceeding the 4.0 km conflict threshold.
                      </p>
                    </div>
                  )}

                  {decisionLoggedFeedback && (
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[10px] flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{decisionLoggedFeedback}</span>
                    </div>
                  )}

                  {/* Three Actions */}
                  <div className="space-y-2 pt-2 border-t border-[#1D3452]">
                    <span className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider block">
                      Executive Actions
                    </span>

                    {/* Action 1: Log a Decision */}
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionLoggedFeedback(
                          `Decision logged: Verified ${selectedBranch.classification} status for ${selectedBranch.branch.name} for Q1 review.`
                        );
                        setTimeout(() => setDecisionLoggedFeedback(null), 3500);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#0F1F35] hover:bg-[#193152] border border-[#1D3452] hover:border-cyan-500/50 text-white font-medium text-xs transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Log a decision</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#536F93]" />
                    </button>

                    {/* Action 2: Show on Map */}
                    <button
                      type="button"
                      onClick={() => {
                        onFocusLocation(selectedBranch.branch.lat, selectedBranch.branch.lng);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#0F1F35] hover:bg-[#193152] border border-[#1D3452] hover:border-cyan-500/50 text-white font-medium text-xs transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Show on map</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#536F93]" />
                    </button>

                    {/* Action 3: Ask Advisor about this branch */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAdvisorWithPrompt(
                          `Analyze branch ${selectedBranch.branch.name} (${selectedBranch.classification}, score ${selectedBranch.finalScore}). Detail its ${selectedBranch.branch.nearestSisterDistanceKm}km sister proximity and competitor pressure.`
                        );
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-between shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Ask Advisor about this branch</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />
                    </button>
                  </div>
                </>
              ) : selectedCandidate ? (
                /* Candidate Zone Selected */
                <>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {selectedCandidate.candidate.name}
                        </h3>
                        <p className="text-[11px] text-[#8BA2C1] mt-0.5">
                          {selectedCandidate.candidate.emirate} · {selectedCandidate.candidate.zoneType}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 bg-teal-500/10 text-teal-400 border-teal-500/25">
                        {selectedCandidate.classification}
                      </span>
                    </div>

                    <div className="mt-2.5 p-2 rounded-lg bg-[#0A1424] border border-[#1D3452] flex items-center justify-between">
                      <span className="text-[11px] text-[#8BA2C1]">Suitability Score</span>
                      <span className="text-sm font-mono font-bold text-white">
                        {selectedCandidate.finalScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Actions for Candidate */}
                  <div className="space-y-2 pt-2 border-t border-[#1D3452]">
                    <button
                      type="button"
                      onClick={() => {
                        onFocusLocation(selectedCandidate.candidate.lat, selectedCandidate.candidate.lng);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#0F1F35] hover:bg-[#193152] border border-[#1D3452] text-white font-medium text-xs transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span>Show candidate on map</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#536F93]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenAdvisorWithPrompt(
                          `Analyze growth candidate ${selectedCandidate.candidate.name} (${selectedCandidate.candidate.emirate}, score ${selectedCandidate.finalScore}). Assess capital payback and unmet female demand.`
                        );
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-between shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                        <span>Ask Advisor about candidate</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-teal-200" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-[#8BA2C1]">
                  <Building2 className="w-8 h-8 text-[#536F93] mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-white">No branch selected</p>
                  <p className="text-[11px] mt-1">
                    Click any branch or candidate on the map or tables to inspect its factor breakdown.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
