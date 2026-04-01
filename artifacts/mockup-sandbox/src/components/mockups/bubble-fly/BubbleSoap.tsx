export function BubbleSoap() {
  const css = `
    @keyframes bsFly {
      0%   { opacity:0;    transform:translate(0px,    0px)   scale(0)   rotate(0deg); }
      8%   { opacity:0.95; transform:translate(0px,    0px)   scale(1.1) rotate(0deg); }
      14%  { opacity:0.95; transform:translate(0px,    0px)   scale(0.94) rotate(0deg); }
      19%  { opacity:0.95; transform:translate(0px,    0px)   scale(1)   rotate(0deg); }
      30%  { opacity:0.95; transform:translate(13px,  -18px)  scale(1)   rotate(5deg); }
      40%  { opacity:0.95; transform:translate(0px,   -36px)  scale(1)   rotate(0deg); }
      52%  { opacity:0.95; transform:translate(-14px, -55px)  scale(1)   rotate(-5deg); }
      62%  { opacity:0.95; transform:translate(0px,   -68px)  scale(1)   rotate(0deg); }
      73%  { opacity:0.95; transform:translate(8px,   -80px)  scale(1)   rotate(3deg); }
      85%  { opacity:0;    transform:translate(8px,   -96px)  scale(1.8) rotate(3deg); }
      100% { opacity:0;    transform:translate(0px,    0px)   scale(0)   rotate(0deg); }
    }
    @keyframes bsSquish {
      0%,19% { transform:scaleX(1) scaleY(1) }
      30%    { transform:scaleX(0.91) scaleY(1.07) }
      40%    { transform:scaleX(1) scaleY(1) }
      52%    { transform:scaleX(0.91) scaleY(1.07) }
      62%    { transform:scaleX(1) scaleY(1) }
      73%    { transform:scaleX(1.04) scaleY(0.97) }
      85%    { transform:scaleX(1.8) scaleY(1.8) }
      100%   { transform:scaleX(1) scaleY(1) }
    }
    @keyframes bsP1 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(0,-26px)scale(0.3)} 100%{opacity:0} }
    @keyframes bsP2 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(23px,-17px)scale(0.3)} 100%{opacity:0} }
    @keyframes bsP3 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(28px,3px)scale(0.3)} 100%{opacity:0} }
    @keyframes bsP4 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-23px,-17px)scale(0.3)} 100%{opacity:0} }
    @keyframes bsP5 { 0%,72%{opacity:0;transform:translate(0,0)scale(0)} 75%{opacity:1;transform:translate(0,0)scale(1)} 88%{opacity:0;transform:translate(-28px,3px)scale(0.3)} 100%{opacity:0} }
    @keyframes bsShine {
      0%,18%  { opacity:0 }
      25%     { opacity:0.8 }
      73%     { opacity:0.8 }
      85%     { opacity:0 }
      100%    { opacity:0 }
    }
  `;

  const dur = "3s";
  const ease = "ease-in-out";
  const inf = "infinite";
  const particleColors = ["#c77dff", "#48cae4", "#06d6a0", "#ff6b9d", "#ffd60a"];
  const particleAnims = ["bsP1", "bsP2", "bsP3", "bsP4", "bsP5"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#1a1a2e" }}>
      <style>{css}</style>
      <div style={{ position: "relative", width: 240, height: 260 }}>
        {/* Rainbow burst particles — centrate sul punto di scoppio: left:124, bottom:171 */}
        {particleAnims.map((anim, i) => (
          <div key={i} style={{
            position: "absolute", left: 124, bottom: 171,
            width: 8, height: 8, borderRadius: "50%", background: particleColors[i],
            boxShadow: `0 0 6px ${particleColors[i]}`,
            animation: `${anim} ${dur} ${ease} ${inf}`,
          }} />
        ))}

        {/* Soap bubble */}
        <div style={{
          position: "absolute", left: 75, bottom: 50,
          animation: `bsFly ${dur} ${ease} ${inf}`,
          transformOrigin: "center center",
        }}>
          <div style={{
            width: 90, height: 90,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 32%, rgba(255,255,255,0.85) 0%, rgba(200,150,255,0.25) 30%, rgba(80,200,255,0.2) 62%, rgba(80,255,200,0.15) 100%)",
            border: "2px solid rgba(255,255,255,0.45)",
            backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            boxShadow: "0 0 18px rgba(180,120,255,0.4), inset 0 0 12px rgba(255,255,255,0.15)",
            animation: `bsSquish ${dur} ${ease} ${inf}`,
          }}>
            {/* Shine highlight */}
            <div style={{
              position: "absolute", top: 10, left: 14,
              width: 22, height: 13,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.7)",
              animation: `bsShine ${dur} ${ease} ${inf}`,
            }} />
            <span style={{ fontSize: 16, fontWeight: 900, color: "rgba(255,255,255,0.95)", fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "0 0 8px rgba(200,150,255,0.9)", zIndex: 1 }}>
              +25 💧
            </span>
          </div>
        </div>
      </div>
      <p style={{ color: "#666", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>V2 — Bolla di sapone</p>
    </div>
  );
}
