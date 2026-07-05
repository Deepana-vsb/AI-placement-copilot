"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MOTIVATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Opportunity does not waste time with those who are unprepared.", author: "Idowu Koyenikan" },
  { text: "It is not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Make your code clean and your ambition cleaner. Your dream job is one breakthrough away.", author: "Placement Copilot Team" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [quoteIndex,   setQuoteIndex]   = useState(0);
  const [fade,         setFade]         = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => { setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length); setFade(true); }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter both email and password."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      router.push(data.onboarded ? "/dashboard" : "/onboarding");
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "deepana1305@gmail.com", name: "Deepana", college: "Your University", branchYear: "2024" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Google Sign-in failed");
      router.push(data.onboarded ? "/dashboard" : "/onboarding");
    } catch (err: any) {
      setError(err.message || "Google Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{ background: "linear-gradient(135deg, #312E81 0%, #4338CA 40%, #7C3AED 80%, #06B6D4 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }}
        />
      </div>

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">

        {/* ── Left: Quotes ── */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-md">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)" }}
          >
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="font-bold text-[10px] text-white uppercase tracking-wider">Placement Motivation</span>
          </div>

          {/* Quote */}
          <div className="min-h-[160px] flex flex-col justify-center">
            <p
              className="text-2xl md:text-3xl font-bold text-white leading-snug tracking-tight transition-opacity duration-500"
              style={{ opacity: fade ? 1 : 0 }}
            >
              "{MOTIVATIONAL_QUOTES[quoteIndex].text}"
            </p>
            <p
              className="text-sm font-semibold mt-3 transition-opacity duration-500"
              style={{ color: "#C7D2FE", opacity: fade ? 1 : 0 }}
            >
              — {MOTIVATIONAL_QUOTES[quoteIndex].author}
            </p>
          </div>

          {/* Dots */}
          <div className="flex justify-center lg:justify-start gap-1.5">
            {MOTIVATIONAL_QUOTES.map((_, idx) => (
              <span
                key={idx}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: idx === quoteIndex ? "24px" : "6px",
                  backgroundColor: idx === quoteIndex ? "#FFFFFF" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>

          {/* Features */}
          <div className="hidden lg:flex flex-col gap-3 mt-4">
            {["AI-Powered Mock Interviews", "ATS Resume Optimizer", "Skill Gap Analysis", "Real-time Communication Coach"].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(6,182,212,0.25)" }}
                >
                  <span className="material-symbols-outlined text-xs" style={{ color: "#06B6D4", fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: "#E0E7FF" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Login Card ── */}
        <div className="w-full max-w-[400px] flex flex-col">
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", boxShadow: "0 8px 24px rgba(124,58,237,0.40)" }}
            >
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                rocket_launch
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Placement Copilot</h2>
            <p className="text-sm mt-1" style={{ color: "#C7D2FE" }}>Your placement prep, powered by AI.</p>
          </div>

          {/* Card */}
          <div
            className="w-full px-8 py-8"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.20)",
            }}
          >
            <h3 className="font-bold text-xl mb-1" style={{ color: "#1F2937" }}>Welcome back</h3>
            <p className="text-xs mb-6" style={{ color: "#94A3B8" }}>Sign in to continue your journey</p>

            {error && (
              <div
                className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold mb-4"
                style={{ backgroundColor: "#FFF1F2", border: "1px solid #FDA4AF", color: "#BE123C" }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#EF4444" }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: "#374151" }}>Email Address</label>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm select-none"
                    style={{ color: "#94A3B8" }}
                  >
                    mail
                  </span>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full py-3 pl-10 pr-4 text-sm"
                    style={{
                      border: "1.5px solid #E5E7EB",
                      borderRadius: "10px",
                      outline: "none",
                      color: "#1F2937",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#7C3AED";
                      e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E7EB";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold" style={{ color: "#374151" }}>Password</label>
                  <a href="#" className="text-[10px] font-bold" style={{ color: "#7C3AED" }}>Forgot password?</a>
                </div>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm select-none"
                    style={{ color: "#94A3B8" }}
                  >
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3 pl-10 pr-10 text-sm"
                    style={{
                      border: "1.5px solid #E5E7EB",
                      borderRadius: "10px",
                      outline: "none",
                      color: "#1F2937",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#7C3AED";
                      e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E7EB";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#94A3B8" }}
                  >
                    <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 mt-2"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : "Sign In →"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-5">
              <div className="flex-grow border-t" style={{ borderColor: "#F3F4F6" }} />
              <span className="mx-3 text-[10px] font-bold" style={{ color: "#94A3B8" }}>OR</span>
              <div className="flex-grow border-t" style={{ borderColor: "#F3F4F6" }} />
            </div>

            {/* Google */}
            <button
              type="button" onClick={handleGoogleSignIn} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-95"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E5E7EB",
                color: "#374151",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.2 5c1.8 0 3.3.6 4.6 1.7L20.3 3C18 1.1 15.3 0 12.2 0 7.5 0 3.5 2.7 1.6 6.6l4 3.1C6.6 6.8 9.2 5 12.2 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.5H12.2v4.8h6.4c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.6-5 3.6-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8l-4-3.1C.6 8 0 10 0 12s.6 4 .9 5.9l4.7-3.1z"/>
                <path fill="#34A853" d="M12.2 24c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1.2.8-2.7 1.3-4.3 1.3-3 0-5.6-1.8-6.6-4.7l-4 3.1C3.5 21.3 7.5 24 12.2 24z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs mt-5" style={{ color: "#94A3B8" }}>
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold" style={{ color: "#7C3AED" }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}