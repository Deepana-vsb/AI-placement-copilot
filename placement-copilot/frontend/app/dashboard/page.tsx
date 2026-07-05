"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface DashboardStats {
  xpTotal: number;
  streak: number;
  resumeCount: number;
  interviewCount: number;
  latestResumeScore: number | null;
  latestInterviewScore: number | null;
  weakTopicAlert: {
    topic: string;
    details: string;
    actionText: string;
    actionUrl: string;
  };
}

const KpiCard = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  barColor,
  barWidth,
  badge,
  delay = 0,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  barColor: string;
  barWidth: number;
  badge?: string;
  delay?: number;
}) => (
  <div
    className="animate-fade-in-up lav-card p-6 flex flex-col gap-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      {badge && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{
            backgroundColor: "rgba(6,182,212,0.12)",
            color: "#06B6D4",
          }}
        >
          {badge}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>
        {label}
      </p>
      <h4 className="font-extrabold text-2xl" style={{ color: "#1F2937" }}>
        {value}
      </h4>
    </div>
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(barWidth, 100)}%`,
          background: `linear-gradient(90deg, ${barColor}, #06B6D4)`,
        }}
      />
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Solve 2 Hard DP Problems", desc: "Estimated: 1.5 Hours", completed: false },
    { id: 2, text: "AI Mock Interview: System Design", desc: "Scheduled for 4:00 PM", completed: false },
    { id: 3, text: "Update Portfolio Case Study", desc: "Design Mockups", completed: false },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated) setUserName(authData.user.name);
        }
        const statsRes = await fetch("/api/dashboard/stats");
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTaskToggle = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FCFCFF" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
          >
            <span className="material-symbols-outlined text-white text-2xl animate-spin">
              progress_activity
            </span>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#6B7280" }}>
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  const remainingTasks = tasks.filter((t) => !t.completed).length;
  const placementPct = stats?.xpTotal ? Math.min(Math.round((stats.xpTotal / 1000) * 100), 100) : 40;
  const circumference = 339.29;

  return (
    <Sidebar>
      {/* ── Welcome Hero ── */}
      <section
        className="animate-fade-in-up lav-card p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4338CA 50%, #312E81 100%)" }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }}
        />
        <div
          className="absolute -bottom-12 right-32 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FFFFFF, transparent)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#A5B4FC" }}>
              Welcome back
            </p>
            <h2 className="font-extrabold text-3xl md:text-4xl text-white mb-3">
              {userName} 👋
            </h2>
            <p style={{ color: "#C7D2FE" }} className="max-w-lg text-sm leading-relaxed">
              You're making great progress! Keep the momentum going to reach your dream placement goal.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <Link
                href="/mock"
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                Start Mock Interview
              </Link>
              <Link
                href="/resumereview"
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#06B6D4", color: "#FFFFFF" }}
              >
                Review Resume
              </Link>
            </div>
          </div>

          {/* Circular Placement Score */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r="54" fill="none"
                  stroke="#06B6D4"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (circumference * placementPct) / 100}
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-2xl text-white leading-none">{placementPct}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#A5B4FC" }}>Ready</span>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="font-bold text-white">Placement Ready</p>
              <p className="text-xs mt-0.5" style={{ color: "#C7D2FE" }}>Top candidate level</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI Stats Grid ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon="local_fire_department"
          iconBg="#FEF3C7"
          iconColor="#D97706"
          label="Coding Streak"
          value={`${stats?.streak ?? 0} ${stats?.streak === 1 ? "Day" : "Days"}`}
          barColor="#F59E0B"
          barWidth={(stats?.streak ?? 0) * 10}
          badge="Active"
          delay={50}
        />
        <KpiCard
          icon="description"
          iconBg="rgba(124,58,237,0.12)"
          iconColor="#7C3AED"
          label="Resume Score"
          value={stats?.latestResumeScore != null ? `${stats.latestResumeScore}%` : "N/A"}
          barColor="#7C3AED"
          barWidth={stats?.latestResumeScore ?? 0}
          delay={100}
        />
        <KpiCard
          icon="star"
          iconBg="rgba(6,182,212,0.12)"
          iconColor="#06B6D4"
          label="Interview Avg"
          value={stats?.latestInterviewScore != null ? `${stats.latestInterviewScore}%` : "N/A"}
          barColor="#06B6D4"
          barWidth={stats?.latestInterviewScore ?? 0}
          delay={150}
        />
        <KpiCard
          icon="emoji_events"
          iconBg="#EDE9FE"
          iconColor="#7C3AED"
          label="Total XP"
          value={`${stats?.xpTotal ?? 0} XP`}
          barColor="#7C3AED"
          barWidth={Math.min((stats?.xpTotal ?? 0) / 10, 100)}
          delay={200}
        />
      </section>

      {/* ── Bento Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Plan */}
        <div className="lg:col-span-7 animate-fade-in-up lav-card p-6 stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(124,58,237,0.10)" }}
              >
                <span className="material-symbols-outlined text-lg" style={{ color: "#7C3AED" }}>checklist</span>
              </div>
              <h3 className="font-bold text-lg" style={{ color: "#1F2937" }}>Today's Plan</h3>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
            >
              {remainingTasks} Remaining
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <label
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group"
                style={{
                  borderColor: task.completed ? "#E5E7EB" : "rgba(124,58,237,0.20)",
                  backgroundColor: task.completed ? "#FAFAFA" : "#FFFFFF",
                }}
              >
                <input
                  className="w-4 h-4 rounded accent-purple-600"
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleTaskToggle(task.id)}
                  style={{ accentColor: "#7C3AED" }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm transition-all"
                    style={{
                      color: task.completed ? "#9CA3AF" : "#1F2937",
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  >
                    {task.text}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{task.desc}</p>
                </div>
                <span
                  className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#7C3AED" }}
                >
                  chevron_right
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Column */}
        {stats?.weakTopicAlert && (
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Alert Card */}
            <div
              className="animate-fade-in-up lav-card p-6 relative overflow-hidden stagger-3"
              style={{ border: "1px solid #FCD34D" }}
            >
              <div
                className="absolute -right-8 -top-8 opacity-10"
                style={{ color: "#F59E0B" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>warning</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="material-symbols-outlined text-amber-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
                <h3 className="font-bold text-base" style={{ color: "#B45309" }}>Analytics Alert</h3>
              </div>
              <h4 className="font-bold text-lg mb-2" style={{ color: "#1F2937" }}>
                {stats.weakTopicAlert.topic}
              </h4>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B7280" }}>
                {stats.weakTopicAlert.details}
              </p>
              <Link
                href={stats.weakTopicAlert.actionUrl}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", boxShadow: "0 4px 16px rgba(124,58,237,0.30)" }}
              >
                {stats.weakTopicAlert.actionText}
                <span className="material-symbols-outlined text-base">bolt</span>
              </Link>
            </div>

            {/* Weekly Goal */}
            <div
              className="animate-fade-in-up lav-card p-5 flex items-center justify-between stagger-4"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.06))" }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#7C3AED" }}>
                  Weekly Goal
                </p>
                <h5 className="font-bold text-xl" style={{ color: "#1F2937" }}>
                  {(stats as any)?.solvedProblems ?? 0}/10 Problems Done
                </h5>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
              >
                <span className="material-symbols-outlined text-white text-xl">trending_up</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Recent Activity ── */}
      <section className="animate-fade-in-up lav-card p-6 stagger-4">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(6,182,212,0.12)" }}
          >
            <span className="material-symbols-outlined text-lg" style={{ color: "#06B6D4" }}>history</span>
          </div>
          <h3 className="font-bold text-lg" style={{ color: "#1F2937" }}>Recent Activity</h3>
        </div>

        <div className="space-y-0 divide-y" style={{ borderColor: "#F3F4F6" }}>
          {stats?.resumeCount && stats.resumeCount > 0 ? (
            <div className="flex items-center gap-4 py-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(124,58,237,0.10)" }}
              >
                <span className="material-symbols-outlined text-base" style={{ color: "#7C3AED" }}>description</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>Completed Resume Review</p>
                <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Formatted in What/How/Impact syntax</p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
              >
                +150 XP
              </span>
            </div>
          ) : null}

          {stats?.interviewCount && stats.interviewCount > 0 ? (
            <div className="flex items-center gap-4 py-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(6,182,212,0.10)" }}
              >
                <span className="material-symbols-outlined text-base" style={{ color: "#06B6D4" }}>record_voice_over</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>Finished Mock Interview Session</p>
                <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Calibrated technical score and answers</p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(6,182,212,0.10)", color: "#06B6D4" }}
              >
                +250 XP
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-4 py-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(124,58,237,0.10)" }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: "#7C3AED" }}>code</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>Solved "Longest Common Subsequence"</p>
              <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Category: Dynamic Programming • 2 hours ago</p>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
            >
              +50 XP
            </span>
          </div>

          <div className="flex items-center gap-4 py-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: "#D97706", fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>Earned Badge: "Placement Ready Star"</p>
              <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Unlocked after completing initial profile setup</p>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "#FEF3C7", color: "#B45309" }}
            >
              Achievement
            </span>
          </div>
        </div>
      </section>
    </Sidebar>
  );
}
