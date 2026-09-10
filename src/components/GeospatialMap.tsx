import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  BranchEvaluation,
  CandidateEvaluation,
} from "../types";
import {
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";

interface GeospatialMapProps {
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  onSelectBranch: (branchEval: BranchEvaluation) => void;
  onSelectCandidate: (candidateEval: CandidateEvaluation) => void;
  focusedLocation?: { lat: number; lng: number } | null;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  branchEvals,
  candidateEvals,
  onSelectBranch,
  onSelectCandidate,
  focusedLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Toggles
  const [showBranches, setShowBranches] = useState(true);
  const [showCandidates, setShowCandidates] = useState(true);
  const [showBuffers, setShowBuffers] = useState(true);
  const [showCannibalizationLinks, setShowCannibalizationLinks] = useState(true);
  const [activeEmirate, setActiveEmirate] = useState<string>("All");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handle Fullscreen escape listener & body scroll lock
  useEffect(() => {
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

  // Robust map dimensions and center handling on fullscreen or focus change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleResize = () => {
      const container = mapContainerRef.current;
      if (!container || container.clientHeight === 0) return;
      map.invalidateSize({ pan: false });
      if (focusedLocation) {
        map.setView([focusedLocation.lat, focusedLocation.lng], map.getZoom() || 12, { animate: false });
      } else {
        map.setView([24.4539, 54.6773], map.getZoom() || 8, { animate: false });
      }
    };

    const rafId = requestAnimationFrame(handleResize);
    const timer1 = setTimeout(handleResize, 50);
    const timer2 = setTimeout(handleResize, 150);
    const timer3 = setTimeout(handleResize, 350);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isFullScreen, focusedLocation]);

  // Initialize Map with High Density Dark CartoDB Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [24.4539, 54.6773],
      zoom: 8,
      zoomControl: true,
      minZoom: 6,
      maxZoom: 17,
    });

    // Dark Matter CartoDB tiles for high-contrast dark theme
    const cartoKey = (import.meta as any).env?.VITE_CARTO_API_KEY;
    const tileUrl = cartoKey
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

    L.tileLayer(
      tileUrl,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapContainerRef.current && mapContainerRef.current.clientHeight > 0) {
        map.invalidateSize({ pan: false });
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Layers when state or evaluations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Existing Bedashing Branches
    if (showBranches) {
      branchEvals.forEach((item) => {
        const { branch, finalScore, classification, cannibalizationWarning } = item;

        if (activeEmirate !== "All" && branch.emirate !== activeEmirate) {
          return;
        }

        // Color mapping
        let color = "#10b981"; // Emerald for PROTECT
        let borderColor = "#059669";
        if (classification === "HOLD") {
          color = "#f59e0b"; // Amber
          borderColor = "#d97706";
        } else if (classification === "SHRINK") {
          color = "#f43f5e"; // Rose
          borderColor = "#e11d48";
        }

        // Catchment Buffer (3km circle)
        if (showBuffers) {
          const bufferCircle = L.circle([branch.lat, branch.lng], {
            radius: 3000,
            color: borderColor,
            fillColor: color,
            fillOpacity: 0.12,
            weight: 1,
            dashArray: "4, 4",
          });
          bufferCircle.addTo(layerGroup);
        }

        // Custom HTML Marker icon
        const iconHtml = `
          <div style="
            background-color: ${color};
            border: 2px solid #0F1115;
            box-shadow: 0 0 10px rgba(0,0,0,0.7);
            border-radius: 9999px;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: monospace;
            font-size: 10px;
            font-weight: 800;
          ">
            ${finalScore}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-branch-marker",
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([branch.lat, branch.lng], { icon: customIcon });

        // High Density Dark Popup
        const popupContent = document.createElement("div");
        popupContent.className = "p-1 font-sans text-xs text-slate-200";
        popupContent.innerHTML = `
          <div style="font-weight: 700; font-size: 13px; color: #FFFFFF; margin-bottom: 2px;">
            ${branch.name}
          </div>
          <div style="color: #94A3B8; font-size: 11px; margin-bottom: 6px;">
            ${branch.emirate} • ${branch.area}
          </div>
          <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; font-family: monospace; background: ${
            classification === "PROTECT"
              ? "rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3)"
              : classification === "HOLD"
              ? "rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3)"
              : "rgba(244, 63, 94, 0.15); color: #FB7185; border: 1px solid rgba(244, 63, 94, 0.3)"
          }">
            ${classification} (${finalScore}/100)
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #CBD5E1; line-height: 1.5;">
            ★ <strong style="color: #F8FAFC">${branch.googleRating.toFixed(1)}</strong> (${branch.reviewCount} reviews)<br/>
            Catchment Affluence: <strong style="color: #F8FAFC">${branch.catchmentAffluenceIndex}/100</strong><br/>
            Nearest Sister: <strong style="color: #F8FAFC">${branch.nearestSisterDistanceKm} km</strong> ${
          cannibalizationWarning ? '<span style="color:#FB7185; font-weight:bold;">(Overlap Warning)</span>' : ""
        }<br/>
            Local Salons: <strong style="color: #F8FAFC">${branch.competitorDensity3km}</strong>
          </div>
          <button id="btn-inspect-${branch.id}" style="
            margin-top: 8px;
            width: 100%;
            padding: 5px 8px;
            background: #1E293B;
            color: #F8FAFC;
            font-size: 11px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
            border: 1px solid #475569;
          ">
            View Deep-Dive Audit
          </button>
        `;

        marker.bindPopup(popupContent);
        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-inspect-${branch.id}`);
          if (btn) {
            btn.onclick = () => onSelectBranch(item);
          }
        });

        marker.addTo(layerGroup);
      });
    }

    // 2. Cannibalization Conflict Links
    if (showCannibalizationLinks) {
      const drawnPairs = new Set<string>();

      branchEvals.forEach((item) => {
        const { branch } = item;
        if (branch.nearestSisterDistanceKm < 4.0) {
          const sister = branchEvals.find((b) => b.branch.id === branch.nearestSisterBranchId);
          if (sister) {
            const pairKey = [branch.id, sister.branch.id].sort().join("--");
            if (!drawnPairs.has(pairKey)) {
              drawnPairs.add(pairKey);

              const line = L.polyline(
                [
                  [branch.lat, branch.lng],
                  [sister.branch.lat, sister.branch.lng],
                ],
                {
                  color: "#f43f5e",
                  weight: 2,
                  dashArray: "6, 6",
                  opacity: 0.9,
                }
              );

              line.bindTooltip(
                `Overlap: ${branch.name} ↔ ${sister.branch.name} (${branch.nearestSisterDistanceKm} km)`,
                { sticky: true, className: "bg-slate-900 text-rose-300 font-mono text-[10px] border border-rose-500/40 p-1" }
              );

              line.addTo(layerGroup);
            }
          }
        }
      });
    }

    // 3. Expansion Candidate Areas
    if (showCandidates) {
      candidateEvals.forEach((item) => {
        const { candidate, finalScore, classification } = item;

        if (activeEmirate !== "All" && candidate.emirate !== activeEmirate) {
          return;
        }

        let color = "#14b8a6"; // Teal for GROW
        if (classification === "WATCH") {
          color = "#f59e0b"; // Amber
        } else if (classification === "SKIP") {
          color = "#64748b"; // Slate
        }

        const iconHtml = `
          <div style="
            background-color: ${color};
            border: 2px solid #0F1115;
            box-shadow: 0 0 10px rgba(0,0,0,0.7);
            transform: rotate(45deg);
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: 800;
          ">
            <span style="transform: rotate(-45deg); font-family: monospace;">+</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-candidate-marker",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([candidate.lat, candidate.lng], { icon: customIcon });

        const popupContent = document.createElement("div");
        popupContent.className = "p-1 font-sans text-xs text-slate-200";
        popupContent.innerHTML = `
          <div style="font-weight: 700; font-size: 13px; color: #FFFFFF; margin-bottom: 2px;">
            ${candidate.name}
          </div>
          <div style="color: #94A3B8; font-size: 11px; margin-bottom: 6px;">
            Candidate Zone • ${candidate.emirate} • ${candidate.zoneType}
          </div>
          <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; font-family: monospace; background: ${
            classification === "GROW"
              ? "rgba(20, 184, 166, 0.15); color: #2DD4BF; border: 1px solid rgba(20, 184, 166, 0.3)"
              : classification === "WATCH"
              ? "rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3)"
              : "rgba(100, 116, 139, 0.15); color: #94A3B8; border: 1px solid rgba(100, 116, 139, 0.3)"
          }">
            Expansion: ${classification} (${finalScore}/100)
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #CBD5E1; line-height: 1.5;">
            Unmet Demand: <strong style="color: #F8FAFC">${candidate.unmetDemandIndex}/100</strong><br/>
            Target Demographic: <strong style="color: #F8FAFC">${candidate.targetDemographicPopulation.toLocaleString()}</strong><br/>
            Retail Gravity: <strong style="color: #F8FAFC">${candidate.retailGravityScore}/100</strong><br/>
            Sister Distance: <strong style="color: #F8FAFC">${candidate.nearestBedashingDistanceKm} km</strong>
          </div>
          <button id="btn-cand-${candidate.id}" style="
            margin-top: 8px;
            width: 100%;
            padding: 5px 8px;
            background: #1E293B;
            color: #F8FAFC;
            font-size: 11px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
            border: 1px solid #475569;
          ">
            Inspect Opportunity
          </button>
        `;

        marker.bindPopup(popupContent);
        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-cand-${candidate.id}`);
          if (btn) {
            btn.onclick = () => onSelectCandidate(item);
          }
        });

        marker.addTo(layerGroup);
      });
    }
  }, [
    branchEvals,
    candidateEvals,
    showBranches,
    showCandidates,
    showBuffers,
    showCannibalizationLinks,
    activeEmirate,
    onSelectBranch,
    onSelectCandidate,
  ]);

  // Center on focused location when passed
  useEffect(() => {
    if (focusedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([focusedLocation.lat, focusedLocation.lng], 13, {
        animate: true,
      });
    }
  }, [focusedLocation]);

  const resetMapZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([24.4539, 54.6773], 8, { animate: true });
    }
  };

  return (
    <div
      className={
        isFullScreen
          ? "fixed inset-0 z-[9999] w-full h-full bg-[#08111E] ds-app flex flex-col overflow-hidden"
          : "relative w-full h-[620px] rounded-lg border border-[#1D3452] shadow-sm bg-[#0F1F35] overflow-hidden flex flex-col"
      }
    >
      {/* Top Banner when in Fullscreen Mode */}
      {isFullScreen && (
        <div className="h-12 bg-[#0C182A] border-b border-[#1D3452] px-4 z-20 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#142842] border border-[#1D3452] flex items-center justify-center p-1">
              <img src="/bedashing-icon.svg" alt="Bedashing" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold tracking-tight text-white uppercase">
                  UAE Map
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Full View
                </span>
              </div>
              <p className="text-[11px] text-[#8BA2C1]">
                23 Bedashing Lounges • 10 Prospective Growth Zones • 3km Buffers &amp; Cannibalization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetMapZoom}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-[#142842] hover:bg-[#193152] text-[#8BA2C1] hover:text-white border border-[#1D3452] transition-colors cursor-pointer"
              title="Reset UAE Geographic View"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset View</span>
            </button>

            <button
              onClick={() => setIsFullScreen(false)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs border border-cyan-400 transition-colors cursor-pointer"
              title="Exit Full View (or press Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Full View (Esc)</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas & Controls Wrapper */}
      <div
        className="relative w-full flex-1 min-h-0 overflow-hidden"
        style={{
          height: isFullScreen ? "calc(100vh - 48px)" : "100%",
          minHeight: isFullScreen ? "calc(100vh - 48px)" : "620px",
        }}
      >
        {/* Leaflet Map Target Element */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Top Right Full View Button when in standard mode */}
        {!isFullScreen && (
          <div className="absolute top-3 right-3 z-[1000]">
            <button
              onClick={() => setIsFullScreen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0C182A]/90 hover:bg-[#142842] text-slate-200 hover:text-white border border-[#1D3452] shadow-lg text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
              title="Expand Map to Full Screen View"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full View</span>
            </button>
          </div>
        )}

        {/* Floating Map Controls & Legend - Dark Navy High Density Style */}
        <div
          className={`absolute z-[1000] bg-[#0C182A]/95 backdrop-blur-md p-3 rounded-lg border border-[#1D3452] shadow-2xl max-w-xs text-xs space-y-2.5 text-slate-200 transition-all ${
            isFullScreen ? "top-4 left-4" : "top-3 left-3"
          }`}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1D3452]">
            <div className="flex items-center space-x-1.5">
              <img src="/bedashing-icon.svg" alt="Bedashing Icon" className="h-3.5 w-auto" />
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                MAP LAYERS
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={resetMapZoom}
                className="p-1 text-[#8BA2C1] hover:text-white rounded hover:bg-[#142842] transition-colors cursor-pointer"
                title="Reset UAE Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isFullScreen ? "text-cyan-300 hover:bg-[#142842]" : "text-[#8BA2C1] hover:text-white hover:bg-[#142842]"
                }`}
                title={isFullScreen ? "Exit Full View (Esc)" : "Full View Screen"}
              >
                {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Emirate filter */}
          <div>
            <label className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider block mb-1">
              Focus Emirate:
            </label>
            <select
              value={activeEmirate}
              onChange={(e) => setActiveEmirate(e.target.value)}
              className="w-full text-xs py-1 px-2 border border-[#1D3452] rounded bg-[#0A1424] text-slate-200 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Emirates (23 Branches)</option>
              <option value="Abu Dhabi">Abu Dhabi (14)</option>
              <option value="Dubai">Dubai (5)</option>
              <option value="Sharjah">Sharjah (2)</option>
              <option value="Fujairah">Fujairah (1)</option>
              <option value="Ras Al Khaimah">Ras Al Khaimah (1)</option>
            </select>
          </div>

          {/* Layer checkboxes */}
          <div className="space-y-1.5 pt-1.5 border-t border-[#1D3452] text-[11px]">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showBranches}
                onChange={(e) => setShowBranches(e.target.checked)}
                className="rounded-xs text-cyan-500 bg-[#0A1424] border-[#1D3452] focus:ring-0"
              />
              <span className="text-slate-300">Existing Branches (Circles)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCandidates}
                onChange={(e) => setShowCandidates(e.target.checked)}
                className="rounded-xs text-teal-500 bg-[#0A1424] border-[#1D3452] focus:ring-0"
              />
              <span className="text-slate-300">Expansion Candidates (Diamonds)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showBuffers}
                onChange={(e) => setShowBuffers(e.target.checked)}
                className="rounded-xs text-cyan-500 bg-[#0A1424] border-[#1D3452] focus:ring-0"
              />
              <span className="text-slate-300">3km Catchment Buffers</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCannibalizationLinks}
                onChange={(e) => setShowCannibalizationLinks(e.target.checked)}
                className="rounded-xs text-rose-500 bg-[#0A1424] border-[#1D3452] focus:ring-0"
              />
              <span className="text-slate-300">Cannibalization Vectors (&lt;4km)</span>
            </label>
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-[#1D3452] space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-200">Protect / Grow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-200">Hold / Watch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-200">Shrink / Skip</span>
            </div>
          </div>
        </div>

        {/* High Density Status Pill in Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-[#0C182A]/90 border border-[#1D3452] px-2.5 py-1 rounded text-[10px] text-[#8BA2C1] shadow-md flex items-center gap-1.5 z-[1000]">
          <img src="/bedashing-icon.svg" alt="Bedashing" className="h-3 w-auto opacity-70" />
          <span>UAE Dark Map | Catchments &amp; Cannibalization</span>
        </div>
      </div>
    </div>
  );
};
