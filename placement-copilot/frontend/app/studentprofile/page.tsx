"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface ProfileData {
  name: string;
  email: string;
  college: string;
  branchYear: string;
  targetRole: string;
  dob?: string;
  location?: string;
  phone?: string;
  cgpa?: number;
  tenthMark?: number;
  twelfthMark?: number;
  profilePicture?: string;
}

interface StatsData {
  xpTotal: number;
  streak: number;
  resumeCount: number;
  interviewCount: number;
  latestResumeScore: number | null;
  latestInterviewScore: number | null;
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileRes = await fetch("/api/auth/me");
        const statsRes = await fetch("/api/dashboard/stats");

        if (profileRes.ok && statsRes.ok) {
          const profileData = await profileRes.json();
          const statsData = await statsRes.json();

          if (profileData.authenticated) {
            setProfile({
              name: profileData.user.name,
              email: profileData.user.email,
              college: profileData.user.college,
              branchYear: profileData.user.branchYear,
              targetRole: profileData.targetRole || "Software Engineer",
              dob: profileData.user.dob,
              location: profileData.user.location,
              phone: profileData.user.phone,
              cgpa: profileData.user.cgpa,
              tenthMark: profileData.user.tenthMark,
              twelfthMark: profileData.user.twelfthMark,
              profilePicture: profileData.user.profilePicture,
            });
          }

          setStats(statsData);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF]">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">
            progress_activity
          </span>
          <span className="font-semibold text-sm text-on-surface-variant">Loading Profile...</span>
        </div>
      </div>
    );
  }

  const BADGES = [
    { name: "2-Week Streak", desc: "Completed practice 14 days straight", icon: "local_fire_department", color: "text-amber-600 bg-amber-50" },
    { name: "ATS Approved", desc: "Scored over 80 on resume review", icon: "verified", color: "text-[#006f66] bg-[#86f2e4]/30" },
    { name: "First Calibration", desc: "Completed first mock technical interview", icon: "smart_toy", color: "text-blue-600 bg-blue-50" },
    { name: "Placement ready", desc: "Accumulated over 500 total XP", icon: "emoji_events", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <Sidebar>
      {/* Header */}
      <div className="mb-lg">
        <h2 className="font-bold text-3xl text-primary">Student Profile</h2>
        <p className="text-sm text-on-surface-variant">
          Your personal preparation records and achievements summary.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left Card - Details */}
        <div className="lg:col-span-4 space-y-lg">
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-lg text-center">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-md border-2 border-primary shadow-sm"
              />
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile?.name || "Student")}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-md border-2 border-primary shadow-sm bg-white"
              />
            )}
            <h3 className="font-bold text-xl text-primary">{profile?.name || "Student Name"}</h3>
            <p className="text-xs text-on-surface-variant mt-1">{profile?.email}</p>

            <hr className="my-md border-outline-variant" />

            <div className="space-y-sm text-left">
              <div>
                <span className="text-[10px] font-bold text-outline block uppercase">College</span>
                <span className="text-sm font-semibold text-primary">{profile?.college}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-outline block uppercase">Branch &amp; Year</span>
                <span className="text-sm font-semibold text-primary">{profile?.branchYear}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-outline block uppercase">Target Role</span>
                <span className="text-sm font-semibold text-secondary">{profile?.targetRole}</span>
              </div>
              
              {/* DOB, Location, Phone */}
              {profile?.dob && (
                <div>
                  <span className="text-[10px] font-bold text-outline block uppercase">Date of Birth</span>
                  <span className="text-sm font-semibold text-primary">{profile.dob}</span>
                </div>
              )}
              {profile?.location && (
                <div>
                  <span className="text-[10px] font-bold text-outline block uppercase">Location</span>
                  <span className="text-sm font-semibold text-primary">{profile.location}</span>
                </div>
              )}
              {profile?.phone && (
                <div>
                  <span className="text-[10px] font-bold text-outline block uppercase">Phone Number</span>
                  <span className="text-sm font-semibold text-primary">{profile.phone}</span>
                </div>
              )}

              {/* Academics Section */}
              <hr className="my-sm border-outline-variant" />
              <span className="text-[10px] font-bold text-primary block uppercase tracking-wide mb-1">Academics</span>
              <div className="grid grid-cols-3 gap-xs pt-1">
                <div>
                  <span className="text-[9px] font-bold text-outline block uppercase">CGPA</span>
                  <span className="text-xs font-bold text-secondary">{profile?.cgpa ? `${profile.cgpa}/10` : "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-outline block uppercase">10th %</span>
                  <span className="text-xs font-bold text-secondary">{profile?.tenthMark ? `${profile.tenthMark}%` : "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-outline block uppercase">12th %</span>
                  <span className="text-xs font-bold text-secondary">{profile?.twelfthMark ? `${profile.twelfthMark}%` : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-lg grid grid-cols-2 gap-md text-center">
            <div className="p-sm bg-[#faf8ff] rounded-xl border border-outline-variant">
              <span className="font-extrabold text-2xl text-primary">{stats?.xpTotal ?? 0}</span>
              <span className="text-[10px] font-bold text-outline block uppercase">Total XP</span>
            </div>
            <div className="p-sm bg-[#faf8ff] rounded-xl border border-outline-variant">
              <span className="font-extrabold text-2xl text-secondary">{stats?.streak ?? 0}</span>
              <span className="text-[10px] font-bold text-outline block uppercase">Streak Days</span>
            </div>
          </div>
        </div>

        {/* Right Section - Badges & Performance */}
        <div className="lg:col-span-8 space-y-lg">
          {/* Achievements / Badges */}
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-lg">
            <h3 className="font-bold text-lg text-primary mb-md">Earned Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {BADGES.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-md p-md bg-[#faf8ff] border border-outline-variant rounded-xl"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.color}`}>
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {badge.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary">{badge.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white border border-outline-variant rounded-xl shadow-sm p-lg">
            <h3 className="font-bold text-lg text-primary mb-md">Evaluation Analytics</h3>
            <div className="space-y-4">
              {/* Resume rating bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-primary">Latest Resume Score</span>
                  <span className="text-secondary font-bold">
                    {stats && stats.latestResumeScore !== null ? `${stats.latestResumeScore}%` : "Not Uploaded Yet"}
                  </span>
                </div>
                <div className="w-full bg-[#f2f3ff] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${stats?.latestResumeScore ?? 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Interview rating bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-primary">Latest Interview Calibration</span>
                  <span className="text-secondary font-bold">
                    {stats && stats.latestInterviewScore !== null ? `${stats.latestInterviewScore}%` : "No Mock Completed"}
                  </span>
                </div>
                <div className="w-full bg-[#f2f3ff] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary h-full transition-all duration-500"
                    style={{ width: `${stats?.latestInterviewScore ?? 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
