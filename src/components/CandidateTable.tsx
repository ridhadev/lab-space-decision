import React, { useState, useMemo } from "react";
import { CandidateEvaluation, CandidateClassification, MarketSaturationTier } from "../types";
import { getMarketSaturationInfo } from "../services/scoringEngine";
import {
  Search,
  Sparkles,
  Eye,
  XCircle,
  ChevronRight,
  MapPin,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface CandidateTableProps {
  evaluations: CandidateEvaluation[];
  onSelectCandidate: (evaluation: CandidateEvaluation) => void;
  onOpenMapFocus: (lat: number, lng: number) => void;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  evaluations,
  onSelectCandidate,
  onOpenMapFocus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassification, setSelectedClassification] = useState<string>("All");
  const [selectedSaturation, setSelectedSaturation] = useState<string>("All");
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

  const filteredCandidates = useMemo(() => {
    return evaluations.filter((item) => {
      const matchSearch =
        item.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.candidate.emirate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.candidate.zoneType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass =
        selectedClassification === "All" ||
        item.classification === selectedClassification;

      const matchSaturation =
        selectedSaturation === "All" ||
        item.saturationTier === selectedSaturation;

      return matchSearch && matchClass && matchSaturation;
    });
  }, [evaluations, searchTerm, selectedClassification, selectedSaturation]);

  const getBadge = (cls: CandidateClassification) => {
    switch (cls) {
      case "GROW":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>GROW</span>
          </span>
        );
      case "WATCH":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Eye className="w-3 h-3 text-amber-400" />
            <span>WATCH</span>
          </span>
        );
      case "SKIP":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ds-card-subtle ds-text-muted border">
            <XCircle className="w-3 h-3 text-slate-400" />
            <span>SKIP</span>
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
                  Candidates — Full View
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  10 Candidate Zones
                </span>
              </div>
              <p className="text-[11px] ds-text-secondary">
                Prioritization into GROW, WATCH, or SKIP based on catchment population, unmet demand, and sister distance.
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

      {/* Header Controls */}
      <div className="p-2.5 border-b ds-border ds-card-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#8BA2C1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate area, emirate, or zone type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded border ds-input placeholder-[#536F93] focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-xs flex-wrap gap-y-1.5">
          <span className="ds-text-secondary text-[11px]">Filter Classification:</span>
          {(["All", "GROW", "WATCH", "SKIP"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClassification(cls)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                selectedClassification === cls
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-xs"
                  : "ds-card-subtle ds-text-secondary hover:ds-text-primary"
              }`}
            >
              {cls}
            </button>
          ))}

          <div className="h-3.5 w-px bg-[#1D3452] mx-1 hidden sm:block" />

          {/* Saturation Filter */}
          <span className="ds-text-secondary text-[11px]">Saturation:</span>
          {(["All", "Monopolistic", "Balanced", "Saturated", "Hyper-Saturated"] as const).map((sat) => {
            const count =
              sat === "All"
                ? evaluations.length
                : evaluations.filter((e) => e.saturationTier === sat).length;
            const satLabel =
              sat === "All"
                ? "All"
                : sat === "Monopolistic"
                ? "Moat (1-4)"
                : sat === "Hyper-Saturated"
                ? "Hyper (18+)"
                : sat;
            return (
              <button
                key={sat}
                onClick={() => setSelectedSaturation(sat)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border flex items-center gap-1 ${
                  selectedSaturation === sat
                    ? "bg-[#142842] text-white border-cyan-500/40 shadow-xs"
                    : "ds-card-subtle ds-text-secondary hover:ds-text-primary"
                }`}
              >
                <span>{satLabel}</span>
                <span className="text-[10px] font-mono opacity-70">({count})</span>
              </button>
            );
          })}

          <div className="h-3.5 w-px bg-[#1D3452] mx-1 hidden sm:block" />

          {/* Full View Toggle */}
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
              <th className="py-2.5 px-3">Candidate Area</th>
              <th className="py-2.5 px-2.5">Emirate & Type</th>
              <th className="py-2.5 px-2.5 text-center">Target Pop (5km)</th>
              <th className="py-2.5 px-2.5 text-center">Unmet Demand</th>
              <th className="py-2.5 px-2.5 text-center">Retail Gravity</th>
              <th className="py-2.5 px-2.5 text-center">Sister Distance</th>
              <th className="py-2.5 px-2.5 text-center">Market Saturation</th>
              <th className="py-2.5 px-2.5 text-center">Expansion Score</th>
              <th className="py-2.5 px-3 text-center">Recommendation</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y ds-border-subtle text-xs">
            {filteredCandidates.map((item, idx) => {
              const { candidate, finalScore, classification, cannibalizationRisk } = item;
              const satInfo = getMarketSaturationInfo(candidate.competitorCount);
              return (
                <tr
                  key={candidate.id}
                  onClick={() => onSelectCandidate(item)}
                  className={`cursor-pointer transition-colors ${
                    idx % 2 === 1 ? "bg-black/15" : "bg-transparent"
                  } hover:bg-[#142842]/50`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold ds-text-primary">{candidate.name}</div>
                    <div className="text-[10px] ds-text-secondary truncate max-w-xs">{candidate.notes}</div>
                  </td>

                  <td className="py-2.5 px-2.5">
                    <span className="font-medium ds-text-primary">{candidate.emirate}</span>
                    <div className="text-[10px] ds-text-secondary">{candidate.zoneType}</div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center font-mono ds-text-primary">
                    {candidate.targetDemographicPopulation.toLocaleString()}
                    <div className="text-[9px] ds-text-muted font-sans">Females (18-55)</div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <div className="font-mono ds-text-primary font-medium">{candidate.unmetDemandIndex}/100</div>
                    <div className="w-16 bg-[#0A1424] rounded-full h-1 mx-auto mt-1 overflow-hidden border border-[#1D3452]">
                      <div
                        className="bg-teal-400 h-full rounded-full"
                        style={{ width: `${candidate.unmetDemandIndex}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <div className="font-mono ds-text-primary font-medium">{candidate.retailGravityScore}/100</div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <div
                      className={`font-mono font-semibold ${
                        cannibalizationRisk ? "text-rose-400 font-bold" : "ds-text-primary"
                      }`}
                    >
                      {candidate.nearestBedashingDistanceKm} km
                    </div>
                    <div className="text-[10px] ds-text-secondary">
                      {cannibalizationRisk ? "Overlap risk" : "Safe spacing"}
                    </div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${satInfo.badgeClass}`}
                      title={`${candidate.competitorCount} salons in 3km - ${satInfo.description}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: satInfo.dotColor }}
                      />
                      <span>{satInfo.label}</span>
                    </span>
                    <div className="text-[10px] ds-text-muted font-mono mt-0.5">
                      {candidate.competitorCount} salons
                    </div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <div
                      className={`text-xs font-mono font-bold ${
                        finalScore >= 70
                          ? "text-teal-400"
                          : finalScore >= 50
                          ? "text-amber-400"
                          : "ds-text-muted"
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
                          onOpenMapFocus(candidate.lat, candidate.lng);
                        }}
                        title="Locate on Map"
                        className="p-1 rounded hover:bg-[#142842] ds-text-secondary hover:ds-text-primary transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(item);
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
            })}
          </tbody>
        </table>
      </div>
      <div className="p-2.5 ds-card-subtle border-t ds-border text-[11px] ds-text-secondary flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Info className="w-3 h-3 ds-text-muted" />
          <span>
            Click any candidate for expansion feasibility audit and AI strategic evaluation.
            {isFullScreen && (
              <span className="ml-2 font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                [Esc] to Exit Full View
              </span>
            )}
          </span>
        </div>
        <div className="font-mono ds-text-secondary">
          Showing {filteredCandidates.length} of {evaluations.length} candidate zones
        </div>
      </div>
    </div>
  );
};
