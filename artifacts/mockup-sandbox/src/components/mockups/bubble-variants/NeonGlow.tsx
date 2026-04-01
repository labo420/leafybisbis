export function NeonGlow() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "radial-gradient(ellipse at center, #0f2a1e 0%, #070d0a 100%)",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            background: "rgba(0, 230, 118, 0.07)",
            border: "2px solid #00E676",
            borderRadius: 10,
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            boxShadow:
              "0 0 10px #00E676, 0 0 26px rgba(0, 230, 118, 0.35), inset 0 0 14px rgba(0, 230, 118, 0.08)",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#00E676",
              fontFamily: "'Courier New', monospace",
              letterSpacing: 2,
              textShadow: "0 0 8px #00E676, 0 0 20px rgba(0,230,118,0.7)",
            }}
          >
            +25 💧
          </span>
          <div
            style={{
              position: "absolute",
              right: -13,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "9px solid transparent",
              borderBottom: "9px solid transparent",
              borderLeft: "13px solid #00E676",
              filter: "drop-shadow(0 0 4px #00E676)",
            }}
          />
        </div>
      </div>
      <p style={{ color: "rgba(0,230,118,0.35)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace" }}>
        Neon Glow
      </p>
    </div>
  );
}
