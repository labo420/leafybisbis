export function ClassicYellow() {
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
      <div style={{ transform: "rotate(-4deg)", position: "relative" }}>
        <div
          style={{
            background: "#FFE135",
            border: "3px solid #111",
            borderRadius: "12px",
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            boxShadow: "3px 3px 0px #111",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#111",
              fontFamily: "'Arial Black', sans-serif",
              letterSpacing: "-0.5px",
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
              borderTop: "11px solid transparent",
              borderBottom: "11px solid transparent",
              borderLeft: "13px solid #111",
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
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: "10px solid #FFE135",
            }}
          />
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
        Classic Yellow
      </p>
    </div>
  );
}
