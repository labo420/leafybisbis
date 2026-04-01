export function Scatter() {
  const pillStyle: React.CSSProperties = {
    position: 'absolute',
    top: 150,
    left: 170,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 700,
    color: '#166534',
    border: '1.5px solid rgba(74,222,128,0.6)',
    backdropFilter: 'blur(4px)',
    transformOrigin: 'center center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ width: 300, height: 540, position: 'relative', overflow: 'hidden', background: '#f0f4ec', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <style>{`
        /* Ciclo 3s — travel in ~0.8s (veloce) */

        @keyframes sc-main {
          0%, 16%  { transform: translate(0,0) scale(1); opacity: 1; }
          20%       { transform: translate(0,-10px) scale(1.24); opacity: 1; }   /* pop */
          22%       { transform: translate(-5px, 3px) scale(1.1); opacity: 1; } /* jitter L */
          24%       { transform: translate(5px,-4px) scale(1.08); opacity: 1; } /* jitter R */
          26%       { transform: translate(0,0) scale(1); opacity: 1; }          /* rilascio */
          54%       { transform: translate(35px,-128px) scale(0.1); opacity: 0; }/* arriva */
          54.5%     { transform: translate(0,0) scale(1); opacity: 0; }          /* reset */
          100%      { transform: translate(0,0) scale(1); opacity: 0; }
        }

        /* Ghost 1 — scatter sinistra-su */
        @keyframes sc-g1 {
          0%, 17%  { opacity: 0; transform: translate(0,0) scale(1); }
          20%       { opacity: 0.65; transform: translate(-24px,-10px) scale(0.82); }
          30%       { opacity: 0; transform: translate(-40px,-18px) scale(0.45); }
          100%      { opacity: 0; }
        }

        /* Ghost 2 — scatter destra-su */
        @keyframes sc-g2 {
          0%, 17%  { opacity: 0; transform: translate(0,0) scale(1); }
          20%       { opacity: 0.55; transform: translate(22px,-14px) scale(0.78); }
          30%       { opacity: 0; transform: translate(36px,-24px) scale(0.4); }
          100%      { opacity: 0; }
        }

        /* Ghost 3 — scatter giù */
        @keyframes sc-g3 {
          0%, 17%  { opacity: 0; transform: translate(0,0) scale(1); }
          20%       { opacity: 0.45; transform: translate(6px,20px) scale(0.72); }
          30%       { opacity: 0; transform: translate(10px,32px) scale(0.38); }
          100%      { opacity: 0; }
        }

        @keyframes sc-counter {
          0%, 51%  { transform: scale(1); color: #166534; }
          55%       { transform: scale(1.32); color: #15803d; filter: drop-shadow(0 0 5px rgba(74,222,128,0.75)); }
          63%       { transform: scale(1); color: #166534; filter: none; }
          100%      { transform: scale(1); color: #166534; }
        }
        @keyframes sc-flash {
          0%, 52%  { opacity: 0; transform: translateY(0); }
          55%       { opacity: 1; transform: translateY(0); }
          68%       { opacity: 0; transform: translateY(-14px); }
          100%      { opacity: 0; }
        }
        @keyframes sc-ring {
          0%, 17%  { opacity: 0; transform: translate(-50%,-50%) scale(0.6); }
          21%       { opacity: 0.7; transform: translate(-50%,-50%) scale(1); }
          34%       { opacity: 0; transform: translate(-50%,-50%) scale(2.4); }
          100%      { opacity: 0; }
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
          <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', animation: 'sc-counter 3s ease infinite', display: 'inline-block' }}>1.234</span>
        </div>
      </div>

      {/* Flash "+200" vicino al counter */}
      <div style={{ position: 'absolute', top: 55, right: 14, fontSize: 10, fontWeight: 700, color: '#16a34a', animation: 'sc-flash 3s ease infinite', opacity: 0 }}>+200</div>

      {/* Plant ring */}
      <div style={{ position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)', width: 130, height: 130, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5 0%, #86efac 50%, #4ade80 100%)', border: '3px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, boxShadow: '0 4px 20px rgba(74,222,128,0.2)' }}>
        🌿
      </div>

      {/* Burst ring al pop */}
      <div style={{ position: 'absolute', top: 163, left: 210, width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(74,222,128,0.55)', animation: 'sc-ring 3s ease-out infinite', pointerEvents: 'none' }} />

      {/* Ghost 1 — copia sinistra */}
      <div style={{ ...pillStyle, animation: 'sc-g1 3s ease-out infinite', opacity: 0 }}>+200 💧</div>

      {/* Ghost 2 — copia destra */}
      <div style={{ ...pillStyle, animation: 'sc-g2 3s ease-out infinite', opacity: 0 }}>+200 💧</div>

      {/* Ghost 3 — copia giù */}
      <div style={{ ...pillStyle, animation: 'sc-g3 3s ease-out infinite', opacity: 0 }}>+200 💧</div>

      {/* Pillola principale — vola verso il counter */}
      <div style={{ ...pillStyle, animation: 'sc-main 3s cubic-bezier(0.55,0,1,0.85) infinite' }}>
        +200 💧
      </div>

      {/* Label */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        5 — Particelle
      </div>
    </div>
  );
}
