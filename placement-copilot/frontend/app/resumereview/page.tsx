"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

interface FeedbackData {
  what: string;
  how: string;
  impact: string;
  score: number;
  suggestions: string[];
}

export default function ResumeReview() {
  const [resumeText, setResumeText] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [feedback,   setFeedback]   = useState<FeedbackData | null>(null);
  const [fileName,   setFileName]   = useState("");
  const [dragActive, setDragActive] = useState(false);

  const loadPdfJs = (): Promise<any> =>
    new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) { resolve((window as any).pdfjsLib); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
        resolve((window as any).pdfjsLib);
      };
      script.onerror = () => reject(new Error("Failed to load PDF extraction helper"));
      document.head.appendChild(script);
    });

  const loadMammoth = (): Promise<any> =>
    new Promise((resolve, reject) => {
      if ((window as any).mammoth) { resolve((window as any).mammoth); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
      script.onload = () => resolve((window as any).mammoth);
      script.onerror = () => reject(new Error("Failed to load DOCX extraction helper"));
      document.head.appendChild(script);
    });

  const handleFileUpload = async (file: File) => {
    setError(""); setFileName(file.name); setLoading(true);
    try {
      const fileType = file.name.split(".").pop()?.toLowerCase();
      let extractedText = "";
      if (fileType === "txt") {
        const reader = new FileReader();
        extractedText = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string || "");
          reader.onerror = () => reject(new Error("Failed to read TXT file"));
          reader.readAsText(file);
        });
      } else if (fileType === "pdf") {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        extractedText = text;
      } else if (fileType === "docx") {
        const mammoth = await loadMammoth();
        const arrayBuffer = await file.arrayBuffer();
        extractedText = (await mammoth.extractRawText({ arrayBuffer })).value;
      } else {
        throw new Error("Unsupported file format. Please upload .txt, .pdf, or .docx");
      }
      if (!extractedText.trim()) throw new Error("Could not extract any text from the file.");
      setResumeText(extractedText);
    } catch (err: any) {
      setError(err.message || "Failed to extract text from file.");
      setFileName("");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) await handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) await handleFileUpload(e.target.files[0]);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) { setError("Please upload a file or paste your resume text to begin."); return; }
    setLoading(true); setError(""); setFeedback(null);
    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Resume analysis failed");
      setFeedback(data.feedback);
    } catch (err: any) {
      setError(err.message || "An error occurred during resume analysis.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => { setFileName(""); setResumeText(""); };

  // 2 * PI * 58 ≈ 364.4
  const strokeDashoffset = feedback ? 364.4 * (1 - feedback.score / 100) : 364.4;

  return (
    <Sidebar>
      {/* ── Page Header ── */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>Dashboard</span>
          <span className="material-symbols-outlined text-sm" style={{ color: "#94A3B8" }}>chevron_right</span>
          <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>Resume Review</span>
        </div>
        <h2 className="font-extrabold text-3xl mb-1" style={{ color: "#1F2937" }}>Resume Optimizer Lab</h2>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Upload your resume to check ATS alignment and receive high-impact recommendations.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-fade-in-up"
          style={{ backgroundColor: "#FFF1F2", border: "1px solid #FDA4AF", color: "#BE123C" }}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          {error}
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upload + Text */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* Drag & Drop Upload Zone */}
          <div
            className="relative rounded-2xl p-8 text-center transition-all cursor-pointer"
            style={{
              border: `2px dashed ${dragActive ? "#7C3AED" : fileName ? "#10B981" : "#7C3AED"}`,
              backgroundColor: dragActive
                ? "rgba(124,58,237,0.08)"
                : fileName
                ? "rgba(16,185,129,0.05)"
                : "rgba(124,58,237,0.04)",
            }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            {fileName ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(16,185,129,0.12)" }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: "#10B981", fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#1F2937" }}>{fileName}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>File loaded and parsed successfully!</p>
                </div>
                <button
                  type="button" onClick={clearFile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: "rgba(239,68,68,0.10)", color: "#EF4444" }}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.10))" }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: "#7C3AED" }}>cloud_upload</span>
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#1F2937" }}>Drag and drop your resume here</p>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Supports PDF, DOCX, and TXT files</p>
                </div>
                <label
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}
                >
                  Browse Files
                  <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
                </label>
              </div>
            )}
          </div>

          {/* Text Editor */}
          <div
            className="lav-card overflow-hidden flex flex-col"
            style={{ minHeight: "420px" }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3.5"
              style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}
            >
              <span className="material-symbols-outlined text-lg" style={{ color: "#7C3AED" }}>edit_note</span>
              <span className="font-semibold text-sm" style={{ color: "#1F2937" }}>
                {fileName ? "Extracted Resume Text" : "Or Paste Resume Text"}
              </span>
            </div>
            <form onSubmit={handleAnalyze} className="flex-1 flex flex-col p-5">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or upload a file to view and edit the text of your resume here..."
                className="flex-1 w-full p-4 font-mono text-sm resize-none transition-all"
                style={{
                  backgroundColor: "#FAFAFA",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "12px",
                  color: "#374151",
                  minHeight: "260px",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7C3AED";
                  e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                }}
                required
              />
              <button
                type="submit" disabled={loading}
                className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", boxShadow: "0 4px 16px rgba(124,58,237,0.30)" }}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Analyzing Resume…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    Analyze Resume
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Score + Feedback */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* ATS Score Card */}
          <div className="lav-card p-6 flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                <circle
                  cx="64" cy="64" r="58" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="364.4"
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)", filter: "drop-shadow(0 0 6px rgba(6,182,212,0.5))" }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-3xl leading-none" style={{ color: "#1F2937" }}>
                  {feedback ? feedback.score : 0}
                </span>
                <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>/100</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1" style={{ color: "#1F2937" }}>ATS Score</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#6B7280" }}>
                {feedback
                  ? `Your resume scores ${feedback.score}%. Review the bullet improvements below.`
                  : "Submit your resume to see your ATS Score."}
              </p>
              {feedback && (
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase"
                    style={
                      feedback.score >= 80
                        ? { backgroundColor: "rgba(16,185,129,0.10)", color: "#059669" }
                        : { backgroundColor: "#FEF3C7", color: "#B45309" }
                    }
                  >
                    {feedback.score >= 80 ? "Low Risk" : "Action Needed"}
                  </span>
                  <span
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase"
                    style={{ backgroundColor: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
                  >
                    {feedback.suggestions.length} suggestions
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Cards */}
          {feedback ? (
            <div className="flex flex-col gap-4">
              {[
                { label: "WHAT", sub: "Primary Focus Area", icon: "flag",       color: "#7C3AED", bg: "rgba(124,58,237,0.10)", text: feedback.what },
                { label: "HOW",  sub: "Implementation",     icon: "build",      color: "#06B6D4", bg: "rgba(6,182,212,0.10)", text: feedback.how },
                { label: "IMPACT", sub: "Measurable Outcomes", icon: "show_chart", color: "#F59E0B", bg: "#FEF3C7", text: feedback.impact },
              ].map((card) => (
                <div key={card.label} className="lav-card p-5 flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.bg }}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ color: card.color }}>
                      {card.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider mb-0.5" style={{ color: card.color }}>
                      {card.label}: {card.sub}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>{card.text}</p>
                  </div>
                </div>
              ))}

              {/* Suggestions */}
              <div className="lav-card p-5">
                <h5 className="font-bold text-sm mb-3" style={{ color: "#1F2937" }}>Bullet-by-Bullet Suggestions</h5>
                <ul className="space-y-2">
                  {feedback.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-xs" style={{ color: "#6B7280" }}>
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: "#7C3AED" }}
                      />
                      {sug}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div
              className="lav-card p-12 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(124,58,237,0.08)" }}
              >
                <span className="material-symbols-outlined text-3xl" style={{ color: "#7C3AED" }}>analytics</span>
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: "#1F2937" }}>Ready for Review</p>
              <p className="text-xs max-w-[200px] mx-auto" style={{ color: "#94A3B8" }}>
                Enter your details on the left and run analysis to unlock candidate analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
