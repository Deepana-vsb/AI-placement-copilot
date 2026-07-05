"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface EvaluationFeedback {
  strengths: string[];
  weaknesses: string[];
  skillScores: {
    technical: number;
    communication: number;
    confidence: number;
  };
  overallScore: number;
}

const INTERVIEWERS = [
  {
    id: "Marcus",
    name: "Marcus",
    title: "Senior Tech Lead",
    avatar: "computer",
    difficulty: "Hard",
    focus: "Systems scaling, optimization, algorithms, & complexity.",
    bio: "Ex-Google Staff Engineer. Direct, strict, and values high-performance optimized designs."
  },
  {
    id: "Rachel",
    name: "Rachel",
    title: "Senior Data Scientist",
    avatar: "bar_chart",
    difficulty: "Medium",
    focus: "Schemas, aggregations, query execution, & statistical models.",
    bio: "Lead Analytics Architect. Data-driven, values clarity, schema normalization, and metrics."
  },
  {
    id: "Chloe",
    name: "Chloe",
    title: "HR Talent Partner",
    avatar: "groups",
    difficulty: "Easy",
    focus: "Behavioral fit, teamwork, conflicts, & career ambitions.",
    bio: "Senior Recruiting Manager. Warm, conversational, values collaboration and leadership."
  }
];

