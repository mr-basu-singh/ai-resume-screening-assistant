import React, { useState, useEffect } from "react";
import { 
  JobAnalysisSession, 
  ResumeAnalysisResult, 
  SkillMatch, 
  SkillGap 
} from "./types";
import { 
  SAMPLE_JD, 
  SAMPLE_RESUME_BASE64, 
  SAMPLE_RESUME_FILENAME 
} from "./sampleData";
import JobDescriptionInput from "./components/JobDescriptionInput";
import ResumeUpload from "./components/ResumeUpload";
import SidebarHistory from "./components/SidebarHistory";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Brain, 
  UploadCloud, 
  Sparkles, 
  RotateCcw, 
  User, 
  FileText, 
  GraduationCap, 
  Check, 
  Trash2, 
  TrendingUp, 
  Layers, 
  ChevronRight,
  Menu,
  Award,
  AlertCircle,
  HelpCircle,
  FolderOpen
} from "lucide-react";

export default function App() {
  // Main states
  const [jobDescription, setJobDescription] = useState("");
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeFileSize, setResumeFileSize] = useState<string | null>(null);
  const [isAutofilled, setIsAutofilled] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<JobAnalysisSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aura_recruit_history_v1");
      if (stored) {
        const parsed = JSON.parse(stored) as JobAnalysisSession[];
        setHistory(parsed);
        if (parsed.length > 0) {
          // Select the latest session by default
          setActiveSessionId(parsed[0].id);
          // Seed values for state from the latest session
          setJobDescription(parsed[0].jobDescription);
          setResumeFileName(parsed[0].resumeFileName);
          setResumeFileSize("Cached payload");
          setResumeBase64("PAYLOAD_CACHED");
        }
      }
    } catch (e) {
      console.error("Failed to load local storage history", e);
    }
  }, []);

  // Save history to localStorage on change
  const saveHistory = (newHistory: JobAnalysisSession[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("aura_recruit_history_v1", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to write history to local storage", e);
    }
  };

  const handleAutoFill = () => {
    setJobDescription(SAMPLE_JD);
    setResumeBase64(SAMPLE_RESUME_BASE64);
    setResumeFileName(SAMPLE_RESUME_FILENAME);
    setResumeFileSize("1.3 KB (Demo PDF)");
    setIsAutofilled(true);
    setError(null);
  };

  const handleClearInputs = () => {
    setJobDescription("");
    setResumeBase64(null);
    setResumeFileName(null);
    setResumeFileSize(null);
    setIsAutofilled(false);
    setError(null);
  };

  const handleFileSelect = (base64: string, name: string, sizeStr: string) => {
    setResumeBase64(base64);
    setResumeFileName(name);
    setResumeFileSize(sizeStr);
    setIsAutofilled(false);
    setError(null);
  };

  const handleSelectSession = (id: string) => {
    const session = history.find(s => s.id === id);
    if (session) {
      setActiveSessionId(id);
      setJobDescription(session.jobDescription);
      setResumeFileName(session.resumeFileName);
      setResumeFileSize("Cached report");
      setResumeBase64("PAYLOAD_CACHED");
      setError(null);
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = history.filter(s => s.id !== id);
    saveHistory(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id);
      } else {
        setActiveSessionId(null);
        handleClearInputs();
      }
    }
  };

  const handleClearAllHistory = () => {
    saveHistory([]);
    setActiveSessionId(null);
    handleClearInputs();
  };

  const handleStartNew = () => {
    setActiveSessionId(null);
    handleClearInputs();
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste or write a Job Description (JD) to evaluate against.");
      return;
    }
    if (!resumeBase64) {
      setError("A PDF candidate resume must be selected or uploaded before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeFileBase64: resumeBase64 === "PAYLOAD_CACHED" && activeSessionId 
            // If viewing historic cache, find its base64, otherwise default to our demo or fallback
            ? (history.find(h => h.id === activeSessionId)?.resumeFileName === SAMPLE_RESUME_FILENAME ? SAMPLE_RESUME_BASE64 : SAMPLE_RESUME_BASE64)
            : resumeBase64,
          resumeFileName: resumeFileName || "resume.pdf",
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "API returned an unexpected status code.");
      }

      const report: ResumeAnalysisResult = data.result;

      // Add to session history
      const newSession: JobAnalysisSession = {
        id: "session_" + Date.now(),
        date: new Date().toISOString(),
        candidateName: report.candidateName || "Candidate Profile",
        jobTitle: report.jobTitle || "Evaluated Position",
        jobDescription,
        resumeFileName: resumeFileName || "candidate_resume.pdf",
        analysis: report
      };

      const updatedHistory = [newSession, ...history];
      saveHistory(updatedHistory);
      setActiveSessionId(newSession.id);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while analyzing the resume. Please check your credentials and network connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract currently viewed session
  const activeSession = history.find(s => s.id === activeSessionId);
  const activeAnalysis = activeSession?.analysis;

  // Custom colors based on Match Score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30";
    if (score >= 50) return "text-amber-400 border-amber-500/30";
    return "text-rose-400 border-rose-500/30";
  };

  // Badges styling
  const fitBadgeStyles = (status: string) => {
    switch (status) {
      case "Strong Fit":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Moderate Fit":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  const recBadgeStyles = (status: string) => {
    switch (status) {
      case "Recommended":
        return "bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-300 border-emerald-500/30";
      case "Consider with Reservations":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      default:
        return "bg-rose-500/15 text-rose-300 border-rose-500/35";
    }
  };

  const statusPillStyles = (status: string) => {
    switch (status) {
      case "Met":
      case "Exceeded":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Partially Met":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      
      {/* Immersive radial gradient decorations for Frosted Glass backdrop effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-14%] w-[60%] h-[50%] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[35%] h-[35%] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/65 backdrop-blur-md border-b border-white/5 py-3.5 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            id="toggle-sidebar-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 mr-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
            title="Toggle session directory"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded text-xs text-indigo-400 uppercase font-black tracking-wider animate-pulse">Enterprise AI</span>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                AuraRecruit <span className="text-indigo-400 font-extrabold font-mono">3.5</span>
              </h1>
            </div>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-black leading-none mt-1">
              Resume Match Intelligent Screening Console
            </p>
          </div>
        </div>

        {/* User context information */}
        <div className="flex items-center gap-3.5">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-100">Sarah Jenkins</p>
            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Lead HR Recruiter</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border border-indigo-300/20 flex items-center justify-center text-sm font-extrabold text-white shadow-inner">
            SJ
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Screening History Sidebar */}
        <SidebarHistory
          history={history}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onClearHistory={handleClearAllHistory}
          onStartNew={handleStartNew}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable Center-Right Stage */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
          
          {/* Diagnostic Warnings */}
          {error && (
            <div id="main-error-banner" className="bg-rose-950/40 backdrop-blur-md border border-rose-500/20 p-4 rounded-xl text-xs text-rose-300 flex items-start gap-3 shadow-xl">
              <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold block text-sm text-rose-200">Processing Interruption</span>
                <p className="mt-1 leading-relaxed opacity-90">{error}</p>
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={handleAutoFill}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 hover:text-white rounded text-[10px] font-bold border border-rose-500/30 transition-all uppercase"
                  >
                    Load Premium Demo Setup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Setup / Configuration Form Block */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Job Description card */}
            <JobDescriptionInput
              value={jobDescription}
              onChange={(txt) => {
                setJobDescription(txt);
                setError(null);
              }}
              onAutoFill={handleAutoFill}
            />

            {/* Resume Upload card */}
            <ResumeUpload
              fileName={resumeFileName}
              fileSize={resumeFileSize}
              isAutofilled={isAutofilled}
              onFileSelect={handleFileSelect}
              onClear={handleClearInputs}
            />
          </div>

          {/* MATCH AUDIT EXECUTION TRIGGER */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl relative z-10 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Perform Alignment Comparison</h3>
                <p className="text-xs text-slate-400">Our system automatically parses qualifications, gaps, projects, and degree levels.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end">
              {(jobDescription.length > 0 || resumeBase64) && (
                <button
                  id="btn-reset-workspace"
                  onClick={handleClearInputs}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 font-semibold text-xs border border-white/5 rounded-xl transition-all"
                >
                  Reset Workspace
                </button>
              )}
              
              <button
                id="btn-analyze-match"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/80 disabled:opacity-85 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Auditing Credentials...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 transition-transform group-hover:scale-125" />
                    Analyze Match
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SCREENING OUTPUT DASHBOARD REPORT */}
          {activeAnalysis ? (
            <div id="recommender-dashboard" className="space-y-6 transition-all duration-300 animate-fadeIn relative z-10">
              
              {/* Top Banner indicating candidate summary context */}
              <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider block">Candidate Evaluation Profile</span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">{activeAnalysis.candidateName}</h2>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <strong className="text-slate-100">{activeAnalysis.candidateTitle || "Industry Professional"}</strong>
                    <span className="text-slate-500">•</span>
                    <span>Targeting: <strong className="text-indigo-300">{activeAnalysis.jobTitle || "Role Requirement"}</strong></span>
                  </p>
                </div>
                
                {activeSession && (
                  <div className="text-slate-400 text-[10px] text-right shrink-0">
                    <p>Report ID: {activeSession.id}</p>
                    <p className="mt-0.5">Scanned on {new Date(activeSession.date).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Stats Highlight Ribbon (Row of cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* 1. Overall Match Score */}
                <div id="stat-match-score" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
                  <div className="relative shrink-0 flex items-center justify-center">
                    {/* Ring score container */}
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="4" fill="none" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        className="stroke-indigo-500" 
                        strokeWidth="5" 
                        fill="none" 
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - (activeAnalysis.matchScore || 0) / 100)}
                      />
                    </svg>
                    <span className="absolute text-base font-black text-white">{activeAnalysis.matchScore || 0}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest block">Overall Match Alignment</span>
                    <h3 className="text-base font-bold text-slate-100 leading-tight mt-0.5">Comprehensive Audit Rating</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Weighted assessment score.</p>
                  </div>
                </div>

                {/* 2. Candidate Fit Label */}
                <div id="stat-fit-status" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-white/5 flex items-center justify-center text-slate-200">
                    <Layers className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest block font-sans">Calculated Candidate Fit</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1.5 ${fitBadgeStyles(activeAnalysis.fitStatus)}`}>
                      {activeAnalysis.fitStatus}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">Prerequisite suitability matches.</p>
                  </div>
                </div>

                {/* 3. Hiring Recommendation */}
                <div id="stat-suitability-status" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-xl md:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-white/5 flex items-center justify-center text-emerald-400">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest block">Recruiter Suitability Recommendation</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1.5 ${recBadgeStyles(activeAnalysis.recommendation)}`}>
                      {activeAnalysis.recommendation}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">Audited recommendation decision.</p>
                  </div>
                </div>

              </div>

              {/* Skills Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto">
                
                {/* 4. Matching Skills (Col-span 7) */}
                <div id="card-matching-skills" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl lg:col-span-7 flex flex-col">
                  <div className="pb-3 mb-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Matching Skills Found in Resume ({activeAnalysis.matchingSkills?.length || 0})
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Valid Alignment
                    </span>
                  </div>

                  {(!activeAnalysis.matchingSkills || activeAnalysis.matchingSkills.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No exact technical or soft skills matches found between resume and job guidelines.</p>
                  ) : (
                    <div className="space-y-3.5 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
                      {activeAnalysis.matchingSkills.map((skill: SkillMatch, index: number) => (
                        <div 
                          key={index}
                          className="bg-slate-900/40 hover:bg-slate-900/80 p-3 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all flex items-start gap-2.5"
                        >
                          <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5 border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-100">{skill.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/15">
                                {skill.category || "Skill"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                              {skill.explanation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Missing Skills (Col-span 5) */}
                <div id="card-missing-skills" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl lg:col-span-5 flex flex-col">
                  <div className="pb-3 mb-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Missing Skills & Skill Gaps ({activeAnalysis.missingSkills?.length || 0})
                    </h3>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      Training Needs
                    </span>
                  </div>

                  {(!activeAnalysis.missingSkills || activeAnalysis.missingSkills.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">Excellent! No major requested skills appear to be missing from the candidate's profile.</p>
                  ) : (
                    <div className="space-y-3.5 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
                      {activeAnalysis.missingSkills.map((gap: SkillGap, index: number) => (
                        <div 
                          key={index} 
                          className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold text-xs text-slate-200">{gap.name}</span>
                            
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${
                              gap.importance === "Critical" 
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                : gap.importance === "Important"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}>
                              {gap.importance}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            <span className="text-amber-300 font-bold">Impact: </span>
                            {gap.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Experiential and Core Criteria breakdown section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                
                {/* 6, 7 & 8: Structural criteria evaluation */}
                <div id="card-requirements-analysis" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2">
                    Core Criteria Alignment Analysis
                  </h3>

                  {/* Experience analysis wrapper */}
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Experience Relevance Audit</span>
                      <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full border ${statusPillStyles(activeAnalysis.experienceAnalysis.status)}`}>
                        {activeAnalysis.experienceAnalysis.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Prerequisites Expected:</span>
                        <span className="text-slate-200 font-medium">{activeAnalysis.experienceAnalysis.required}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Candidate Profile Evidence:</span>
                        <span className="text-slate-200 font-medium">{activeAnalysis.experienceAnalysis.candidate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 pt-2 border-t border-white/5 leading-relaxed font-normal">
                      {activeAnalysis.experienceAnalysis.evaluation}
                    </p>
                  </div>

                  {/* Education analysis wrapper */}
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Academic Education & Certs</span>
                      <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full border ${statusPillStyles(activeAnalysis.educationAnalysis.status)}`}>
                        {activeAnalysis.educationAnalysis.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">JD Academic Profile:</span>
                        <span className="text-slate-200 font-medium">{activeAnalysis.educationAnalysis.required}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Candidate Degrees/Certs:</span>
                        <span className="text-slate-200 font-medium">{activeAnalysis.educationAnalysis.candidate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 pt-2 border-t border-white/5 leading-relaxed font-normal">
                      {activeAnalysis.educationAnalysis.evaluation}
                    </p>
                  </div>
                </div>

                {/* Project Portfolio and Strengths/Weaknesses summary */}
                <div id="card-strengths-weaknesses" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-5 col-span-1">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2">
                      Practical Projects & Portfolio Relevance
                    </h3>

                    <div className="mt-3.5 space-y-3">
                      {activeAnalysis.projectRelevance?.projectsReviewed?.map((proj: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-950/40 rounded-lg border border-white/5">
                          <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                            <FolderOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                            {proj.title}
                          </h4>
                          {proj.description && <p className="text-[10px] text-slate-400 mt-0.5">{proj.description}</p>}
                          <p className="text-[11px] text-slate-300 mt-2 font-light italic leading-normal">
                            "{proj.relevanceEvaluation}"
                          </p>
                        </div>
                      ))}

                      {activeAnalysis.projectRelevance?.overallRelevanceSummary && (
                        <p className="text-xs text-slate-400 mt-2 bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/20 leading-relaxed">
                          <strong className="text-indigo-300">Project Synthesis: </strong>
                          {activeAnalysis.projectRelevance.overallRelevanceSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="p-3.5 bg-slate-900/40 rounded-xl border border-white/5 border-l-4 border-l-emerald-500">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Top Strengths</span>
                      <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1.5 mt-2">
                        {activeAnalysis.strengths?.map((str: string, index: number) => (
                          <li key={index} className="leading-tight shrink-0">{str}</li>
                        )) || <span className="italic block mt-1">Found in audit</span>}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-slate-900/40 rounded-xl border border-white/5 border-l-4 border-l-amber-500">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block font-sans">Reservations / Gaps</span>
                      <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1.5 mt-2">
                        {activeAnalysis.weaknesses?.map((wk: string, index: number) => (
                          <li key={index} className="leading-tight shrink-0">{wk}</li>
                        )) || <span className="italic block mt-1">Analyzed gaps</span>}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>

              {/* 11. Final Recruiter Verdict / Summary Panel */}
              <div id="card-recruiter-summary" className="bg-gradient-to-r from-slate-900/90 via-indigo-950/10 to-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-2.5">
                  <Brain className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                  Strategic Hiring Assessment & Synopsis
                </h3>

                <p className="text-slate-200 text-xs italic font-medium leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 block">
                  "{activeAnalysis.finalRecruiterSummary}"
                </p>

                <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-2 text-[10px] text-slate-500 border-t border-white/5">
                  <span>Match rating verified via server-side Google Gemini 3.5 LLM.</span>
                  <span className="text-slate-400 font-bold">Confidential recruiting artifact • AuraRecruit Enterprise</span>
                </div>
              </div>

            </div>
          ) : (
            /* Empty state (No session is active) */
            <div id="dashboard-empty-state" className="text-center p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-4 animate-bounce" style={{ animationDuration: "3s" }}>
                <BrainsIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Active Screening Selected</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
                Fill the Job Description requirements panel, and select or drag-and-drop a candidate resume PDF on the left. Click <strong className="text-indigo-400">Analyze Match</strong> to initialize our automated AI match auditor.
              </p>

              {/* Direct call matching triggers */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  id="btn-empty-state-demo"
                  onClick={handleAutoFill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load Demo Data
                </button>
                {history.length > 0 && (
                  <button
                    id="btn-empty-state-latest"
                    onClick={() => handleSelectSession(history[0].id)}
                    className="px-4 py-2 bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all"
                  >
                    View Latest Report ({history[0].candidateName})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick instructions / Recruiter Checklist footer */}
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div>
              <h5 className="font-bold text-slate-200 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Multimodal PDF Parsing
              </h5>
              <p className="leading-relaxed text-[11px]">Directly uploads high fidelity PDF files safely into server memory for extraction.</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-200 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Gap Identification
              </h5>
              <p className="leading-relaxed text-[11px]">Computes missed keywords, important tool omissions, and projects that fall short.</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-200 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Local Cache System
              </h5>
              <p className="leading-relaxed text-[11px]">Safely stores all previously run matches in browser state, letting you switch back/forth.</p>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}

// Inline brain helper icon for layout cleanups
function BrainsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18a3.75 3.75 0 0 1-.495-7.467 5.99 5.99 0 0 1 1.925 3.546 5.974 5.974 0 0 0 2.133-1A3.75 3.75 0 0 1 12 18Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12a7.5 7.5 0 0 1 15 0c0 .991-.192 1.936-.541 2.802-.034.084-.078.165-.132.24l-1.07 1.488a.75.75 0 0 1-1.127.132l-.462-.462a.75.75 0 0 0-1.06 0l-.513.513a.75.75 0 0 1-1.127-.132l-1.07-1.488A12.029 12.029 0 0 1 12 15a8.97 8.97 0 0 1-4.041.97l-1.07 1.488a.75.75 0 0 1-1.127.132l-.462-.462a.75.75 0 0 0-1.06 0l-.513.513a.75.75 0 0 1-1.127-.132l-1.07-1.488C4.692 13.936 4.5 12.991 4.5 12Z"
      />
    </svg>
  );
}
