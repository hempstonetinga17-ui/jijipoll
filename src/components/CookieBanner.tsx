"use client";

import { useState, useEffect } from "react";

type ConsentLevel = "essential" | "analytics" | "full";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<ConsentLevel>("essential");
  const [duration, setDuration] = useState("1 month");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Only show if user hasn't consented yet
    const consent = localStorage.getItem("jijipoll_consent");
    if (!consent) {
      // Small delay so page loads first
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem(
      "jijipoll_consent",
      JSON.stringify({ level: selected, duration, ts: Date.now() })
    );

    // Fire tracking only on analytics or full consent
    if (selected === "analytics" || selected === "full") {
      try {
        await fetch("/api/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consentLevel: selected,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
          }),
        });
      } catch {
        // Silently fail – tracking is non-critical
      }
    }

    setSaving(false);
    setVisible(false);
  };

  if (!visible) return null;

  const levels: { id: ConsentLevel; label: string; desc: string }[] = [
    {
      id: "essential",
      label: "Essential",
      desc: "Highest level of privacy. Data accessed for necessary basic operations only.",
    },
    {
      id: "analytics",
      label: "Analytics",
      desc: "Data used for analytics and to help us understand usage patterns.",
    },
    {
      id: "full",
      label: "Full Tracking",
      desc: "Data shared to help improve the site and provide personalised experience.",
    },
  ];

  const durations = ["1 month", "3 months", "6 months", "1 year"];

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.2)",
          zIndex: 9998,
          pointerEvents: "none",
        }}
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-label="Cookie consent"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          fontFamily: "'Inter', sans-serif",
          animation: "slideUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .cookie-btn-active {
            background: #1e2936 !important;
            color: #fff !important;
            border-color: #1e2936 !important;
          }
        `}</style>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "#111", marginBottom: "0.25rem" }}>
            We believe your data is your property and support your right to privacy and transparency.
          </p>
          <p style={{ fontSize: "0.78rem", color: "#555" }}>
            Select a Data Access Level and Duration to choose how we use and share your data.
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {/* Level buttons */}
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelected(lvl.id)}
              title={lvl.desc}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "999px",
                border: "1.5px solid #d1d5db",
                background: selected === lvl.id ? "#1e2936" : "#f3f4f6",
                color: selected === lvl.id ? "#fff" : "#374151",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.18s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {/* Dot indicator */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    lvl.id === "essential"
                      ? "#9ca3af"
                      : lvl.id === "analytics"
                      ? "#f59e0b"
                      : "#8b5cf6",
                  flexShrink: 0,
                }}
              />
              {lvl.label}
            </button>
          ))}

          {/* Duration dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                appearance: "none",
                padding: "0.45rem 2rem 0.45rem 0.9rem",
                borderRadius: "999px",
                border: "1.5px solid #d1d5db",
                background: "#f3f4f6",
                color: "#374151",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {durations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: "0.7rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "0.6rem",
                color: "#6b7280",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* Description of selected level */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.73rem",
            color: "#6b7280",
            maxWidth: "620px",
            margin: "0 auto",
          }}
        >
          {levels.find((l) => l.id === selected)?.desc}{" "}
          {selected === "analytics" || selected === "full"
            ? "Data shared with 3rd parties to ensure the site is secure and works on your device."
            : "Data shared with 3rd parties to ensure the site is secure and works on your device."}
        </p>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <button
            style={{
              background: "none",
              border: "none",
              color: "#10b981",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
            onClick={() => {
              // Could open a detailed settings modal
            }}
          >
            Customize
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              padding: "0.6rem 2rem",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: saving ? "wait" : "pointer",
              transition: "background 0.2s",
              boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
              opacity: saving ? 0.8 : 1,
            }}
          >
            {saving ? "Saving…" : "Save my preferences"}
          </button>

          <a
            href="/privacy-policy"
            style={{
              color: "#10b981",
              fontSize: "0.82rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Privacy policy
          </a>
        </div>
      </div>
    </>
  );
}
