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
  ExternalLink
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
    <header className="bg-[#161B22] border-b border-slate-700 sticky top-0 z-30 text-slate-200 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand & Reference Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-xs">
              D
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold tracking-tight text-white uppercase">
                  DECISION SPACE
                </h1>
                <span className="text-xs font-normal text-slate-400 italic">
                  v1.1
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  UAE Network
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Reference: <span className="text-slate-200 font-medium">Bedashing Beauty Lounges</span> (23 Branches: 14 AD, 5 DXB, 2 SHJ, 1 FUJ, 1 RAK)
              </p>
            </div>
          </div>

          {/* High Density Metric Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Avg Health</span>
              <span className="text-xs font-mono font-bold text-slate-200">{summary.averageHealthScore}/100</span>
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

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenControls}
              className="inline-flex items-center space-x-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Adjust scoring weights and thresholds"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Weights</span>
            </button>

            <button
              onClick={onOpenAi}
              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition-colors shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </button>

            <button
              onClick={onOpenMemo}
              disabled={isAiLoading}
              className="inline-flex items-center space-x-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Board Memo</span>
            </button>

            <button
              onClick={onOpenDrive}
              className="inline-flex items-center space-x-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Google Drive Resource Sync"
            >
              <FolderSync className="w-3.5 h-3.5 text-slate-400" />
              <span>Drive Sync</span>
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 transition-colors shadow-xs"
              title="Open Technical & Strategic Architecture Documentation in new tab"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Docs ↗</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs - High Density Bar */}
        <div className="flex items-center space-x-1.5 mt-2.5 pt-2 border-t border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 text-[11px] font-medium rounded border transition-colors ${
              activeTab === "overview"
                ? "bg-slate-800 text-white border-slate-600 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
            }`}
          >
            Network Branches ({summary.totalBranches})
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-medium rounded border transition-colors ${
              activeTab === "map"
                ? "bg-slate-800 text-white border-slate-600 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
            }`}
          >
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>UAE Geospatial Map</span>
          </button>

          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-3 py-1 text-[11px] font-medium rounded border transition-colors ${
              activeTab === "candidates"
                ? "bg-slate-800 text-white border-slate-600 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
            }`}
          >
            Expansion Candidates ({summary.totalCandidates})
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-medium rounded border transition-colors ${
              activeTab === "resources"
                ? "bg-slate-800 text-white border-slate-600 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
            }`}
          >
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>Specs & Drive Sources (6 Docs)</span>
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-semibold rounded border transition-colors ${
              activeTab === "docs"
                ? "bg-indigo-900/50 text-indigo-200 border-indigo-500/60 shadow-xs"
                : "text-indigo-400/90 hover:text-indigo-200 hover:bg-indigo-950/40 border-indigo-500/20"
            }`}
          >
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>Architecture Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
