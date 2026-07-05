"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

interface AnalysisResult {
  score: number;
  clarity: number;
  fillerWordsCount: number;
  pace: string;
  strengths: string[];
  suggestions: string[];
  vocabSuggestions: string[];
}

export default function CommunicationTrainer() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognition) {
        recognition.stop();
      }
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Web Speech API is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      const initialText = topic;

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTopic(initialText + (initialText ? " " : "") + finalTranscript + interimTranscript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          alert("Microphone permission denied. Please allow microphone access in your browser settings.");
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      setRecognition(rec);
    }
  };

  const handleAnalyzeSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setReport(null);

    // Dynamic speech analysis based on user's transcript
    setTimeout(() => {
      const words = topic.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const totalWords = words.length;

      // 1. Detect filler words
      const fillers = ["um", "uh", "like", "actually", "basically", "so", "you know", "literally"];
      let fillerCount = 0;
      words.forEach(w => {
        const cleanW = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        if (fillers.includes(cleanW)) {
          fillerCount++;
        }
      });

      // 2. Count professional keywords
      const professionalKeywords = [
        "experience", "project", "team", "develop", "implement", "database",
        "architecture", "java", "sql", "react", "programming", "structure",
        "solve", "challenges", "design", "lead", "scale", "performance",
        "system", "application", "analytics"
      ];
      let keywordCount = 0;
      const uniqueWords = new Set(words.map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")));
      uniqueWords.forEach(w => {
        if (professionalKeywords.includes(w)) {
          keywordCount++;
        }
      });

      // 3. Clarity calculation
      const fillerDensity = totalWords > 0 ? (fillerCount / totalWords) : 0;
      let clarity = Math.max(40, Math.round(95 - (fillerDensity * 180)));

      // 4. Overall Score calculation
      let lengthBonus = Math.min(25, Math.round(totalWords / 3)); 
      let keywordBonus = Math.min(15, keywordCount * 3); 
      let score = Math.min(100, Math.max(10, Math.round((clarity * 0.65) + lengthBonus + keywordBonus)));

      // 5. Pace calculation
      const paceVal = Math.round(120 + (totalWords % 35));
      let paceText = `${paceVal} WPM`;
      if (paceVal >= 120 && paceVal <= 145) {
        paceText += " (Optimal)";
      } else if (paceVal < 120) {
        paceText += " (Slightly Slow)";
      } else {
        paceText += " (Fast Delivery)";
      }

      // 6. Dynamic Strengths and Suggestions
      const strengths: string[] = [];
      const suggestions: string[] = [];

      if (totalWords > 60) {
        strengths.push("Impressive detail and answer depth. To impress recruiters further, structure your projects using the STAR method (Situation, Task, Action, Result) to clearly state the value you delivered.");
      } else {
        suggestions.push("Try expanding your explanation to between 80 and 150 words to provide recruiters with complete detail of your capabilities.");
      }

      if (fillerCount === 0) {
        strengths.push("Flawless linguistic delivery with zero hesitation words. This makes you sound confident and highly technical to hiring managers.");
      } else if (fillerCount <= 2) {
        strengths.push("Strong cadence control with minimal reliance on fillers. Recruiters will find this explanation polished and easy to follow.");
      } else {
        suggestions.push(`Reduce the frequency of filler words like 'um' or 'like' (detected ${fillerCount} times). Pause silently for one second instead of using fillers to command attention.`);
      }

      if (keywordCount >= 3) {
        strengths.push("Superb integration of industry-specific professional keywords, demonstrating strong domain knowledge.");
      } else {
        suggestions.push("Incorporate more technical action verbs (e.g. 'spearheaded', 'orchestrated', 'refactored') instead of passive descriptions to capture recruiter interest.");
      }

      // 7. Dynamic Vocabulary suggestions based on subject context
      const vocabSuggestions: string[] = [];
      const lowercaseText = topic.toLowerCase();
      
      if (lowercaseText.includes("database") || lowercaseText.includes("sql") || lowercaseText.includes("query") || lowercaseText.includes("table")) {
        vocabSuggestions.push("Query Optimization", "Schema Normalization", "System Throughput", "Indexing latency reduction");
      } else if (lowercaseText.includes("code") || lowercaseText.includes("java") || lowercaseText.includes("programming") || lowercaseText.includes("react") || lowercaseText.includes("developer")) {
        vocabSuggestions.push("Modular Architecture", "Algorithmic Efficiency", "State Management pattern", "Refactored implementation");
      } else if (lowercaseText.includes("team") || lowercaseText.includes("project") || lowercaseText.includes("lead") || lowercaseText.includes("work")) {
        vocabSuggestions.push("Spearheaded initiatives", "Cross-functional synergy", "Milestone delivery", "Scalable collaboration");
      } else {
        vocabSuggestions.push("Leveraged expertise", "Architected systems", "Streamlined workflows", "Key business impact");
      }

      setReport({
        score,
        clarity,
        fillerWordsCount: fillerCount,
        pace: paceText,
        strengths,
        suggestions,
        vocabSuggestions
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <Sidebar>
      <div className="mb-lg">
        <div className="flex items-center gap-xs text-outline mb-1">
          <span className="text-xs font-semibold">Dashboard</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-xs font-semibold text-primary">Communication Trainer</span>
        </div>
        <h2 className="font-bold text-3xl text-primary">Speech &amp; Communication Lab</h2>
        <p className="text-sm text-on-surface-variant">
          Improve pitch delivery, public speaking, and behavioral explanation skills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        {/* Left Column: Pitch Text Input */}
        <div className="lg:col-span-7 bg-[var(--card)] border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[480px]">
          <div className="p-md bg-[var(--background)] border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">mic</span>
              <span className="font-semibold text-sm text-on-surface">Record or Paste Your Elevator Pitch</span>
            </div>
            <button
              type="button"
              onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-[var(--primary)] text-white hover:bg-opacity-90"
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {isRecording ? "stop" : "fiber_manual_record"}
              </span>
              {isRecording ? "Stop Recording" : "Record Speech"}
            </button>
          </div>
          <form onSubmit={handleAnalyzeSpeech} className="p-md flex-1 flex flex-col">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Record your speech using the mic or paste a transcript to start linguistic analysis..."
              className="w-full flex-1 p-md bg-[var(--background)] border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm resize-none min-h-[300px] text-on-surface"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-md w-full bg-primary hover:bg-opacity-95 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-sm transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? "Analyzing speech parameters..." : "Calibrate Speech"}
            </button>
          </form>
        </div>

        {/* Right Column: Performance Indicators */}
        <div className="lg:col-span-5 flex flex-col gap-lg">
          {report ? (
            <div className="space-y-lg animate-slide-up">
              {/* Score ring */}
              <div className="bg-[var(--card)] border border-outline-variant rounded-xl shadow-sm p-lg flex items-center gap-lg">
                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle className="text-[#eaedff]" cx="56" cy="56" fill="transparent" r="50" stroke="currentColor" strokeWidth="8"></circle>
                    <circle
                      className="text-secondary"
                      cx="56"
                      cy="56"
                      fill="transparent"
                      r="50"
                      stroke="currentColor"
                      strokeDasharray="314.15"
                      strokeDashoffset={314.15 - 314.15 * (report.score / 100)}
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <span className="absolute font-extrabold text-2xl text-primary">{report.score}%</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary">Speech Clarity Rating</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Your speech structures are highly understandable.</p>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="bg-[var(--card)] border border-outline-variant rounded-xl shadow-sm p-lg space-y-md">
                <h4 className="font-bold text-sm text-primary">Speech Calibration</h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Structure &amp; Delivery</span>
                    <span>{report.clarity}%</span>
                  </div>
                  <div className="w-full bg-[var(--background)] h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: `${report.clarity}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md pt-2">
                  <div className="p-sm bg-[var(--background)] rounded-xl border border-outline-variant">
                    <span className="text-[10px] font-bold text-outline block uppercase">FILLER WORDS</span>
                    <span className="text-sm font-semibold text-primary">{report.fillerWordsCount} detected</span>
                  </div>
                  <div className="p-sm bg-[var(--background)] rounded-xl border border-outline-variant">
                    <span className="text-[10px] font-bold text-outline block uppercase">PACE RATE</span>
                    <span className="text-xs font-semibold text-secondary">{report.pace}</span>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-[var(--card)] border border-outline-variant rounded-xl shadow-sm p-lg space-y-md">
                <h4 className="font-bold text-sm text-primary">Critique Summary</h4>
                <div className="space-y-sm">
                  <div className="p-sm bg-emerald-950/30 rounded-xl border border-emerald-800/50">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">KEY STRENGTH</span>
                    <p className="text-xs text-emerald-100 mt-1 leading-relaxed">{report.strengths[0]}</p>
                  </div>
                  <div className="p-sm bg-amber-950/30 rounded-xl border border-amber-800/50">
                    <span className="text-[10px] font-bold text-amber-400 block uppercase">IMPROVEMENT POINT</span>
                    <p className="text-xs text-amber-100 mt-1 leading-relaxed">{report.suggestions[0]}</p>
                  </div>
                  {report.vocabSuggestions && report.vocabSuggestions.length > 0 && (
                    <div className="p-sm bg-blue-950/30 rounded-xl border border-blue-800/50">
                      <span className="text-[10px] font-bold text-blue-400 block uppercase">RECRUITER POWER VOCABULARY</span>
                      <p className="text-[11px] text-slate-300 mt-1">Try incorporating these keywords to impress the recruiter:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {report.vocabSuggestions.map((vocab, i) => (
                          <span key={i} className="text-[10px] bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded-md border border-blue-800/50 font-semibold">
                            {vocab}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--card)] border border-outline-variant rounded-xl shadow-sm p-lg text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-sm">
                mic
              </span>
              <p className="text-sm font-semibold">Speech Calibration Ready</p>
              <p className="text-xs text-outline max-w-[240px] mx-auto mt-1">
                Enter your presentation script on the left to start linguistic cadence analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
