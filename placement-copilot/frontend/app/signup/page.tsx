"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CollegeAutocomplete from "@/components/CollegeAutocomplete";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    branch: "CS / IT",
    year: "4th Year",
    password: "",
    confirmPassword: "",
    terms: false,
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.college || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.terms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          college: formData.college,
          branchYear: `${formData.branch} (${formData.year})`,
          location: formData.location,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed");

      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  // Shared light input style matching login page
  const inputCls = "w-full rounded-xl py-3 text-sm font-medium transition-all outline-none";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E8F0FE 40%, #EDE9FE 100%)" }}>

      {/* ── Subtle background shapes matching project theme ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* ── SIGNUP CARD ── */}
      <div className="relative z-10 w-full max-w-[440px] my-6">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(79,70,229,0.10)] px-8 py-10">

          {/* Logo Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, #1E1B6A 0%, #2D27A6 100%)" }}>
              {/* Rocket / Copilot SVG Icon */}
              <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8C32 8 20 18 20 34c0 4.4 1.6 8.4 4.2 11.5L32 56l7.8-10.5C42.4 42.4 44 38.4 44 34c0-16-12-26-12-26z"
                  fill="white" fillOpacity="0.95"/>
                <circle cx="32" cy="30" r="5" fill="#4F46E5" />
                <path d="M20 38 L14 46 L22 44 Z" fill="white" fillOpacity="0.7"/>
                <path d="M44 38 L50 46 L42 44 Z" fill="white" fillOpacity="0.7"/>
                <ellipse cx="32" cy="55" rx="4" ry="3" fill="#FCD34D" fillOpacity="0.9"/>
                <polygon points="32,4 33.2,7.2 36.5,7.2 33.9,9.1 34.9,12.3 32,10.5 29.1,12.3 30.1,9.1 27.5,7.2 30.8,7.2"
                  fill="#93C5FD" />
              </svg>
            </div>

            <h1 className="text-3xl font-black tracking-tight leading-tight"
              style={{ color: "#1E1B6A" }}>
              Create Account
            </h1>
            <p className="text-sm mt-2 font-medium" style={{ color: "#6B7280" }}>
              Join AI Placement Copilot today.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: "#374151" }}>Full Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px]"
                  style={{ color: "#9CA3AF" }}>person</span>
                <input
                  name="name" type="text" required
                  value={formData.name} onChange={handleChange}
                  className={`${inputCls} pl-11 pr-4`}
                  style={{
                    background: "#F9FAFB",
                    border: "1.5px solid #E5E7EB",
                    color: "#111827",
                  }}
                  onFocus={e => { e.target.style.border = "1.5px solid #4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)"; }}
                  onBlur={e => { e.target.style.border = "1.5px solid #E5E7EB"; e.target.style.boxShadow = "none"; }}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: "#374151" }}>College Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px]"
                  style={{ color: "#9CA3AF" }}>mail</span>
                <input
                  name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className={`${inputCls} pl-11 pr-4`}
                  style={{
                    background: "#F9FAFB",
                    border: "1.5px solid #E5E7EB",
                    color: "#111827",
                  }}
                  onFocus={e => { e.target.style.border = "1.5px solid #4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)"; }}
                  onBlur={e => { e.target.style.border = "1.5px solid #E5E7EB"; e.target.style.boxShadow = "none"; }}
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            {/* College Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: "#374151" }}>College Name</label>
              <CollegeAutocomplete
                variant="signup"
                value={formData.college}
                onChange={(val) => setFormData(prev => ({ ...prev, college: val }))}
                onLocationDetected={(loc) => setFormData(prev => ({ ...prev, location: loc }))}
              />
            </div>

            {/* Branch & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold block" style={{ color: "#374151" }}>Branch</label>
                <select name="branch" value={formData.branch} onChange={handleChange}
                  className="w-full rounded-xl py-3 px-3 text-sm font-medium outline-none transition-all"
                  style={{
                    background: "#F9FAFB",
                    border: "1.5px solid #E5E7EB",
                    color: "#111827",
                  }}
                >
                  <option>CS / IT</option>
                  <option>Mechanical</option>
                  <option>Electrical</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold block" style={{ color: "#374151" }}>Year</label>
                <select name="year" value={formData.year} onChange={handleChange}
                  className="w-full rounded-xl py-3 px-3 text-sm font-medium outline-none transition-all"
                  style={{
                    background: "#F9FAFB",
                    border: "1.5px solid #E5E7EB",
                    color: "#111827",
                  }}
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: "#374151" }}>Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px]"
                  style={{ color: "#9CA3AF" }}>lock</span>
                <input
                  name="password" type={showPassword ? "text" : "password"} required
                  value={formData.password} onChange={handleChange}
                  className={`${inputCls} pl-11 pr-11`}
                  style={{
                    background: "#F9FAFB",
                    border: "1.5px solid #E5E7EB",
                    color: "#111827",
                  }}
                  onFocus={e => { e.target.style.border = "1.5px solid #4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)"; }}
                  onBlur={e => { e.target.style.border = "1.5px solid #E5E7EB"; e.target.style.boxShadow = "none"; }}
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#9CA3AF" }}>
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: "#374151" }}>Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px]"
                  style={{ color: "#9CA3AF" }}>lock</span>
                <input
                  name="confirmPassword" type={showPassword ? "text" : "password"} required
                  value={formData.confirmPassword} onChange={handleChange}
                  className={`${inputCls} pl-11 pr-4`}
                  style={{
                    background: "#F9FAFB",
                    border: "1.5px solid #E5E7EB",
                    color: "#111827",
                  }}
                  onFocus={e => { e.target.style.border = "1.5px solid #4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)"; }}
                  onBlur={e => { e.target.style.border = "1.5px solid #E5E7EB"; e.target.style.boxShadow = "none"; }}
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
              <label htmlFor="terms" className="text-[11px] cursor-pointer select-none leading-relaxed"
                style={{ color: "#6B7280" }}>
                I agree to the{" "}
                <a href="#" className="font-bold hover:underline" style={{ color: "#4F46E5" }}>Terms of Service</a> and{" "}
                <a href="#" className="font-bold hover:underline" style={{ color: "#4F46E5" }}>Privacy Policy</a>.
              </label>
            </div>

            {/* Sign Up Button */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 font-bold text-sm rounded-xl text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{ background: "linear-gradient(135deg, #1E1B6A 0%, #2D27A6 100%)" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
              ) : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t" style={{ borderColor: "#E5E7EB" }} />
            <span className="mx-4 text-xs font-semibold" style={{ color: "#9CA3AF" }}>OR</span>
            <div className="flex-grow border-t" style={{ borderColor: "#E5E7EB" }} />
          </div>

          {/* Google */}
          <button type="button"
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all"
            style={{ background: "white", border: "1.5px solid #E5E7EB", color: "#374151" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={e => (e.currentTarget.style.background = "white")}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.2 5c1.8 0 3.3.6 4.6 1.7L20.3 3C18 1.1 15.3 0 12.2 0 7.5 0 3.5 2.7 1.6 6.6l4 3.1C6.6 6.8 9.2 5 12.2 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.5H12.2v4.8h6.4c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.6-5 3.6-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8l-4-3.1C.6 8 0 10 0 12s.6 4 .9 5.9l4.7-3.1z"/>
              <path fill="#34A853" d="M12.2 24c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1.2.8-2.7 1.3-4.3 1.3-3 0-5.6-1.8-6.6-4.7l-4 3.1C3.5 21.3 7.5 24 12.2 24z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-5" style={{ color: "#6B7280" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-black" style={{ color: "#1E1B6A" }}>
              Sign In
            </Link>
          </p>

          {/* Bottom Badge */}
          <div className="mt-5 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              Ready to crush your next technical round?
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
