"use client";

import React, { useState, useEffect, useRef } from "react";

interface University {
  name: string;
  country: string;
  "state-province": string | null;
}

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationDetected?: (location: string) => void;
  variant?: "signup" | "settings";
}

export default function CollegeAutocomplete({
  value,
  onChange,
  onLocationDetected,
  variant = "signup",
}: CollegeAutocompleteProps) {
  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value || value.length < 3) {
      setResults([]);
      return;
    }

    const fetchColleges = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(value)}&limit=10`);
        const data = await res.json();
        setResults(data.slice(0, 5)); // show top 5
      } catch (error) {
        console.error("Error fetching universities:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchColleges();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (uni: University) => {
    onChange(uni.name);
    setShowDropdown(false);
    if (onLocationDetected) {
      const locationParts = [];
      if (uni["state-province"]) locationParts.push(uni["state-province"]);
      if (uni.country) locationParts.push(uni.country);
      onLocationDetected(locationParts.join(", "));
    }
  };

  const inputCls = variant === "signup" 
    ? "w-full rounded-xl py-3 text-sm font-medium transition-all outline-none pl-11 pr-4"
    : "w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  const inputStyle = variant === "signup"
    ? { background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#111827" }
    : {};

  return (
    <div className="relative group" ref={wrapperRef}>
      {variant === "signup" && (
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px]"
          style={{ color: "#9CA3AF" }}>school</span>
      )}
      
      <input
        name="college"
        type="text"
        required
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={(e) => {
          setShowDropdown(true);
          if (variant === "signup") {
            e.target.style.border = "1.5px solid #4F46E5"; 
            e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)";
          }
        }}
        onBlur={(e) => {
          if (variant === "signup") {
            e.target.style.border = "1.5px solid #E5E7EB"; 
            e.target.style.boxShadow = "none";
          }
        }}
        className={inputCls}
        style={inputStyle}
        placeholder="Enter your college name"
        autoComplete="off"
      />

      {/* Dropdown */}
      {showDropdown && (value.length >= 3) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center animate-pulse">Searching...</div>
          ) : results.length > 0 ? (
            <ul className="max-h-60 overflow-auto scrollbar-thin">
              {results.map((uni, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(uni)}
                  className="px-4 py-3 hover:bg-indigo-50/80 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="text-sm font-semibold text-gray-800">{uni.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    {uni["state-province"] ? `${uni["state-province"]}, ` : ""}{uni.country}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">No universities found</div>
          )}
        </div>
      )}
    </div>
  );
}
