"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

interface SubTopic {
  name: string;
  description: string;
}

interface TopicCategory {
  title: string;
  icon: string;
  subtopics: SubTopic[];
}

const TOPICS: TopicCategory[] = [
  {
    title: "Arithmetic",
    icon: "calculate",
    subtopics: [
      { name: "Percentages", description: "Successive changes, population formulas, and marks calculation" },
      { name: "Profit, Loss & Discount", description: "Marked price, cost price, selling price, and faulty weights" },
      { name: "Simple & Compound Interest", description: "Compounding frequencies (annual, quarterly) and installments" },
      { name: "Averages", description: "Weighted average, age-based problems, and replacement of values" },
      { name: "Ratios & Proportions", description: "Direct/inverse variations, partnerships, and coin problems" },
      { name: "Mixtures & Alligations", description: "Rule of alligation and repeated dilution of liquids" }
    ]
  },
  {
    title: "Time, Work & Distance",
    icon: "schedule",
    subtopics: [
      { name: "Time & Work", description: "Work efficiency, alternate days, wages, and man-days" },
      { name: "Pipes & Cisterns", description: "Inlet/outlet pipes, leakages, and filling times" },
      { name: "Speed, Time & Distance", description: "Average speed, relative speed, and arrival problems" },
      { name: "Trains", description: "Crossing poles/platforms and two trains same/opposite direction" },
      { name: "Boats & Streams", description: "Upstream, downstream, and current speed calculations" },
      { name: "Clocks & Calendars", description: "Angle between hands, faulty clocks, and day-of-date lookup" }
    ]
  },
  {
    title: "Modern Math",
    icon: "query_stats",
    subtopics: [
      { name: "Permutations & Combinations", description: "Linear/circular arrangements, selection logic" },
      { name: "Probability", description: "Coin tosses, dice rolls, playing cards, and ball selections" },
      { name: "Algebra", description: "Linear and quadratic equations, roots, and identities" },
      { name: "Number Systems", description: "Divisibility rules, LCM/HCF, unit digits, and remainders" },
      { name: "Progressions", description: "Arithmetic (AP) and Geometric (GP) progressions" },
      { name: "Geometry & Mensuration", description: "Area and volume of 2D & 3D shapes" }
    ]
  },
  {
    title: "Data Interpretation",
    icon: "bar_chart",
    subtopics: [
      { name: "Tables", description: "Analyzing large raw financial or operational datasets" },
      { name: "Bar Graphs", description: "Comparing year-on-year growth, production, or revenues" },
      { name: "Pie Charts", description: "Degree-based and percentage-based distributions" },
      { name: "Line Graphs", description: "Tracking continuous trends, fluctuating profits, or stock patterns" },
      { name: "Caselets", description: "Paragraph-based scenarios converted to tables" },
      { name: "Radar Charts", description: "Evaluating performance across multiple parameters" }
    ]
  }
];

