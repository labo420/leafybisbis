export function Current() {
  const stamps = [true, true, true, false, false, false, false];
  const goldStamps = [false, false, false, false, false, false, false];

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6"
      style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        width: 360,
        height: 740,
        borderRadius: 44,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        background: "#F2F9F5",
        position: "relative",
      }}>

        {/* Status bar */}
        <div style={{ height: 40, background: "#1A3028", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 15, height: 8, background: "white", borderRadius: 2, opacity: 0.9 }} />
            <div style={{ width: 3, height: 8, background: "white", opacity: 0.5, borderRadius: 1 }} />
          </div>
        </div>

        {/* Balance bar */}
        <div style={{ background: "#2E6B50", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "rgba(255,255,255,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14 }}>🌿</span>
            </div>
            <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Ciao, Marco! 👋</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 14, height: 14, background: "#38BDF8", borderRadius: 7 }} />
              <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>1.240</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 14, height: 14, background: "#AADF2A", borderRadius: 7 }} />
              <span style={{ color: "#AADF2A", fontSize: 13, fontWeight: 700 }}>42 LEA</span>
            </div>
          </div>
        </div>

        {/* Hero dark section with level ring */}
        <div style={{ background: "#142A20", padding: "20px 0 28px", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <div style={{ position: "relative", width: 130, height: 130 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="13"/>
              <circle cx="65" cy="65" r="52" fill="none" stroke="#51B888" strokeWidth="13" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52 * 0.62} ${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * 0.25}`}
                transform="rotate(-90 65 65)"/>
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: "linear-gradient(135deg, #2E6B50, #1B2D26)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", border: "2px solid rgba(81,184,136,0.3)" }}>
                <span style={{ fontSize: 22 }}>🌱</span>
              </div>
              <div style={{ color: "#51B888", fontSize: 9, fontWeight: 600, marginTop: 3, letterSpacing: 0.5 }}>Germoglio</div>
            </div>
          </div>
          <div style={{ color: "#38BDF8", fontSize: 11, marginTop: 2, fontWeight: 500 }}>1.240 / 2.000 drops</div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", background: "#F2F9F5", paddingBottom: 72 }}>

          {/* CHECK IN classico */}
          <div style={{ margin: "12px 14px 0", borderRadius: 20, overflow: "hidden", position: "relative", padding: 14, background: "#F0F9FF", border: "1.5px solid rgba(56,189,248,0.25)", boxShadow: "0 6px 16px rgba(14,165,233,0.18)" }}>
            <div style={{ position: "absolute", top: -28, right: -28, width: 72, height: 72, borderRadius: 36, background: "rgba(56,189,248,0.10)" }} />
            <div style={{ position: "absolute", bottom: -18, left: -18, width: 55, height: 55, borderRadius: 28, background: "rgba(14,165,233,0.08)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #E0F4FF, #F0F9FF, #E8F7FF)", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13 }}>💧</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "#0369A1", letterSpacing: 1.5 }}>CHECK IN</span>
                </div>
                <div style={{ background: "rgba(56,189,248,0.12)", borderRadius: 10, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 10, color: "#0369A1", fontWeight: 600 }}>3/7</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                {stamps.map((done, i) => (
                  <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
                    background: done ? "#0EA5E9" : i === 3 ? "rgba(56,189,248,0.08)" : "rgba(56,189,248,0.05)",
                    border: done ? "none" : i === 3 ? "2px solid #38BDF8" : "1.5px dashed rgba(56,189,248,0.25)",
                    color: done ? "white" : i === 6 ? "rgba(3,105,161,0.3)" : "rgba(3,105,161,0.35)" }}>
                    {done ? "✓" : i === 6 ? "🏆" : i + 1}
                  </div>
                ))}
              </div>

              <div style={{ height: 5, background: "rgba(56,189,248,0.12)", borderRadius: 3, marginBottom: 9, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "42%", background: "linear-gradient(90deg,#38BDF8,#0EA5E9,#0369A1)", borderRadius: 3 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13 }}>🔥</span>
                  <span style={{ fontSize: 11, color: "#0369A1", fontWeight: 500 }}>3 giorni di fila</span>
                </div>
                <div style={{ background: "rgba(56,189,248,0.12)", borderRadius: 7, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0369A1" }}>+250</span>
                  <div style={{ width: 10, height: 10, background: "#38BDF8", borderRadius: 5 }} />
                </div>
              </div>
            </div>

            {/* CHECK IN overlay */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(224,244,255,0.92)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <div style={{ background: "linear-gradient(135deg,#38BDF8,#0284C7,#0369A1)", borderRadius: 13, padding: "11px 26px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(2,132,199,0.35)" }}>
                <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>💧 Fai Check In</span>
              </div>
            </div>
          </div>

          {/* CHECK IN GOLD */}
          <div style={{ margin: "10px 14px 0", borderRadius: 20, overflow: "hidden", position: "relative", padding: 14, background: "#FFFBF0", border: "1.5px solid rgba(255,215,0,0.45)", boxShadow: "0 6px 16px rgba(245,158,11,0.20)" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#FFF8E1,#FFFBF0,#FEF3C7)", zIndex: 0 }} />
            <div style={{ position: "absolute", top: -28, right: -28, width: 72, height: 72, borderRadius: 36, background: "rgba(245,158,11,0.10)" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(251,191,36,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13 }}>🌿</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "#B8860B", letterSpacing: 1.5 }}>CHECK IN GOLD</span>
                </div>
                <div style={{ background: "rgba(245,158,11,0.12)", borderRadius: 10, padding: "3px 8px" }}>
                  <span style={{ fontSize: 10, color: "#B8860B", fontWeight: 600 }}>0/7</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                {goldStamps.map((done, i) => (
                  <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
                    background: done ? "#F59E0B" : "rgba(245,158,11,0.06)",
                    border: done ? "none" : i === 0 ? "2px solid #F59E0B" : "1.5px dashed rgba(245,158,11,0.25)",
                    color: i === 6 ? "rgba(184,134,11,0.30)" : "rgba(184,134,11,0.40)" }}>
                    {i === 6 ? "👑" : i + 1}
                  </div>
                ))}
              </div>

              <div style={{ height: 5, background: "rgba(245,158,11,0.12)", borderRadius: 3, marginBottom: 9, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "0%", background: "linear-gradient(90deg,#FBBF24,#F59E0B,#D97706)", borderRadius: 3 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13 }}>🛡️</span>
                  <span style={{ fontSize: 11, color: "rgba(146,64,14,0.60)", fontWeight: 500 }}>Premio 0/7</span>
                </div>
                <div style={{ background: "rgba(245,158,11,0.12)", borderRadius: 7, padding: "3px 8px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#B8860B" }}>+50 drops</span>
                </div>
              </div>
            </div>

            {/* GOLD overlay */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,248,220,0.93)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <div style={{ background: "linear-gradient(135deg,#FFD700,#F59E0B,#D97706)", borderRadius: 13, padding: "11px 26px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(217,119,6,0.35)" }}>
                <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>⭐ Fai Check In</span>
              </div>
            </div>
          </div>

          {/* Sfide header */}
          <div style={{ margin: "14px 14px 6px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1F2937" }}>🏁 Sfide</span>
          </div>

          {/* Challenge card */}
          <div style={{ margin: "0 14px", borderRadius: 14, background: "white", border: "1px solid #E5E7EB", padding: "11px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 7 }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: "rgba(56,189,248,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🛒</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1F2937" }}>Acquisto verde</div>
                <div style={{ fontSize: 10, color: "#6B7280" }}>Compra 2 prodotti bio</div>
              </div>
            </div>
            <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "#38BDF8", borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 68, background: "rgba(255,255,255,0.96)", borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 6px 4px", flexShrink: 0 }}>
          {[["🏠","Home",true],["📜","Storico",false],["📷","",false],["🌿","Raccolto",false],["👤","Profilo",false]].map(([icon,label,active], i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
              <div style={{
                width: i === 2 ? 46 : 32, height: i === 2 ? 46 : 32, borderRadius: "50%",
                background: i === 2 ? "linear-gradient(135deg, #2E6B50, #1B2D26)" : active ? "rgba(46,107,80,0.1)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i === 2 ? 18 : 16,
                boxShadow: i === 2 ? "0 4px 12px rgba(46,107,80,0.4)" : "none",
                marginTop: i === 2 ? -14 : 0,
              }}>
                {icon}
              </div>
              {label && <span style={{ fontSize: 9, color: active ? "#2E6B50" : "#9CA3AF", fontWeight: active ? 600 : 400 }}>{label as string}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
