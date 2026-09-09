import { DriveResourceFile } from "../types";

export const DRIVE_RESOURCES: DriveResourceFile[] = [
  {
    name: "README.md",
    description: "Master GitHub Quick Start guide, business context, local installation steps, and API key configurations.",
    category: "Specification",
    status: "Loaded in App",
    id: "doc-00",
    size: "9 KB",
  },
  {
    name: "ai-case-study.docx",
    description: "The original client brief and source of truth for all requirements, strategic network goals, and evaluation criteria.",
    category: "Client Brief",
    status: "Loaded in App",
    id: "doc-01",
    size: "48 KB",
  },
  {
    name: "FUNCTIONAL_SPEC.md",
    description: "Defines requirements FR-1 through FR-11, non-functional requirements NFR-1 to NFR-10, priorities, edge cases, and definition of done.",
    category: "Specification",
    status: "Loaded in App",
    id: "doc-02",
    size: "34 KB",
  },
  {
    name: "APPROACH.md",
    description: "Business framing, lexicon with numeric thresholds, scoring formulas, classification rules, AI layer design, and traceability table.",
    category: "Approach",
    status: "Loaded in App",
    id: "doc-03",
    size: "42 KB",
  },
  {
    name: "IMPLEMENTATION_SPEC.md",
    description: "How to build it: stack, repository layout, hard architectural rules, file schemas, and 8 development phases with acceptance criteria.",
    category: "Specification",
    status: "Loaded in App",
    id: "doc-04",
    size: "38 KB",
  },
  {
    name: "branches_raw.csv",
    description: "All 23 Bedashing branches with exact coordinates, emirate allocations, and base spatial attributes extracted.",
    category: "Data & Collectors",
    status: "Loaded in App",
    id: "doc-05",
    size: "8 KB",
  },
  {
    name: "01_branches.py",
    description: "Working Python collector for fetching, cleaning, and verifying the Bedashing branch geospatial and attribute feed.",
    category: "Data & Collectors",
    status: "Loaded in App",
    id: "doc-06",
    size: "6 KB",
  },
];

export const METHODOLOGY_NOTES = {
  precedence: [
    "1. ai-case-study.docx wins on requirements.",
    "2. FUNCTIONAL_SPEC.md wins on behaviour (what the app does).",
    "3. APPROACH.md wins on definitions, formulas, and numeric thresholds.",
    "4. IMPLEMENTATION_SPEC.md wins on structure, layout, and phase order."
  ],
  classifications: {
    branches: [
      { code: "PROTECT", label: "Protect", color: "emerald", desc: "Defend moat, invest in premium upgrades, protect high-yield market position." },
      { code: "HOLD", label: "Hold", color: "amber", desc: "Maintain current capacity, monitor unit economics, steady-state operations." },
      { code: "SHRINK", label: "Shrink", color: "rose", desc: "Downsize chairs, renegotiate lease, or consolidate due to cannibalization or weak unit margin." }
    ],
    candidates: [
      { code: "GROW", label: "Grow", color: "emerald", desc: "Immediate priority expansion pipeline; underserved high-affluence catchment." },
      { code: "WATCH", label: "Watch", color: "amber", desc: "Promising future potential; monitor handover, foot traffic, and lease openings." },
      { code: "SKIP", label: "Skip", color: "slate", desc: "Saturated competitive landscape or severe sister network cannibalization." }
    ]
  }
};
