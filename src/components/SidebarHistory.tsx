import React, { useState } from "react";
import { JobAnalysisSession } from "../types";
import { 
  History, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  User, 
  Briefcase, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface SidebarHistoryProps {
  history: JobAnalysisSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  onStartNew: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SidebarHistory({
  history,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearHistory,
  onStartNew,
  isOpen,
  onToggle,
}: SidebarHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(
    (s) =>
      s.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  const scoreBadgeColors = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        />
      )}

      <div
        id="sidebar-container"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-80 bg-slate-900 border-r border-slate-800 text-slate-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-base text-white tracking-tight">Screening History</h2>
          </div>
          <button 
            onClick={onToggle}
            className="lg:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: Create New Scan */}
        <div className="p-3 border-b border-slate-800">
          <button
            id="btn-sidebar-new-scan"
            onClick={() => {
              onStartNew();
              if (window.innerWidth < 1024) onToggle();
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            New Screening Audit
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              id="search-history-input"
              type="text"
              placeholder="Search candidate / position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 text-slate-100 placeholder-slate-500 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 mt-4">
              <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs">No matching audits found.</p>
              {history.length > 0 && <p className="text-[10px] text-slate-600 mt-1">Try adjusting your keyword filter.</p>}
            </div>
          ) : (
            filteredHistory.map((session) => {
              const isActive = session.id === activeSessionId;
              const result = session.analysis;
              return (
                <div
                  id={`history-item-${session.id}`}
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`group relative flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? "bg-slate-800/80 border-indigo-500/50 shadow-inner"
                      : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-xs text-white truncate">
                        {session.candidateName || "Unknown Candidate"}
                      </span>
                    </div>
                    
                    {/* Score badge */}
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border shrink-0 ${scoreBadgeColors(result.matchScore)}`}>
                      {result.matchScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 truncate">
                    <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{session.jobTitle || "Role Match"}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-900/60">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-2.5 h-2.5 shrink-0" />
                      <span>{formatDate(session.date)}</span>
                    </div>

                    <button
                      id={`btn-delete-history-${session.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete the screening report for ${session.candidateName}?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-all shrink-0"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Clear All */}
        {history.length > 0 && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/60">
            <button
              id="btn-sidebar-clear-all"
              onClick={() => {
                if (confirm("Are you sure you want to clear your entire candidate screening history? This action cannot be undone.")) {
                  onClearHistory();
                }
              }}
              className="flex items-center justify-center gap-1.5 w-full py-2 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 font-medium text-xs rounded transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wipe Screening History ({history.length})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
