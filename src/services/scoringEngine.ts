import {
  Branch,
  CandidateArea,
  BranchScoringWeights,
  CandidateScoringWeights,
  ThresholdConfig,
  BranchEvaluation,
  CandidateEvaluation,
  NetworkSummary,
  Emirate,
  MarketSaturationTier,
} from "../types";

export const DEFAULT_BRANCH_WEIGHTS: BranchScoringWeights = {
  reputationWeight: 25,
  catchmentDemandWeight: 35,
  cannibalizationWeight: 20,
  competitionWeight: 20,
};

export const DEFAULT_CANDIDATE_WEIGHTS: CandidateScoringWeights = {
  unmetDemandWeight: 35,
  affluenceWeight: 25,
  retailGravityWeight: 20,
  cannibalizationRiskWeight: 20,
};

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  protectCutoff: 72,
  holdCutoff: 52,
  growCutoff: 76,
  watchCutoff: 56,
  sisterBufferKm: 4.0,
};

/**
 * Helper to determine market saturation tier and metadata based on competitor density
 */
export function getMarketSaturationInfo(competitors: number): {
  tier: MarketSaturationTier;
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
} {
  if (competitors >= 18) {
    return {
      tier: "Hyper-Saturated",
      label: "Hyper-Saturated",
      badgeClass: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      dotColor: "#FB7185",
      description: "Severe competitor density (18+ salons in 3km)",
    };
  } else if (competitors >= 10) {
    return {
      tier: "Saturated",
      label: "Saturated",
      badgeClass: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
      dotColor: "#FB923C",
      description: "High competitor density (10–17 salons in 3km)",
    };
  } else if (competitors >= 5) {
    return {
      tier: "Balanced",
      label: "Balanced",
      badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      dotColor: "#FBBF24",
      description: "Moderate commercial density (5–9 salons in 3km)",
    };
  } else {
    return {
      tier: "Monopolistic",
      label: "Monopolistic (Moat)",
      badgeClass: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
      dotColor: "#38BDF8",
      description: "Protected trade area / low competition (1–4 salons in 3km)",
    };
  }
}

/**
 * Deterministic evaluation for a Bedashing branch.
 * Generates exact scores, transparent formula traces, and explainable key drivers.
 */
