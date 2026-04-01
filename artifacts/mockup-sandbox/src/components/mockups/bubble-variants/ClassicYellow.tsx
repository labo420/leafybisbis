export function ClassicYellow() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: "#e8e8e8" }}>
      <div style={{ position: "relative", transform: "rotate(-3deg)" }}>
        {/* Halftone shadow */}
        <div style={{
          position: "absolute", top: 6, left: 6,
          width: "100%", height: "100%",
          borderRadius: 14,
          backgroundImage: "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
          backgroundSize: "5px 5px",
          zIndex: 0,
        }} />
        {/* Main bubble */}
        <div style={{
          position: "relative", zIndex: 1,
          background: "#fff",
          border: "3px solid #000",
          borderRadius: 14,
          padding: "11px 22px",
        }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#000", fontFamily: "'Arial Black', 'Impact', sans-serif", letterSpacing: -0.5 }}>
            +25 💧
          </span>
          {/* Arrow tail right */}
          <div style={{ position: "absolute", right: -15, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: "14px solid #000" }} />
          <div style={{ position: "absolute", right: -11, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "11px solid #fff" }} />
        </div>
      </div>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V1 — Rettangolo classico</p>
    </div>
  );
}