export default function MockInterview() {
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationFeedback | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  // Custom Interaction States
  const [selectedInterviewer, setSelectedInterviewer] = useState(INTERVIEWERS[0]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const baseTextRef = useRef("");

  // Active Pacing Stopwatch
  useEffect(() => {
    if (interviewStarted && !typing && !loading) {
      setSecondsElapsed(0);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewStarted, typing, loading, messages.length]);

  // Speech Recognition (Microphone) Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
          console.log("Speech recognition session started.");
        };

        rec.onspeechstart = () => {
          console.log("Active voice activity detected.");
        };

        rec.onresult = (event: any) => {
          let sessionTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            sessionTranscript += event.results[i][0].transcript;
          }
          if (sessionTranscript) {
            setInputValue(baseTextRef.current + (baseTextRef.current ? " " : "") + sessionTranscript);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
          if (event.error === "not-allowed") {
            alert("Microphone permission was denied. Please allow microphone access for this website in your browser settings (click the lock/padlock icon next to the URL, then enable the Microphone toggle).");
          } else if (event.error === "no-speech") {
            // Quietly ignore silence errors
          } else {
            alert("Microphone capture issue: " + event.error);
          }
        };

        rec.onend = () => {
          console.log("Speech recognition session ended.");
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Voice Unlock Helper to satisfy browser user-activation rules
  const unlockSpeechAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(u);
    }
  };

  // Pre-load and listen to voice lists
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      loadVoices();
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, []);

  // Text-To-Speech (Voice Output) Engine
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && voiceEnabled) {
      window.speechSynthesis.cancel(); // Mute previous
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) =>
        v.name.includes("Google US English") ||
        v.name.includes("Microsoft Zira") ||
        v.lang === "en-US"
      );
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak when last message is assistant
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") {
        speakText(lastMsg.content);
      }
    }
  }, [messages, voiceEnabled]);

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      alert("Microphone input (SpeechRecognition) is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        // Explicitly request browser microphone permissions
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        baseTextRef.current = inputValue; // Save previous text value
        setIsRecording(true);
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Microphone access failed:", err);
        alert("Failed to access microphone. Please ensure microphone permissions are allowed for this site (click the lock/settings icon in your browser's address bar).");
        setIsRecording(false);
      }
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.targetRole) {
            setTargetRole(data.targetRole);
          }
        }
      } catch (err) {
        console.error("Failed to load profile target role", err);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const startNewInterview = async () => {
    setLoading(true);
    setMessages([]);
    setSessionId(null);
    setEvaluation(null);
    setShowReport(false);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewer: selectedInterviewer.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start interview");

      setSessionId(data.sessionId);
      setMessages(data.messages || []);
      setInterviewStarted(true);
    } catch (err) {
      console.error(err);
      alert("Error starting interview session");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId || loading) return;

    const userMsg = inputValue.trim();
    setInputValue("");

    const updatedMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(updatedMessages);
    setTyping(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMsg,
          interviewer: selectedInterviewer.id
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error communicating with interviewer");

      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      alert("Interviewer error. Please try responding again.");
    } finally {
      setTyping(false);
    }
  };

  const handleEndInterview = async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      const response = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to score interview");

      setEvaluation(data.feedback);
      setShowReport(true);
    } catch (err) {
      console.error(err);
      alert("Could not evaluate interview. Please ensure you responded to at least one question.");
    } finally {
      setLoading(false);
    }
  };

  // Live Answer Metrics Analyzer (Calculates client-side keywords & metrics depth)
  const getAnswerMetrics = () => {
    const inputClean = inputValue.toLowerCase().trim();
    if (!inputClean) return { score: 0, text: "Begin typing your response...", color: "bg-slate-200" };

    const words = inputClean.split(/\s+/).filter(w => w.length > 0).length;
    
    // Check for technical/metrics keywords
    const keywords = ["scale", "latency", "index", "complexity", "big o", "database", "sql", "normalization", "quantify", "react", "spring", "query", "average", "percent", "latency", "schema", "optimize", "reduce"];
    const foundKeywords = keywords.filter(keyword => inputClean.includes(keyword)).length;
    
    // Check for numerical values/metrics
    const hasNumbers = /\d+/.test(inputClean) || inputClean.includes("%");

    let depthPoints = 0;
    if (words > 5) depthPoints += 20;
    if (words > 15) depthPoints += 20;
    if (words > 35) depthPoints += 15;
    depthPoints += foundKeywords * 15;
    if (hasNumbers) depthPoints += 20;

    const score = Math.min(100, depthPoints);

    if (score < 35) {
      return { score, text: "Weak: Too brief. Add core technical methodologies.", color: "bg-rose-500", tip: "Tip: Explain how you completed task, what technologies were used." };
    } else if (score < 70) {
      return { score, text: "Moderate: Good structure. Try to quantify your impact.", color: "bg-amber-500", tip: "Tip: Include numerical metrics (e.g. 'reduced latency by 30%')." };
    } else {
      return { score, text: "Strong: Excellent depth and project metrics!", color: "bg-emerald-500", tip: "Tip: Keep it up! Click Send when ready." };
    }
  };

  const currentMetrics = getAnswerMetrics();
  const reportOffset = evaluation ? 364.4 * (1 - evaluation.overallScore / 100) : 364.4;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Sidebar>
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-extrabold text-3xl text-slate-800 tracking-tight">Mock Interview Agent</h2>
          <p className="text-slate-500 text-sm">
            Practice with our AI calibrated for top-tier tech roles.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Voice Mode Toggle Button */}
          <button
            onClick={() => { setVoiceEnabled(!voiceEnabled); unlockSpeechAudio(); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              voiceEnabled
                ? "bg-[#f0f9ff] border-[#0284c7] text-[#0284c7]"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {voiceEnabled ? "volume_up" : "volume_off"}
            </span>
            {voiceEnabled ? "Voice Enabled" : "Voice Muted"}
          </button>

          <div className="flex items-center gap-2 bg-[#f0f9ff] px-4 py-2 rounded-xl border border-sky-100">
            <span className="material-symbols-outlined text-[#0284c7] text-sm">verified</span>
            <span className="font-bold text-xs text-[#0284c7]">Target: {targetRole}</span>
          </div>
        </div>
      </div>

      {/* Main Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-230px)] min-h-[580px]">
        
        {/* Left Column: Selector / Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Bento Setup Panel */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
            
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-800 border-b border-slate-50 pb-2 flex items-center justify-between">
                <span>Interviewer Agent</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">Setup</span>
              </h3>

              {!interviewStarted ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select your interviewer personality before starting the calibration:
                  </p>
                  
                  {/* Selector list */}
                  <div className="space-y-2">
                    {INTERVIEWERS.map((interviewer) => (
                      <div
                        key={interviewer.id}
                        onClick={() => setSelectedInterviewer(interviewer)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedInterviewer.id === interviewer.id
                            ? "border-[#0284c7] bg-[#f0f9ff]"
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm bg-slate-100 p-1.5 rounded-lg text-slate-600">
                              {interviewer.avatar}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{interviewer.name}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            interviewer.difficulty === "Hard" 
                              ? "bg-rose-100 text-rose-700" 
                              : interviewer.difficulty === "Medium" 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {interviewer.difficulty}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">{interviewer.title}</p>
                        <p className="text-[9px] text-slate-400 leading-normal mt-0.5">{interviewer.bio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Chosen Interviewer HUD */}
                  <div className="p-4 bg-[#f0f9ff] border border-sky-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined bg-white text-[#0284c7] p-2 rounded-lg text-lg border border-sky-200">
                        {selectedInterviewer.avatar}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">{selectedInterviewer.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold block">{selectedInterviewer.title}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
                      "{selectedInterviewer.bio}"
                    </p>
                  </div>

                  {/* Stopwatch pacing helper */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">RESPONSE PACING</span>
                      <span className="text-sm font-extrabold text-slate-800">{formatTimer(secondsElapsed)}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-200/50 px-2 py-1 rounded">
                      {secondsElapsed < 15 ? "Too Brief" : secondsElapsed < 90 ? "Ideal Pace" : "Keep it Concise"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-6">
              {!interviewStarted ? (
                <button
                  onClick={() => { startNewInterview(); unlockSpeechAudio(); }}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  Start Interview with {selectedInterviewer.name}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEndInterview}
                    disabled={loading}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">stop</span>
                    End &amp; Evaluate Session
                  </button>
                  <button
                    onClick={() => { startNewInterview(); unlockSpeechAudio(); }}
                    disabled={loading}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs">refresh</span>
                    Reset Room
                  </button>
                </>
              )}
            </div>

          </section>
        </div>

        {/* Right Column: Chat Room Area */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden h-full">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${interviewStarted ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}></div>
              <span className="font-bold text-xs text-slate-700">Interviewer: {selectedInterviewer.name} ({selectedInterviewer.title})</span>
            </div>
            {interviewStarted && (
              <span className="text-[10px] font-bold bg-[#f0f9ff] text-[#0284c7] border border-sky-100 px-3 py-1 rounded-full">
                Active Calibration
              </span>
            )}
          </div>

          {/* Conversation Screen */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-slate-50/30">
            {!interviewStarted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 animate-bounce">
                  voice_chat
                </span>
                <h4 className="font-bold text-base text-slate-700">Practice Interview Room</h4>
                <p className="text-xs text-slate-500 max-w-[290px] mx-auto mt-2 leading-relaxed">
                  Choose your interviewer on the left, then click Start to begin. You can speak your answers via microphone or type them directly.
                </p>
              </div>
            ) : (
              <>
                {messages
                  .filter((m) => m.role === "user" || m.role === "assistant")
                  .map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 max-w-[85%] animate-slide-up ${
                          isUser ? "self-end flex-row-reverse" : "self-start"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
                            isUser ? "bg-[#0284c7] text-white" : "bg-slate-800 text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isUser ? "person" : selectedInterviewer.avatar}
                          </span>
                        </div>
                        <div
                          className={`p-4 rounded-2xl relative ${
                            isUser
                              ? "bg-[#0284c7] text-white rounded-tr-none shadow-sm"
                              : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm"
                          }`}
                        >
                          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap pr-4">
                            {msg.content}
                          </p>
                          
                          {/* Speak helper replay button next to AI queries */}
                          {!isUser && (
                            <button
                              onClick={() => speakText(msg.content)}
                              className="absolute right-2 top-2 text-slate-300 hover:text-slate-500"
                              title="Speak Question Aloud"
                            >
                              <span className="material-symbols-outlined text-xs">volume_up</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {typing && (
                  <div className="flex gap-3 max-w-[85%] self-start">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">{selectedInterviewer.avatar}</span>
                    </div>
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Interactive Answer Strength Bar Overlay */}
          {interviewStarted && (
            <div className="px-6 py-2 border-t border-slate-50 bg-slate-50/50 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-500">Live Answer Quality Meter:</span>
                <span className="text-slate-600">{currentMetrics.text}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${currentMetrics.color}`}
                  style={{ width: `${currentMetrics.score}%` }}
                ></div>
              </div>
              {inputValue.trim() && (
                <span className="text-[9px] text-[#0284c7] font-semibold">{currentMetrics.tip}</span>
              )}
            </div>
          )}

          {/* Console inputs */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={(e) => { handleSendMessage(e); unlockSpeechAudio(); }} className="flex items-center gap-3 bg-slate-50 rounded-xl p-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-[#0284c7] focus-within:bg-white shadow-inner">
              <input
                disabled={!interviewStarted || loading || typing}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-xs px-3 py-2 text-white placeholder:text-slate-400 disabled:opacity-50"
                placeholder={interviewStarted ? "Type or speak your answer response..." : "Start the interview first..."}
                type="text"
              />
              <button
                type="button"
                onClick={() => { toggleRecording(); unlockSpeechAudio(); }}
                disabled={!interviewStarted || loading || typing}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
                  isRecording 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
                title={isRecording ? "Stop Recording" : "Voice Input (Speak)"}
              >
                <span className="material-symbols-outlined text-sm">
                  {isRecording ? "mic_off" : "mic"}
                </span>
              </button>
              <button
                type="submit"
                disabled={!interviewStarted || loading || typing || !inputValue.trim()}
                className="w-9 h-9 flex items-center justify-center bg-[#0284c7] text-white rounded-lg shadow hover:bg-[#0369a1] active:scale-95 transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* FAB Overlay Modal for Feedback Report */}
      {showReport && evaluation && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-slide-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-400">insights</span>
                <h2 className="font-bold text-base">Interview Performance Report</h2>
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="material-symbols-outlined hover:bg-white/10 p-2 rounded-full text-white"
              >
                close
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Score Circle */}
              <div className="flex flex-col items-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      className="text-slate-100"
                      cx="64"
                      cy="64"
                      fill="transparent"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                    ></circle>
                    <circle
                      className="text-[#0284c7]"
                      cx="64"
                      cy="64"
                      fill="transparent"
                      r="58"
                      stroke="currentColor"
                      strokeDasharray="364.4"
                      strokeDashoffset={reportOffset}
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <span className="absolute font-extrabold text-slate-800 text-3xl">
                    {evaluation.overallScore}%
                  </span>
                </div>
                <p className="mt-4 font-bold text-xs text-slate-500">
                  Overall Proficiency Rating
                </p>
              </div>

              {/* Strengths & Focus Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-xs text-emerald-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      trending_up
                    </span>
                    Core Strengths
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Focus Areas */}
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                  <h4 className="font-bold text-xs text-rose-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      report
                    </span>
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.weaknesses.map((weak, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skill Scores Bar Chart */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <h4 className="font-bold text-xs text-slate-700">Detailed Metrics Scoreboard</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Technical Depth</span>
                      <span>{evaluation.skillScores.technical}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${evaluation.skillScores.technical}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Communication &amp; Pacing</span>
                      <span>{evaluation.skillScores.communication}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${evaluation.skillScores.communication}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Confidence &amp; Delivery</span>
                      <span>{evaluation.skillScores.confidence}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${evaluation.skillScores.confidence}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setShowReport(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