export function evaluateBranch(
  branch: Branch,
  weights: BranchScoringWeights = DEFAULT_BRANCH_WEIGHTS,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): BranchEvaluation {
  // 1. Reputation Score (Rating 3.5 - 5.0 normalized + review volume factor)
  const normalizedRating = Math.max(0, Math.min(100, ((branch.googleRating - 3.5) / 1.5) * 100));
  const reviewFactor = Math.min(100, (branch.reviewCount / 1400) * 100);
  const reputationScore = Math.round(normalizedRating * 0.7 + reviewFactor * 0.3);

  // 2. Catchment Demand Score
  const demandScore = branch.catchmentAffluenceIndex;

  // 3. Cannibalization Score (Proximity to nearest sister branch; higher is safer/better)
  let cannibalizationScore = 100;
  if (branch.nearestSisterDistanceKm < 2.0) {
    cannibalizationScore = 25;
  } else if (branch.nearestSisterDistanceKm < 5.0) {
    cannibalizationScore = Math.round(25 + ((branch.nearestSisterDistanceKm - 2.0) / 3.0) * 75);
  } else {
    cannibalizationScore = 100;
  }

  // 4. Competition Resilience Score (fewer competitors or high reputation resilience)
  let competitionScore = 100;
  if (branch.competitorDensity3km <= 3) {
    competitionScore = 100;
  } else if (branch.competitorDensity3km >= 25) {
    competitionScore = 30;
  } else {
    competitionScore = Math.round(100 - ((branch.competitorDensity3km - 3) / 22) * 70);
  }

  const saturationInfo = getMarketSaturationInfo(branch.competitorDensity3km);

  // Weighted sum
  const totalWeight =
    weights.reputationWeight +
    weights.catchmentDemandWeight +
    weights.cannibalizationWeight +
    weights.competitionWeight;

  const rawWeighted =
    reputationScore * weights.reputationWeight +
    demandScore * weights.catchmentDemandWeight +
    cannibalizationScore * weights.cannibalizationWeight +
    competitionScore * weights.competitionWeight;

  const finalScore = Math.round(rawWeighted / (totalWeight || 1));

  // Classification
  let classification: "PROTECT" | "HOLD" | "SHRINK" = "HOLD";
  if (finalScore >= thresholds.protectCutoff) {
    classification = "PROTECT";
  } else if (finalScore < thresholds.holdCutoff) {
    classification = "SHRINK";
  }

  const cannibalizationWarning = branch.nearestSisterDistanceKm < thresholds.sisterBufferKm;

  // Audit formula string
  const auditFormula = `(${reputationScore} × ${weights.reputationWeight}% Rep) + (${demandScore} × ${weights.catchmentDemandWeight}% Dem) + (${cannibalizationScore} × ${weights.cannibalizationWeight}% Dist) + (${competitionScore} × ${weights.competitionWeight}% Comp) = ${finalScore}/100`;

  // Key drivers
  const keyDrivers: string[] = [];
  if (branch.googleRating >= 4.7) keyDrivers.push(`High reputation rating (${branch.googleRating}★)`);
  if (branch.catchmentAffluenceIndex >= 90) keyDrivers.push(`Affluent catchment (${branch.catchmentAffluenceIndex}/100)`);
  if (cannibalizationWarning) {
    keyDrivers.push(`Sister branch overlap (${branch.nearestSisterDistanceKm}km to nearest)`);
  }
  if (branch.competitorDensity3km >= 18) {
    keyDrivers.push(`High competitor density (${branch.competitorDensity3km} salons in 3km)`);
  }
  if (branch.footTrafficTier.includes("Ultra-High")) {
    keyDrivers.push(`Premier foot-traffic tier`);
  }

  return {
    branch,
    reputationScore,
    demandScore,
    cannibalizationScore,
    competitionScore,
    saturationTier: saturationInfo.tier,
    finalScore,
    classification,
    cannibalizationWarning,
    auditFormula,
    keyDrivers,
  };
}

/**
 * Deterministic evaluation for candidate expansion areas.
 */
export function evaluateCandidate(
  candidate: CandidateArea,
  weights: CandidateScoringWeights = DEFAULT_CANDIDATE_WEIGHTS,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): CandidateEvaluation {
  const demandScore = candidate.unmetDemandIndex;
  const affluenceScore = candidate.affluenceScore;
  const retailScore = candidate.retailGravityScore;

  // Cannibalization safety
  let cannibalizationSafetyScore = 100;
  if (candidate.nearestBedashingDistanceKm < 2.0) {
    cannibalizationSafetyScore = 20;
  } else if (candidate.nearestBedashingDistanceKm < 6.0) {
    cannibalizationSafetyScore = Math.round(
      20 + ((candidate.nearestBedashingDistanceKm - 2.0) / 4.0) * 80
    );
  } else {
    cannibalizationSafetyScore = 100;
  }

  const totalWeight =
    weights.unmetDemandWeight +
    weights.affluenceWeight +
    weights.retailGravityWeight +
    weights.cannibalizationRiskWeight;

  const rawWeighted =
    demandScore * weights.unmetDemandWeight +
    affluenceScore * weights.affluenceWeight +
    retailScore * weights.retailGravityWeight +
    cannibalizationSafetyScore * weights.cannibalizationRiskWeight;

  const finalScore = Math.round(rawWeighted / (totalWeight || 1));

  let classification: "GROW" | "WATCH" | "SKIP" = "WATCH";
  if (finalScore >= thresholds.growCutoff) {
    classification = "GROW";
  } else if (finalScore < thresholds.watchCutoff) {
    classification = "SKIP";
  }

  const cannibalizationRisk = candidate.nearestBedashingDistanceKm < thresholds.sisterBufferKm;

  const auditFormula = `(${demandScore} × ${weights.unmetDemandWeight}% Unmet) + (${affluenceScore} × ${weights.affluenceWeight}% Affl) + (${retailScore} × ${weights.retailGravityWeight}% Retail) + (${cannibalizationSafetyScore} × ${weights.cannibalizationRiskWeight}% Safe) = ${finalScore}/100`;

  let recommendationSummary = "";
  if (classification === "GROW") {
    recommendationSummary = `High priority pipeline target. Strong unmet demand (${demandScore}) with favorable network separation (${candidate.nearestBedashingDistanceKm}km).`;
  } else if (classification === "WATCH") {
    recommendationSummary = `Promising medium-term zone. Monitor retail anchor leasing and handover speed.`;
  } else {
    recommendationSummary = `Sub-optimal expansion target. Heavy competition or cannibalization risk with existing branch.`;
  }

  const saturationInfo = getMarketSaturationInfo(candidate.competitorCount);

  return {
    candidate,
    demandScore,
    affluenceScore,
    retailScore,
    cannibalizationSafetyScore,
    saturationTier: saturationInfo.tier,
    finalScore,
    classification,
    cannibalizationRisk,
    auditFormula,
    recommendationSummary,
  };
}

