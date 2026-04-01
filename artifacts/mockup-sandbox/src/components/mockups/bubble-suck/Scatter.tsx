export function Scatter() {
  return (
    <div style={{ width: 300, height: 540, position: 'relative', overflow: 'hidden', background: '#f0f4ec', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <style>{`
        @keyframes sc-pill {
          0%, 20%   { opacity: 1; transform: translate(0,0) scale(1); }
          25%        { opacity: 1; transform: translate(0,-10px) scale(1.22); }
          28%        { opacity: 0; transform: translate(0,0) scale(1); }
          100%       { opacity: 0; }
        }
        @keyframes sc-p1 {
          0%, 26%   { opacity: 0; transform: translate(0,0) scale(1); }
          30%        { opacity: 1; transform: translate(-18px,-22px) scale(1.1); }
          65%        { opacity: 0; transform: translate(35px,-128px) scale(0.08); }
          65.5%      { opacity: 0; transform: translate(0,0) scale(1); }
          100%       { opacity: 0; }
        }
        @keyframes sc-p2 {
          0%, 26%   { opacity: 0; transform: translate(0,0) scale(1); }
          30%        { opacity: 1; transform: translate(2px,-28px) scale(1.15); }
          65%        { opacity: 0; transform: translate(35px,-128px) scale(0.08); }
          65.5%      { opacity: 0; transform: translate(0,0) scale(1); }
          100%       { opacity: 0; }
        }
        @keyframes sc-p3 {
          0%, 26%   { opacity: 0; transform: translate(0,0) scale(1); }
          30%        { opacity: 1; transform: translate(22px,-18px) scale(1.1); }
          65%        { opacity: 0; transform: translate(35px,-128px) scale(0.08); }
          65.5%      { opacity: 0; transform: translate(0,0) scale(1); }
          100%       { opacity: 0; }
        }
        @keyframes sc-counter {
          0%, 62%   { transform: scale(1); color: #166534; }
          66%        { transform: scale(1.3); color: #15803d; filter: drop-shadow(0 0 5px rgba(74,222,128,0.7)); }
          74%        { transform: scale(1); color: #166534; filter: none; }
          100%       { transform: scale(1); color: #166534; }
        }
        @keyframes sc-flash {
          0%, 63%   { opacity: 0; transform: translateY(0); }
          66%        { opacity: 1; transform: translateY(0); }
          80%        { opacity: 0; transform: translateY(-14px); }
          100%       { opacity: 0; }
        }
        @keyframes sc-burst-ring {
          0%, 23%   { opacity: 0; transform: translate(-50%,-50%) scale(0.8); }
          27%        { opacity: 0.6; transform: translate(-50%,-50%) scale(1); }
          35%        { opacity: 0; transform: translate(-50%,-50%) scale(2.2); }
          100%       { opacity: 0; }
        }
      `}</style>

      {/* Balance bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>🍃</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a1a' }}>Leafy</span>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid rgba(74,222,128,0.35)', borderRadius: 20, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 15 }}>💧</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', animation: 'sc-counter 4s ease infinite', display: 'inline-block' }}>1.234</span>
        </div>
      </div>

      {/* Flash near counter */}
      <div style={{ position: 'absolute', top: 55, right: 14, fontSize: 10, fontWeight: 700, color: '#16a34a', animation: 'sc-flash 4s ease infinite', opacity: 0 }}>+200</div>

      {/* Plant ring */}
      <div style={{ position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)', width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5 0%, #86efac 50%, #4ade80 100%)', border: '3px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, boxShadow: '0 4px 20px rgba(74,222,128,0.2)' }}>
        🌿
      </div>

      {/* Burst ring on pop */}
      <div style={{ position: 'absolute', top: 163, left: 210, width: 54, height: 54, borderRadius: '50%', border: '2px solid rgba(74,222,128,0.5)', transformOrigin: '50% 50%', animation: 'sc-burst-ring 4s ease-out infinite', pointerEvents: 'none' }} />

      {/* Original pill — disappears on pop */}
      <div style={{ position: 'absolute', top: 150, left: 170, background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#166534', border: '1.5px solid rgba(74,222,128,0.6)', backdropFilter: 'blur(4px)', transformOrigin: 'center center', animation: 'sc-pill 4s ease infinite', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', whiteSpace: 'nowrap' }}>
        +200 💧
      </div>

      {/* Particle 1: "+" — scatters left-up */}
      <div style={{ position: 'absolute', top: 157, left: 178, fontSize: 13, fontWeight: 700, color: '#15803d', transformOrigin: 'center center', animation: 'sc-p1 4s ease-in infinite', opacity: 0 }}>
        +
      </div>

      {/* Particle 2: "200" — scatters up */}
      <div style={{ position: 'absolute', top: 156, left: 188, fontSize: 12, fontWeight: 700, color: '#166534', transformOrigin: 'center center', animation: 'sc-p2 4s ease-in infinite', opacity: 0 }}>
        200
      </div>

      {/* Particle 3: "💧" — scatters right-up */}
      <div style={{ position: 'absolute', top: 157, left: 218, fontSize: 12, transformOrigin: 'center center', animation: 'sc-p3 4s ease-in infinite', opacity: 0 }}>
        💧
      </div>

      {/* Variant label */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        5 — Particelle
      </div>
    </div>
  );
}
