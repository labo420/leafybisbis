export function BubbleLeafy() {
  const css = `
    @keyframes blFly {
      0%   { opacity:0; transform:translateY(0) scale(0); }
      8%   { opacity:1; transform:translateY(0) scale(1.13); }
      13%  { opacity:1; transform:translateY(0) scale(0.93); }
      18%  { opacity:1; transform:translateY(0) scale(1); }
      73%  { opacity:1; transform:translateY(-80px) scale(1); }
      85%  { opacity:0; transform:translateY(-94px) scale(1.75); }
      100% { opacity:0; transform:translateY(0) scale(0); }
    }
    @keyframes blP1 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(0,-25px)scale(0.3)} 100%{opacity:0} }
    @keyframes blP2 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(22px,-17px)scale(0.3)} 100%{opacity:0} }
    @keyframes blP3 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(27px,3px)scale(0.3)} 100%{opacity:0} }
    @keyframes blP4 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-22px,-17px)scale(0.3)} 100%{opacity:0} }
    @keyframes blP5 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-27px,3px)scale(0.3)} 100%{opacity:0} }
    @keyframes blGlow {
      0%,18%  { box-shadow: 0 0 0 rgba(46,107,80,0) }
      25%     { box-shadow: 0 0 14px rgba(46,107,80,0.5) }
      73%     { box-shadow: 0 0 14px rgba(46,107,80,0.5) }
      85%     { box-shadow: 0 0 28px rgba(46,107,80,0) }
      100%    { box-shadow: 0 0 0 rgba(46,107,80,0) }
    }
  `;

  const dur = "3s";
  const ease = "ease-in-out";
  const inf = "infinite";
  const green = "#2E6B50";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#e8e8e8" }}>
      <style>{css}</style>
      <div style={{ position: "relative", width: 240, height: 260 }}>
        {/* Green burst particles */}
        {["blP1","blP2","blP3","blP4","blP5"].map((anim, i) => (
          <div key={i} style={{
            position: "absolute", left: 116, bottom: 154,
            width: 8, height: 8, borderRadius: "50%", background: green,
            animation: `${anim} ${dur} ${ease} ${inf}`,
          }} />
        ))}

        {/* Bubble */}
        <div style={{
          position: "absolute", left: 75, bottom: 50,
          animation: `blFly ${dur} ${ease} ${inf}`,
          transformOrigin: "center center",
        }}>
          {/* Halftone shadow */}
          <div style={{
            position: "absolute", top: 5, left: 5,
            width: 90, height: 52,
            borderRadius: 50,
            backgroundImage: `radial-gradient(circle, ${green} 1.5px, transparent 1.5px)`,
            backgroundSize: "5px 5px",
            opacity: 0.35,
            zIndex: 0,
          }} />
          {/* Bubble body */}
          <div style={{
            position: "relative", zIndex: 1,
            width: 90, height: 52,
            background: "#fff",
            border: `3px solid ${green}`,
            borderRadius: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: `blGlow ${dur} ${ease} ${inf}`,
          }}>
            <span style={{ fontSize: 17, fontWeight: 900, fontFamily: "'Arial Black', Impact, sans-serif", color: green }}>
              +25 💧
            </span>
          </div>
        </div>
      </div>
      <p style={{ color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V4 — Verde Leafy</p>
    </div>
  );
}
