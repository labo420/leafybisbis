export function ElasticSnap() {
  return (
    <div style={{ width: 300, height: 540, position: 'relative', overflow: 'hidden', background: '#f0f4ec', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <style>{`
        @keyframes el-bubble {
          0%, 20%    { transform: translate(0,0) scaleX(1) scaleY(1); opacity: 1; }
          25%         { transform: translate(0,-10px) scaleX(1.18) scaleY(1.18); opacity: 1; }
          30%         { transform: translate(0,0) scaleX(1) scaleY(1); opacity: 1; }
          45%         { transform: translate(16px,-60px) scaleX(0.55) scaleY(2.4); opacity: 1; }
          55%         { transform: translate(28px,-100px) scaleX(1.3) scaleY(0.35); opacity: 0.85; }
          65%         { transform: translate(35px,-128px) scaleX(0.1) scaleY(0.1); opacity: 0; }
          65.5%       { transform: translate(0,0) scaleX(1) scaleY(1); opacity: 0; }
          100%        { transform: translate(0,0) scaleX(1) scaleY(1); opacity: 0; }
        }
        @keyframes el-counter {
          0%, 62%    { transform: scale(1); color: #166534; }
          64%         { transform: scale(0.85); color: #166534; }
          67%         { transform: scale(1.35); color: #15803d; filter: drop-shadow(0 0 6px rgba(74,222,128,0.8)); }
          72%         { transform: scale(0.95); color: #166534; filter: none; }
          76%         { transform: scale(1.05); color: #166534; }
          80%         { transform: scale(1); color: #166534; }
          100%        { transform: scale(1); color: #166534; }
        }
        @keyframes el-flash {
          0%, 63%    { opacity: 0; transform: translateY(0); }
          67%         { opacity: 1; transform: translateY(0); }
          80%         { opacity: 0; transform: translateY(-14px); }
          100%        { opacity: 0; }
        }
        @keyframes el-stretch-ghost {
          0%, 29%    { opacity: 0; }
          40%         { opacity: 0.3; transform: translate(10px,-30px) scaleX(0.7) scaleY(1.6); }
          54%         { opacity: 0.15; transform: translate(25px,-90px) scaleX(1.2) scaleY(0.4); }
          65%         { opacity: 0; transform: translate(35px,-128px) scaleX(0.1) scaleY(0.1); }
          65.5%       { opacity: 0; }
          100%        { opacity: 0; }
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
          <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', animation: 'el-counter 4s ease infinite', display: 'inline-block' }}>1.234</span>
        </div>
      </div>

      {/* Flash near counter */}
      <div style={{ position: 'absolute', top: 55, right: 14, fontSize: 10, fontWeight: 700, color: '#16a34a', animation: 'el-flash 4s ease infinite', opacity: 0 }}>+200</div>

      {/* Plant ring */}
      <div style={{ position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)', width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5 0%, #86efac 50%, #4ade80 100%)', border: '3px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, boxShadow: '0 4px 20px rgba(74,222,128,0.2)' }}>
        🌿
      </div>

      {/* Stretch ghost */}
      <div style={{ position: 'absolute', top: 150, left: 170, background: 'rgba(74,222,128,0.1)', borderRadius: 10, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: 'rgba(22,101,52,0.4)', transformOrigin: 'center center', animation: 'el-stretch-ghost 4s ease-in infinite', whiteSpace: 'nowrap' }}>
        +200 💧
      </div>

      {/* Bubble value */}
      <div style={{ position: 'absolute', top: 150, left: 170, background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#166534', border: '1.5px solid rgba(74,222,128,0.6)', backdropFilter: 'blur(4px)', transformOrigin: 'center center', animation: 'el-bubble 4s ease-in infinite', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', whiteSpace: 'nowrap' }}>
        +200 💧
      </div>

      {/* Variant label */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        4 — Elastico
      </div>
    </div>
  );
}
