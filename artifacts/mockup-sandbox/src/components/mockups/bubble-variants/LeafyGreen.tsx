export function LeafyGreen() {
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
      <div style={{ position: "relative" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #6BD9A4 0%, #2D8C5E 100%)",
            borderRadius: 24,
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 24px rgba(81,184,136,0.5), 0 2px 6px rgba(0,0,0,0.3)",
            border: "2.5px solid rgba(255,255,255,0.45)",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: 0.5,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            +25 💧
          </span>
          <div
            style={{
              position: "absolute",
              right: -12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "9px solid transparent",
              borderBottom: "9px solid transparent",
              borderLeft: "12px solid #2D8C5E",
            }}
          />
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
        Leafy Green
      </p>
    </div>
  );
}
