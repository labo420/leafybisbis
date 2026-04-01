export function LeafyGreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: "#e8e8e8" }}>
      <div style={{ position: "relative" }}>
        {/* Halftone shadow */}
        <div style={{
          position: "absolute", top: 6, left: 6,
          width: "100%", height: "100%",
          borderRadius: "50%",
          backgroundImage: "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
          backgroundSize: "5px 5px",
          zIndex: 0,
        }} />
        {/* Oval bubble */}
        <div style={{
          position: "relative", zIndex: 1,
          background: "#fff",
          border: "3px solid #000",
          borderRadius: "50%",
          width: 130,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ fontSize: 21, fontWeight: 900, color: "#000", fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
            +25 💧
          </span>
          {/* Arrow tail bottom-right */}
          <div style={{ position: "absolute", bottom: -2, right: 18, width: 0, height: 0, borderTop: "14px solid #000", borderRight: "14px solid transparent" }} />
          <div style={{ position: "absolute", bottom: 1, right: 21, width: 0, height: 0, borderTop: "11px solid #fff", borderRight: "11px solid transparent" }} />
        </div>
      </div>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V2 — Ovale</p>
    </div>
  );
}