/**
 * Aggregates evaluations into network-wide executive metrics.
 */
export function calculateNetworkSummary(
  branchEvals: BranchEvaluation[],
  candidateEvals: CandidateEvaluation[]
): NetworkSummary {
  let protectCount = 0;
  let holdCount = 0;
  let shrinkCount = 0;
  let scoreSum = 0;
  let highRiskCannibalizedCount = 0;

  const saturationBreakdown = {
    monopolistic: 0,
    balanced: 0,
    saturated: 0,
    hyperSaturated: 0,
  };

  const emirates: Emirate[] = ["Abu Dhabi", "Dubai", "Sharjah", "Fujairah", "Ras Al Khaimah"];
  const emirateBreakdown: Record<Emirate, { total: number; protect: number; hold: number; shrink: number }> = {
    "Abu Dhabi": { total: 0, protect: 0, hold: 0, shrink: 0 },
    Dubai: { total: 0, protect: 0, hold: 0, shrink: 0 },
    Sharjah: { total: 0, protect: 0, hold: 0, shrink: 0 },
    Fujairah: { total: 0, protect: 0, hold: 0, shrink: 0 },
    "Ras Al Khaimah": { total: 0, protect: 0, hold: 0, shrink: 0 },
  };

  branchEvals.forEach((b) => {
    scoreSum += b.finalScore;
    if (b.classification === "PROTECT") protectCount++;
    if (b.classification === "HOLD") holdCount++;
    if (b.classification === "SHRINK") shrinkCount++;
    if (b.cannibalizationWarning) highRiskCannibalizedCount++;

    if (b.saturationTier === "Monopolistic") saturationBreakdown.monopolistic++;
    else if (b.saturationTier === "Balanced") saturationBreakdown.balanced++;
    else if (b.saturationTier === "Saturated") saturationBreakdown.saturated++;
    else if (b.saturationTier === "Hyper-Saturated") saturationBreakdown.hyperSaturated++;

    const em = b.branch.emirate;
    if (emirateBreakdown[em]) {
      emirateBreakdown[em].total++;
      if (b.classification === "PROTECT") emirateBreakdown[em].protect++;
      if (b.classification === "HOLD") emirateBreakdown[em].hold++;
      if (b.classification === "SHRINK") emirateBreakdown[em].shrink++;
    }
  });

  let growCount = 0;
  let watchCount = 0;
  let skipCount = 0;

  candidateEvals.forEach((c) => {
    if (c.classification === "GROW") growCount++;
    if (c.classification === "WATCH") watchCount++;
    if (c.classification === "SKIP") skipCount++;
  });

  return {
    totalBranches: branchEvals.length,
    protectCount,
    holdCount,
    shrinkCount,
    averageHealthScore: branchEvals.length ? Math.round(scoreSum / branchEvals.length) : 0,
    highRiskCannibalizedCount,
    totalCandidates: candidateEvals.length,
    growCount,
    watchCount,
    skipCount,
    emirateBreakdown,
    saturationBreakdown,
  };
}
