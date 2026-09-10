import React, { useEffect, useRef, useState, useCallback } from "react";
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
  ChevronDown,
  ChevronUp,
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
  const [showCompetitionHeatmap, setShowCompetitionHeatmap] = useState(true);
  const [showCoverageGaps, setShowCoverageGaps] = useState(true);
  const [activeEmirate, setActiveEmirate] = useState<string>("All");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const isInitialMount = useRef(true);

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

  // Robust map dimensions on fullscreen or focus change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleResize = () => {
      const container = mapContainerRef.current;
      if (!container || container.clientHeight === 0) return;
      map.invalidateSize({ pan: false });
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
  }, [isFullScreen]);

  // Initialize Map with High Density Dark CartoDB Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [24.4539, 54.6773],
      zoom: 8,
      zoomControl: false,
      minZoom: 6,
      maxZoom: 17,
    });

    // Add zoom in/out control at bottom-right corner of the map
    L.control.zoom({ position: "bottomright" }).addTo(map);

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

    // 0. Competition Density & Market Saturation Heatmap (Thermal Blue-to-Red)
    if (showCompetitionHeatmap) {
      // Render thermal saturation blobs around existing branches
      branchEvals.forEach((item) => {
        const { branch } = item;
        if (activeEmirate !== "All" && branch.emirate !== activeEmirate) return;

        const count = branch.competitorDensity3km;

        let outerColor = "#06b6d4"; // Cool cyan
        let midColor = "#0ea5e9";
        let coreColor = "#0284c7";
        let tierLabel = "Low Density Moat";
        let outerOpacity = 0.08;
        let midOpacity = 0.16;
        let coreOpacity = 0.26;

        if (count >= 18) {
          // Hyper-Saturated (Red/Crimson)
          outerColor = "#ef4444";
          midColor = "#dc2626";
          coreColor = "#b91c1c";
          tierLabel = "Hyper-Saturated Corridor";
          outerOpacity = 0.16;
          midOpacity = 0.28;
          coreOpacity = 0.42;
        } else if (count >= 10) {
          // High Saturation (Orange/Amber)
          outerColor = "#f97316";
          midColor = "#ea580c";
          coreColor = "#c2410c";
          tierLabel = "High Saturation";
          outerOpacity = 0.13;
          midOpacity = 0.23;
          coreOpacity = 0.35;
        } else if (count >= 5) {
          // Moderate (Yellow/Gold)
          outerColor = "#eab308";
          midColor = "#d97706";
          coreColor = "#b45309";
          tierLabel = "Balanced Competition";
          outerOpacity = 0.10;
          midOpacity = 0.18;
          coreOpacity = 0.28;
        }

        // Outer thermal dissipation ring (3.8km)
        const outerCircle = L.circle([branch.lat, branch.lng], {
          radius: 3800,
          color: outerColor,
          fillColor: outerColor,
          fillOpacity: outerOpacity,
          weight: 0,
          interactive: false,
        });
        outerCircle.addTo(layerGroup);

        // Mid thermal density ring (2.2km)
        const midCircle = L.circle([branch.lat, branch.lng], {
          radius: 2200,
          color: midColor,
          fillColor: midColor,
          fillOpacity: midOpacity,
          weight: 0,
          interactive: false,
        });
        midCircle.addTo(layerGroup);

        // Core thermal density ring (1.0km) with interactive tooltip
        const coreCircle = L.circle([branch.lat, branch.lng], {
          radius: 1000,
          color: coreColor,
          fillColor: coreColor,
          fillOpacity: coreOpacity,
          weight: 0,
          interactive: true,
        });

        coreCircle.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px; line-height: 1.4;">
            <div style="font-weight: 700; color: #FFFFFF;">${branch.name} — Saturation Zone</div>
            <div style="color: #94A3B8; font-size: 10px;">${branch.emirate} • ${branch.area}</div>
            <div style="margin-top: 4px; font-weight: 700; color: ${
              count >= 18 ? "#FB7185" : count >= 10 ? "#FB923C" : count >= 5 ? "#FBBF24" : "#38BDF8"
            }; font-family: monospace;">
              ${count} salons within 3km (${tierLabel})
            </div>
          </div>`,
          { sticky: true, className: "bg-[#0C182A] text-slate-200 border border-[#1D3452] shadow-xl rounded-md p-1.5" }
        );

        coreCircle.addTo(layerGroup);
      });

      // Also render thermal saturation for expansion candidates if active
      if (showCandidates) {
        candidateEvals.forEach((item) => {
          const { candidate } = item;
          if (activeEmirate !== "All" && candidate.emirate !== activeEmirate) return;

          const count = candidate.competitorCount;

          let outerColor = "#06b6d4";
          let midColor = "#0ea5e9";
          let coreColor = "#0284c7";
          let tierLabel = "Low Density Moat";
          let outerOpacity = 0.08;
          let midOpacity = 0.16;
          let coreOpacity = 0.26;

          if (count >= 18) {
            outerColor = "#ef4444";
            midColor = "#dc2626";
            coreColor = "#b91c1c";
            tierLabel = "Hyper-Saturated Corridor";
            outerOpacity = 0.16;
            midOpacity = 0.28;
            coreOpacity = 0.42;
          } else if (count >= 10) {
            outerColor = "#f97316";
            midColor = "#ea580c";
            coreColor = "#c2410c";
            tierLabel = "High Saturation";
            outerOpacity = 0.13;
            midOpacity = 0.23;
            coreOpacity = 0.35;
          } else if (count >= 5) {
            outerColor = "#eab308";
            midColor = "#d97706";
            coreColor = "#b45309";
            tierLabel = "Balanced Competition";
            outerOpacity = 0.10;
            midOpacity = 0.18;
            coreOpacity = 0.28;
          }

          const outerCircle = L.circle([candidate.lat, candidate.lng], {
            radius: 3600,
            color: outerColor,
            fillColor: outerColor,
            fillOpacity: outerOpacity * 0.85,
            weight: 0,
            interactive: false,
          });
          outerCircle.addTo(layerGroup);

          const coreCircle = L.circle([candidate.lat, candidate.lng], {
            radius: 1100,
            color: coreColor,
            fillColor: coreColor,
            fillOpacity: coreOpacity * 0.85,
            weight: 0,
            interactive: true,
          });

          coreCircle.bindTooltip(
            `<div style="font-family: sans-serif; font-size: 11px; line-height: 1.4;">
              <div style="font-weight: 700; color: #FFFFFF;">${candidate.name} (Candidate)</div>
              <div style="color: #94A3B8; font-size: 10px;">${candidate.emirate} • ${candidate.zoneType}</div>
              <div style="margin-top: 4px; font-weight: 700; color: ${
                count >= 18 ? "#FB7185" : count >= 10 ? "#FB923C" : count >= 5 ? "#FBBF24" : "#38BDF8"
              }; font-family: monospace;">
                ${count} competitors (${tierLabel})
              </div>
            </div>`,
            { sticky: true, className: "bg-[#0C182A] text-slate-200 border border-[#1D3452] shadow-xl rounded-md p-1.5" }
          );

          coreCircle.addTo(layerGroup);
        });
      }
    }

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

    // 3. Coverage Gap & "White Space" Opportunity Layer
    if (showCoverageGaps) {
      candidateEvals.forEach((item) => {
        const { candidate, classification, finalScore } = item;

        if (activeEmirate !== "All" && candidate.emirate !== activeEmirate) {
          return;
        }

        // Coverage gap criteria: high unmet demand (>=80), high affluence (>=80), outside immediate sister cannibalization threshold (>=3.0km)
        const isCoverageGap =
          candidate.unmetDemandIndex >= 80 &&
          candidate.affluenceScore >= 80 &&
          candidate.nearestBedashingDistanceKm >= 3.0;

        if (!isCoverageGap) return;

        // Primary Opportunity Catchment Aura (3,500m radius)
        const auraCircle = L.circle([candidate.lat, candidate.lng], {
          radius: 3500,
          color: "#06b6d4",
          fillColor: "#0891b2",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "6, 6",
          interactive: true,
        });

        // Inner Core of intense unmet demand (1,400m)
        const coreAura = L.circle([candidate.lat, candidate.lng], {
          radius: 1400,
          color: "#22d3ee",
          fillColor: "#06b6d4",
          fillOpacity: 0.20,
          weight: 1,
          interactive: false,
        });

        auraCircle.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px; line-height: 1.45;">
            <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 9999px; background: #22d3ee;"></span>
              <strong style="color: #FFFFFF; font-size: 12px;">Coverage Gap: ${candidate.name}</strong>
            </div>
            <div style="color: #94A3B8; font-size: 10px; margin-bottom: 5px;">${candidate.emirate} • ${candidate.zoneType}</div>
            <div style="font-family: monospace; font-size: 10px; color: #22d3ee; margin-bottom: 3px;">
              Unmet Demand: <strong>${candidate.unmetDemandIndex}/100</strong> • Affluence: <strong>${candidate.affluenceScore}/100</strong>
            </div>
            <div style="font-size: 10.5px; color: #CBD5E1; line-height: 1.5;">
              Network Gap: <strong style="color: #F8FAFC">${candidate.nearestBedashingDistanceKm} km</strong> from nearest sister branch<br/>
              Target Demographic: <strong style="color: #F8FAFC">${candidate.targetDemographicPopulation.toLocaleString()}</strong> residents<br/>
              Expected Capacity: <strong style="color: #F8FAFC">${candidate.expectedChairCapacity} chairs</strong><br/>
              Strategic Priority: <strong style="color: ${classification === "GROW" ? "#2DD4BF" : "#FBBF24"}">${classification} (${finalScore}/100)</strong>
            </div>
          </div>`,
          { sticky: true, className: "bg-[#0C182A] text-slate-200 border border-cyan-500/50 shadow-xl rounded-md p-2" }
        );

        auraCircle.addTo(layerGroup);
        coreAura.addTo(layerGroup);

        // Network Gap Reach Vector connecting candidate to nearest Bedashing branch
        const nearestSister = branchEvals.find((b) => b.branch.id === candidate.nearestBedashingBranchId);
        if (nearestSister) {
          const reachVector = L.polyline(
            [
              [candidate.lat, candidate.lng],
              [nearestSister.branch.lat, nearestSister.branch.lng],
            ],
            {
              color: "#06b6d4",
              weight: 1.5,
              dashArray: "3, 6",
              opacity: 0.65,
            }
          );

          reachVector.bindTooltip(
            `Coverage Gap: ${candidate.nearestBedashingDistanceKm} km unserved corridor from ${nearestSister.branch.name}`,
            { sticky: true, className: "bg-[#0C182A] text-cyan-300 font-mono text-[10px] border border-cyan-500/40 p-1" }
          );

          reachVector.addTo(layerGroup);
        }
      });
    }

    // 4. Expansion Candidate Areas
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
    showCompetitionHeatmap,
    showCoverageGaps,
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

  // Center map dynamically on the Center of Gravity of selected emirate/points
  const centerMapOnSelection = useCallback(
    (emirate: string) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (emirate === "All") {
        const allPoints: [number, number][] = [
          ...branchEvals.map((b) => [b.branch.lat, b.branch.lng] as [number, number]),
          ...candidateEvals.map((c) => [c.candidate.lat, c.candidate.lng] as [number, number]),
        ];
        if (allPoints.length > 0) {
          const bounds = L.latLngBounds(allPoints);
          map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 9, duration: 1.2 });
        } else {
          map.flyTo([24.4539, 54.6773], 8, { duration: 1.2 });
        }
        return;
      }

      // Collect all branches and candidates for the chosen emirate
      const emirateBranches = branchEvals
        .filter((b) => b.branch.emirate === emirate)
        .map((b) => ({ lat: b.branch.lat, lng: b.branch.lng }));

      const emirateCandidates = candidateEvals
        .filter((c) => c.candidate.emirate === emirate)
        .map((c) => ({ lat: c.candidate.lat, lng: c.candidate.lng }));

      const selectedPoints = [...emirateBranches, ...emirateCandidates];
      if (selectedPoints.length === 0) return;

      // 1. Compute Center of Gravity (arithmetic mean of geographic coordinates)
      const sumLat = selectedPoints.reduce((acc, p) => acc + p.lat, 0);
      const sumLng = selectedPoints.reduce((acc, p) => acc + p.lng, 0);
      const cogLat = sumLat / selectedPoints.length;
      const cogLng = sumLng / selectedPoints.length;

      // 2. Determine spatial spread from Center of Gravity to calibrate ideal zoom
      if (selectedPoints.length === 1) {
        // Single location (e.g. Fujairah City Centre or Manar Mall RAK)
        map.flyTo([cogLat, cogLng], 12.5, { duration: 1.2 });
      } else {
        // Multi-location emirate (e.g. Abu Dhabi, Dubai, Sharjah)
        let maxDeltaLat = 0;
        let maxDeltaLng = 0;

        selectedPoints.forEach((p) => {
          const dLat = Math.abs(p.lat - cogLat);
          const dLng = Math.abs(p.lng - cogLng);
          if (dLat > maxDeltaLat) maxDeltaLat = dLat;
          if (dLng > maxDeltaLng) maxDeltaLng = dLng;
        });

        // Calibrate symmetric bounds with comfortable visual margin
        const padLat = Math.max(maxDeltaLat * 1.25, 0.045);
        const padLng = Math.max(maxDeltaLng * 1.25, 0.045);

        const balancedBounds = L.latLngBounds([
          [cogLat - padLat, cogLng - padLng],
          [cogLat + padLat, cogLng + padLng],
        ]);

        map.flyToBounds(balancedBounds, {
          padding: [50, 50],
          maxZoom: 13,
          duration: 1.2,
        });
      }
    },
    [branchEvals, candidateEvals]
  );

  // Automatically center map on center of gravity whenever activeEmirate selection changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    centerMapOnSelection(activeEmirate);
  }, [activeEmirate, centerMapOnSelection]);

  const resetMapZoom = () => {
    setActiveEmirate("All");
    centerMapOnSelection("All");
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

        {/* Collapsed Map Layers Trigger Pill */}
        {!isPanelExpanded && (
          <div
            className={`absolute z-[1000] transition-all ${
              isFullScreen ? "top-4 left-4" : "top-3 left-3"
            }`}
          >
            <button
              onClick={() => setIsPanelExpanded(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#0C182A]/95 hover:bg-[#142842] text-slate-200 hover:text-white border border-[#1D3452] shadow-2xl text-xs font-semibold transition-all backdrop-blur-md group cursor-pointer"
              title="Expand Map Layers & Controls"
            >
              <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                Map Layers
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#142842] text-slate-300 font-mono border border-[#1D3452]">
                {activeEmirate === "All" ? "UAE (23)" : activeEmirate}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8BA2C1] group-hover:text-white transition-colors" />
            </button>
          </div>
        )}

        {/* Floating Map Controls & Legend - Expandable Panel */}
        {isPanelExpanded && (
          <div
            className={`absolute z-[1000] bg-[#0C182A]/95 backdrop-blur-md p-3 rounded-lg border border-[#1D3452] shadow-2xl max-w-xs text-xs space-y-2.5 text-slate-200 transition-all ${
              isFullScreen ? "top-4 left-4" : "top-3 left-3"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1D3452]">
              <div
                className="flex items-center space-x-1.5 cursor-pointer select-none group"
                onClick={() => setIsPanelExpanded(false)}
                title="Click to collapse panel"
              >
                <img src="/bedashing-icon.svg" alt="Bedashing Icon" className="h-3.5 w-auto" />
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest group-hover:text-cyan-200 transition-colors">
                  MAP LAYERS
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-mono border border-cyan-500/30">
                  {activeEmirate === "All" ? "UAE" : activeEmirate}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={resetMapZoom}
                  className="p-1 text-[#8BA2C1] hover:text-white rounded hover:bg-[#142842] transition-colors cursor-pointer"
                  title="Reset UAE Zoom (All Emirates)"
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
                <button
                  onClick={() => setIsPanelExpanded(false)}
                  className="p-1 text-[#8BA2C1] hover:text-white rounded hover:bg-[#142842] transition-colors cursor-pointer"
                  title="Hide / Collapse Map Layers Panel"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Emirate filter with Center of Gravity dynamic centering */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#8BA2C1] uppercase tracking-wider block">
                  Focus Emirate:
                </label>
                <span className="text-[9px] text-cyan-400 font-mono">
                  Auto-centers on gravity
                </span>
              </div>
              <select
                value={activeEmirate}
                onChange={(e) => setActiveEmirate(e.target.value)}
                className="w-full text-xs py-1 px-2 border border-[#1D3452] rounded bg-[#0A1424] text-slate-200 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
              >
                <option value="All">All Emirates (23 Branches • UAE Overview)</option>
                <option value="Abu Dhabi">Abu Dhabi (14 Branches)</option>
                <option value="Dubai">Dubai (5 Branches)</option>
                <option value="Sharjah">Sharjah (2 Branches)</option>
                <option value="Fujairah">Fujairah (1 Branch)</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah (1 Branch)</option>
              </select>

              {/* Quick-select interactive emirate chips */}
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: "All", label: "UAE" },
                    { id: "Abu Dhabi", label: "AD" },
                    { id: "Dubai", label: "DXB" },
                    { id: "Sharjah", label: "SHJ" },
                    { id: "Fujairah", label: "FUJ" },
                    { id: "Ras Al Khaimah", label: "RAK" },
                  ] as const
                ).map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => setActiveEmirate(em.id)}
                    className={`flex-1 py-0.5 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                      activeEmirate === em.id
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs"
                        : "bg-[#0A1424] text-[#8BA2C1] border-[#1D3452] hover:text-slate-200 hover:border-slate-500"
                    }`}
                    title={`Focus ${em.id} and center map on its center of gravity`}
                  >
                    {em.label}
                  </button>
                ))}
              </div>
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

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompetitionHeatmap}
                  onChange={(e) => setShowCompetitionHeatmap(e.target.checked)}
                  className="rounded-xs text-orange-500 bg-[#0A1424] border-[#1D3452] focus:ring-0"
                />
                <span className="text-slate-300 flex items-center justify-between w-full pr-1">
                  <span>Saturation Heatmap (Thermal)</span>
                  <span className="inline-block w-3.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-yellow-400 to-rose-500 shadow-xs"></span>
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCoverageGaps}
                  onChange={(e) => setShowCoverageGaps(e.target.checked)}
                  className="rounded-xs text-cyan-400 bg-[#0A1424] border-[#1D3452] focus:ring-0"
                />
                <span className="text-slate-300 flex items-center justify-between w-full pr-1">
                  <span>Coverage Gaps (White Spaces)</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-dashed border-cyan-400 bg-cyan-500/30"></span>
                </span>
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

              {showCoverageGaps && (
                <div className="pt-1.5 border-t border-[#1D3452]/70 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full border border-dashed border-cyan-400 bg-cyan-500/20"></span>
                    <span className="text-cyan-300 font-semibold text-[10px]">Unserved Coverage Gap</span>
                  </div>
                  <div className="text-[9px] text-[#8BA2C1] font-mono leading-tight pl-4">
                    Affluence ≥80 • Distance ≥3km • Unmet ≥80
                  </div>
                </div>
              )}

              {showCompetitionHeatmap && (
                <div className="pt-2 border-t border-[#1D3452] space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-[#8BA2C1] font-bold uppercase tracking-wider">
                    <span>Competition Saturation</span>
                    <span>Salons / 3km</span>
                  </div>
                  {/* Thermal Color Ramp Bar */}
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-cyan-400 via-yellow-400 via-orange-500 to-rose-600 shadow-inner" />
                  <div className="flex items-center justify-between text-[8px] font-mono text-[#8BA2C1]">
                    <span className="text-cyan-400 font-semibold">1–4 Low</span>
                    <span className="text-yellow-400 font-semibold">5–9</span>
                    <span className="text-orange-400 font-semibold">10–17</span>
                    <span className="text-rose-400 font-semibold">18+ Hyper</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Collapse Footer */}
            <div className="pt-1.5 border-t border-[#1D3452]/60 flex items-center justify-between text-[10px] text-[#8BA2C1]">
              <span className="text-[9px] font-mono opacity-80">6 Map Layers</span>
              <button
                onClick={() => setIsPanelExpanded(false)}
                className="inline-flex items-center space-x-1 text-[#8BA2C1] hover:text-cyan-300 transition-colors cursor-pointer"
                title="Hide / Collapse Menu"
              >
                <span>Hide Menu</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* High Density Status Pill in Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-[#0C182A]/90 border border-[#1D3452] px-2.5 py-1 rounded text-[10px] text-[#8BA2C1] shadow-md hidden sm:flex items-center gap-1.5 z-[1000] backdrop-blur-md">
          <img src="/bedashing-icon.svg" alt="Bedashing" className="h-3 w-auto opacity-70" />
          <span>UAE Dark Map | Saturation Heatmap &amp; Coverage Gaps</span>
        </div>
      </div>
    </div>
  );
};
