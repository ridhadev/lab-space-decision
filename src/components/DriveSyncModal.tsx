import React, { useState } from "react";
import { DRIVE_RESOURCES, METHODOLOGY_NOTES } from "../data/specs";
import { googleSignIn, logout, getAccessToken } from "../services/firebaseAuth";
import { User } from "firebase/auth";
import {
  FolderSync,
  X,
  FileText,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [, setRemoteFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("FUNCTIONAL_SPEC.md");

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSyncStatus(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setSyncStatus("Google Account connected. Ready to fetch live Drive resources.");
        fetchDriveFiles(res.accessToken);
      }
    } catch (err: any) {
      setSyncStatus(`Sign-in note: ${err.message || "OAuth prompt closed."}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const fetchDriveFiles = async (token: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/drive/resources", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRemoteFiles(data.files || []);
        setSyncStatus(`Successfully synced ${data.files?.length || 0} files from Google Drive.`);
      } else {
        const data = await res.json();
        setSyncStatus(`Drive notice: ${data.error || "Could not list remote folder"}`);
      }
    } catch (err: any) {
      setSyncStatus(`Drive fetch notice: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setRemoteFiles([]);
    setSyncStatus("Signed out.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#161B22] rounded-lg border border-slate-700 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-700 bg-[#1C2128] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">
              <FolderSync className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white uppercase">
                GOOGLE DRIVE SPECIFICATIONS & RESOURCE SYNC
              </h2>
              <p className="text-[11px] text-slate-400">
                Connected Folder ID: <code className="text-[10px] font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-300 border border-slate-700">1fjPVxav6Zp-I9U0sPh1uHVEgqJwXt-cA</code>
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

        {/* OAuth Authentication Bar */}
        <div className="p-3 border-b border-slate-700 bg-indigo-950/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div>
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">
                  Connected as {currentUser.displayName || currentUser.email}
                </span>
                <span className="text-slate-600">•</span>
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-rose-400 font-medium inline-flex items-center space-x-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">
                <span>Sign in with your authorized Google account to sync live changes from Drive.</span>
              </div>
            )}
          </div>

          <div>
            {!currentUser ? (
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1 font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? "Connecting..." : "Sign in with Google"}</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  const token = await getAccessToken();
                  if (token) fetchDriveFiles(token);
                }}
                disabled={isSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs border border-indigo-500 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Drive Folder"}</span>
              </button>
            )}
          </div>
        </div>

        {syncStatus && (
          <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-700 text-xs text-slate-300 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Content: Precedence Rules & The 6 Files */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Precedence Banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Mandatory Source Precedence Hierarchy:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-amber-200/90 font-mono">
              {METHODOLOGY_NOTES.precedence.map((rule, idx) => (
                <div key={idx} className="flex items-start space-x-1">
                  <span>•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div>
            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">
              All 6 Reference Resources (Loaded into Decision Space Memory):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DRIVE_RESOURCES.map((file) => (
                <div
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  className={`p-2.5 rounded border transition-all cursor-pointer ${
                    selectedFile === file.name
                      ? "border-indigo-500 bg-indigo-950/40 shadow-xs"
                      : "border-slate-700 bg-slate-900/90 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{file.name}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {file.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {file.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{file.status}</span>
                    </span>
                    <span>{file.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected File Details */}
          <div className="p-3 bg-black/60 text-slate-200 rounded border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between font-sans text-xs text-indigo-400 font-bold">
              <span>Resource Audit View: {selectedFile}</span>
              <span className="text-slate-500 font-mono text-[10px]">Embedded in App Memory</span>
            </div>
            <div className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
              {selectedFile === "ai-case-study.docx" && (
                <div>
                  <strong>Client Brief:</strong> Bedashing is a premier UAE beauty lounge network with 23 branches. Executive leadership requires a deterministic decision-support model to classify existing branches into PROTECT, HOLD, or SHRINK, and evaluate new expansion candidate areas into GROW, WATCH, or SKIP. Public reputation, demographic affluence, and spatial competition govern the model.
                </div>
              )}
              {selectedFile === "FUNCTIONAL_SPEC.md" && (
                <div>
                  <strong>Functional Specification:</strong> Defines FR-1 to FR-11 (deterministic branch scoring, candidate evaluation, interactive weight adjustment, GIS map visualization, buffer circles, cannibalization vector alerts, grounded LLM explanations, board memo export) and NFR-1 to NFR-10 (strict grounding, no LLM scoring calculations, sub-second recalculation).
                </div>
              )}
              {selectedFile === "APPROACH.md" && (
                <div>
                  <strong>Approach & Lexicon:</strong> Four scoring dimensions: Reputation (Google rating & volume), Catchment Demand (discretionary beauty spend), Cannibalization (distance to nearest sister branch &lt;4km penalty), and Competition Density. Precedence rules and deterministic formula transparency ensure zero black-box scoring.
                </div>
              )}
              {selectedFile === "IMPLEMENTATION_SPEC.md" && (
                <div>
                  <strong>Implementation Architecture:</strong> Full-stack Express + Vite architecture with secure server-side Gemini API grounding, Leaflet geospatial visualization, and client-side Google OAuth Workspace integration for Drive synchronization.
                </div>
              )}
              {selectedFile === "branches_raw.csv" && (
                <div>
                  <strong>Branch Dataset:</strong> 23 branches extracted across 5 Emirates: 14 in Abu Dhabi, 5 in Dubai, 2 in Sharjah, 1 in Fujairah, 1 in Ras Al Khaimah with exact latitudes, longitudes, addresses, and ratings.
                </div>
              )}
              {selectedFile === "01_branches.py" && (
                <div>
                  <strong>Collector Script:</strong> Python collector parsing Bedashing store locations, calculating Haversine nearest-sister distances, and exporting verified coordinates.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-[#1C2128] flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            Source precedence is automatically enforced in scoring algorithms.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold rounded bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
