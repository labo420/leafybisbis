export function BubbleClassic() {
  const css = `
    @keyframes bcFly {
      0%   { opacity:0; transform:translateY(0) scale(0); }
      8%   { opacity:1; transform:translateY(0) scale(1.14); }
      13%  { opacity:1; transform:translateY(0) scale(0.93); }
      19%  { opacity:1; transform:translateY(0) scale(1); }
      73%  { opacity:1; transform:translateY(-80px) scale(1); }
      85%  { opacity:0; transform:translateY(-94px) scale(1.75); }
      100% { opacity:0; transform:translateY(0) scale(0); }
    }
    @keyframes bcUp  { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(0px,-24px)scale(0.4)} 100%{opacity:0} }
    @keyframes bcUR  { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(22px,-17px)scale(0.4)} 100%{opacity:0} }
    @keyframes bcR   { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(27px,2px)scale(0.4)} 100%{opacity:0} }
    @keyframes bcUL  { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-22px,-17px)scale(0.4)} 100%{opacity:0} }
    @keyframes bcL   { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-27px,2px)scale(0.4)} 100%{opacity:0} }
  `;

  const dur = "3s";
  const ease = "ease-in-out";
  const inf = "infinite";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#e8e8e8" }}>
      <style>{css}</style>
      <div style={{ position: "relative", width: 240, height: 260 }}>
        {/* Burst particles — anchored at pop center (left:116, bottom:154) */}
        {[
          { anim: "bcUp",  left: 116, bottom: 154 },
          { anim: "bcUR",  left: 116, bottom: 154 },
          { anim: "bcR",   left: 116, bottom: 154 },
          { anim: "bcUL",  left: 116, bottom: 154 },
          { anim: "bcL",   left: 116, bottom: 154 },
        ].map((p, i) => (
          <div key={i} style={{
            position: "absolute", left: p.left, bottom: p.bottom,
            width: 8, height: 8, borderRadius: "50%", background: "#000",
            animation: `${p.anim} ${dur} ${ease} ${inf}`,
          }} />
        ))}

        {/* Bubble wrapper (animated) */}
        <div style={{
          position: "absolute",
          left: 75, bottom: 50,
          animation: `bcFly ${dur} ${ease} ${inf}`,
          transformOrigin: "center center",
        }}>
          {/* Halftone shadow */}
          <div style={{
            position: "absolute", top: 5, left: 5,
            width: 90, height: 52,
            borderRadius: 50,
            backgroundImage: "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
            backgroundSize: "5px 5px",
            zIndex: 0,
          }} />
          {/* Bubble */}
          <div style={{
            position: "relative", zIndex: 1,
            width: 90, height: 52,
            background: "#fff",
            border: "3px solid #000",
            borderRadius: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Arial Black', Impact, sans-serif", color: "#000" }}>
              +25 💧
            </span>
          </div>
        </div>
      </div>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V1 — Comic ovale</p>
    </div>
  );
}
