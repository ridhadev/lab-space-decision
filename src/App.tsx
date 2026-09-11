import React, { useState, useMemo, useCallback } from "react";
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
import { LeftNavRail, NavView } from "./components/LeftNavRail";
import { AppHeader, RightPanelType } from "./components/AppHeader";
import { KpiBand } from "./components/KpiBand";
import { RightDrawerPanel } from "./components/RightDrawerPanel";
import { OverviewView } from "./components/OverviewView";
import { GrowthView } from "./components/GrowthView";
import { BranchesView } from "./components/BranchesView";
import { GeospatialMap } from "./components/GeospatialMap";
import { BoardMemoModal } from "./components/BoardMemoModal";
import { DriveSyncModal } from "./components/DriveSyncModal";
import { GuidedTour } from "./components/GuidedTour";

export default function App() {
  // Navigation State: Map, Branches, Growth, Summary
  const [activeView, setActiveView] = useState<NavView>("map");

  // KPI Band expanded state: collapsed on Map by default, expanded on the other three views
  const [isKpiOpen, setIsKpiOpen] = useState<boolean>(false);

  // Right Drawer Panel State: 'config' | 'advisor' | 'data' | 'dev' | 'branch' | null
  const [activePanel, setActivePanel] = useState<RightPanelType>(null);

  // Scoring Weights & Thresholds
  const [branchWeights, setBranchWeights] = useState<BranchScoringWeights>(DEFAULT_BRANCH_WEIGHTS);
  const [candidateWeights, setCandidateWeights] = useState<CandidateScoringWeights>(DEFAULT_CANDIDATE_WEIGHTS);
  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);

  // Selected Entities for Audit & Detail Panel
  const [selectedBranchEval, setSelectedBranchEval] = useState<BranchEvaluation | null>(null);
  const [selectedCandidateEval, setSelectedCandidateEval] = useState<CandidateEvaluation | null>(null);

  // Map Focus Coordinate
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Secondary Modals (Board Memo & Drive Sync)
  const [isMemoModalOpen, setIsMemoModalOpen] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [initialAdvisorPrompt, setInitialAdvisorPrompt] = useState<string | null>(null);

  // Guided Tour State
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem("decisionspace_tour_dismissed") !== "true";
    } catch {
      return true;
    }
  });
  const [tourStepIndex, setTourStepIndex] = useState<number>(0);

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

  // Handle View Navigation: switches view and sets KPI band open status
  const handleSelectView = useCallback((view: NavView) => {
    setActiveView(view);
    // Section 2 Requirement: KPI band starts collapsed when view is Map, expanded on other three views
    setIsKpiOpen(view !== "map");
  }, []);

  // Handle Location Focus from anywhere (Header search, Table, Growth cards)
  const handleFocusMapLocation = useCallback((lat: number, lng: number) => {
    setFocusedLocation({ lat, lng });
    setActiveView("map");
    setIsKpiOpen(false);
  }, []);

  // Branch Selection Handler
  const handleSelectBranch = useCallback((b: BranchEvaluation) => {
    setSelectedBranchEval(b);
    setSelectedCandidateEval(null);
  }, []);

  // Candidate Selection Handler
  const handleSelectCandidate = useCallback((c: CandidateEvaluation) => {
    setSelectedCandidateEval(c);
    setSelectedBranchEval(null);
  }, []);

  // Guided Tour Step Handler: Automatically switches views, panels, and maps
  const handleTourStepChange = useCallback((stepIdx: number) => {
    setTourStepIndex(stepIdx);
    switch (stepIdx) {
      case 0: // 1. Interactive Geospatial Network Map
        setActiveView("map");
        setActivePanel(null);
        setIsKpiOpen(false);
        break;
      case 1: // 2. Market Saturation & Portfolio Summary
        setActiveView("overview");
        setActivePanel(null);
        setIsKpiOpen(true);
        break;
      case 2: // 3. Deterministic Branch Portfolio Evaluation
        setActiveView("branches");
        setActivePanel(null);
        setIsKpiOpen(true);
        break;
      case 3: // 4. Growth Pipeline & Greenfield Expansion
        setActiveView("growth");
        setActivePanel(null);
        setIsKpiOpen(true);
        break;
      case 4: // 5. Dynamic What-If Sensitivity Modeling
        setActivePanel("config");
        break;
      case 5: // 6. Grounded AI Strategic Advisor & Board Memo
        setActivePanel("advisor");
        break;
      default:
        break;
    }
  }, []);

  const handleCloseTour = useCallback(() => {
    setIsTourOpen(false);
    try {
      localStorage.setItem("decisionspace_tour_dismissed", "true");
    } catch {
      // ignore
    }
  }, []);

  const handleStartTour = useCallback(() => {
    setIsTourOpen(true);
    handleTourStepChange(0);
  }, [handleTourStepChange]);

  return (
    <div
      id="decision-space-root"
      className="h-screen w-screen overflow-hidden flex bg-[#08111E] text-slate-200 antialiased selection:bg-cyan-500 selection:text-white"
    >
      {/* 1. Left Nav Rail (Fixed 74px, full height, 4 nav items) */}
      <LeftNavRail
        currentView={activeView}
        onSelectView={handleSelectView}
      />

      {/* 2. Main Workspace Layout Area (Header + Body) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top App Header (60px, Identity, Search with ⌘K, Grouped Switcher & Avatar) */}
        <AppHeader
          totalBranches={summary.totalBranches}
          totalCandidates={summary.totalCandidates}
          activePanel={activePanel}
          onTogglePanel={(p) => setActivePanel(p)}
          branchEvals={branchEvals}
          candidateEvals={candidateEvals}
          onSelectBranch={(b) => {
            handleSelectBranch(b);
            setActivePanel("branch");
          }}
          onSelectCandidate={(c) => {
            handleSelectCandidate(c);
            setActivePanel("branch");
          }}
          onFocusMapLocation={handleFocusMapLocation}
          onStartTour={handleStartTour}
          isTourOpen={isTourOpen}
        />

        {/* Flex Row starting directly under 60px header containing Content + Sibling Drawer */}
        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          {/* Main Content Column */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* KPI Band (Clickable disclosure, decision pills, auto-fit cards when open) */}
            <KpiBand
              isOpen={isKpiOpen}
              onToggle={() => setIsKpiOpen((prev) => !prev)}
              summary={summary}
              branchEvals={branchEvals}
              candidateEvals={candidateEvals}
              onOpenDataPanel={() => setActivePanel("data")}
              onNavigateToMap={() => {
                setActiveView("map");
                setIsKpiOpen(false);
              }}
              onNavigateToGrowth={() => {
                setActiveView("growth");
                setIsKpiOpen(true);
              }}
              onSelectBranch={(b) => {
                handleSelectBranch(b);
                setActivePanel("branch");
              }}
              onSelectCandidate={(c) => {
                handleSelectCandidate(c);
                setActivePanel("branch");
              }}
            />

            {/* Nav Views */}
            <main className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 overflow-auto">
              {/* VIEW 1: MAP */}
              {activeView === "map" && (
                <div className="flex-1 min-h-[560px] flex flex-col min-w-[400px]">
                  <GeospatialMap
                    branchEvals={branchEvals}
                    candidateEvals={candidateEvals}
                    onSelectBranch={(b) => {
                      handleSelectBranch(b);
                      setActivePanel("branch");
                    }}
                    onSelectCandidate={(c) => {
                      handleSelectCandidate(c);
                      setActivePanel("branch");
                    }}
                    focusedLocation={focusedLocation}
                  />
                </div>
              )}

              {/* VIEW 2: GROWTH */}
              {activeView === "growth" && (
                <GrowthView
                  candidateEvals={candidateEvals}
                  onSelectCandidate={(c) => {
                    handleSelectCandidate(c);
                  }}
                  onFocusMapLocation={handleFocusMapLocation}
                  onOpenCandidatePanel={() => setActivePanel("branch")}
                />
              )}

              {/* VIEW 3: BRANCHES */}
              {activeView === "branches" && (
                <BranchesView
                  branchEvals={branchEvals}
                  onSelectBranch={(b) => {
                    handleSelectBranch(b);
                  }}
                  onOpenBranchPanel={() => setActivePanel("branch")}
                />
              )}

              {/* VIEW 4: OVERVIEW */}
              {activeView === "overview" && (
                <OverviewView
                  branchEvals={branchEvals}
                  summary={summary}
                  branchWeights={branchWeights}
                  onSelectBranch={(b) => {
                    handleSelectBranch(b);
                  }}
                  onOpenConfigPanel={() => setActivePanel("config")}
                  onOpenBranchPanel={() => setActivePanel("branch")}
                />
              )}
            </main>
          </div>

          {/* Right Drawer Panel (Full-height sibling, 368px at >=1200px, overlay below 1200px) */}
          <RightDrawerPanel
            activePanel={activePanel}
            onClose={() => setActivePanel(null)}
            branchWeights={branchWeights}
            setBranchWeights={setBranchWeights}
            candidateWeights={candidateWeights}
            setCandidateWeights={setCandidateWeights}
            thresholds={thresholds}
            setThresholds={setThresholds}
            summary={summary}
            selectedBranch={selectedBranchEval || branchEvals[0] || null}
            selectedCandidate={selectedCandidateEval}
            initialAdvisorPrompt={initialAdvisorPrompt}
            onClearInitialAdvisorPrompt={() => setInitialAdvisorPrompt(null)}
            onFocusLocation={handleFocusMapLocation}
            onOpenAdvisorWithPrompt={(prompt) => {
              setInitialAdvisorPrompt(prompt);
              setActivePanel("advisor");
            }}
            onOpenMemoModal={() => setIsMemoModalOpen(true)}
            onOpenDriveModal={() => setIsDriveModalOpen(true)}
            branchEvals={branchEvals}
            candidateEvals={candidateEvals}
          />
        </div>
      </div>

      {/* Auxiliary Board Memo Modal */}
      <BoardMemoModal
        isOpen={isMemoModalOpen}
        onClose={() => setIsMemoModalOpen(false)}
        branchEvals={branchEvals}
        candidateEvals={candidateEvals}
        summary={summary}
        branchWeights={branchWeights}
      />

      {/* Auxiliary Drive Sync Modal */}
      <DriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />

      {/* Guided Tour Workflow Cards (7 Core Capabilities) */}
      <GuidedTour
        isOpen={isTourOpen}
        currentStepIndex={tourStepIndex}
        onStepChange={handleTourStepChange}
        onClose={handleCloseTour}
        onRestart={() => handleTourStepChange(0)}
      />
    </div>
  );
}
