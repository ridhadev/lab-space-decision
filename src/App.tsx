import React, { useState, useMemo } from "react";
import { BEDASHING_BRANCHES } from "./data/branches";
import { CANDIDATE_AREAS } from "./data/candidates";
import {
  evaluateBranch,
  evaluateCandidate,
  calculateNetworkSummary,
  DEFAULT_BRANCH_WEIGHTS,
  DEFAULT_CANDIDATE_WEIGHTS,
  DEFAULT_THRESHOLDS,
} from "./services/scoringEngine";
import {
  BranchEvaluation,
  CandidateEvaluation,
  BranchScoringWeights,
  CandidateScoringWeights,
  ThresholdConfig,
} from "./types";
import { Header } from "./components/Header";
import { ExecutiveSummaryCards } from "./components/ExecutiveSummaryCards";
import { BranchTable } from "./components/BranchTable";
import { CandidateTable } from "./components/CandidateTable";
import { GeospatialMap } from "./components/GeospatialMap";
import { ModelControlsModal } from "./components/ModelControlsModal";
import { BranchDetailModal } from "./components/BranchDetailModal";
import { AiAdvisor } from "./components/AiAdvisor";
import { BoardMemoModal } from "./components/BoardMemoModal";
import { DriveSyncModal } from "./components/DriveSyncModal";
import { ResourcesView } from "./components/ResourcesView";

