"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface SkillItem {
  name: string;
  current: number;
  required: number;
  gap: number;
}

export default function SkillGapAnalysis() {
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: "Data Structures & Algorithms", current: 65, required: 85, gap: 20 },
    { name: "System Design", current: 40, required: 75, gap: 35 },
    { name: "Database Management (SQL)", current: 70, required: 80, gap: 10 },
    { name: "Frontend Technologies", current: 80, required: 70, gap: 0 },
    { name: "Communication & Pitching", current: 75, required: 80, gap: 5 },
  ]);

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
        console.error(err);
      }
    }
    loadProfile();
  }, []);

  const handleSkillChange = (index: number, newCurrent: number) => {
    const updated = [...skills];
    updated[index].current = newCurrent;
    updated[index].gap = Math.max(0, updated[index].required - newCurrent);
    setSkills(updated);
  };

  // SVG Radar Chart calculations
  const radarCenter = 160;
  const maxRadius = 100;
  const skillAngles = [0, 72, 144, 216, 288];

  const getPointsString = (type: "current" | "required") => {
    return skills
      .map((skill, index) => {
        const value = type === "current" ? skill.current : skill.required;
        const angle = (skillAngles[index] - 90) * (Math.PI / 180);
        const r = (value / 100) * maxRadius;
        const x = radarCenter + r * Math.cos(angle);
        const y = radarCenter + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const getGridPoints = (level: number) => {
    return skillAngles
      .map((angleDeg) => {
        const angle = (angleDeg - 90) * (Math.PI / 180);
        const r = (level / 100) * maxRadius;
        const x = radarCenter + r * Math.cos(angle);
        const y = radarCenter + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const labelCoords = skills.map((_, index) => {
    const angle = (skillAngles[index] - 90) * (Math.PI / 180);
    const r = maxRadius + 28;
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { x, y };
  });

  return (
    <Sidebar>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs font-semibold">
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-[#0369a1]">Skill Gap Analysis</span>
        </div>
        <h2 className="font-extrabold text-3xl text-slate-800 tracking-tight">Placement Readiness Analytics</h2>
        <p className="text-sm text-slate-500">
          Analyze and calibrate your competency levels against core requirements for <span className="font-semibold text-[#0369a1]">{targetRole}</span> roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Radar Chart & sliders */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Interactive Radar Visualizer */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Radar Chart SVG */}
              <div className="relative w-[320px] h-[320px] shrink-0 bg-slate-50/50 rounded-full p-2 border border-slate-100/50">
                <svg width="320" height="320" className="overflow-visible">
                  {/* Concentric helper grids */}
                  {[20, 40, 60, 80, 100].map((lvl) => (
                    <polygon
                      key={lvl}
                      points={getGridPoints(lvl)}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="0.75"
                      strokeDasharray="3,3"
                    />
                  ))}

                  {/* Axis lines */}
                  {skillAngles.map((angleDeg, idx) => {
                    const angle = (angleDeg - 90) * (Math.PI / 180);
                    const x = radarCenter + maxRadius * Math.cos(angle);
                    const y = radarCenter + maxRadius * Math.sin(angle);
                    return (
                      <line
                        key={idx}
                        x1={radarCenter}
                        y1={radarCenter}
                        x2={x}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Required Area */}
                  <polygon
                    points={getPointsString("required")}
                    fill="rgba(244, 63, 94, 0.05)"
                    stroke="rgba(244, 63, 94, 0.45)"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                  />

                  {/* Current Area */}
                  <polygon
                    points={getPointsString("current")}
                    fill="rgba(3, 105, 161, 0.25)"
                    stroke="#0284c7"
                    strokeWidth="3"
                  />

                  {/* Data Points */}
                  {skills.map((skill, index) => {
                    const angle = (skillAngles[index] - 90) * (Math.PI / 180);
                    const r = (skill.current / 100) * maxRadius;
                    const x = radarCenter + r * Math.cos(angle);
                    const y = radarCenter + r * Math.sin(angle);
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#0284c7"
                        stroke="#fff"
                        strokeWidth="2"
                        className="shadow-sm"
                      />
                    );
                  })}

                  {/* Dynamic Labels */}
                  {skills.map((skill, index) => {
                    const { x, y } = labelCoords[index];
                    const isRight = x > radarCenter;
                    const isCenter = Math.abs(x - radarCenter) < 10;
                    return (
                      <text
                        key={index}
                        x={x}
                        y={y}
                        textAnchor={isCenter ? "middle" : isRight ? "start" : "end"}
                        alignmentBaseline="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#475569"
                        className="select-none"
                      >
                        {skill.name.split(" ")[0]} ({skill.current}%)
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Chart Legend & Explanation */}
              <div className="space-y-4 md:pl-6 border-slate-100 md:border-l">
                <h4 className="font-bold text-slate-800 text-sm">Visual Competency Map</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The <span className="text-[#0284c7] font-semibold">blue polygon</span> represents your current self-assessed skill level. The <span className="text-rose-500 font-semibold">dotted red path</span> shows placement readiness requirements.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded bg-[#0284c7]/20 border border-[#0284c7]"></span>
                    <span className="text-slate-600 font-medium">Current Competency</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded bg-rose-50 border border-rose-400 border-dashed"></span>
                    <span className="text-slate-600 font-medium">Placement Benchmark</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Interactive Calibration Sliders */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-3 flex items-center justify-between">
              <span>Interactive Skill Calibration</span>
              <span className="text-xs font-semibold text-[#0284c7] bg-[#f0f9ff] px-2.5 py-1 rounded-full">Drag sliders to simulate score improvements</span>
            </h3>

            <div className="space-y-5">
              {skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">{skill.name}</span>
                    <span className="text-slate-500">
                      Current: <strong className="text-[#0284c7] text-sm">{skill.current}%</strong> vs Required:{" "}
                      <strong className="text-slate-600">{skill.required}%</strong>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={skill.current}
                      onChange={(e) => handleSkillChange(index, parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                    />
                  </div>

                  {skill.gap > 0 ? (
                    <div className="p-2 bg-rose-50/50 border border-rose-100/50 rounded-lg flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        Skill Gap of {skill.gap}% identified.
                      </p>
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-100/50 px-2 py-0.5 rounded">Action Required</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50/50 border border-emerald-100/50 rounded-lg flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Benchmark satisfied! Ready for placement matching.
                      </p>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded">Ready</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-3">
              Action Plan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on your target role as a <strong className="text-slate-800">{targetRole}</strong>, we recommend starting these chapters immediately to close current gaps:
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Dynamic DSA Alert Card */}
              {skills[0].current < skills[0].required && (
                <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase">DSA PRIORITY</span>
                    <span className="text-[10px] font-bold text-rose-600">-{skills[0].gap}% Gap</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 block">Trees &amp; Recursion</span>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">Close the DSA gap by traversing hierarchical structures.</p>
                  <Link href="/codingpractice">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0284c7] hover:underline cursor-pointer">
                      Start Coding Practice
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </Link>
                </div>
              )}

              {/* Dynamic System Design Alert Card */}
              {skills[1].current < skills[1].required && (
                <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">SYSTEM DESIGN</span>
                    <span className="text-[10px] font-bold text-amber-600">-{skills[1].gap}% Gap</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 block">Scale &amp; Replication</span>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">Close the gap by reviewing horizontal scaling, sharding, and caching strategies.</p>
                  <Link href="/codingpractice">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:underline cursor-pointer">
                      Review Core Architectures
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </Link>
                </div>
              )}

              {/* Dynamic Database Alert Card */}
              {skills[2].current < skills[2].required && (
                <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-extrabold text-[#0284c7] bg-sky-100 px-2 py-0.5 rounded-full uppercase">DATABASE (SQL)</span>
                    <span className="text-[10px] font-bold text-[#0284c7]">-{skills[2].gap}% Gap</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 block">SQL Queries &amp; Window Functions</span>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">Practice complex Joins, Group By queries, and analytical rank functions.</p>
                  <Link href="/sqlpractice">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0284c7] hover:underline cursor-pointer">
                      Solve SQL Problems
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </Link>
                </div>
              )}

            </div>
          </div>

          <div className="pt-6">
            <button className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-2xl text-xs shadow-md transition-all active:scale-95">
              Refactor Study Schedule
            </button>
          </div>
        </div>

      </div>
    </Sidebar>
  );
}
