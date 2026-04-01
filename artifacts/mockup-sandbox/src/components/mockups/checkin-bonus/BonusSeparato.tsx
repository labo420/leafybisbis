import { Trophy } from "lucide-react";

const XpDrop = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2 C12 2 5 10 5 15 C5 19.4 8.1 22 12 22 C15.9 22 19 19.4 19 15 C19 10 12 2 12 2Z"
      fill="#60a5fa" stroke="#3b82f6" strokeWidth="1.2" />
  </svg>
);

const LeafIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.82C3.82 19.82 9 20 12 17C14.5 19.5 20 19 20 13C20 10 19 8 17 8Z"
      fill="#4ade80" stroke="#22c55e" strokeWidth="1.2" />
  </svg>
);

const SLOTS = [
  { done: true },
  { done: true },
  { done: false, next: true },
  { done: false },
  { done: false },
  { done: false },
  { done: false },
];

export function BonusSeparato() {
  return (
    <div
      className="min-h-screen flex flex-col gap-5 p-4 items-center justify-center"
      style={{ background: "#f3f4f6", fontFamily: "'Nunito', sans-serif" }}
    >

      {/* ─── CLASSICO ─── */}
      <div style={{ background: "#fff", borderRadius: 20, padding: "16px", width: 360, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#e8f4f0", borderRadius: 10, padding: 6 }}>
              <XpDrop size={22} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#2E6B50", letterSpacing: 1 }}>CHECK IN</span>
          </div>
          <div style={{ background: "#e8f4f0", borderRadius: 10, padding: "4px 10px" }}>
            <span style={{ fontSize: 13, color: "#2E6B50", fontWeight: 700 }}>📅 2/7</span>
          </div>
        </div>

        {/* 7 cerchi */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          {SLOTS.map((slot, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 20,
                background: slot.done ? "#2E6B50" : "rgba(0,0,0,0.05)",
                border: slot.next ? "2px solid #3a8f65" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <XpDrop size={slot.done ? 20 : 18} />
                {slot.done && (
                  <div style={{ position: "absolute", bottom: -2, right: -2, background: "#22c55e", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, color: "#fff", fontWeight: 900 }}>✓</span>
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: slot.done ? "#2E6B50" : "rgba(0,0,0,0.3)" }}>+50</span>
              <span style={{ fontSize: 9, color: slot.done ? "#2E6B50" : "rgba(0,0,0,0.25)", fontWeight: 600 }}>{i + 1}°</span>
            </div>
          ))}
        </div>

        {/* Separatore */}
        <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "4px 0 12px" }} />

        {/* Banner premio completamento */}
        <div style={{ background: "rgba(46,107,80,0.07)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.45 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Trophy size={16} color="#2E6B50" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2E6B50" }}>Bonus 7/7</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#2E6B50" }}>+1000</span>
            <XpDrop size={14} />
          </div>
        </div>
      </div>

      {/* ─── GOLD ─── */}
      <div style={{ background: "#FFFBF2", borderRadius: 20, padding: "16px", width: 360, boxShadow: "0 2px 12px rgba(184,134,11,0.1)", border: "1px solid rgba(184,134,11,0.12)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "rgba(184,134,11,0.12)", borderRadius: 10, padding: 6 }}>
              <LeafIcon size={22} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#B8860B", letterSpacing: 1 }}>CHECK IN GOLD</span>
          </div>
          <div style={{ background: "rgba(184,134,11,0.12)", borderRadius: 10, padding: "4px 10px" }}>
            <span style={{ fontSize: 13, color: "#B8860B", fontWeight: 700 }}>✦ 2/7</span>
          </div>
        </div>

        {/* 7 cerchi */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          {SLOTS.map((slot, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 20,
                background: slot.done ? "#A0760A" : "rgba(184,134,11,0.1)",
                border: slot.next ? "2px solid #B8860B" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 2, position: "relative",
              }}>
                <XpDrop size={13} />
                <LeafIcon size={13} />
                {slot.done && (
                  <div style={{ position: "absolute", bottom: -2, right: -2, background: "#22c55e", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, color: "#fff", fontWeight: 900 }}>✓</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: slot.done ? "#B8860B" : "rgba(184,134,11,0.4)" }}>+100</span>
                <XpDrop size={8} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: slot.done ? "#B8860B" : "rgba(184,134,11,0.4)" }}>+20</span>
                <LeafIcon size={8} />
              </div>
              <span style={{ fontSize: 9, color: slot.done ? "#B8860B" : "rgba(184,134,11,0.35)", fontWeight: 600 }}>{i + 1}°</span>
            </div>
          ))}
        </div>

        {/* Separatore */}
        <div style={{ height: 1, background: "rgba(184,134,11,0.15)", margin: "4px 0 12px" }} />

        {/* Banner premio completamento */}
        <div style={{ background: "rgba(184,134,11,0.09)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.45 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Trophy size={16} color="#B8860B" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#B8860B" }}>Bonus 7/7</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#B8860B" }}>+2500</span>
              <XpDrop size={13} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#B8860B" }}>+100</span>
              <LeafIcon size={13} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