export default function App() {
  // Navigation & Tab State: Map is first and default
  const [activeTab, setActiveTab] = useState<"map" | "overview" | "candidates" | "resources" | "docs">("map");

  // Scoring Weights & Thresholds
  const [branchWeights, setBranchWeights] = useState<BranchScoringWeights>(DEFAULT_BRANCH_WEIGHTS);
  const [candidateWeights, setCandidateWeights] = useState<CandidateScoringWeights>(DEFAULT_CANDIDATE_WEIGHTS);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);

  // Selected Entities for Audit
  const [selectedBranchEval, setSelectedBranchEval] = useState<BranchEvaluation | null>(null);
  const [selectedCandidateEval, setSelectedCandidateEval] = useState<CandidateEvaluation | null>(null);

  // Map Focus Coordinate
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Modals Visibility
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  // Deterministic Recalculation Engine
  const branchEvals = useMemo(() => {
    return BEDASHING_BRANCHES.map((b) => evaluateBranch(b, branchWeights, thresholds));
  }, [branchWeights, thresholds]);

  const candidateEvals = useMemo(() => {
    return CANDIDATE_AREAS.map((c) => evaluateCandidate(c, candidateWeights, thresholds));
  }, [candidateWeights, thresholds]);

  const summary = useMemo(() => {
    return calculateNetworkSummary(branchEvals, candidateEvals);
  }, [branchEvals, candidateEvals]);

  // Handler to locate on map and switch tab
  const handleMapFocus = (lat: number, lng: number) => {
    setFocusedLocation({ lat, lng });
    setActiveTab("map");
  };

  return (
    <div className="min-h-screen ds-app flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <Header
        summary={summary}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenControls={() => setIsControlsOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenDrive={() => setIsDriveOpen(true)}
        onOpenMemo={() => setIsMemoOpen(true)}
        isAiLoading={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4">
        {/* Executive Summary Metric Cards (Visible on Overview & Candidates) */}
        {activeTab !== "resources" && activeTab !== "docs" && (
          <ExecutiveSummaryCards
            summary={summary}
            branchEvals={branchEvals}
            candidateEvals={candidateEvals}
            onSelectBranch={(b) => setSelectedBranchEval(b)}
            onSelectCandidate={(c) => setSelectedCandidateEval(c)}
          />
        )}

        {/* Tab 1: UAE Map */}
        {activeTab === "map" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight ds-text-primary uppercase">
                  UAE Map
                </h2>
                <p className="text-[11px] ds-text-secondary">
                  Interactive map of all 23 Bedashing lounges, 3km catchment buffers, sister cannibalization lines, and expansion target zones.
                </p>
              </div>
            </div>

            <GeospatialMap
              branchEvals={branchEvals}
              candidateEvals={candidateEvals}
              onSelectBranch={(b) => setSelectedBranchEval(b)}
              onSelectCandidate={(c) => setSelectedCandidateEval(c)}
              focusedLocation={focusedLocation}
            />
          </div>
        )}

        {/* Tab 2: Existing Branches */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight ds-text-primary uppercase">
                  Branches (23)
                </h2>
                <p className="text-[11px] ds-text-secondary">
                  Deterministic classification into PROTECT, HOLD, or SHRINK based on reputation, catchment demand, sister proximity, and competition.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("map")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                View on Map →
              </button>
            </div>

            <BranchTable
              evaluations={branchEvals}
              onSelectBranch={(b) => setSelectedBranchEval(b)}
              onOpenMapFocus={handleMapFocus}
            />
          </div>
        )}

        {/* Tab 3: Expansion Candidates */}
        {activeTab === "candidates" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight ds-text-primary uppercase">
                  Candidates (10)
                </h2>
                <p className="text-[11px] ds-text-secondary">
                  Evaluating new territory growth into GROW, WATCH, or SKIP based on unmet demand, target female affluence, retail gravity, and sister cannibalization safety.
                </p>
              </div>
            </div>

            <CandidateTable
              evaluations={candidateEvals}
              onSelectCandidate={(c) => setSelectedCandidateEval(c)}
              onOpenMapFocus={handleMapFocus}
            />
          </div>
        )}

        {/* Tab 4: Specifications & Drive Resources */}
        {activeTab === "resources" && <ResourcesView />}

        {/* Tab 5: Technical & Strategic Architecture Documentation */}
        {activeTab === "docs" && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 ds-card border shadow-sm">
              <div>
                <h2 className="text-sm font-semibold tracking-tight ds-text-primary uppercase flex items-center gap-2">
                  <span>Technical & Strategic Architecture Documentation</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">/docs/index.html</span>
                </h2>
                <p className="text-[11px] ds-text-secondary mt-0.5">
                  Complete technical specification: Data provenance table, mathematical models (Haversine & cannibalization curves), hypotheses, and developer reference.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/docs/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>Open in Full Tab ↗</span>
                </a>
              </div>
            </div>

            <div className="w-full h-[76vh] ds-card overflow-hidden border shadow-2xl">
              <iframe
                src="/docs/index.html"
                title="Decision Space Technical Documentation"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="ds-header border-t py-2.5 text-xs ds-text-secondary transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px]">
            <strong className="ds-text-primary">Decision Space</strong> • UAE Retail Network Decision-Support
          </div>
          <div className="text-slate-500 text-[10px] font-mono">
            Grounding Mandate: Models explain computed metrics; deterministic models govern all scoring.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ModelControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
        branchWeights={branchWeights}
        setBranchWeights={setBranchWeights}
        candidateWeights={candidateWeights}
        setCandidateWeights={setCandidateWeights}
        thresholds={thresholds}
        setThresholds={setThresholds}
        summary={summary}
      />

      <BranchDetailModal
        key={selectedBranchEval?.branch.id || selectedCandidateEval?.candidate.id || "none"}
        branchEval={selectedBranchEval}
        candidateEval={selectedCandidateEval}
        branchWeights={branchWeights}
        onClose={() => {
          setSelectedBranchEval(null);
          setSelectedCandidateEval(null);
        }}
      />

      <AiAdvisor
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        branchEvals={branchEvals}
        candidateEvals={candidateEvals}
        summary={summary}
        branchWeights={branchWeights}
      />

      <BoardMemoModal
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
        branchEvals={branchEvals}
        candidateEvals={candidateEvals}
        summary={summary}
        branchWeights={branchWeights}
      />

      <DriveSyncModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
      />
    </div>
  );
}
