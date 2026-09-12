import React from "react";
import { NetworkSummary } from "../types";
import {
  Sliders,
  FileText,
  Bot,
  FolderSync,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface HeaderProps {
  summary: NetworkSummary;
  activeTab: "overview" | "map" | "candidates" | "resources" | "docs";
  setActiveTab: (tab: "overview" | "map" | "candidates" | "resources" | "docs") => void;
  onOpenControls: () => void;
  onOpenAi: () => void;
  onOpenDrive: () => void;
  onOpenMemo: () => void;
  isAiLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  activeTab,
  setActiveTab,
  onOpenControls,
  onOpenAi,
  onOpenDrive,
  onOpenMemo,
  isAiLoading,
}) => {

  return (
    <header className="ds-header border-b sticky top-0 z-30 ds-text-primary shadow-md transition-colors">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand & Reference Info */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-white border border-[#1D3452] rounded-lg flex items-center justify-center p-0.5 shadow-xs shrink-0 overflow-hidden">
              <picture className="w-full h-full flex items-center justify-center">
                <source type="image/svg+xml" srcSet="/bedashing-logo.svg?v=20260912" />
                <img
                  src="/bedashing-logo.png?v=20260912"
                  alt="Bedashing Icon"
                  className="w-full h-full object-contain"
                />
              </picture>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold tracking-tight ds-text-primary uppercase">
                  DECISION SPACE
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  UAE Network
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-slate-200 tracking-wide">Bedashing Beauty Lounge</span>
                <span className="text-[#536F93] text-[10px]">•</span>
                <p className="text-[11px] ds-text-secondary">
                  <span className="font-semibold ds-text-primary">23 Branches</span> (14 AD, 5 DXB, 2 SHJ, 1 FUJ, 1 RAK)
                </p>
              </div>
            </div>
          </div>

          {/* High Density Metric Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="px-2.5 py-1 rounded border ds-card-subtle flex flex-col">
              <span className="text-[9px] text-[#8BA2C1] uppercase font-bold tracking-wider">Avg Health</span>
              <span className="text-xs font-mono font-bold ds-text-primary">{summary.averageHealthScore}/100</span>
            </div>

            <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PROTECT: {summary.protectCount}</span>
            </div>

            <div className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>HOLD: {summary.holdCount}</span>
            </div>

            <div className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>SHRINK: {summary.shrinkCount}</span>
            </div>

            <div className="px-2 py-1 rounded bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/20 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>GROW: {summary.growCount}</span>
            </div>
          </div>

          {/* Action Tools & Theme/Mode Switcher */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenControls}
              className="inline-flex items-center space-x-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded ds-card-subtle hover:opacity-85 ds-text-secondary border transition-colors cursor-pointer"
              title="Adjust scoring weights and thresholds"
            >
              <Sliders className="w-3.5 h-3.5 text-[#8BA2C1]" />
              <span>Weights</span>
            </button>

            <button
              onClick={onOpenAi}
              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 transition-colors shadow-xs cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </button>

            <button
              onClick={onOpenMemo}
              disabled={isAiLoading}
              className="inline-flex items-center space-x-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded ds-card-subtle hover:opacity-85 ds-text-primary border transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Board Memo</span>
            </button>

            <button
              onClick={onOpenDrive}
              className="inline-flex items-center space-x-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded ds-card-subtle hover:opacity-85 ds-text-secondary border transition-colors cursor-pointer"
              title="Google Drive Resource Sync"
            >
              <FolderSync className="w-3.5 h-3.5 text-[#8BA2C1]" />
              <span>Drive Sync</span>
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded bg-[#142842] hover:bg-[#193152] text-cyan-300 border border-[#1D3452] hover:border-cyan-500/50 transition-colors shadow-xs"
              title="Open Technical & Strategic Architecture Documentation in new tab"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Docs ↗</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs - High Density Bar */}
        <div className="flex items-center space-x-1.5 mt-2.5 pt-2 border-t border-[#1D3452] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("map")}
            className={`inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
              activeTab === "map"
                ? "bg-[#142842] text-white border-cyan-500/40 shadow-xs"
                : "ds-text-secondary hover:ds-text-primary hover:bg-[#142842]/60 border-transparent"
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Map</span>
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#142842] text-white border-cyan-500/40 shadow-xs"
                : "ds-text-secondary hover:ds-text-primary hover:bg-[#142842]/60 border-transparent"
            }`}
          >
            Branches ({summary.totalBranches})
          </button>

          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-3 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
              activeTab === "candidates"
                ? "bg-[#142842] text-white border-cyan-500/40 shadow-xs"
                : "ds-text-secondary hover:ds-text-primary hover:bg-[#142842]/60 border-transparent"
            }`}
          >
            Candidates ({summary.totalCandidates})
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
              activeTab === "resources"
                ? "bg-[#142842] text-white border-cyan-500/40 shadow-xs"
                : "ds-text-secondary hover:ds-text-primary hover:bg-[#142842]/60 border-transparent"
            }`}
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>Resources</span>
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
              activeTab === "docs"
                ? "bg-cyan-950/60 text-cyan-200 border-cyan-500/60 shadow-xs"
                : "text-cyan-400/90 hover:text-cyan-200 hover:bg-cyan-950/40 border-cyan-500/20"
            }`}
          >
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span>Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
