export function SpikyBurst() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "radial-gradient(ellipse at center, #2D6A4F 0%, #1B4332 100%)",
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 140, height: 110 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 5,
              height: 56,
              background: i % 2 === 0 ? "#FF6B35" : "#FFB347",
              borderRadius: 3,
              top: "50%",
              left: "50%",
              transformOrigin: "50% 100%",
              transform: `translate(-50%, 0%) rotate(${i * (360 / 14)}deg) translateY(-100%)`,
              opacity: 0.9,
            }}
          />
        ))}
        <div
          style={{
            background: "#fff",
            border: "3px solid #FF6B35",
            borderRadius: 14,
            padding: "9px 16px",
            position: "relative",
            zIndex: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >
          <span
            style={{
              fontSize: 19,
              fontWeight: 900,
              color: "#FF6B35",
              fontFamily: "'Arial Black', sans-serif",
            }}
          >
            +25 💧
          </span>
          <div
            style={{
              position: "absolute",
              right: -14,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderLeft: "14px solid #FF6B35",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "7px solid transparent",
              borderBottom: "7px solid transparent",
              borderLeft: "10px solid #fff",
              zIndex: 3,
            }}
          />
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
        Spiky Burst
      </p>
    </div>
  );
}
