"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CollegeAutocomplete from "@/components/CollegeAutocomplete";

export default function Settings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    branchYear: "",
    targetRole: "Software Engineer",
    dob: "",
    location: "",
    phone: "",
    cgpa: "",
    tenthMark: "",
    twelfthMark: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const PRESET_AVATARS = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Jack",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Zoe"
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setFormData({
              name: data.user.name || "",
              email: data.user.email || "",
              college: data.user.college || "",
              branchYear: data.user.branchYear || "",
              targetRole: data.targetRole || "Software Engineer",
              dob: data.user.dob || "",
              location: data.user.location || "",
              phone: data.user.phone || "",
              cgpa: data.user.cgpa !== null && data.user.cgpa !== undefined ? String(data.user.cgpa) : "",
              tenthMark: data.user.tenthMark !== null && data.user.tenthMark !== undefined ? String(data.user.tenthMark) : "",
              twelfthMark: data.user.twelfthMark !== null && data.user.twelfthMark !== undefined ? String(data.user.twelfthMark) : "",
              profilePicture: data.user.profilePicture || "",
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        profilePicture: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const selectAvatar = (url: string) => {
    setFormData(prev => ({
      ...prev,
      profilePicture: url
    }));
  };

  const deleteAvatar = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage("Settings updated successfully!");
      } else {
        const errData = await res.json();
        setMessage(`Error: ${errData.error || "Failed to update profile"}`);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(`Connection error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF]">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">
            progress_activity
          </span>
          <span className="font-semibold text-sm text-on-surface-variant">Loading Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <Sidebar>
      <div className="mb-lg">
        <h2 className="font-bold text-3xl text-primary">Settings</h2>
        <p className="text-sm text-on-surface-variant">
          Manage your account profile, calibration preferences, and credentials.
        </p>
      </div>

      <div className="max-w-2xl bg-white border border-outline-variant rounded-xl shadow-sm p-lg">
        {message && (
          <div className="mb-md p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <h3 className="font-bold text-base text-primary border-b border-[#eaedff] pb-2">
            Profile Picture &amp; Avatars
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-md py-md bg-[#faf8ff] p-md rounded-xl border border-outline-variant">
            {/* Preview */}
            <div className="relative">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-sm"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formData.name || "Student")}`}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-sm bg-white"
                />
              )}
              {formData.profilePicture && (
                <button
                  type="button"
                  onClick={deleteAvatar}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow active:scale-95"
                  title="Remove Picture"
                >
                  <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                </button>
              )}
            </div>

            {/* Selection Grid */}
            <div className="flex-1 space-y-sm text-center sm:text-left">
              <span className="text-xs font-semibold text-on-surface block">Choose a Preset Avatar:</span>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectAvatar(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 bg-white ${
                      formData.profilePicture === url ? "border-primary scale-110 shadow-sm" : "border-outline-variant"
                    }`}
                  >
                    <img src={url} alt="Preset Avatar" className="w-full h-full" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-xs justify-center sm:justify-start pt-1">
                <span className="text-xs text-on-surface-variant font-medium">Or upload custom image:</span>
                <label className="px-3 py-1 bg-white border border-outline-variant text-[10px] font-bold text-primary rounded-lg cursor-pointer hover:bg-slate-50 active:scale-95 shadow-sm">
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-base text-primary border-b border-[#eaedff] pb-2 pt-4">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-semibold text-xs text-on-surface block">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
                required
              />
            </div>

            <div className="space-y-xs">
              <label className="font-semibold text-xs text-on-surface block">Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-md py-3 bg-[#eaedff] border border-outline-variant rounded-xl text-sm text-on-surface-variant opacity-70"
              />
            </div>

            <div className="space-y-xs">
              <label className="font-semibold text-xs text-on-surface block">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
              />
            </div>

            <div className="space-y-xs">
              <label className="font-semibold text-xs text-on-surface block">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter 10-digit number"
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
              />
            </div>

            <div className="space-y-xs col-span-2">
              <label className="font-semibold text-xs text-on-surface block">Location / City</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
              />
            </div>
          </div>

          <h3 className="font-bold text-base text-primary border-b border-[#eaedff] pb-2 pt-4">
            Academic Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="space-y-xs">
              <label className="font-semibold text-xs text-on-surface block">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                placeholder="e.g. 8.75"
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
              />
            </div>

            <div className="space-y-xs">
              <label className="font-semibold text-xs text-on-surface block">10th Score (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tenthMark}
                onChange={(e) => setFormData({ ...formData, tenthMark: e.target.value })}
                placeholder="e.g. 92.5"
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
              />
            </div>

            <div className="space-y-xs">
              <label className="font-semibold text-xs text-on-surface block">12th Score (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.twelfthMark}
                onChange={(e) => setFormData({ ...formData, twelfthMark: e.target.value })}
                placeholder="e.g. 89.0"
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
              />
            </div>

            <div className="space-y-xs col-span-2">
              <label className="font-semibold text-xs text-on-surface block">College Name</label>
              <CollegeAutocomplete
                variant="settings"
                value={formData.college}
                onChange={(val) => setFormData({ ...formData, college: val })}
                onLocationDetected={(loc) => setFormData(prev => ({ ...prev, location: loc }))}
              />
            </div>

            <div className="space-y-xs col-span-1">
              <label className="font-semibold text-xs text-on-surface block">Branch &amp; Graduation Year</label>
              <input
                type="text"
                value={formData.branchYear}
                onChange={(e) => setFormData({ ...formData, branchYear: e.target.value })}
                placeholder="e.g. CSE 2025"
                className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
                required
              />
            </div>
          </div>

          <h3 className="font-bold text-base text-primary border-b border-[#eaedff] pb-2 pt-4">
            Preferences
          </h3>

          <div className="space-y-xs">
            <label className="font-semibold text-xs text-on-surface block">Target Placement Role</label>
            <select
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="w-full px-md py-3 bg-[#faf8ff] border border-outline-variant rounded-xl text-sm text-on-surface"
            >
              <option>SDE / Software Engineer</option>
              <option>Data Analyst</option>
              <option>Data Scientist</option>
              <option>Full Stack Developer</option>
              <option>ML Engineer</option>
              <option>Other</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-xl py-3 bg-primary hover:bg-[#1e1b4b] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
}
