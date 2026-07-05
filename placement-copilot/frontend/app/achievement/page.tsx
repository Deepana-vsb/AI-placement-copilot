"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface Badge {
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  color: string;
  date?: string;
}

export default function Achievements() {
  const [xpTotal, setXpTotal] = useState(400);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setXpTotal(data.xpTotal || 0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  const BADGES: Badge[] = [
    { name: "SDE Kickoff", desc: "Successfully onboarded your prep profile", icon: "rocket_launch", unlocked: true, color: "text-blue-600 bg-blue-50 border-blue-200", date: "July 1, 2026" },
    { name: "Resume Ready", desc: "Analyzed your first resume with AI", icon: "description", unlocked: true, color: "text-[#006f66] bg-[#86f2e4]/30 border-[#86f2e4]/50", date: "July 2, 2026" },
    { name: "First Calibration", desc: "Finished your first mock technical interview", icon: "smart_toy", unlocked: true, color: "text-purple-600 bg-purple-50 border-purple-200", date: "July 2, 2026" },
    { name: "Weekly Warrior", desc: "Achieved a 7-day streak of active preparation", icon: "local_fire_department", unlocked: false, color: "text-gray-400 bg-gray-50 border-gray-200" },
    { name: "Code Master", desc: "Finished 50 coding practice problems", icon: "code", unlocked: false, color: "text-gray-400 bg-gray-50 border-gray-200" },
    { name: "System Guru", desc: "Scored over 90% in a System Design mock interview", icon: "cloud", unlocked: false, color: "text-gray-400 bg-gray-50 border-gray-200" },
  ];

  return (
    <Sidebar>
      <div className="mb-lg">
        <h2 className="font-bold text-3xl text-primary">Achievements</h2>
        <p className="text-sm text-on-surface-variant">
          Track unlocked badges, placement status, and cumulative score levels.
        </p>
      </div>

      {/* Level Card */}
      <section className="bg-white border border-outline-variant rounded-xl shadow-sm p-lg flex flex-col sm:flex-row items-center justify-between gap-md mb-lg">
        <div className="space-y-sm text-center sm:text-left">
          <span className="text-[10px] font-bold text-outline block uppercase">CURRENT LEVEL</span>
          <h3 className="font-bold text-2xl text-primary">Level {Math.max(1, Math.floor(xpTotal / 300) + 1)} Preparer</h3>
          <p className="text-xs text-on-surface-variant">
            {xpTotal} total XP accumulated. {Math.max(0, 300 - (xpTotal % 300))} XP needed for next level.
          </p>
        </div>
        <div className="w-full sm:w-64 bg-[#f2f3ff] h-4 rounded-full overflow-hidden border border-outline-variant">
          <div className="bg-secondary h-full transition-all duration-500" style={{ width: `${(xpTotal % 300) / 3}%` }}></div>
        </div>
      </section>

      {/* Badges Grid */}
      <section className="space-y-md">
        <h3 className="font-bold text-lg text-primary border-b border-[#eaedff] pb-2">Preparation Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {BADGES.map((badge, idx) => (
            <div
              key={idx}
              className={`p-lg border rounded-xl flex items-start gap-md bg-white transition-all ${
                badge.unlocked ? "border-outline-variant shadow-sm" : "border-gray-200 opacity-60"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${badge.color}`}>
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: badge.unlocked ? "'FILL' 1" : "'FILL' 0" }}>
                  {badge.icon}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-primary">{badge.name}</h4>
                  {badge.unlocked ? (
                    <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 uppercase font-bold">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase font-bold">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{badge.desc}</p>
                {badge.date && <p className="text-[10px] text-outline italic">Unlocked on {badge.date}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Sidebar>
  );
}
