import React, { useEffect } from "react";
import {
  Map,
  BarChart3,
  Building2,
  TrendingUp,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface TourStep {
  id: string;
  title: string;
  category: string;
  targetViewLabel: string;
  description: string;
  keyFeatures: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeColor: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "spatial-map",
    title: "Interactive Geospatial Network Map",
    category: "Spatial Intelligence",
    targetViewLabel: "Map View",
    description:
      "Interactive CartoDB Dark Matter map displaying all 24 Bedashing lounges and 8 greenfield expansion candidates across the UAE. Toggle 3km catchment radii, competition saturation, and automated sister cannibalization overlap detection.",
    keyFeatures: [
      "24 Existing Lounges & 8 Candidate Growth Zones",
      "Competition Saturation Heatmap",
      "Sister Cannibalization & 3km Catchment Buffers",
      "Emirate Centroid Camera Quick-Jump (AD, DXB, SHJ, etc.)",
    ],
    icon: Map,
    accentColor: "from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "market-saturation",
    title: "Market Saturation & Portfolio Summary",
    category: "Portfolio Analytics",
    targetViewLabel: "Summary View",
    description:
      "Executive overview aggregating network health, capital distribution, and the 4-tier competitive saturation index: Monopolistic Moat (1–4), Balanced (5–9), Saturated (10–17), and Hyper-Saturated (18+).",
    keyFeatures: [
      "4-Tier Competitive Saturation Matrix",
      "Network Health Averages & Portfolio Exposure",
      "Emirate Footprint & Capacity Breakdown",
    ],
    icon: BarChart3,
    accentColor: "from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-400",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
  {
    id: "branches-evaluation",
    title: "Deterministic Branch Portfolio Evaluation",
    category: "Store Operations",
    targetViewLabel: "Branches View",
    description:
      "Auditable, mathematical evaluation classifying all 24 Bedashing salons into PROTECT (≥ 85), HOLD (70–84), or SHRINK (< 70) based on Google star reputation, trade area affluence, sister distance, and competitor moats.",
    keyFeatures: [
      "Real Google Ratings (4.1–4.8★) & Review Volumes",
      "Auditable Scoring Formula Breakdown",
      "Instant CSV Export & In-Situ Location Audits",
    ],
    icon: Building2,
    accentColor: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "growth-pipeline",
    title: "Growth Pipeline & Greenfield Expansion",
    category: "Capital Allocation",
    targetViewLabel: "Growth View",
    description:
      "Prioritizes white-space expansion across high-growth corridors (e.g., Dubai Hills, Saadiyat Cultural District) into GROW (≥ 80), WATCH (65–79), or SKIP (< 65) with projected chair capacities and unmet demand metrics.",
    keyFeatures: [
      "White-Space Prioritization in High-Growth Corridors",
      "Unmet Female Demographic Demand vs. Capacity",
      "CapEx Rollout Tiers & Projected Styling Chairs",
    ],
    icon: TrendingUp,
    accentColor: "from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-400",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  },
  {
    id: "sensitivity-modeling",
    title: "Dynamic What-If Sensitivity Modeling",
    category: "Sensitivity Engine",
    targetViewLabel: "Config Drawer",
    description:
      "Tune scoring weights and decision thresholds in real time using interactive sliders. Watch scores, classification counts, and network maps recalculate dynamically on client-side state with zero lag.",
    keyFeatures: [
      "Sliders for Branch & Growth Scoring Coefficients",
      "Custom Decision Cutoffs & Sister Buffer Radii",
      "Instant Network-Wide Recomputation & Revert",
    ],
    icon: Sliders,
    accentColor: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "ai-strategic-advisor",
    title: "Grounded AI Strategic Advisor & Board Memo",
    category: "Executive Intelligence",
    targetViewLabel: "Advisor Drawer",
    description:
      "Dual-path executive briefing engine powered by Google Gemini 3.8 Flash with a zero-downtime deterministic fallback. Ask conversational strategic questions, inspect localized store rationales, and generate formal Board Memoranda.",
    keyFeatures: [
      "Conversational Strategic Geospatial Q&A",
      "One-Click Formal Board of Directors Memorandum",
      "In-Situ Branch Rationales Cached in Local Storage",
    ],
    icon: Sparkles,
    accentColor: "from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-300",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onClose: () => void;
  onRestart: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  currentStepIndex,
  onStepChange,
  onClose,
  onRestart,
}) => {
  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;
  const StepIcon = currentStep.icon;

  // Keyboard navigation: Left/Right arrows, Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (currentStepIndex < totalSteps - 1) {
          onStepChange(currentStepIndex + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStepIndex > 0) {
          onStepChange(currentStepIndex - 1);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex, totalSteps, onStepChange, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[440px] max-w-[calc(100vw-32px)] shadow-2xl rounded-2xl overflow-hidden bg-[#0A1526]/95 backdrop-blur-md border border-[#23426A] text-slate-200"
        role="dialog"
        aria-label="Guided Tour"
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500" />

        <div className="p-4 sm:p-5">
          {/* Header Row: Icon, Step info, Category Badge & Close Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-br ${currentStep.accentColor}`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400">
                    Step {currentStepIndex + 1} of {totalSteps}
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${currentStep.badgeColor}`}
                  >
                    {currentStep.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8BA2C1] mt-0.5">
                  <span>Current View:</span>
                  <span className="inline-flex items-center gap-1 text-white font-medium bg-[#142842] px-1.5 py-0.5 rounded text-[10px] border border-[#1D3452]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {currentStep.targetViewLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Close / Hide Tour Button */}
            <button
              type="button"
              onClick={onClose}
              title="Hide tour (can be reopened anytime)"
              className="p-1.5 rounded-lg text-[#8BA2C1] hover:text-white hover:bg-[#142842] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Description */}
          <div className="mt-3.5">
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {currentStep.title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Key Capabilities Checklist */}
          <div className="mt-3.5 bg-[#060D18]/80 rounded-xl p-2.5 border border-[#162A45] space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-[#6E8BAE] uppercase tracking-wider block">
              Core Capabilities Highlighted:
            </span>
            {currentStep.keyFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>

          {/* Step Progression Indicators (Clickable Dots) */}
          <div className="mt-4 flex items-center justify-between gap-1 pt-2 border-t border-[#1D3452]">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange(idx)}
                  title={`Jump to: ${step.title}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    idx === currentStepIndex
                      ? "w-6 h-2 bg-cyan-400"
                      : "w-2 h-2 bg-[#1E395F] hover:bg-[#345B91]"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStepChange(currentStepIndex - 1)}
                disabled={currentStepIndex === 0}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  currentStepIndex === 0
                    ? "text-slate-600 cursor-not-allowed"
                    : "text-slate-300 hover:text-white hover:bg-[#142842] cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {currentStepIndex < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={() => onStepChange(currentStepIndex + 1)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <span>Finish Tour</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom dismiss helper */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#718DAF]">
            <button
              type="button"
              onClick={onClose}
              className="hover:text-slate-300 underline underline-offset-2 cursor-pointer transition-colors"
            >
              Hide guided tour
            </button>
            <span className="text-[9px] text-[#557193]">
              Use ← and → keys to browse
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
