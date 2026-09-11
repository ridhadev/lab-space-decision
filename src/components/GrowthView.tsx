import React, { useState } from "react";
import { CandidateEvaluation } from "../types";
import {
  Sparkles,
  MapPin,
  Clock,
  Armchair,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

interface GrowthViewProps {
  candidateEvals: CandidateEvaluation[];
  onSelectCandidate: (c: CandidateEvaluation) => void;
  onFocusMapLocation: (lat: number, lng: number) => void;
  onOpenCandidatePanel: () => void;
}

export const GrowthView: React.FC<GrowthViewProps> = ({
  candidateEvals,
  onSelectCandidate,
  onFocusMapLocation,
  onOpenCandidatePanel,
}) => {
  const [selectedEmirate, setSelectedEmirate] = useState<string>("All");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("All");

  const emirates = ["All", "Dubai", "Abu Dhabi", "Sharjah"];
  const verdicts = ["All", "GROW", "WATCH", "SKIP"];

  const filteredCandidates = candidateEvals.filter((c) => {
    const matchesEmirate = selectedEmirate === "All" || c.candidate.emirate === selectedEmirate;
    const matchesVerdict = selectedVerdict === "All" || c.classification === selectedVerdict;
    return matchesEmirate && matchesVerdict;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* View Header & Working Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Expansion Pipeline
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
              {filteredCandidates.length} of {candidateEvals.length} Target Zones
            </span>
          </div>
          <p className="text-[11px] text-[#8BA2C1] mt-0.5">
            Evaluating greenfield growth zones across target female affluence, unmet demand, and sister safety.
          </p>
        </div>

        {/* Filter Strips */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {/* Emirate filter */}
          <div className="flex items-center bg-[#0A1424] p-1 rounded-lg border border-[#1D3452]">
            {emirates.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setSelectedEmirate(em)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                  selectedEmirate === em
                    ? "bg-[#142842] text-white font-semibold shadow-xs"
                    : "text-[#8BA2C1] hover:text-white"
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          {/* Verdict filter */}
          <div className="flex items-center bg-[#0A1424] p-1 rounded-lg border border-[#1D3452]">
            {verdicts.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVerdict(v)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                  selectedVerdict === v
                    ? "bg-[#142842] text-white font-semibold shadow-xs"
                    : "text-[#8BA2C1] hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Cards in auto-fit, minmax(320px, 1fr) Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredCandidates.map((item) => {
          const { candidate } = item;
          const isGrow = item.classification === "GROW";
          const isWatch = item.classification === "WATCH";

          return (
            <div
              key={candidate.id}
              className="p-4 rounded-xl bg-[#0F1F35] border border-[#1D3452] hover:border-teal-500/50 transition-all flex flex-col justify-between shadow-xs group"
            >
              <div>
                {/* Top Row: Name, Area, Verdict Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8BA2C1] mt-0.5">
                      <MapPin className="w-3 h-3 text-[#536F93]" />
                      <span>{candidate.emirate}</span>
                      <span>·</span>
                      <span className="truncate">{candidate.zoneType}</span>
                    </div>
                  </div>

                  {/* Verdict Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${
                      isGrow
                        ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                        : isWatch
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                    }`}
                  >
                    {item.classification}
                  </span>
                </div>

                {/* Big Score and Key Stats */}
                <div className="mt-3 flex items-baseline justify-between p-2.5 rounded-lg bg-[#0A1424] border border-[#1D3452]">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8BA2C1] block">
                      Expansion Score
                    </span>
                    <div className="text-2xl font-mono font-bold text-white mt-0.5">
                      {item.finalScore}
                      <span className="text-xs text-[#8BA2C1] font-normal"> / 100</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8BA2C1] block">
                      Target Capacity
                    </span>
                    <div className="text-xs font-semibold text-teal-300 flex items-center justify-end gap-1 mt-1">
                      <Armchair className="w-3 h-3 text-teal-400" />
                      <span>{candidate.expectedChairCapacity} chairs</span>
                    </div>
                    <div className="text-[10px] text-[#8BA2C1] font-mono flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-[#536F93]" />
                      <span>Pop: {candidate.targetDemographicPopulation.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Per-Factor Bars */}
                <div className="mt-3 space-y-1.5 text-[10px]">
                  {/* Factor 1: Unmet Demand */}
                  <div>
                    <div className="flex justify-between text-[#8BA2C1]">
                      <span>Unmet Demand Index</span>
                      <span className="font-mono text-white font-semibold">
                        {item.demandScore.toFixed(0)}/100
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0A1424] rounded-full mt-0.5 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${item.demandScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 2: Target Affluence */}
                  <div>
                    <div className="flex justify-between text-[#8BA2C1]">
                      <span>Catchment Affluence</span>
                      <span className="font-mono text-white font-semibold">
                        {item.affluenceScore.toFixed(0)}/100
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0A1424] rounded-full mt-0.5 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${item.affluenceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 3: Sister Buffer Safety */}
                  <div>
                    <div className="flex justify-between text-[#8BA2C1]">
                      <span>Sister Proximity Safety</span>
                      <span className="font-mono text-white font-semibold">
                        {item.cannibalizationSafetyScore.toFixed(0)}/100 ({candidate.nearestBedashingDistanceKm}km)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0A1424] rounded-full mt-0.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          candidate.nearestBedashingDistanceKm < 4.0 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${item.cannibalizationSafetyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions: Compare & View on Map */}
              <div className="mt-4 pt-2.5 border-t border-[#1D3452] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onFocusMapLocation(candidate.lat, candidate.lng);
                  }}
                  className="text-cyan-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View on Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCandidate(item);
                    onOpenCandidatePanel();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0A1424] hover:bg-[#142842] border border-[#1D3452] hover:border-teal-500/50 text-white font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3 text-teal-400" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
