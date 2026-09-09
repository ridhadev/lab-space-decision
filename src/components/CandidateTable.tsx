import React, { useState, useMemo } from "react";
import { CandidateEvaluation, CandidateClassification } from "../types";
import {
  Search,
  Sparkles,
  Eye,
  XCircle,
  ChevronRight,
  MapPin,
  Info,
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

  const filteredCandidates = useMemo(() => {
    return evaluations.filter((item) => {
      const matchSearch =
        item.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.candidate.emirate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.candidate.zoneType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass =
        selectedClassification === "All" ||
        item.classification === selectedClassification;

      return matchSearch && matchClass;
    });
  }, [evaluations, searchTerm, selectedClassification]);

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
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>SKIP</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-sm overflow-hidden text-slate-200">
      {/* Header Controls */}
      <div className="p-2.5 border-b border-slate-700 bg-[#1C2128] flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate area, emirate, or zone type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">Filter Classification:</span>
          {(["All", "GROW", "WATCH", "SKIP"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClassification(cls)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                selectedClassification === cls
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
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
              <th className="py-2.5 px-3">Candidate Area</th>
              <th className="py-2.5 px-2.5">Emirate & Type</th>
              <th className="py-2.5 px-2.5 text-center">Target Pop (5km)</th>
              <th className="py-2.5 px-2.5 text-center">Unmet Demand</th>
              <th className="py-2.5 px-2.5 text-center">Retail Gravity</th>
              <th className="py-2.5 px-2.5 text-center">Sister Distance</th>
              <th className="py-2.5 px-2.5 text-center">Expansion Score</th>
              <th className="py-2.5 px-3 text-center">Recommendation</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {filteredCandidates.map((item, idx) => {
              const { candidate, finalScore, classification, cannibalizationRisk } = item;
              return (
                <tr
                  key={candidate.id}
                  onClick={() => onSelectCandidate(item)}
                  className={`cursor-pointer transition-colors ${
                    idx % 2 === 1 ? "bg-slate-800/25" : "bg-transparent"
                  } hover:bg-slate-800/60`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{candidate.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{candidate.notes}</div>
                  </td>

                  <td className="py-2.5 px-2.5">
                    <span className="font-medium text-slate-300">{candidate.emirate}</span>
                    <div className="text-[10px] text-slate-400">{candidate.zoneType}</div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center font-mono text-slate-300">
                    {candidate.targetDemographicPopulation.toLocaleString()}
                    <div className="text-[9px] text-slate-500 font-sans">Females (18-55)</div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <div className="font-mono text-slate-300 font-medium">{candidate.unmetDemandIndex}/100</div>
                    <div className="w-14 bg-slate-800 rounded-full h-1 mx-auto mt-1 overflow-hidden border border-slate-700">
                      <div
                        className="bg-teal-500 h-full rounded-full"
                        style={{ width: `${candidate.unmetDemandIndex}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center font-mono text-slate-300">
                    {candidate.retailGravityScore}/100
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <div
                      className={`font-mono font-semibold ${
                        cannibalizationRisk ? "text-amber-400 font-bold" : "text-slate-300"
                      }`}
                    >
                      {candidate.nearestBedashingDistanceKm} km
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {cannibalizationRisk ? "Cannibalization risk" : "Safe spacing"}
                    </div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <div
                      className={`text-xs font-mono font-bold ${
                        finalScore >= 75
                          ? "text-teal-400"
                          : finalScore >= 55
                          ? "text-amber-400"
                          : "text-slate-500"
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
                          onOpenMapFocus(candidate.lat, candidate.lng);
                        }}
                        title="Locate on Map"
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(item);
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
            })}
          </tbody>
        </table>
      </div>
      <div className="p-2.5 bg-[#1C2128] border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="w-3 h-3 text-slate-500" />
          <span>Click any candidate for expansion feasibility audit and AI strategic evaluation.</span>
        </div>
        <div className="font-mono text-slate-400">
          Showing {filteredCandidates.length} of {evaluations.length} candidate zones
        </div>
      </div>
    </div>
  );
};
