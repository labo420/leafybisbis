export function SpikyBurst() {
  const cx = 90, cy = 75;
  const outerR = 68, innerR = 43;
  const numSpikes = 9;
  const pts = Array.from({ length: numSpikes * 2 }, (_, i) => {
    const angle = (i * Math.PI) / numSpikes - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");

  // Shadow polygon (offset)
  const ptsShadow = Array.from({ length: numSpikes * 2 }, (_, i) => {
    const angle = (i * Math.PI) / numSpikes - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${(cx + 6 + r * Math.cos(angle)).toFixed(1)},${(cy + 6 + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#e8e8e8" }}>
      <svg width={180} height={150} overflow="visible">
        {/* Halftone shadow layer */}
        <defs>
          <pattern id="dots" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#000" />
          </pattern>
          <clipPath id="shadowClip">
            <polygon points={ptsShadow} />
          </clipPath>
        </defs>
        <polygon points={ptsShadow} fill="url(#dots)" clipPath="url(#shadowClip)" />
        {/* Main spiky burst */}
        <polygon points={pts} fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize={21} fontWeight={900} fontFamily="'Arial Black', Impact, sans-serif" fill="#000">
          +25 💧
        </text>
      </svg>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace", marginTop: -8 }}>V3 — Burst a punte</p>
    </div>
  );
}
