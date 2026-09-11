import React, { useState } from "react";
import { BranchEvaluation } from "../types";
import {
  Download,
  Building2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

interface BranchesViewProps {
  branchEvals: BranchEvaluation[];
  onSelectBranch: (b: BranchEvaluation) => void;
  onOpenBranchPanel: () => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({
  branchEvals,
  onSelectBranch,
  onOpenBranchPanel,
}) => {
  const [decisionFilter, setDecisionFilter] = useState<string>("ALL");
  const [emirateFilter, setEmirateFilter] = useState<string>("ALL");
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // Counts for segmented filter tabs
  const protectCount = branchEvals.filter((b) => b.classification === "PROTECT").length;
  const holdCount = branchEvals.filter((b) => b.classification === "HOLD").length;
  const shrinkCount = branchEvals.filter((b) => b.classification === "SHRINK").length;

  // Filtered branches
  const filteredBranches = branchEvals.filter((b) => {
    const matchesDecision = decisionFilter === "ALL" || b.classification === decisionFilter;
    const matchesEmirate = emirateFilter === "ALL" || b.branch.emirate === emirateFilter;
    return matchesDecision && matchesEmirate;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "Branch ID",
      "Name",
      "Emirate",
      "Address",
      "Google Star Rating",
      "Review Count",
      "Affluence Index",
      "Competitors (3km)",
      "Nearest Sister (km)",
      "Cannibalization Alert",
      "Decision Band",
      "Score",
    ];

    const rows = filteredBranches.map((b) => [
      `"${b.branch.id}"`,
      `"${b.branch.name.replace(/"/g, '""')}"`,
      `"${b.branch.emirate}"`,
      `"${b.branch.address.replace(/"/g, '""')}"`,
      b.branch.googleRating,
      b.branch.reviewCount,
      b.branch.catchmentAffluenceIndex,
      b.branch.competitorDensity3km,
      b.branch.nearestSisterDistanceKm,
      b.cannibalizationWarning ? "YES" : "NO",
      b.classification,
      b.finalScore,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bedashing_branches_${decisionFilter.toLowerCase()}_q1_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Controls Bar: Segmented Filter, Emirate, Density, Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C182A] p-2.5 rounded-xl border border-[#1D3452]">
        {/* Left: Decision Segmented Filter */}
        <div className="flex items-center bg-[#0A1424] p-1 rounded-lg border border-[#1D3452] text-xs">
          <button
            type="button"
            onClick={() => setDecisionFilter("ALL")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
              decisionFilter === "ALL"
                ? "bg-[#142842] text-white font-bold shadow-xs"
                : "text-[#8BA2C1] hover:text-white"
            }`}
          >
            All ({branchEvals.length})
          </button>
          <button
            type="button"
            onClick={() => setDecisionFilter("PROTECT")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
              decisionFilter === "PROTECT"
                ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                : "text-[#8BA2C1] hover:text-emerald-400"
            }`}
          >
            Protect ({protectCount})
          </button>
          <button
            type="button"
            onClick={() => setDecisionFilter("HOLD")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
              decisionFilter === "HOLD"
                ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                : "text-[#8BA2C1] hover:text-amber-400"
            }`}
          >
            Hold ({holdCount})
          </button>
          <button
            type="button"
            onClick={() => setDecisionFilter("SHRINK")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
              decisionFilter === "SHRINK"
                ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30"
                : "text-[#8BA2C1] hover:text-rose-400"
            }`}
          >
            Shrink ({shrinkCount})
          </button>
        </div>

        {/* Right Controls: Emirate dropdown, Density toggle, Export CSV */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Emirate Dropdown */}
          <select
            value={emirateFilter}
            onChange={(e) => setEmirateFilter(e.target.value)}
            className="bg-[#0A1424] border border-[#1D3452] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-slate-500"
          >
            <option value="ALL">All Emirates</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Dubai">Dubai</option>
            <option value="Sharjah">Sharjah</option>
            <option value="Fujairah">Fujairah</option>
            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
          </select>

          {/* Density Toggle (Default vs Compact) */}
          <button
            type="button"
            onClick={() => setIsCompact((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              isCompact
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold"
                : "bg-[#0A1424] border-[#1D3452] text-[#8BA2C1] hover:text-white"
            }`}
            title="Toggle compact table density (hides address sub-lines)"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{isCompact ? "Compact" : "Default"}</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A1424] hover:bg-[#142842] border border-[#1D3452] hover:border-emerald-500/50 text-white text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Download CSV spreadsheet of current table"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Count Sub-line */}
      <div className="flex items-center justify-between text-[11px] text-[#8BA2C1] px-1">
        <span>
          Showing <strong className="text-white font-mono">{filteredBranches.length}</strong> of {branchEvals.length} branches
        </span>
        <span className="text-[10px] font-mono text-[#536F93]">
          Click any row to open branch detail panel
        </span>
      </div>

      {/* Table Wrapper (Horizontal Scroll, min-width: 840px) */}
      <div className="rounded-xl border border-[#1D3452] bg-[#0C182A] overflow-x-auto shadow-xs">
        <table className="w-full min-w-[840px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1D3452] bg-[#0A1424] text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider">
              <th className="py-2.5 px-4">Lounge Name &amp; Area</th>
              <th className="py-2.5 px-3">Google Star Rating</th>
              <th className="py-2.5 px-3">Catchment Affluence</th>
              <th className="py-2.5 px-3">Sister Distance</th>
              <th className="py-2.5 px-3">3km Competitors</th>
              <th className="py-2.5 px-3">Health Score</th>
              <th className="py-2.5 px-4 text-right">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D3452]/60">
            {filteredBranches.map((item) => {
              const { branch } = item;
              const isProtect = item.classification === "PROTECT";
              const isHold = item.classification === "HOLD";
              const isShrink = item.classification === "SHRINK";
              const isInsideSisterBuffer = branch.nearestSisterDistanceKm < 4.0;

              return (
                <tr
                  key={branch.id}
                  onClick={() => {
                    onSelectBranch(item);
                    onOpenBranchPanel();
                  }}
                  className="hover:bg-[#0F1F35] transition-colors cursor-pointer group"
                >
                  {/* Name & Address */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#8BA2C1] group-hover:text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {branch.name}
                        </span>
                        {!isCompact && (
                          <p className="text-[10px] text-[#8BA2C1] truncate">
                            {branch.emirate} · {branch.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-white font-semibold">{branch.googleRating}★</span>
                    <span className="text-[#536F93] text-[10px] ml-1">
                      ({branch.reviewCount})
                    </span>
                  </td>

                  {/* Affluence */}
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-white">{branch.catchmentAffluenceIndex}</span>
                    <span className="text-[#536F93] text-[10px]"> / 100</span>
                  </td>

                  {/* Sister Distance (Alert Red when inside buffer < 4.0km) */}
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={`font-semibold inline-flex items-center gap-1 ${
                        isInsideSisterBuffer
                          ? "text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30"
                          : "text-emerald-400"
                      }`}
                    >
                      {isInsideSisterBuffer && <AlertTriangle className="w-2.5 h-2.5" />}
                      <span>{branch.nearestSisterDistanceKm} km</span>
                    </span>
                  </td>

                  {/* Competitors */}
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    <span>{branch.competitorDensity3km} salons</span>
                  </td>

                  {/* Health Score */}
                  <td className="py-2.5 px-3 font-mono font-bold text-white">
                    {item.finalScore}
                    <span className="text-[10px] text-[#536F93] font-normal"> / 100</span>
                  </td>

                  {/* Verdict Badge */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          isProtect
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : isHold
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                        }`}
                      >
                        {item.classification}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#536F93] group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#1D3452] bg-[#0A1424] text-[10px] font-mono text-[#8BA2C1]">
              <td colSpan={7} className="py-2 px-4">
                Total: {filteredBranches.length} Lounges · Average Health Score:{" "}
                <span className="text-white font-bold">
                  {Math.round(
                    filteredBranches.reduce((acc, curr) => acc + curr.finalScore, 0) /
                      (filteredBranches.length || 1)
                  )}
                  /100
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