export default function AptitudePractice() {
  const [testStarted, setTestStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedMainCategory, setSelectedMainCategory] = useState("Arithmetic");
  const [selectedSubtopic, setSelectedSubtopic] = useState("Percentages");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(105);
  const [history, setHistory] = useState<any[]>([]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/practice/submissions?module=aptitude");
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch aptitude history", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const saveAptitudeScore = async (finalScore: number, totalQuestions: number) => {
    try {
      await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "aptitude",
          problemId: `${selectedMainCategory}: ${selectedSubtopic}`,
          userCode: `${finalScore}/${totalQuestions}`,
          status: "completed"
        })
      });
      fetchSubmissions();
    } catch (err) {
      console.error("Failed to save aptitude score", err);
    }
  };

  const startTest = async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setSubmitted(false);
    setTimeLeft(105);
    setScore(0);

    try {
      const topicQuery = `${selectedMainCategory} - ${selectedSubtopic}`;
      const res = await fetch(`/api/aptitude/questions?count=${questionCount}&topic=${encodeURIComponent(topicQuery)}`);
      if (!res.ok) throw new Error("Failed to generate test questions");
      const data = await res.json();
      const parsedQuestions = typeof data === "string" ? JSON.parse(data) : data;
      
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setAnswers(Array(parsedQuestions.length).fill(null));
        setTestStarted(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(err);
      setError("AI generation server busy. Loaded standard mock evaluation suite instead.");
      const fallbackQs = [
        {
          id: 1,
          question: `[Arithmetic: ${selectedSubtopic}] In a placement batch of 120 students, 60% passed the initial quantitative assessment, 45% passed the coding round, and 25% passed both. How many students failed both rounds?`,
          options: ["24 students", "30 students", "36 students", "40 students"],
          correctIdx: 0,
          explanation: "Using sets: Total Passed = P(Quant) + P(Coding) - P(Both) = 60% + 45% - 25% = 80%.\nTotal Failed = 100% - 80% = 20%.\n20% of 120 students = 24 students."
        },
        {
          id: 2,
          question: `[Arithmetic: ${selectedSubtopic}] A candidate sells a resume preparation course for $120, incurring a loss of 20%. At what price should they sell the course to gain a profit of 15%?`,
          options: ["$150.00", "$172.50", "$165.00", "$180.00"],
          correctIdx: 1,
          explanation: "Loss is 20%, so $120 is 80% of Cost Price.\nCP = 120 / 0.8 = $150.\nFor 15% profit: Selling Price = 150 * 1.15 = $172.50."
        }
      ];
      setQuestions(fallbackQs);
      setAnswers(Array(fallbackQs.length).fill(null));
      setTestStarted(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!testStarted || loading || questions.length === 0 || submitted) return;
    if (timeLeft === 0) { setSubmitted(true); return; }

    const timer = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, testStarted, loading, questions, submitted]);

  const activeQuestion = questions[currentIdx];

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setSubmitted(true);
    const isCorrect = selectedOpt === activeQuestion.correctIdx;
    if (isCorrect) setScore((prev) => prev + 1);
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIdx] = isCorrect;
      return copy;
    });
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setSubmitted(false);
    setTimeLeft(105);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      saveAptitudeScore(score, questions.length);
      setTestStarted(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (err) {
      return "Recent";
    }
  };

  // Compute Overall Analytics
  const totalAttempts = history.length;
  let overallAccuracy = 0;
  let totalXP = 0;
  
  // Topic accuracy counters
  const categoryAccuracy: Record<string, { correct: number; total: number }> = {
    "Arithmetic": { correct: 0, total: 0 },
    "Time, Work & Distance": { correct: 0, total: 0 },
    "Modern Math": { correct: 0, total: 0 },
    "Data Interpretation": { correct: 0, total: 0 },
  };

  if (totalAttempts > 0) {
    let totalQuestions = 0;
    let totalCorrect = 0;
    history.forEach((sub) => {
      const parts = sub.userCode.split("/");
      if (parts.length === 2) {
        const correct = parseInt(parts[0], 10);
        const questionsCount = parseInt(parts[1], 10);
        if (!isNaN(correct) && !isNaN(questionsCount)) {
          totalCorrect += correct;
          totalQuestions += questionsCount;

          // Group by category if matching
          if (sub.problemId) {
            const catName = sub.problemId.split(":")[0]?.trim();
            if (categoryAccuracy[catName]) {
              categoryAccuracy[catName].correct += correct;
              categoryAccuracy[catName].total += questionsCount;
            }
          }
        }
      }
    });
    overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    totalXP = totalAttempts * 100;
  }

  const currentCategoryObj = TOPICS.find((t) => t.title === selectedMainCategory) || TOPICS[0];

  return (
    <Sidebar>
      {/* ── Page Header ── */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>Practice</span>
          <span className="material-symbols-outlined text-sm" style={{ color: "#94A3B8" }}>chevron_right</span>
          <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>Quantitative Aptitude</span>
        </div>
        <h2 className="font-extrabold text-3xl mb-1" style={{ color: "#1F2937" }}>Aptitude Prep Lab</h2>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Improve your problem solving speed for placement eligibility exams featuring current technology & company patterns.
        </p>
      </div>

      {!testStarted ? (
        /* ── Split Layout: Config on Left, Scoreboard on Right ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in-up stagger-1">
          
          {/* LEFT: Quiz Configurator */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-outline-variant rounded-2xl shadow-md p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ color: "#7C3AED" }}>settings</span>
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: "#1F2937" }}>Configure Quiz</h3>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>Set your parameters below</p>
                </div>
              </div>

              {/* Step 1: Question Count */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">1. Select Number of Questions</span>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 10, 20, 30, 50].map((num) => (
                    <button
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className="py-3 rounded-xl border text-center font-bold text-xs transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: questionCount === num ? "#7C3AED" : "#FFFFFF",
                        color: questionCount === num ? "#FFFFFF" : "#6B7280",
                        borderColor: questionCount === num ? "#7C3AED" : "#E5E7EB",
                        boxShadow: questionCount === num ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
                      }}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Main Topic Categories */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">2. Select Aptitude Category</span>
                <div className="grid grid-cols-2 gap-3">
                  {TOPICS.map((topic) => {
                    const isSelected = selectedMainCategory === topic.title;
                    return (
                      <button
                        key={topic.title}
                        onClick={() => {
                          setSelectedMainCategory(topic.title);
                          setSelectedSubtopic(topic.subtopics[0].name);
                        }}
                        className="p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
                        style={{
                          backgroundColor: isSelected ? "rgba(124,58,237,0.06)" : "#FFFFFF",
                          borderColor: isSelected ? "#7C3AED" : "#E5E7EB",
                          color: isSelected ? "#7C3AED" : "#6B7280",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          style={{
                            color: isSelected ? "#7C3AED" : "#94A3B8",
                            fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          {topic.icon}
                        </span>
                        <span className="text-xs font-bold">{topic.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Focus Subtopics */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">3. Choose Focus Area Subtopic</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentCategoryObj.subtopics.map((sub) => {
                    const isSelected = selectedSubtopic === sub.name;
                    return (
                      <div
                        key={sub.name}
                        onClick={() => setSelectedSubtopic(sub.name)}
                        className="p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-center gap-0.5"
                        style={{
                          backgroundColor: isSelected ? "rgba(16,185,129,0.05)" : "#FFFFFF",
                          borderColor: isSelected ? "#10B981" : "#E5E7EB",
                          boxShadow: isSelected ? "0 2px 8px rgba(16,185,129,0.06)" : "none",
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: isSelected ? "#059669" : "#1F2937" }}
                        >
                          {sub.name}
                        </span>
                        <span className="text-[10px] leading-relaxed" style={{ color: "#94A3B8" }}>
                          {sub.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Launch Action */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={startTest}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating AI Questions…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      Launch AI Aptitude Test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Scoreboard / Topic Performance Analytics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-outline-variant rounded-2xl shadow-md p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ color: "#06B6D4" }}>emoji_events</span>
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: "#1F2937" }}>Aptitude Scoreboard</h3>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>Real-time performance logs</p>
                </div>
              </div>

              {/* Analytics Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <span className="material-symbols-outlined text-base mb-1 block" style={{ color: "#06B6D4" }}>task_alt</span>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Done</span>
                  <span className="text-base font-extrabold text-slate-800">{totalAttempts}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <span className="material-symbols-outlined text-base mb-1 block" style={{ color: "#7C3AED" }}>percent</span>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Accuracy</span>
                  <span className="text-base font-extrabold text-slate-800">{overallAccuracy}%</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <span className="material-symbols-outlined text-base mb-1 block" style={{ color: "#F59E0B" }}>workspace_premium</span>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Earned XP</span>
                  <span className="text-base font-extrabold text-slate-800">+{totalXP}</span>
                </div>
              </div>

              {/* Topic Mastery breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Topic Mastery Breakdown</span>
                <div className="space-y-3.5">
                  {TOPICS.map((topic) => {
                    const statsObj = categoryAccuracy[topic.title];
                    const acc = statsObj && statsObj.total > 0 ? Math.round((statsObj.correct / statsObj.total) * 100) : 0;
                    return (
                      <div key={topic.title} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span style={{ color: "#374151" }}>{topic.title}</span>
                          <span style={{ color: "#7C3AED" }}>{acc > 0 ? `${acc}% accuracy` : "No attempts"}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${acc || 0}%`,
                              background: "linear-gradient(90deg, #7C3AED, #06B6D4)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Quiz Logs */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Recent Quiz Logs</span>
                
                {history.length > 0 ? (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {history.slice(-4).reverse().map((attempt: any, idx: number) => {
                      const scoreParts = attempt.userCode.split("/");
                      const correct = parseInt(scoreParts[0] || "0", 10);
                      const total = parseInt(scoreParts[1] || "5", 10);
                      const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
                      
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between shadow-sm"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{attempt.problemId?.split(":")[1]?.trim() || attempt.problemId || "Practice Quiz"}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{formatRelativeTime(attempt.submittedAt)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-extrabold text-slate-800">{attempt.userCode}</span>
                            <span
                              className="text-[9px] font-extrabold block px-1.5 py-0.5 rounded-md mt-0.5 uppercase tracking-wider text-center"
                              style={{
                                backgroundColor: acc >= 80 ? "rgba(16,185,129,0.10)" : acc >= 50 ? "#FEF3C7" : "rgba(239,68,68,0.10)",
                                color: acc >= 80 ? "#059669" : acc >= 50 ? "#B45309" : "#EF4444",
                              }}
                            >
                              {acc}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="p-6 text-center border-2 border-dashed border-gray-100 rounded-2xl"
                    style={{ backgroundColor: "#FAFAFA" }}
                  >
                    <span className="material-symbols-outlined text-3xl mb-2 text-slate-300">insights</span>
                    <p className="text-xs font-semibold text-slate-700">No practice logs recorded</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                      Complete your first AI Aptitude Quiz to populate your scoreboard breakdown!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Active Quiz Interface ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl animate-scale-in">
          {/* Left Column: Active Question */}
          <div className="lg:col-span-8 bg-white border border-outline-variant rounded-2xl shadow-md overflow-hidden flex flex-col">
            
            {/* Active Header */}
            <div
              className="p-4 border-b flex justify-between items-center text-xs font-bold"
              style={{ backgroundColor: "#F8FAFC", borderColor: "#E5E7EB" }}
            >
              <span style={{ color: "#7C3AED" }}>QUESTION {currentIdx + 1} OF {questions.length}</span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase font-bold" style={{ color: "#94A3B8" }}>{selectedSubtopic}</span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "rgba(16,185,129,0.10)", color: "#059669" }}>
                  <span className="material-symbols-outlined text-sm">grade</span>
                  Score: {score}
                </span>
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all"
                  style={{
                    backgroundColor: timeLeft < 20 ? "#FFF1F2" : "rgba(124,58,237,0.10)",
                    color: timeLeft < 20 ? "#EF4444" : "#7C3AED",
                  }}
                >
                  <span className="material-symbols-outlined text-sm">timer</span>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Question Workspace */}
            <div className="p-6 space-y-6">
              {error && (
                <div
                  className="p-3.5 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: "#FFFBEB", border: "1px solid #FCD34D", color: "#B45309" }}
                >
                  {error}
                </div>
              )}
              <h3 className="font-extrabold text-base leading-relaxed" style={{ color: "#1F2937" }}>
                {activeQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {activeQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  const isCorrect = idx === activeQuestion.correctIdx;

                  let customStyle = {
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    color: "#374151",
                    boxShadow: "none",
                  };

                  if (submitted) {
                    if (isCorrect) {
                      customStyle = { backgroundColor: "rgba(16,185,129,0.08)", borderColor: "#10B981", color: "#065F46", boxShadow: "none" };
                    } else if (isSelected) {
                      customStyle = { backgroundColor: "#FFF1F2", borderColor: "#EF4444", color: "#991B1B", boxShadow: "none" };
                    } else {
                      customStyle = { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" };
                    }
                  } else if (isSelected) {
                    customStyle = {
                      backgroundColor: "rgba(124,58,237,0.06)",
                      borderColor: "#7C3AED",
                      color: "#7C3AED",
                      boxShadow: "0 0 0 3px rgba(124,58,237,0.15)",
                    };
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !submitted && setSelectedOpt(idx)}
                      disabled={submitted}
                      className="w-full flex items-center justify-between p-4 border rounded-xl text-left font-semibold text-sm transition-all duration-200"
                      style={customStyle}
                    >
                      <span>{opt}</span>
                      {submitted && isCorrect && (
                        <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <span className="material-symbols-outlined text-red-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                          cancel
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t flex justify-between items-center" style={{ borderColor: "#F3F4F6" }}>
                <button
                  onClick={() => setTestStarted(false)}
                  className="text-xs font-bold transition-colors flex items-center gap-1 hover:text-red-500"
                  style={{ color: "#94A3B8" }}
                >
                  <span className="material-symbols-outlined text-sm">exit_to_app</span>
                  Quit Quiz
                </button>
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedOpt === null}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #06B6D4, #7C3AED)", boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}
                  >
                    {currentIdx + 1 === questions.length ? "Finish & Return" : "Next Challenge →"}
                  </button>
                )}
              </div>

              {/* Explanation Block */}
              {submitted && (
                <div
                  className="p-4 rounded-xl space-y-1.5 animate-slide-up"
                  style={{ backgroundColor: "#FFFBEB", border: "1px solid #FCD34D" }}
                >
                  <span className="text-[10px] font-bold block uppercase" style={{ color: "#B45309" }}>EXPLANATION</span>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-mono" style={{ color: "#6B7280" }}>
                    {activeQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Mini Tracker */}
          <div className="lg:col-span-4 bg-white border border-outline-variant rounded-2xl shadow-md p-6 space-y-5 flex flex-col">
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: "#94A3B8" }}>Quiz Scoreboard</h3>
            
            <div
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ backgroundColor: "rgba(124,58,237,0.04)", borderColor: "rgba(124,58,237,0.15)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg shadow-sm"
                style={{ backgroundColor: "#FFFFFF", border: "2px solid #7C3AED", color: "#7C3AED" }}
              >
                {score}
              </div>
              <div>
                <span className="text-xs font-bold block" style={{ color: "#1F2937" }}>Current Score</span>
                <span className="text-[10px]" style={{ color: "#6B7280" }}>
                  {currentIdx > 0
                    ? `${((score / (submitted ? currentIdx + 1 : currentIdx)) * 100).toFixed(0)}% Accuracy`
                    : "0% Accuracy"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase block" style={{ color: "#94A3B8" }}>Question Progress</span>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => {
                  const status = answers[idx];
                  const isActive = idx === currentIdx;

                  let customStyle = {
                    backgroundColor: "#FAFAFA",
                    borderColor: "#E5E7EB",
                    color: "#94A3B8",
                    boxShadow: "none",
                  };

                  if (status === true) {
                    customStyle = { backgroundColor: "rgba(16,185,129,0.06)", borderColor: "#10B981", color: "#059669", boxShadow: "none" };
                  } else if (status === false) {
                    customStyle = { backgroundColor: "#FFF1F2", borderColor: "#EF4444", color: "#EF4444", boxShadow: "none" };
                  } else if (isActive) {
                    customStyle = {
                      backgroundColor: "rgba(124,58,237,0.06)",
                      borderColor: "#7C3AED",
                      color: "#7C3AED",
                      boxShadow: "0 0 0 3px rgba(124,58,237,0.15)",
                    };
                  }

                  return (
                    <div
                      key={idx}
                      className="h-9 rounded-lg border flex items-center justify-center text-xs font-bold transition-all"
                      style={customStyle}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
