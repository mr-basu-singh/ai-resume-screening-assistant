import React, { useRef, useState } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface ResumeUploadProps {
  fileName: string | null;
  fileSize: string | null;
  isAutofilled: boolean;
  onFileSelect: (base64: string, name: string, sizeStr: string) => void;
  onClear: () => void;
}

export default function ResumeUpload({
  fileName,
  fileSize,
  isAutofilled,
  onFileSelect,
  onClear,
}: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processFile = (file: File) => {
    setErrorLocal(null);

    if (file.type !== "application/pdf") {
      setErrorLocal("Currently, only PDF candidate resumes are officially supported. Please upload a standard PDF.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorLocal("The selected file exceeds our size threshold (15MB). Please upload a smaller PDF resume.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Extract base64 payload from raw DataURL stream
        const base64Data = reader.result.split(",")[1];
        if (base64Data) {
          onFileSelect(base64Data, file.name, formatBytes(file.size));
        } else {
          setErrorLocal("An unexpected error occurred while reading the PDF payload.");
        }
      }
    };
    reader.onerror = () => {
      setErrorLocal("Failed to parse this file. Ensure it is not password-protected or corrupted.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="resume-upload-card" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full min-h-[380px]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm tracking-tight">Candidate Resume</h3>
            <p className="text-slate-400 text-[10px]">Select candidate profile payload</p>
          </div>
        </div>
      </div>

      <input
        id="resume-file-picker"
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex-1 flex flex-col justify-center">
        {fileName ? (
          /* File Selected state */
          <div 
            id="file-uploaded-view"
            className={`border-2 border-dashed rounded-lg p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center transition-all ${
              isAutofilled ? "border-amber-300" : "border-emerald-300"
            }`}
          >
            <div className={`p-4 rounded-full mb-3 ${
              isAutofilled ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              <File className="w-10 h-10" />
            </div>

            <h4 className="font-semibold text-slate-800 text-xs break-all max-w-xs">{fileName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-500 font-medium">{fileSize || "Size unknown"}</span>
              <span className="text-slate-300">•</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isAutofilled ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {isAutofilled ? "Auto-Filled Sample PDF" : "Uploaded PDF"}
              </span>
            </div>

            <p className="text-[11px] text-emerald-600 font-medium mt-3 flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
               Payload loaded successfully
            </p>

            <button
              id="btn-remove-resume"
              onClick={onClear}
              className="mt-5 px-3 py-1.5 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-all flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              Replace Resume PDF
            </button>
          </div>
        ) : (
          /* Dropzone state */
          <div
            id="dropzone-area"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerBrowse}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50/45"
                : "border-slate-200 hover:border-indigo-400 bg-slate-50/30 hover:bg-slate-50/70"
            }`}
          >
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm mb-3 text-slate-500 group-hover:text-indigo-600">
              <UploadCloud className="w-8 h-8 text-indigo-500" />
            </div>

            <h4 className="font-semibold text-slate-800 text-xs">Drag & drop candidate resume here</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              or <span className="text-indigo-600 font-bold hover:underline">browse files</span> on your computer
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100/80 w-full max-w-[200px]">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">SUPPORTED FORMAT</span>
              <span className="text-[11px] text-slate-600 font-bold mt-0.5 inline-block">PDF documents only</span>
            </div>
          </div>
        )}

        {errorLocal && (
          <div id="upload-error-banner" className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorLocal}</span>
          </div>
        )}
      </div>
    </div>
  );
}
