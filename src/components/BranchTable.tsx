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
  Maximize2,
  Minimize2,
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handle Fullscreen escape listener & body scroll lock
  React.useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullScreen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isFullScreen]);

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
    <div
      className={
        isFullScreen
          ? "fixed inset-0 z-[9999] w-screen h-screen rounded-none border-0 flex flex-col p-3 sm:p-5 bg-[#0A1424] ds-app overflow-hidden ds-text-primary"
          : "ds-card border shadow-sm ds-text-primary rounded-lg overflow-hidden"
      }
    >
      {/* Fullscreen Header Banner */}
      {isFullScreen && (
        <div className="flex items-center justify-between pb-3 mb-2.5 border-b ds-border shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0A1424] border border-[#1D3452] flex items-center justify-center p-1.5 shadow-xs shrink-0">
              <img src="/bedashing-icon.svg" alt="Bedashing" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-tight ds-text-primary uppercase">
                  Branches — Full View
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  23 UAE Lounges
                </span>
              </div>
              <p className="text-[11px] ds-text-secondary">
                Classification into PROTECT, HOLD, or SHRINK with complete financial &amp; spatial metrics.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFullScreen(false)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 transition-colors shadow-xs cursor-pointer"
            title="Exit Full View (or press Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Full View (Esc)</span>
          </button>
        </div>
      )}

      {/* Controls Header - High Density Style */}
      <div className="p-2.5 border-b ds-border ds-card-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#8BA2C1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branch name, community or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded border ds-input placeholder-[#536F93] focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="flex items-center space-x-1 ds-text-secondary mr-1 text-[11px]">
            <Filter className="w-3 h-3" />
            <span>Emirate:</span>
          </div>
          {emirateList.map((em) => (
            <button
              key={em}
              onClick={() => setSelectedEmirate(em)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                selectedEmirate === em
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-xs"
                  : "ds-card-subtle ds-text-secondary hover:ds-text-primary"
              }`}
            >
              {em}
            </button>
          ))}

          <div className="h-3.5 w-px bg-[#1D3452] mx-1 hidden sm:block" />

          {/* Classification Filter */}
          {(["All", "PROTECT", "HOLD", "SHRINK"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClassification(cls)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                selectedClassification === cls
                  ? "bg-[#142842] text-white border-cyan-500/40 shadow-xs"
                  : "ds-card-subtle ds-text-secondary hover:ds-text-primary"
              }`}
            >
              {cls}
            </button>
          ))}

          <div className="h-3.5 w-px bg-[#1D3452] mx-1 hidden sm:block" />

          {/* Full View Mode Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
              isFullScreen
                ? "bg-cyan-600 text-white border-cyan-500 shadow-xs"
                : "ds-card-subtle ds-text-secondary hover:ds-text-primary"
            }`}
            title={isFullScreen ? "Exit Full View (Esc)" : "Expand Table to Full View Screen"}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Full View</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto ${isFullScreen ? "flex-1 min-h-0 overflow-y-auto" : ""}`}>
        <table className="w-full text-left border-collapse">
          <thead className={isFullScreen ? "sticky top-0 z-10 shadow-xs" : ""}>
            <tr className="ds-card-subtle border-b ds-border ds-text-secondary text-[10px] font-bold uppercase tracking-wider">
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
          <tbody className="divide-y ds-border-subtle text-xs">
            {filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center ds-text-muted">
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
                      idx % 2 === 1 ? "bg-black/15" : "bg-transparent"
                    } hover:bg-[#142842]/50`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="font-semibold ds-text-primary flex items-center space-x-1.5">
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
                          <div className="text-[10px] ds-text-secondary truncate max-w-xs">
                            {branch.address}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5">
                      <span className="font-medium ds-text-primary">{branch.emirate}</span>
                      <div className="text-[10px] ds-text-secondary">{branch.area}</div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <div className="inline-flex items-center space-x-1 ds-text-primary font-semibold">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{branch.googleRating.toFixed(1)}</span>
                      </div>
                      <div className="text-[10px] ds-text-secondary">{branch.reviewCount} rev</div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <div className="font-mono ds-text-primary font-medium">{branch.catchmentAffluenceIndex}/100</div>
                      <div className="w-16 bg-[#0A1424] rounded-full h-1 mx-auto mt-1 overflow-hidden border border-[#1D3452]">
                        <div
                          className="bg-cyan-400 h-full rounded-full"
                          style={{ width: `${branch.catchmentAffluenceIndex}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <div
                        className={`font-mono font-semibold ${
                          cannibalizationWarning ? "text-rose-400 font-bold" : "ds-text-primary"
                        }`}
                      >
                        {branch.nearestSisterDistanceKm} km
                      </div>
                      <div className="text-[10px] ds-text-secondary">
                        {cannibalizationWarning ? "Overlap risk" : "Safe spacing"}
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <span className="font-mono ds-text-primary font-medium">{branch.competitorDensity3km}</span>
                      <span className="text-[10px] ds-text-secondary ml-1">salons</span>
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
                        <span className="text-[10px] font-normal ds-text-muted">/100</span>
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
                          className="p-1 rounded hover:bg-[#142842] ds-text-secondary hover:ds-text-primary transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBranch(item);
                          }}
                          className="inline-flex items-center space-x-0.5 text-[11px] font-medium px-2 py-0.5 rounded ds-card-subtle hover:opacity-85 border ds-text-secondary hover:ds-text-primary transition-colors cursor-pointer"
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
      <div className="p-2.5 ds-card-subtle border-t ds-border text-[11px] ds-text-secondary flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Info className="w-3 h-3 ds-text-muted" />
          <span>
            Click any row for mathematical formula verification and AI strategic explanation.
            {isFullScreen && (
              <span className="ml-2 font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                [Esc] to Exit Full View
              </span>
            )}
          </span>
        </div>
        <div className="font-mono ds-text-secondary">
          Showing {filteredBranches.length} of {evaluations.length} branches
        </div>
      </div>
    </div>
  );
};
