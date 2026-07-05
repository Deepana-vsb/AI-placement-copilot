"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  children: React.ReactNode;
}

const MAIN_NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",    icon: "dashboard" },
  { href: "/planner",      label: "Planner",      icon: "calendar_today" },
  { href: "/studentprofile", label: "Profile",    icon: "person" },
  { href: "/achievement",  label: "Achievements", icon: "emoji_events" },
  { href: "/settings",     label: "Settings",     icon: "settings" },
];

const AI_NAV_ITEMS = [
  { href: "/resumereview",     label: "Resume Review",    icon: "description" },
  { href: "/mock",             label: "Mock Interview",   icon: "record_voice_over" },
  { href: "/skillgapanalysis", label: "Skill Gap",        icon: "query_stats" },
  { href: "/communication",    label: "Communication",    icon: "forum" },
];

const PRACTICE_NAV_ITEMS = [
  { href: "/codingpractice",  label: "Coding Practice", icon: "code" },
  { href: "/javapractice",    label: "Java Practice",   icon: "coffee" },
  { href: "/sqlpractice",     label: "SQL Practice",    icon: "database" },
  { href: "/aptitudepractice",label: "Aptitude Prep",   icon: "calculate" },
];

function NavSection({
  title,
  items,
  isActive,
}: {
  title: string;
  items: { href: string; label: string; icon: string }[];
  isActive: (href: string) => boolean;
}) {
  return (
    <div className="px-3 mb-6">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 px-3"
        style={{ color: "rgba(165,180,252,0.7)" }}
      >
        {title}
      </p>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={{
                backgroundColor: active ? "rgba(255,255,255,0.18)" : "transparent",
                color: active ? "#FFFFFF" : "rgba(199,210,254,0.85)",
                borderLeft: active ? "3px solid #06B6D4" : "3px solid transparent",
                fontWeight: active ? 700 : 500,
              }}
            >
              <span
                className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110"
                style={{
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                  color: active ? "#06B6D4" : "rgba(199,210,254,0.7)",
                }}
              >
                {item.icon}
              </span>
              <span className="truncate" style={{ color: "inherit" }}>{item.label}</span>
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#06B6D4" }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [userName,       setUserName]       = useState("Alex Chen");
  const [userEmail,      setUserEmail]      = useState("alex@university.edu");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showProModal,   setShowProModal]   = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPro,          setIsPro]          = useState(false);
  const [payLoading,     setPayLoading]     = useState(false);
  const [cardNumber,     setCardNumber]     = useState("");
  const [cardExpiry,     setCardExpiry]     = useState("");
  const [cardCVC,        setCardCVC]        = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUserName(data.user.name);
            setUserEmail(data.user.email);
            setProfilePicture(data.user.profilePicture);
            setIsPro(data.user.isPro || false);
          } else {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleUpgradePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCVC) {
      alert("Please fill in all card details for the upgrade session.");
      return;
    }
    setPayLoading(true);
    setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/upgrade", { method: "POST" });
        if (res.ok) {
          setIsPro(true);
          setShowPaymentModal(false);
          setShowProModal(true);
          setCardNumber(""); setCardExpiry(""); setCardCVC("");
        } else {
          alert("Payment gateway simulation failure. Please try again.");
        }
      } catch (err) {
        console.error(err);
        alert("Payment connection error. Please try again.");
      } finally {
        setPayLoading(false);
      }
    }, 2000);
  };

  const isLinkActive = (href: string) => pathname === href;

  return (
    <div
      className="min-h-screen pb-24 md:pb-0 md:pl-64 pt-16"
      style={{ backgroundColor: "#FCFCFF" }}
    >
      {/* ── TOP NAVBAR ── */}
      <header
        className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-6"
        style={{
          backgroundColor: "#312E81",
          boxShadow: "0 2px 20px rgba(49,46,129,0.30)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
          >
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
          </div>
          <span className="font-bold text-lg text-white tracking-tight hidden sm:block">
            Placement Copilot
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "#A5B4FC" }}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>

          {/* User Card */}
          <div className="flex items-center gap-3">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-9 h-9 rounded-xl object-cover"
                style={{ border: "2px solid rgba(255,255,255,0.2)" }}
              />
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName || "Student")}`}
                alt="Profile"
                className="w-9 h-9 rounded-xl object-cover bg-white"
                style={{ border: "2px solid rgba(255,255,255,0.2)" }}
              />
            )}

            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white leading-tight">
                  {userName}
                </span>
                {isPro ? (
                  <button
                    onClick={() => setShowProModal(true)}
                    className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(90deg, #F59E0B, #EF4444)", color: "#FFFFFF" }}
                    title="View Premium Status"
                  >
                    PRO
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all hover:scale-105 active:scale-95 animate-pulse"
                    style={{ background: "linear-gradient(90deg, #7C3AED, #06B6D4)", color: "#FFFFFF" }}
                    title="Upgrade to Pro"
                  >
                    Upgrade
                  </button>
                )}
              </div>
              <span className="text-[10px]" style={{ color: "#A5B4FC" }}>{userEmail}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/20"
              style={{ color: "#A5B4FC" }}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── SIDEBAR (Desktop) ── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-64 overflow-y-auto z-40"
        style={{ backgroundColor: "#4338CA" }}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-5 mb-2">
          <div
            className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                style={{ border: "2px solid rgba(255,255,255,0.2)" }}
              />
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName || "Student")}`}
                alt="Profile"
                className="w-9 h-9 rounded-xl object-cover bg-white flex-shrink-0"
                style={{ border: "2px solid rgba(255,255,255,0.2)" }}
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] truncate" style={{ color: "#A5B4FC" }}>{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Nav Sections */}
        <div className="flex-1 overflow-y-auto py-2">
          <NavSection title="AI Agents"    items={AI_NAV_ITEMS}       isActive={isLinkActive} />
          <NavSection title="Practice Labs" items={PRACTICE_NAV_ITEMS} isActive={isLinkActive} />
          <NavSection title="Main Menu"    items={MAIN_NAV_ITEMS}     isActive={isLinkActive} />
        </div>

        {/* Sidebar Footer */}
        <div className="px-4 py-4">
          <div
            className="p-3 rounded-2xl text-center"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.30), rgba(6,182,212,0.20))", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#C7D2FE" }}>
              Placement Copilot
            </p>
            <p className="text-[9px]" style={{ color: "#818CF8" }}>AI-Powered Career Platform</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {children}
      </main>

      {/* ── BOTTOM NAV BAR (Mobile) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-safe rounded-t-2xl"
        style={{
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E5E7EB",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {[
          { href: "/dashboard",    icon: "dashboard",         label: "Home" },
          { href: "/mock",         icon: "record_voice_over", label: "Interview" },
          { href: "/resumereview", icon: "description",       label: "Resume" },
          { href: "/codingpractice", icon: "code",            label: "Practice" },
        ].map((item) => {
          const active = isLinkActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-2 flex-1 gap-0.5 transition-all"
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{
                  color: active ? "#7C3AED" : "#9CA3AF",
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span
                className="text-[9px] font-semibold"
                style={{ color: active ? "#7C3AED" : "#9CA3AF" }}
              >
                {item.label}
              </span>
              {active && (
                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: "#7C3AED" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── PRO STATUS MODAL ── */}
      {showProModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(31,41,55,0.6)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="animate-scale-in max-w-sm w-full p-6 flex flex-col items-center text-center"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
              border: "1px solid #E5E7EB",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
            >
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
            </div>
            <h3 className="font-extrabold text-xl mb-1" style={{ color: "#1F2937" }}>PRO Membership Active</h3>
            <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
              Congratulations! Your premium developer license has unlocked all features.
            </p>
            <div
              className="w-full rounded-xl p-4 mb-5 space-y-3 text-left"
              style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}
            >
              {[
                "Unlimited AI Mock Sessions",
                "Speech Recognition Audio Input",
                "Dynamic ATS Resume Feedback",
                "Fail-Safe Multi-Collection Database",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(124,58,237,0.12)" }}
                  >
                    <span className="material-symbols-outlined text-xs" style={{ color: "#7C3AED", fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#374151" }}>{feat}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowProModal(false)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)", boxShadow: "0 4px 12px rgba(245,158,11,0.30)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(31,41,55,0.6)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="animate-scale-in max-w-sm w-full p-6"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
              border: "1px solid #E5E7EB",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
                >
                  <span className="material-symbols-outlined text-white text-lg">credit_card</span>
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: "#1F2937" }}>Secure Checkout</h3>
                  <p className="text-xs" style={{ color: "#6B7280" }}>Upgrade to Copilot Pro</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: "#6B7280" }}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Plan Badge */}
            <div
              className="p-4 rounded-xl mb-5 text-center"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#7C3AED" }}>Upgrade Plan</p>
              <p className="font-extrabold text-xl" style={{ color: "#1F2937" }}>Placement Copilot Pro</p>
              <p className="font-bold text-lg mt-1" style={{ color: "#06B6D4" }}>$9.99 / one-time</p>
            </div>

            {/* Form */}
            <form onSubmit={handleUpgradePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#374151" }}>
                  Card Number
                </label>
                <input
                  required type="text" placeholder="4242 4242 4242 4242"
                  value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm"
                  style={{ borderRadius: "10px", border: "1.5px solid #E5E7EB", outline: "none" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#374151" }}>Expiry</label>
                  <input
                    required type="text" placeholder="MM/YY"
                    value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm"
                    style={{ borderRadius: "10px", border: "1.5px solid #E5E7EB", outline: "none" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide block mb-1.5" style={{ color: "#374151" }}>CVC</label>
                  <input
                    required type="text" placeholder="123"
                    value={cardCVC} onChange={(e) => setCardCVC(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm"
                    style={{ borderRadius: "10px", border: "1.5px solid #E5E7EB", outline: "none" }}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={payLoading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", boxShadow: "0 4px 16px rgba(124,58,237,0.30)" }}
              >
                {payLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Pay & Upgrade to Pro
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
