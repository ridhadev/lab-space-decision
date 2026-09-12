import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sliders,
  Sparkles,
  ChevronDown,
  User,
  Palette,
  Users,
  LogOut,
  MapPin,
  Building2,
  Check,
  BookOpen,
  ExternalLink,
  Compass,
} from "lucide-react";
import { BranchEvaluation, CandidateEvaluation, ThresholdConfig } from "../types";
import { SIMULATION_SCENARIOS } from "../services/scoringEngine";

export type RightPanelType = "config" | "advisor" | "data" | "dev" | "branch" | null;

interface AppHeaderProps {
  totalBranches: number;
  totalCandidates: number;
  activePanel: RightPanelType;
  onTogglePanel: (panel: RightPanelType) => void;
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  onSelectBranch: (b: BranchEvaluation) => void;
  onSelectCandidate: (c: CandidateEvaluation) => void;
  onFocusMapLocation?: (lat: number, lng: number) => void;
  onStartTour?: () => void;
  isTourOpen?: boolean;
  currentThresholds?: ThresholdConfig;
  onApplyScenario?: (scenarioId: string) => void;
  shrinkCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  totalBranches,
  activePanel,
  onTogglePanel,
  branchEvals,
  candidateEvals,
  onSelectBranch,
  onSelectCandidate,
  onFocusMapLocation,
  onStartTour,
  isTourOpen,
  currentThresholds,
  onApplyScenario,
  shrinkCount,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const scenarioMenuRef = useRef<HTMLDivElement | null>(null);

  // Determine active scenario name
  const currentScenario = Object.values(SIMULATION_SCENARIOS).find(
    (sc) =>
      currentThresholds?.holdCutoff === sc.thresholds.holdCutoff &&
      currentThresholds?.protectCutoff === sc.thresholds.protectCutoff
  );
  const activeScenarioLabel = currentScenario ? currentScenario.shortLabel : "Custom Mode";

