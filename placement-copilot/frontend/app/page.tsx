"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            if (data.onboarded) {
              router.push("/dashboard");
            } else {
              router.push("/onboarding");
            }
            return;
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF]">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">
            progress_activity
          </span>
          <span className="font-semibold text-sm text-on-surface-variant">Loading Placement Copilot...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8FF] text-[#131B2E] min-h-screen flex flex-col justify-between relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#86f2e4] rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#e3dfff] rounded-full blur-[160px]"></div>
      </div>

      {/* Header */}
      <header className="px-lg h-20 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
          <span className="font-bold text-2xl text-primary tracking-tight">Placement Copilot</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="font-semibold text-sm px-5 py-2.5 rounded-xl border border-outline-variant hover:bg-[#eaedff] transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1e1b4b] shadow-md transition-all"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-lg py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-grow">
        <div className="space-y-lg text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/20 rounded-full border border-secondary-container/30">
            <span className="material-symbols-outlined text-secondary text-sm">stars</span>
            <span className="font-bold text-xs text-secondary uppercase tracking-wider">AI-Powered Placement Officer</span>
          </div>
          <h1 className="font-extrabold text-5xl md:text-6xl text-primary tracking-tight leading-none">
            Crush your technical interviews.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Practice interactive mock interviews, perform automated resume reviews, and get customized study planners tailored for your dream software engineering roles.
          </p>
          <div className="flex gap-4 pt-4">
            <Link
              href="/signup"
              className="bg-primary text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-[#1e1b4b] hover:-translate-y-0.5 active:scale-95 shadow-lg hover:shadow-primary/20 transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="font-semibold text-base px-8 py-4 rounded-xl border border-outline-variant hover:bg-white active:scale-95 transition-all duration-200"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Visual Graphic Mockup */}
        <div className="relative flex justify-center items-center">
          <div className="w-full max-w-[480px] bg-white border border-outline-variant rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs text-on-surface-variant font-medium bg-[#faf8ff] border border-outline-variant px-3 py-1 rounded-full">
                AI Copilot System Active
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  AI
                </div>
                <div className="bg-[#f2f3ff] p-3 rounded-xl rounded-tl-none text-xs leading-relaxed max-w-[85%] text-on-surface">
                  "Hello! I am your Technical Mock Interviewer. Let's start with system design. How would you design a rate limiter for a distributed API?"
                </div>
              </div>

              <div className="flex items-start gap-3 justify-end">
                <div className="bg-[#86f2e4]/20 p-3 rounded-xl rounded-tr-none text-xs leading-relaxed max-w-[85%] text-on-surface border border-[#86f2e4]/30">
                  "I would implement a token bucket algorithm at the API gateway layer to control request velocity..."
                </div>
                <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  You
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  AI
                </div>
                <div className="bg-[#f2f3ff] p-3 rounded-xl rounded-tl-none text-xs leading-relaxed max-w-[85%] text-on-surface">
                  "Excellent choice. How would you handle synchronization issues if multiple server instances are running behind the gateway?"
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              <span>Overall Match: 94%</span>
              <span className="text-secondary">Avg Score: 4.8 / 5</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-outline-variant bg-white flex items-center justify-center text-xs text-on-surface-variant font-medium">
        © 2026 Placement Copilot. Built with Next.js, MongoDB, and LLaMA 3.3.
      </footer>
    </div>
  );
}
