export function BubbleSpiky() {
  const css = `
    @keyframes bkFly {
      0%   { opacity:0; transform:translateY(0) scale(0) rotate(0deg); }
      8%   { opacity:1; transform:translateY(0) scale(1.12) rotate(-5deg); }
      14%  { opacity:1; transform:translateY(0) scale(0.94) rotate(2deg); }
      19%  { opacity:1; transform:translateY(0) scale(1) rotate(0deg); }
      73%  { opacity:1; transform:translateY(-80px) scale(1) rotate(-8deg); }
      85%  { opacity:0; transform:translateY(-96px) scale(1.9) rotate(-15deg); }
      100% { opacity:0; transform:translateY(0) scale(0) rotate(0deg); }
    }
    @keyframes bkP1 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(0,-28px)scale(0.3)} 100%{opacity:0} }
    @keyframes bkP2 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(26px,-19px)scale(0.3)} 100%{opacity:0} }
    @keyframes bkP3 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(30px,4px)scale(0.3)} 100%{opacity:0} }
    @keyframes bkP4 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-26px,-19px)scale(0.3)} 100%{opacity:0} }
    @keyframes bkP5 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-30px,4px)scale(0.3)} 100%{opacity:0} }
    @keyframes bkP6 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(0,18px)scale(0.3)} 100%{opacity:0} }
  `;

  // SVG spiky burst polygon
  const cx = 45, cy = 45;
  const outerR = 42, innerR = 26;
  const numSpikes = 8;
  const pts = Array.from({ length: numSpikes * 2 }, (_, i) => {
    const angle = (i * Math.PI) / numSpikes - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");

  const dur = "3s";
  const ease = "ease-in-out";
  const inf = "infinite";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#e8e8e8" }}>
      <style>{css}</style>
      <div style={{ position: "relative", width: 240, height: 260 }}>
        {/* Burst particles (90×90 bubble, center at pop: left=120, bottom=175; particles at 116,171) */}
        {["bkP1","bkP2","bkP3","bkP4","bkP5","bkP6"].map((anim, i) => (
          <div key={i} style={{
            position: "absolute", left: 116, bottom: 175,
            width: 7, height: 7, borderRadius: "50%", background: "#000",
            animation: `${anim} ${dur} ${ease} ${inf}`,
          }} />
        ))}

        {/* Spiky bubble */}
        <div style={{
          position: "absolute", left: 75, bottom: 50,
          animation: `bkFly ${dur} ${ease} ${inf}`,
          transformOrigin: "center center",
        }}>
          {/* Shadow */}
          <svg width={90} height={90} style={{ position: "absolute", top: 5, left: 5 }}>
            <polygon points={pts}
              fill="none"
              style={{
                fill: "transparent",
              }}
            />
            {/* Halftone dot shadow */}
            <defs>
              <pattern id="bkDots" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="#000" />
              </pattern>
              <clipPath id="bkClip">
                <polygon points={pts} />
              </clipPath>
            </defs>
            <polygon points={pts} fill="url(#bkDots)" clipPath="url(#bkClip)" opacity={0.8} />
          </svg>
          {/* Main burst */}
          <svg width={90} height={90}>
            <polygon points={pts} fill="#fff" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
            <text x={cx} y={cy + 7} textAnchor="middle" fontSize={15} fontWeight={900} fontFamily="'Arial Black', Impact, sans-serif" fill="#000">
              +25 💧
            </text>
          </svg>
        </div>
      </div>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V3 — Burst a punte</p>
    </div>
  );
}
