export function NeonGlow() {
  // Cloud SVG: main body + scalloped top + tail circles
  const W = 180, H = 130;
  const cloudPath = `
    M 20,75
    Q 15,75 12,68
    Q 8,60 14,53
    Q 10,47 16,42
    Q 18,30 30,30
    Q 32,18 44,16
    Q 56,10 68,18
    Q 74,10 86,12
    Q 100,8 106,20
    Q 118,16 122,28
    Q 136,28 138,42
    Q 148,48 144,60
    Q 148,72 138,76
    Q 136,82 128,82
    L 28,82
    Q 20,82 20,75
    Z
  `;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#e8e8e8" }}>
      <svg width={W} height={H} overflow="visible">
        <defs>
          <pattern id="dots2" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#000" />
          </pattern>
          <clipPath id="cloudShadowClip">
            <path d={cloudPath} transform="translate(6,6)" />
          </clipPath>
        </defs>
        {/* Halftone shadow */}
        <path d={cloudPath} transform="translate(6,6)" fill="url(#dots2)" clipPath="url(#cloudShadowClip)" />
        {/* Cloud body */}
        <path d={cloudPath} fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
        {/* Thought bubble tail: 3 circles decreasing */}
        <circle cx={118} cy={96} r={8} fill="#fff" stroke="#000" strokeWidth={3} />
        <circle cx={132} cy={108} r={5} fill="#fff" stroke="#000" strokeWidth={3} />
        <circle cx={142} cy={118} r={3} fill="#fff" stroke="#000" strokeWidth={3} />
        {/* Text */}
        <text x={80} y={58} textAnchor="middle" fontSize={20} fontWeight={900} fontFamily="'Arial Black', Impact, sans-serif" fill="#000">
          +25 💧
        </text>
      </svg>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V4 — Nuvola / Pensiero</p>
    </div>
  );
}
