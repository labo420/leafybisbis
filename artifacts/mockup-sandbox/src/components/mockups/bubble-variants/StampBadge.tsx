export function StampBadge() {
  // Jagged rectangle: polygon with spiky edges on all sides
  const W = 180, H = 100;
  const cx = W / 2, cy = H / 2;

  // Build a jagged rectangle using polygon points
  // Top edge: zigzag
  const step = 15;
  const spike = 8;
  const pts: string[] = [];

  // Top edge (left to right)
  for (let x = 0; x <= W; x += step) {
    pts.push(`${x},${x % (step * 2) === 0 ? 0 : spike}`);
  }
  // Right edge (top to bottom)
  for (let y = 0; y <= H; y += step) {
    pts.push(`${y % (step * 2) === 0 ? W : W - spike},${y}`);
  }
  // Bottom edge (right to left)
  for (let x = W; x >= 0; x -= step) {
    pts.push(`${x},${x % (step * 2) === 0 ? H : H - spike}`);
  }
  // Left edge (bottom to top)
  for (let y = H; y >= 0; y -= step) {
    pts.push(`${y % (step * 2) === 0 ? 0 : spike},${y}`);
  }

  const ptsStr = pts.join(" ");

  // Shadow offset version
  const ptsShadow = pts.map(p => {
    const [x, y] = p.split(",").map(Number);
    return `${x + 6},${y + 6}`;
  }).join(" ");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: "#e8e8e8" }}>
      <div style={{ position: "relative" }}>
        <svg width={W + 20} height={H + 20} overflow="visible" style={{ transform: "rotate(-2deg)" }}>
          <defs>
            <pattern id="dots3" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#000" />
            </pattern>
            <clipPath id="jaggedShadowClip">
              <polygon points={ptsShadow} transform="translate(10,8)" />
            </clipPath>
          </defs>
          {/* Halftone shadow */}
          <polygon points={ptsShadow} transform="translate(10,8)" fill="url(#dots3)" clipPath="url(#jaggedShadowClip)" />
          {/* Jagged bubble */}
          <polygon points={ptsStr} transform="translate(10,8)" fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="miter" />
          {/* Arrow tail right */}
          <polygon points={`${W + 10},${cy + 8} ${W + 24},${cy + 8} ${W + 10},${cy - 4}`} transform="translate(10,8)" fill="#fff" stroke="#000" strokeWidth={3} />
          {/* Text */}
          <text x={cx + 10} y={cy + 15} textAnchor="middle" fontSize={22} fontWeight={900} fontFamily="'Arial Black', Impact, sans-serif" fill="#000">
            +25 💧
          </text>
        </svg>
      </div>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V5 — Dentellato</p>
    </div>
  );
}
