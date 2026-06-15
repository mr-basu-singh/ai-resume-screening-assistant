import React from "react";
import { SAMPLE_JD } from "../sampleData";
import { FileText, Sparkles, RefreshCcw } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  onAutoFill: () => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
  onAutoFill,
}: JobDescriptionInputProps) {
  const charactersCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div id="jd-input-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full min-h-[380px]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm tracking-tight">Job Description (JD)</h3>
            <p className="text-slate-400 text-[10px]">Paste specifications & requirements</p>
          </div>
        </div>

        <button
          id="btn-autofill-sample-jd"
          type="button"
          onClick={onAutoFill}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-medium text-xs rounded-lg shadow-sm transition-all"
          title="Autofill a premium sample job description and resume to test the tool instantly"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          Autofill Sample Data
        </button>
      </div>

      <div className="flex-1 min-h-[180px] relative">
        <textarea
          id="job-description-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste full job details here... Include mandatory stack (e.g. React, Node.js), expected professional tenure, degree fields, certifications, and high-level role responsibilities to enable precise matching."
          className="w-full h-full min-h-[180px] p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 text-xs rounded-lg transition-all focus:outline-none resize-none leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>Words: <strong>{wordCount}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Characters: <strong>{charactersCount}</strong></span>
        </div>
        {value.length > 50 && (
          <button
            id="btn-clear-jd-input"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-semibold"
          >
            Clear Text
          </button>
        )}
      </div>
    </div>
  );
}
