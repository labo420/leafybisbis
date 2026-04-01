export function CurvedArc() {
  return (
    <div style={{ width: 300, height: 540, position: 'relative', overflow: 'hidden', background: '#f0f4ec', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <style>{`
        @keyframes ca-bubble {
          0%, 20%   { transform: translate(0,0) scale(1); opacity: 1; }
          25%        { transform: translate(0,-10px) scale(1.22); opacity: 1; }
          30%        { transform: translate(0,0) scale(1); opacity: 1; }
          40%        { transform: translate(-32px,-55px) scale(0.82); opacity: 1; }
          52%        { transform: translate(-8px,-105px) scale(0.48); opacity: 0.9; }
          65%        { transform: translate(35px,-128px) scale(0.1); opacity: 0; }
          65.5%      { transform: translate(0,0) scale(1); opacity: 0; }
          100%       { transform: translate(0,0) scale(1); opacity: 0; }
        }
        @keyframes ca-counter {
          0%, 62%   { transform: scale(1); color: #166534; }
          66%        { transform: scale(1.3); color: #15803d; filter: drop-shadow(0 0 5px rgba(74,222,128,0.7)); }
          74%        { transform: scale(1); color: #166534; filter: none; }
          100%       { transform: scale(1); color: #166534; }
        }
        @keyframes ca-flash {
          0%, 63%   { opacity: 0; transform: translateY(0); }
          66%        { opacity: 1; transform: translateY(0); }
          80%        { opacity: 0; transform: translateY(-14px); }
          100%       { opacity: 0; }
        }
        @keyframes ca-comet {
          0%, 28%   { opacity: 0; }
          30%        { opacity: 0; transform: translate(0,0) scale(1); }
          38%        { opacity: 0.4; transform: translate(-32px,-55px) scale(0.82); }
          50%        { opacity: 0.2; transform: translate(-8px,-105px) scale(0.48); }
          64%        { opacity: 0; transform: translate(35px,-128px) scale(0.1); }
          65.5%      { opacity: 0; }
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
          <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', animation: 'ca-counter 4s ease infinite', display: 'inline-block' }}>1.234</span>
        </div>
      </div>

      {/* Flash near counter */}
      <div style={{ position: 'absolute', top: 55, right: 14, fontSize: 10, fontWeight: 700, color: '#16a34a', animation: 'ca-flash 4s ease infinite', opacity: 0 }}>+200</div>

      {/* Plant ring */}
      <div style={{ position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)', width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5 0%, #86efac 50%, #4ade80 100%)', border: '3px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, boxShadow: '0 4px 20px rgba(74,222,128,0.2)' }}>
        🌿
      </div>

      {/* Comet tail ghost */}
      <div style={{ position: 'absolute', top: 150, left: 170, background: 'rgba(74,222,128,0.12)', borderRadius: 16, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#166534', border: '1px dashed rgba(74,222,128,0.3)', transformOrigin: 'center center', animation: 'ca-comet 4s ease-in-out infinite', whiteSpace: 'nowrap' }}>
        +200 💧
      </div>

      {/* Bubble value */}
      <div style={{ position: 'absolute', top: 150, left: 170, background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#166534', border: '1.5px solid rgba(74,222,128,0.6)', backdropFilter: 'blur(4px)', transformOrigin: 'center center', animation: 'ca-bubble 4s ease-in-out infinite', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', whiteSpace: 'nowrap' }}>
        +200 💧
      </div>

      {/* Variant label */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        3 — Arco curvo
      </div>
    </div>
  );
}
