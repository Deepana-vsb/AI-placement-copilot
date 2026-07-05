"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  { id: "SDE / Software Engineer", label: "SDE / Software Engineer", icon: "terminal" },
  { id: "Data Analyst", label: "Data Analyst", icon: "analytics" },
  { id: "Data Scientist", label: "Data Scientist", icon: "science" },
  { id: "Full Stack Developer", label: "Full Stack Developer", icon: "layers" },
  { id: "ML Engineer", label: "ML Engineer", icon: "psychology" },
  { id: "Other", label: "Other", icon: "more_horiz" },
];

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Stripe",
  "Uber",
  "TCS",
  "Infosys",
];

const SKILL_DOMAINS = [
  { id: "dsa", label: "Data Structures & Algorithms" },
  { id: "systemDesign", label: "System Design" },
  { id: "dbms", label: "Database Management" },
  { id: "frontend", label: "Frontend Development" },
  { id: "backend", label: "Backend Development" },
  { id: "communication", label: "Communication Skills" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState("");
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [selfRatedSkills, setSelfRatedSkills] = useState<Record<string, number>>({
    dsa: 3,
    systemDesign: 3,
    dbms: 3,
    frontend: 3,
    backend: 3,
    communication: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompanyToggle = (company: string) => {
    if (targetCompanies.includes(company)) {
      setTargetCompanies(targetCompanies.filter((c) => c !== company));
    } else {
      setTargetCompanies([...targetCompanies, company]);
    }
  };

  const handleSkillRate = (skillId: string, rating: number) => {
    setSelfRatedSkills((prev) => ({ ...prev, [skillId]: rating }));
  };

  const handleNext = () => {
    if (step === 1 && !targetRole) {
      setError("Please select a target role to continue.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (targetCompanies.length === 0) {
      setError("Please select at least one target company.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          targetCompanies,
          selfRatedSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save onboarding details");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred saving your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8FF] text-[#131B2E] min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4 md:p-6">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#86f2e4] rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#e3dfff] rounded-full blur-[140px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[640px] px-md md:px-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Progress Indicator */}
        <div className="mb-lg space-y-md">
          <div className="flex h-1.5 w-full bg-[#dae2fd] rounded-full overflow-hidden">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,106,97,0.3)]"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-center">
            <span className="font-semibold text-xs text-on-surface-variant bg-[#f2f3ff] px-3 py-1 rounded-full border border-outline-variant">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-md md:p-xl p-lg space-y-lg relative overflow-hidden min-h-[420px] flex flex-col justify-between">
          <div>
            {error && (
              <div className="p-3 bg-error-container text-error rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-md">error</span>
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-sm">
                  <h1 className="font-bold text-2xl md:text-3xl text-primary tracking-tight">
                    What's your target role?
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-[400px] mx-auto">
                    We'll tailor your interview practice and learning path based on your career goal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-md">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      className={`group flex items-center justify-between p-lg border rounded-xl bg-[#faf8ff] hover:border-primary hover:shadow-md transition-all duration-200 text-left active:scale-95 ${
                        targetRole === role.id ? "border-primary bg-[#86f2e4]/10" : "border-outline-variant"
                      }`}
                      onClick={() => setTargetRole(role.id)}
                    >
                      <div className="flex items-center gap-md">
                        <div
                          className={`p-sm rounded-lg transition-colors ${
                            targetRole === role.id ? "bg-[#006a61]/10 text-secondary" : "bg-white text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined">{role.icon}</span>
                        </div>
                        <span className="font-semibold text-sm">{role.label}</span>
                      </div>
                      {targetRole === role.id && (
                        <span
                          className="material-symbols-outlined text-secondary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-sm">
                  <h1 className="font-bold text-2xl md:text-3xl text-primary tracking-tight">
                    Select your target companies
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-[400px] mx-auto">
                    Choose the organizations you are preparing for. You can choose multiple.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-md pt-md">
                  {COMPANIES.map((company) => {
                    const isSelected = targetCompanies.includes(company);
                    return (
                      <button
                        key={company}
                        onClick={() => handleCompanyToggle(company)}
                        className={`p-lg border rounded-xl text-center font-semibold text-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? "border-primary bg-[#86f2e4]/15 shadow-sm text-primary"
                            : "border-outline-variant bg-[#faf8ff] hover:bg-[#eaedff]"
                        }`}
                      >
                        {company}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-sm">
                  <h1 className="font-bold text-2xl md:text-3xl text-primary tracking-tight">
                    Rate your current skills
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-[400px] mx-auto">
                    Help us baseline your initial prep level by rating your confidence.
                  </p>
                </div>

                <div className="space-y-md pt-md">
                  {SKILL_DOMAINS.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-md border border-outline-variant rounded-xl bg-[#faf8ff]"
                    >
                      <span className="font-semibold text-sm mb-2 sm:mb-0">{skill.label}</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (selfRatedSkills[skill.id] || 0) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleSkillRate(skill.id, star)}
                              className="text-2xl text-amber-500 focus:outline-none transition-transform hover:scale-125"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-xl border-t border-outline-variant mt-6">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="font-semibold text-sm text-on-surface-variant hover:text-primary transition-colors px-md py-2 disabled:opacity-30"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="bg-primary hover:bg-[#1e1b4b] text-white px-xl py-3 rounded-full font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95 duration-200"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#006a61] hover:bg-[#005049] text-white px-xl py-3 rounded-full font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95 duration-200 disabled:opacity-50"
              >
                {loading ? "Saving Profile..." : "Finish Onboarding"}
              </button>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <p className="text-center mt-lg font-semibold text-xs text-on-surface-variant opacity-60">
          Securely powered by Placement Copilot Engine.
        </p>
      </main>
    </div>
  );
}
