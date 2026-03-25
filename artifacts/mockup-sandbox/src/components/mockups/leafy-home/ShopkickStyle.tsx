export function ShopkickStyle() {
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
        background: "#F8F9FA",
        position: "relative",
      }}>

        {/* Status bar */}
        <div style={{ height: 40, background: "#F8F9FA", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <span style={{ color: "#1F2937", fontSize: 12, fontWeight: 700 }}>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 15, height: 8, background: "#1F2937", borderRadius: 2, opacity: 0.7 }} />
            <div style={{ width: 3, height: 8, background: "#1F2937", opacity: 0.3, borderRadius: 1 }} />
          </div>
        </div>

        {/* Header — clean, light */}
        <div style={{ background: "#F8F9FA", padding: "8px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>Ciao, Marco</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1F2937", lineHeight: 1.2 }}>
              1.240 <span style={{ color: "#2E6B50" }}>drops</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#6B7280" }}>LEA Token</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2E6B50" }}>42 LEA</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: "#2E6B50", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700 }}>M</div>
          </div>
        </div>

        {/* Level — compact strip */}
        <div style={{ background: "#fff", padding: "10px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(0,0,0,0.05)", flexShrink: 0 }}>
          <div style={{ position: "relative", width: 44, height: 44 }}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#E5E7EB" strokeWidth="4"/>
              <circle cx="22" cy="22" r="18" fill="none" stroke="#2E6B50" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 18 * 0.62} ${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * 0.25}`}
                transform="rotate(-90 22 22)"/>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌱</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>Germoglio</div>
            <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "62%", background: "#2E6B50", borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>62%</div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", background: "#F8F9FA", paddingBottom: 68 }}>

          {/* Section label */}
          <div style={{ padding: "14px 18px 6px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", letterSpacing: 0.8, textTransform: "uppercase" as const }}>Check-in giornaliero</span>
          </div>

          {/* CHECK IN classico — CLEAN */}
          <div style={{ margin: "0 14px", borderRadius: 16, background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative" }}>
            <div style={{ padding: "14px 14px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(46,107,80,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13 }}>📅</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>Check-in</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>3 giorni di fila 🔥</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#2E6B50", fontWeight: 600 }}>+250 drops</div>
              </div>

              <div style={{ display: "flex", gap: 4 }}>
                {stamps.map((done, i) => (
                  <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600,
                    background: done ? "#2E6B50" : i === 3 ? "rgba(46,107,80,0.06)" : "rgba(0,0,0,0.03)",
                    border: done ? "none" : i === 3 ? "1.5px solid #2E6B50" : "1.5px solid rgba(0,0,0,0.08)",
                    color: done ? "white" : i === 3 ? "#2E6B50" : i === 6 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.3)" }}>
                    {done ? "✓" : i === 6 ? "★" : i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay check-in */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(248,249,250,0.94)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "#2E6B50", borderRadius: 12, padding: "12px 28px", boxShadow: "0 4px 16px rgba(46,107,80,0.30)" }}>
                <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Fai Check-in</span>
              </div>
            </div>
          </div>

          {/* CHECK IN GOLD — CLEAN */}
          <div style={{ margin: "10px 14px 0", borderRadius: 16, background: "white", border: "1px solid rgba(212,160,23,0.20)", boxShadow: "0 2px 12px rgba(212,160,23,0.10)", overflow: "hidden", position: "relative" }}>
            <div style={{ padding: "14px 14px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(212,160,23,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13 }}>⭐</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>Check-in Gold</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>Ricompense settimanali</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#D4A017", fontWeight: 600 }}>+50 drops</div>
              </div>

              <div style={{ display: "flex", gap: 4 }}>
                {goldStamps.map((done, i) => (
                  <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600,
                    background: done ? "#D4A017" : "rgba(0,0,0,0.03)",
                    border: done ? "none" : i === 0 ? "1.5px solid #D4A017" : "1.5px solid rgba(0,0,0,0.08)",
                    color: done ? "white" : i === 0 ? "#D4A017" : i === 6 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.3)" }}>
                    {done ? "✓" : i === 6 ? "★" : i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay gold check-in */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,253,245,0.94)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "#D4A017", borderRadius: 12, padding: "12px 28px", boxShadow: "0 4px 16px rgba(212,160,23,0.30)" }}>
                <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Fai Check-in Gold</span>
              </div>
            </div>
          </div>

          {/* Sfide section */}
          <div style={{ padding: "16px 18px 6px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", letterSpacing: 0.8, textTransform: "uppercase" as const }}>Le tue sfide</span>
          </div>

          <div style={{ margin: "0 14px", borderRadius: 14, background: "white", border: "1px solid rgba(0,0,0,0.06)", padding: "12px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(46,107,80,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🛒</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>Acquisto verde</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>2 prodotti bio</div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#2E6B50" }}>+80</div>
            </div>
            <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "#2E6B50", borderRadius: 2 }} />
            </div>
          </div>

          <div style={{ margin: "8px 14px 0", borderRadius: 14, background: "white", border: "1px solid rgba(0,0,0,0.06)", padding: "12px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(46,107,80,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>♻️</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>Senza plastica</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>3 prodotti senza plastica</div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#2E6B50" }}>+120</div>
            </div>
            <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "33%", background: "#2E6B50", borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Tab bar — icon only, minimal */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 62, background: "white", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 8px 2px", flexShrink: 0 }}>
          {[["🏠",true],["📜",false],["📷",false],["🌿",false],["👤",false]].map(([icon, active], i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: i === 2 ? 42 : 28, height: i === 2 ? 42 : 28, borderRadius: "50%",
                background: i === 2 ? "#2E6B50" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i === 2 ? 16 : 18,
                boxShadow: i === 2 ? "0 2px 8px rgba(46,107,80,0.35)" : "none",
                marginTop: i === 2 ? -16 : 0,
                filter: !active && i !== 2 ? "grayscale(1) opacity(0.4)" : "none",
              }}>
                {icon}
              </div>
              {i === 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#2E6B50", marginTop: 2 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