  // Global ⌘K shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsAvatarMenuOpen(false);
        setIsScenarioMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
      if (
        scenarioMenuRef.current &&
        !scenarioMenuRef.current.contains(e.target as Node)
      ) {
        setIsScenarioMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Results filtering
  const filteredBranches = searchQuery.trim()
    ? branchEvals
        .filter(
          (b) =>
            b.branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.branch.emirate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.branch.address.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredCandidates = searchQuery.trim()
    ? candidateEvals
        .filter(
          (c) =>
            c.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.candidate.emirate.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
    : [];

  return (
    <header
      id="app-header"
      className="h-[60px] w-full bg-[#0C182A] border-b border-[#1D3452] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30 select-none relative"
    >
      {/* 1. Left Zone: Identity with Single Bedashing Brand Icon */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div className="w-[36px] h-[36px] rounded-lg bg-white border border-[#1D3452] p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
          <picture className="w-full h-full flex items-center justify-center">
            <source type="image/svg+xml" srcSet="/bedashing-logo.svg?v=20260912" />
            <img
              src="/bedashing-logo.png?v=20260912"
              alt="Bedashing Logo"
              className="w-full h-full object-contain"
            />
          </picture>
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase whitespace-nowrap">
              Decision Space
            </span>
            <span className="hidden md:inline-flex text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              UAE Retail
            </span>
          </div>
          <p className="text-[11px] text-[#8BA2C1] truncate">
            {totalBranches} Bedashing Lounges · 2026 Q1 Cycle
          </p>
        </div>
      </div>

      {/* 2. Center Zone: Inset Search with ⌘K Hint */}
      <div
        ref={searchContainerRef}
        className="flex-1 max-w-[380px] min-w-[150px] relative"
      >
        <div className="h-[34px] w-full rounded-lg bg-[#0A1424] border border-[#1D3452] focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/40 flex items-center px-2.5 transition-all shadow-inner">
          <Search className="w-3.5 h-3.5 text-[#536F93] shrink-0 mr-2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search branches, areas, codes..."
            className="w-full bg-transparent text-xs text-white placeholder-[#536F93] outline-none truncate pr-8"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#142842] border border-[#1D3452] text-[9px] font-mono text-[#8BA2C1] pointer-events-none shrink-0 shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Live Search Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-[38px] left-0 right-0 bg-[#0F1F35] border border-[#1D3452] rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-100 max-h-[360px] overflow-y-auto">
            {filteredBranches.length === 0 && filteredCandidates.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#8BA2C1]">
                No matching locations or zones found
              </div>
            ) : (
              <div className="py-1">
                {filteredBranches.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-[#536F93] uppercase tracking-wider bg-[#0C182A]">
                      Bedashing Lounges ({filteredBranches.length})
                    </div>
                    {filteredBranches.map((b) => (
                      <button
                        key={b.branch.id}
                        type="button"
                        onClick={() => {
                          onSelectBranch(b);
                          onTogglePanel("branch");
                          if (onFocusMapLocation) {
                            onFocusMapLocation(b.branch.lat, b.branch.lng);
                          }
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#193152] transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#8BA2C1]" />
                            <span>{b.branch.name}</span>
                          </div>
                          <p className="text-[10px] text-[#8BA2C1] truncate">
                            {b.branch.emirate} · {b.branch.address}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                            b.classification === "PROTECT"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : b.classification === "HOLD"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {b.classification} {b.finalScore}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredCandidates.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-[#536F93] uppercase tracking-wider bg-[#0C182A] border-t border-[#1D3452]">
                      Expansion Candidates ({filteredCandidates.length})
                    </div>
                    {filteredCandidates.map((c) => (
                      <button
                        key={c.candidate.id}
                        type="button"
                        onClick={() => {
                          onSelectCandidate(c);
                          if (onFocusMapLocation) {
                            onFocusMapLocation(c.candidate.lat, c.candidate.lng);
                          }
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#193152] transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold text-white group-hover:text-teal-300 truncate flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#8BA2C1]" />
                            <span>{c.candidate.name}</span>
                          </div>
                          <p className="text-[10px] text-[#8BA2C1] truncate">
                            {c.candidate.emirate} · {c.candidate.zoneType}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 bg-teal-500/10 text-teal-400 border-teal-500/20">
                          {c.classification} {c.finalScore}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Right Zone: Grouped Switcher & Avatar Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Simulation Scenario Switcher Button */}
        {onApplyScenario && (
          <div ref={scenarioMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsScenarioMenuOpen((prev) => !prev)}
              aria-expanded={isScenarioMenuOpen}
              className={`h-[34px] px-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                isScenarioMenuOpen
                  ? "border-cyan-400 bg-[#142842] text-white"
                  : "border-[#1D3452] bg-[#0A1424] text-slate-200 hover:bg-[#102036] hover:border-slate-500"
              }`}
              title="Switch Portfolio Simulation Scenario"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-semibold text-white hidden xl:inline">
                Simulation:
              </span>
              <span className="text-xs font-medium text-cyan-300">
                {activeScenarioLabel}
              </span>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {shrinkCount ?? 3} SHRINK
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8BA2C1]" />
            </button>

            {isScenarioMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-80 bg-[#0C182A] border border-[#1D3452] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 border-b border-[#1D3452] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#8BA2C1] tracking-wider">
                    Simulation Scenarios
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Live Reactive
                  </span>
                </div>
                <div className="py-1 space-y-1">
                  {Object.values(SIMULATION_SCENARIOS).map((sc) => {
                    const isCurrent =
                      currentThresholds?.holdCutoff === sc.thresholds.holdCutoff &&
                      currentThresholds?.protectCutoff === sc.thresholds.protectCutoff;
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => {
                          onApplyScenario(sc.id);
                          setIsScenarioMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer border ${
                          isCurrent
                            ? "bg-cyan-950/60 border-cyan-400 text-white"
                            : "bg-[#0A1424] border-transparent hover:bg-[#142842] text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className={isCurrent ? "text-cyan-300" : "text-white"}>
                            {sc.name}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[10.5px] text-[#8BA2C1] mt-0.5 leading-snug">
                          {sc.description}
                        </p>
                        <div className="text-[9.5px] font-mono mt-1 text-rose-300/90">
                          {sc.shrinkTarget === "None" ? "0 Shrink / 4 Hold" : `Target Shrink: ${sc.shrinkTarget}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1.5 mt-1 border-t border-[#1D3452] flex justify-between items-center px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsScenarioMenuOpen(false);
                      onTogglePanel("config");
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Customize Sliders in Config...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* a. Grouped Config / Advisor Switcher Container */}
        <div
          id="config-advisor-switcher"
          className="border border-[#1D3452] rounded-[10px] p-[3px] bg-[#0A1424] flex items-center gap-1 shadow-xs"
        >
          {/* Config Button (Secondary / Ghost) */}
          <button
            type="button"
            onClick={() => onTogglePanel(activePanel === "config" ? null : "config")}
            aria-pressed={activePanel === "config"}
            className={`h-[28px] px-2.5 rounded-[7px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none ${
              activePanel === "config"
                ? "bg-[#0F1F35] text-white shadow-xs border border-[#1D3452]"
                : "text-[#8BA2C1] hover:text-white hover:bg-[#142842]/80 border border-transparent"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 stroke-[1.8]" />
            <span className="hidden sm:inline">Config</span>
          </button>

          {/* Ask the Advisor Button (Primary / Filled with accent) */}
          <button
            type="button"
            onClick={() => onTogglePanel(activePanel === "advisor" ? null : "advisor")}
            aria-pressed={activePanel === "advisor"}
            className={`h-[28px] px-2.5 rounded-[7px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none text-white ${
              activePanel === "advisor"
                ? "bg-cyan-700 ring-1 ring-cyan-300/70 ring-inset shadow-xs"
                : "bg-cyan-600 hover:bg-cyan-500 shadow-xs"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Ask Advisor</span>
          </button>
        </div>

        {/* b. Avatar Button & Dropdown Menu */}
        <div ref={avatarMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsAvatarMenuOpen((prev) => !prev)}
            aria-expanded={isAvatarMenuOpen}
            className={`h-[34px] px-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
              isAvatarMenuOpen
                ? "border-cyan-500/70 bg-[#193152] text-white"
                : "border-[#1D3452] bg-[#0C182A] text-slate-200 hover:bg-[#142842] hover:border-slate-500"
            }`}
          >
            {/* 24px monogram tile */}
            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center border border-cyan-500/30">
              RZ
            </div>
            <span className="text-xs font-medium text-white hidden md:inline">
              Ridha
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8BA2C1] transition-transform ${
                isAvatarMenuOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* Avatar Dropdown (Section 6 Requirements) */}
          {isAvatarMenuOpen && (
            <div
              id="avatar-dropdown-menu"
              className="absolute right-0 top-[40px] w-64 rounded-lg bg-[#0F1F35] border border-[#1D3452] shadow-2xl z-50 text-xs text-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
            >
              {/* GROUP 1: ACCOUNT */}
              <div className="p-2.5 pb-2 border-b border-[#1D3452]">
                <span className="text-[9px] font-mono font-bold text-[#536F93] uppercase tracking-wider block mb-1 px-1.5">
                  Account
                </span>
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#193152] transition-colors cursor-pointer">
                  <User className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">Ridha Zegdane</p>
                    <p className="text-[10px] text-[#8BA2C1] truncate">
                      ridha.zegdane@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              {/* GROUP 2: WORKSPACE */}
              <div className="p-2.5 pb-2 border-b border-[#1D3452]">
                <span className="text-[9px] font-mono font-bold text-[#536F93] uppercase tracking-wider block mb-1 px-1.5">
                  Workspace
                </span>
                {/* Appearance / Theme */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#193152] transition-colors cursor-pointer text-[#8BA2C1] hover:text-white">
                  <span className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-[#8BA2C1]" />
                    <span>Appearance</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span>Dark Navy</span>
                  </span>
                </div>
                {/* Members & Access */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#193152] transition-colors cursor-pointer text-[#8BA2C1] hover:text-white">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#8BA2C1]" />
                    <span>Members &amp; Access</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#536F93]">5 Active</span>
                </div>
              </div>

              {/* GROUP 3: DOCUMENTATION & SESSION */}
              <div className="p-2.5 pt-1.5">
                {/* Guided Tour Trigger */}
                {onStartTour && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      onStartTour();
                    }}
                    className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#193152] transition-colors text-[#8BA2C1] hover:text-white cursor-pointer mb-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Guided Tour</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/15 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      6 Steps
                    </span>
                  </button>
                )}

                {/* Documentation */}
                <a
                  href="/docs/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsAvatarMenuOpen(false)}
                  className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#193152] transition-colors text-[#8BA2C1] hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Documentation</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#536F93]" />
                </a>
                {/* Sign out */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#193152] transition-colors text-[#536F93] hover:text-rose-400 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#536F93]" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
