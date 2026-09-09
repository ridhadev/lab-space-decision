export type BranchClassification = "PROTECT" | "HOLD" | "SHRINK";
export type CandidateClassification = "GROW" | "WATCH" | "SKIP";
export type Emirate = "Abu Dhabi" | "Dubai" | "Sharjah" | "Fujairah" | "Ras Al Khaimah";

export interface Branch {
  id: string;
  name: string;
  emirate: Emirate;
  area: string;
  address: string;
  lat: number;
  lng: number;
  // Core Operational & Catchment Metrics
  googleRating: number; // e.g. 4.6 (out of 5.0)
  reviewCount: number; // e.g. 850
  footTrafficTier: "Ultra-High (Mall / Hub)" | "High (Urban Center)" | "Moderate (Residential Community)" | "Specialized (Airport / Resort)";
  catchmentAffluenceIndex: number; // 0 - 100 (Discretionary beauty budget in 3km)
  competitorDensity3km: number; // Number of competing salons in 3km
  nearestSisterBranchId: string;
  nearestSisterDistanceKm: number; // Distance in km to nearest Bedashing
  monthlyVisitorEstimate: number;
  chairCount: number;
  // Audit notes
  strategicNotes?: string;
}

export interface CandidateArea {
  id: string;
  name: string;
  emirate: Emirate;
  zoneType: "Super-Regional Mall" | "Affluent Waterfront" | "Emerging Master Community" | "Luxury Urban Center" | "Suburban Residential";
  lat: number;
  lng: number;
  // Catchment & Opportunity Metrics
  targetDemographicPopulation: number; // Female target demographic (18-55) in 5km
  affluenceScore: number; // 0 - 100
  retailGravityScore: number; // 0 - 100 (Mall anchor, parking, accessibility)
  unmetDemandIndex: number; // 0 - 100 (Spend potential vs current salon chairs)
  competitorCount: number;
  nearestBedashingBranchId: string;
  nearestBedashingDistanceKm: number; // Sister branch proximity
  expectedChairCapacity: number;
  notes: string;
}

export interface BranchScoringWeights {
  reputationWeight: number; // default: 25%
  catchmentDemandWeight: number; // default: 35%
  cannibalizationWeight: number; // default: 20%
  competitionWeight: number; // default: 20%
}

export interface CandidateScoringWeights {
  unmetDemandWeight: number; // default: 35%
  affluenceWeight: number; // default: 25%
  retailGravityWeight: number; // default: 20%
  cannibalizationRiskWeight: number; // default: 20%
}

export interface ThresholdConfig {
  // Branch thresholds
  protectCutoff: number; // default: 70
  holdCutoff: number; // default: 50 (below is SHRINK)
  // Candidate thresholds
  growCutoff: number; // default: 75
  watchCutoff: number; // default: 55 (below is SKIP)
  // Spatial Cannibalization distance warning
  sisterBufferKm: number; // default: 4.0 km
}

export interface BranchEvaluation {
  branch: Branch;
  reputationScore: number; // 0-100
  demandScore: number; // 0-100
  cannibalizationScore: number; // 0-100 (higher = safe / low cannibalization)
  competitionScore: number; // 0-100 (higher = resilient / favorable share)
  finalScore: number; // 0-100
  classification: BranchClassification;
  cannibalizationWarning: boolean;
  auditFormula: string;
  keyDrivers: string[];
}

export interface CandidateEvaluation {
  candidate: CandidateArea;
  demandScore: number;
  affluenceScore: number;
  retailScore: number;
  cannibalizationSafetyScore: number;
  finalScore: number;
  classification: CandidateClassification;
  cannibalizationRisk: boolean;
  auditFormula: string;
  recommendationSummary: string;
}

export interface NetworkSummary {
  totalBranches: number;
  protectCount: number;
  holdCount: number;
  shrinkCount: number;
  averageHealthScore: number;
  highRiskCannibalizedCount: number;
  totalCandidates: number;
  growCount: number;
  watchCount: number;
  skipCount: number;
  emirateBreakdown: Record<Emirate, { total: number; protect: number; hold: number; shrink: number }>;
}

export interface DriveResourceFile {
  name: string;
  description: string;
  category: "Client Brief" | "Specification" | "Data & Collectors" | "Approach";
  status: "Loaded in App" | "Synced from Drive";
  id?: string;
  size?: string;
}
