/**
 * Decision Space - Runtime AI Recommendation Storage Service
 * Persists grounded AI deep-dive rationales per branch and candidate in browser LocalStorage.
 */

export interface CachedAiRationale {
  text: string;
  generatedAt: string; // ISO 8601 string
}

const STORAGE_PREFIX = "decisionspace_ai_rationale_";

export const getStoredAiRationale = (subjectKey: string | null): CachedAiRationale | null => {
  if (!subjectKey || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${subjectKey}`);
    if (!raw) return null;
    
    // Support either structured JSON or legacy plain string
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.text === "string") {
        return {
          text: parsed.text,
          generatedAt: parsed.generatedAt || new Date().toISOString(),
        };
      }
    } catch {
      return {
        text: raw,
        generatedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.warn("[aiStorage] Error reading cached AI rationale:", err);
    return null;
  }
};

export const setStoredAiRationale = (subjectKey: string | null, text: string): void => {
  if (!subjectKey || typeof window === "undefined") return;
  try {
    const payload: CachedAiRationale = {
      text,
      generatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${subjectKey}`, JSON.stringify(payload));
  } catch (err) {
    console.warn("[aiStorage] Error saving AI rationale to localStorage:", err);
  }
};

export const removeStoredAiRationale = (subjectKey: string | null): void => {
  if (!subjectKey || typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${subjectKey}`);
  } catch (err) {
    console.warn("[aiStorage] Error removing AI rationale from localStorage:", err);
  }
};
