import React, { useState, useMemo } from "react";
import { BranchEvaluation, Emirate, BranchClassification } from "../types";
import {
  Search,
  Filter,
  AlertTriangle,
  Star,
  ShieldCheck,
  PauseCircle,
  TrendingDown,
  Info,
  ChevronRight,
  MapPin,
} from "lucide-react";

interface BranchTableProps {
  evaluations: BranchEvaluation[];
  onSelectBranch: (evaluation: BranchEvaluation) => void;
  onOpenMapFocus: (lat: number, lng: number) => void;
}

export const BranchTable: React.FC<BranchTableProps> = ({
  evaluations,
  onSelectBranch,
  onOpenMapFocus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmirate, setSelectedEmirate] = useState<string>("All");
  const [selectedClassification, setSelectedClassification] = useState<string>("All");

  const emirateList: (Emirate | "All")[] = [
    "All",
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Fujairah",
    "Ras Al Khaimah",
  ];

  const filteredBranches = useMemo(() => {
    return evaluations.filter((item) => {
      const matchSearch =
        item.branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEmirate =
        selectedEmirate === "All" || item.branch.emirate === selectedEmirate;

      const matchClassification =
        selectedClassification === "All" ||
        item.classification === selectedClassification;

      return matchSearch && matchEmirate && matchClassification;
    });
  }, [evaluations, searchTerm, selectedEmirate, selectedClassification]);

  const getBadge = (classification: BranchClassification) => {
    switch (classification) {
      case "PROTECT":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>PROTECT</span>
          </span>
        );
      case "HOLD":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PauseCircle className="w-3 h-3 text-amber-400" />
            <span>HOLD</span>
          </span>
        );
      case "SHRINK":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>SHRINK</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-sm overflow-hidden text-slate-200">
      {/* Controls Header - High Density Style */}
      <div className="p-2.5 border-b border-slate-700 bg-[#1C2128] flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branch name, community or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="flex items-center space-x-1 text-slate-400 mr-1 text-[11px]">
            <Filter className="w-3 h-3" />
            <span>Emirate:</span>
          </div>
          {emirateList.map((em) => (
            <button
              key={em}
              onClick={() => setSelectedEmirate(em)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                selectedEmirate === em
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {em}
            </button>
          ))}

          <div className="h-3.5 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Classification Filter */}
          {(["All", "PROTECT", "HOLD", "SHRINK"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClassification(cls)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                selectedClassification === cls
                  ? "bg-slate-700 text-white border-slate-500 shadow-xs"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#161B22] border-b border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">Branch & Location</th>
              <th className="py-2.5 px-2.5">Emirate</th>
              <th className="py-2.5 px-2.5 text-center">Reputation</th>
              <th className="py-2.5 px-2.5 text-center">Catchment Affluence</th>
              <th className="py-2.5 px-2.5 text-center">Sister Distance</th>
              <th className="py-2.5 px-2.5 text-center">Competitors (3km)</th>
              <th className="py-2.5 px-2.5 text-center">Health Score</th>
              <th className="py-2.5 px-3 text-center">Decision</th>
              <th className="py-2.5 px-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No branches found matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredBranches.map((item, idx) => {
                const { branch, finalScore, classification, cannibalizationWarning } = item;
                return (
                  <tr
                    key={branch.id}
                    onClick={() => onSelectBranch(item)}
                    className={`cursor-pointer transition-colors ${
                      idx % 2 === 1 ? "bg-slate-800/25" : "bg-transparent"
                    } hover:bg-slate-800/60`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                            <span>{branch.name}</span>
                            {cannibalizationWarning && (
                              <span
                                title={`High sister-branch cannibalization risk: ${branch.nearestSisterDistanceKm}km to nearest Bedashing`}
                                className="inline-flex items-center text-rose-400"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {branch.address}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5">
                      <span className="font-medium text-slate-300">{branch.emirate}</span>
                      <div className="text-[10px] text-slate-400">{branch.area}</div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <div className="inline-flex items-center space-x-1 text-slate-200 font-semibold">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{branch.googleRating.toFixed(1)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{branch.reviewCount} rev</div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <div className="font-mono text-slate-300 font-medium">{branch.catchmentAffluenceIndex}/100</div>
                      <div className="w-16 bg-slate-800 rounded-full h-1 mx-auto mt-1 overflow-hidden border border-slate-700">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${branch.catchmentAffluenceIndex}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <div
                        className={`font-mono font-semibold ${
                          cannibalizationWarning ? "text-rose-400 font-bold" : "text-slate-300"
                        }`}
                      >
                        {branch.nearestSisterDistanceKm} km
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {cannibalizationWarning ? "Overlap risk" : "Safe spacing"}
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <span className="font-mono text-slate-300 font-medium">{branch.competitorDensity3km}</span>
                      <span className="text-[10px] text-slate-400 ml-1">salons</span>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <div
                        className={`text-xs font-mono font-bold ${
                          finalScore >= 70
                            ? "text-emerald-400"
                            : finalScore >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {finalScore}
                        <span className="text-[10px] font-normal text-slate-500">/100</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {getBadge(classification)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMapFocus(branch.lat, branch.lng);
                          }}
                          title="Locate on Map"
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBranch(item);
                          }}
                          className="inline-flex items-center space-x-0.5 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <span>Audit</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-2.5 bg-[#1C2128] border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="w-3 h-3 text-slate-500" />
          <span>Click any row for mathematical formula verification and AI strategic explanation.</span>
        </div>
        <div className="font-mono text-slate-400">
          Showing {filteredBranches.length} of {evaluations.length} branches
        </div>
      </div>
    </div>
  );
};
