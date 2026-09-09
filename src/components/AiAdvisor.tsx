import React, { useState } from "react";
import {
  BranchEvaluation,
  CandidateEvaluation,
  BranchScoringWeights,
  NetworkSummary,
} from "../types";
import {
  Bot,
  Send,
  Copy,
  Check,
  X,
} from "lucide-react";

interface AiAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  branchEvals: BranchEvaluation[];
  candidateEvals: CandidateEvaluation[];
  summary: NetworkSummary;
  branchWeights: BranchScoringWeights;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  isOpen,
  onClose,
  branchEvals,
  candidateEvals,
  summary,
  branchWeights,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome to Decision Space AI Advisor. I am grounded strictly in your deterministic scoring model (${summary.totalBranches} Bedashing branches, ${summary.protectCount} PROTECT, ${summary.holdCount} HOLD, ${summary.shrinkCount} SHRINK).

Ask me any strategic question, or select a suggested prompt below to analyze network trade-offs.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    "Why is Al Wasl Jumeirah classified as SHRINK?",
    "Analyze cannibalization between West Yas and Noya Plaza",
    "What are our top 3 GROW expansion zones?",
    "Which Abu Dhabi branches have the highest competitive pressure?",
    "Synthesize the portfolio: capital allocation for PROTECT branches",
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setIsLoading(true);

    try {
      const contextData = {
        summary,
        weights: branchWeights,
        keyBranches: branchEvals.map((b) => ({
          name: b.branch.name,
          emirate: b.branch.emirate,
          score: b.finalScore,
          decision: b.classification,
          sisterDistKm: b.branch.nearestSisterDistanceKm,
          rating: b.branch.googleRating,
          reviews: b.branch.reviewCount,
          competitors: b.branch.competitorDensity3km,
          affluence: b.branch.catchmentAffluenceIndex,
          cannibalizationWarning: b.cannibalizationWarning,
        })),
        candidates: candidateEvals.map((c) => ({
          name: c.candidate.name,
          emirate: c.candidate.emirate,
          score: c.finalScore,
          decision: c.classification,
          unmetDemand: c.demandScore,
          sisterDistKm: c.candidate.nearestBedashingDistanceKm,
        })),
      };

      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          subjectType: "network",
          subjectData: contextData,
          modelContext: { summary, activeWeights: branchWeights },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content: data.explanation || "No response generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: "assistant",
        content: `Error generating explanation: ${err.message}. Please verify the Gemini API configuration.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-2xl max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-700 bg-[#1C2128] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold tracking-tight text-white uppercase">
                  DECISION SPACE AI ADVISOR
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Grounded in Deterministic Model
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Explains results and tactical tradeoffs. Never computes or overrides numbers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-700 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0 text-[10px] uppercase tracking-wider">Quick Queries:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0F1115] text-xs">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-500 px-1 font-mono">
                  <span>{isUser ? "Leadership" : "Decision Space AI"}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`relative max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-[#161B22] text-slate-200 border border-slate-700 shadow-sm rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(m.content, idx)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-indigo-400 text-xs py-2 px-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
              <span>Consulting grounded deterministic numbers via Gemini...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-700 bg-[#1C2128]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about branch classifications, cannibalization or expansion..."
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
