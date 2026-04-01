export function StampBadge() {
  const stars = [
    { top: -10, left: 22, rot: 0 },
    { top: 14, right: -12, rot: 15 },
    { bottom: -8, left: 8, rot: -10 },
    { top: -6, right: 14, rot: 20 },
  ];

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
      <div style={{ position: "relative", width: 116, height: 116 }}>
        {stars.map((s, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              fontSize: 13,
              color: "#FFE135",
              transform: `rotate(${s.rot}deg)`,
              ...s,
            }}
          >
            ✦
          </span>
        ))}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #E63946 0%, #9B111E 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid #fff",
            boxShadow: "0 0 0 3px #E63946, 0 6px 20px rgba(0,0,0,0.5)",
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: 2.5,
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            DROPS
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              fontFamily: "'Arial Black', sans-serif",
              lineHeight: 1,
            }}
          >
            +25
          </span>
          <span style={{ fontSize: 18, lineHeight: 1 }}>💧</span>
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
        Stamp Badge
      </p>
    </div>
  );
}
