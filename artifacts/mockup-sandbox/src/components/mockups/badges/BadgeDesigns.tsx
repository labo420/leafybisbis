export function BadgeDesigns() {
  const badges = [
    {
      level: "Germoglio",
      tier: 1,
      drops: "0 – 499 drops",
      bg: "#FFFFFF",
      outerRing: "#A8D5BA",
      innerRing: "#D4EEE0",
      iconColor: "#4A9E7F",
      textColor: "#2E6B50",
      subColor: "#6DBBA8",
      stars: 0,
    },
    {
      level: "Ramoscello",
      tier: 2,
      drops: "500 – 1 499 drops",
      bg: "#F0FAF5",
      outerRing: "#51B888",
      innerRing: "#C5E8D5",
      iconColor: "#2E6B50",
      textColor: "#2E6B50",
      subColor: "#51B888",
      stars: 0,
    },
    {
      level: "Arbusto",
      tier: 3,
      drops: "1 500 – 3 999 drops",
      bg: "#2E6B50",
      outerRing: "#7DC89A",
      innerRing: "rgba(255,255,255,0.18)",
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.6)",
      stars: 1,
    },
    {
      level: "Albero",
      tier: 4,
      drops: "4 000 – 9 999 drops",
      bg: "#1A4A35",
      outerRing: "#D4A017",
      innerRing: "rgba(212,160,23,0.22)",
      iconColor: "#FFD84D",
      textColor: "#FFFFFF",
      subColor: "#D4A017",
      stars: 2,
    },
    {
      level: "Foresta",
      tier: 5,
      drops: "10 000 – 24 999 drops",
      bg: "#0F2E1F",
      outerRing: "#FFD700",
      innerRing: "rgba(255,215,0,0.18)",
      iconColor: "#FFD700",
      textColor: "#FFD700",
      subColor: "rgba(255,215,0,0.7)",
      stars: 3,
    },
    {
      level: "Giungla",
      tier: 6,
      drops: "25 000+ drops",
      bg: "#060F09",
      outerRing: "#FFD700",
      innerRing: "rgba(255,215,0,0.14)",
      iconColor: "#FFE566",
      textColor: "#FFE566",
      subColor: "rgba(255,215,0,0.65)",
      stars: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F6] p-10 flex flex-col gap-8">
      <div className="text-center mb-2">
        <p className="text-xs font-semibold tracking-widest text-[#2E6B50] uppercase mb-1">Proposta di redesign</p>
        <h1 className="text-3xl font-bold text-[#0F2E1F]">Badge di livello</h1>
        <p className="text-sm text-neutral-500 mt-1">Palette verde+oro · forma esagonale · progressione cromatica</p>
      </div>

      <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto w-full">
        {badges.map((b) => (
          <div key={b.level} className="flex flex-col items-center gap-3">
            <HexBadge badge={b} />
            <div className="text-center">
              <div
                className="text-sm font-bold tracking-wide"
                style={{ color: b.tier >= 3 ? "#0F2E1F" : "#2E6B50" }}
              >
                {b.level}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{b.drops}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl border border-neutral-100 p-5 mt-2">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Note di design</p>
        <ul className="space-y-1.5 text-xs text-neutral-600">
          <li>• <strong>Forma esagonale</strong> — richiama il pattern naturale degli alveari, distintiva rispetto al cerchio del ring di livello</li>
          <li>• <strong>Progressione cromatica</strong> — da bianco/menta (starter) a verde scuro/oro (elite), status immediatamente leggibile</li>
          <li>• <strong>Doppio bordo</strong> — outer ring pieno + inner ring tenue, dà profondità senza gradienti</li>
          <li>• <strong>Icona botanica</strong> — SVG flat, tratto sottile, cresce in complessità con il livello</li>
          <li>• <strong>Stelle di tier</strong> — Arbusto+ aggiunge stelle nell'angolo per rafforzare lo status</li>
          <li>• <strong>Oro per Albero/Foresta/Giungla</strong> — coerente con il tema Leafy Gold dell'app</li>
        </ul>
      </div>
    </div>
  );
}

interface BadgeConfig {
  level: string;
  tier: number;
  drops: string;
  bg: string;
  outerRing: string;
  innerRing: string;
  iconColor: string;
  textColor: string;
  subColor: string;
  stars: number;
}

function HexBadge({ badge: b }: { badge: BadgeConfig }) {
  const SIZE = 140;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  const hexPath = (r: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`;
    });
    return `M ${pts[0]} L ${pts[1]} L ${pts[2]} L ${pts[3]} L ${pts[4]} L ${pts[5]} Z`;
  };

  return (
    <div style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.13))" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <clipPath id={`hex-clip-${b.tier}`}>
            <path d={hexPath(62)} />
          </clipPath>
        </defs>

        <path d={hexPath(65)} fill={b.outerRing} />
        <path d={hexPath(60)} fill={b.bg} />
        <path d={hexPath(50)} fill={b.innerRing} />

        <g clipPath={`url(#hex-clip-${b.tier})`}>
          <BotanicalIcon tier={b.tier} cx={CX} cy={CY} color={b.iconColor} />
        </g>

        {b.stars > 0 && (
          <StarDots count={b.stars} color={b.outerRing} cx={CX} cy={CY} />
        )}
      </svg>
    </div>
  );
}

function BotanicalIcon({ tier, cx, cy, color }: { tier: number; cx: number; cy: number; color: string }) {
  const s = `stroke="${color}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (tier) {
    case 1:
      return (
        <g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}>
          <line x1={cx} y1={cy + 22} x2={cx} y2={cy - 14} />
          <path d={`M${cx},${cy - 4} Q${cx - 18},${cy - 16} ${cx - 14},${cy - 28}`} />
          <path d={`M${cx},${cy - 10} Q${cx + 18},${cy - 20} ${cx + 12},${cy - 32}`} />
          <ellipse cx={cx} cy={cy + 18} rx={6} ry={3} fill={color} fillOpacity={0.3} stroke="none" />
        </g>
      );
    case 2:
      return (
        <g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path d={`M${cx - 20},${cy + 20} Q${cx - 10},${cy} ${cx},${cy - 18}`} />
          <path d={`M${cx - 12},${cy + 8} Q${cx - 24},${cy - 8} ${cx - 28},${cy - 16}`} />
          <path d={`M${cx - 6},${cy - 2} Q${cx + 6},${cy - 18} ${cx + 2},${cy - 26}`} />
          <path d={`M${cx + 2},${cy + 4} Q${cx + 18},${cy - 2} ${cx + 22},${cy - 14}`} />
          <ellipse cx={cx - 6} cy={cy + 16} rx={5} ry={2.5} fill={color} fillOpacity={0.25} stroke="none" transform={`rotate(-20,${cx - 6},${cy + 16})`} />
        </g>
      );
    case 3:
      return (
        <g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}>
          <path d={`M${cx},${cy + 22} Q${cx},${cy + 8} ${cx},${cy - 4}`} />
          <ellipse cx={cx} cy={cy - 14} rx={20} ry={14} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
          <path d={`M${cx - 14},${cy - 10} Q${cx},${cy - 18} ${cx + 14},${cy - 10}`} />
          <path d={`M${cx - 18},${cy - 16} Q${cx},${cy - 28} ${cx + 18},${cy - 16}`} />
        </g>
      );
    case 4:
      return (
        <g stroke={color} fill={color} fillOpacity={0.15} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path d={`M${cx},${cy + 24} L${cx},${cy - 4}`} fill="none" strokeWidth={3.5} />
          <path d={`M${cx - 8},${cy + 18} L${cx + 8},${cy + 18}`} fill="none" />
          <path d={`M${cx},${cy - 4} L${cx - 22},${cy + 8} L${cx - 12},${cy + 2} L${cx - 28},${cy - 8} L${cx},${cy - 26} L${cx + 28},${cy - 8} L${cx + 12},${cy + 2} L${cx + 22},${cy + 8} Z`} strokeWidth={2} />
        </g>
      );
    case 5:
      return (
        <g stroke={color} fill={color} fillOpacity={0.12} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path d={`M${cx},${cy + 24} L${cx},${cy + 12}`} fill="none" strokeWidth={2.5} />
          <path d={`M${cx - 12},${cy + 24} L${cx - 12},${cy + 14}`} fill="none" strokeWidth={2} />
          <path d={`M${cx + 12},${cy + 24} L${cx + 12},${cy + 14}`} fill="none" strokeWidth={2} />
          <path d={`M${cx},${cy + 12} L${cx - 12},${cy + 18} L${cx - 6},${cy + 12} L${cx - 18},${cy + 4} L${cx},${cy - 12} L${cx + 18},${cy + 4} L${cx + 6},${cy + 12} L${cx + 12},${cy + 18} Z`} />
          <path d={`M${cx - 12},${cy + 14} L${cx - 22},${cy + 10} L${cx - 14},${cy + 6} L${cx - 24},${cy + 0} L${cx - 12},${cy - 10} L${cx - 2},${cy + 4} Z`} />
          <path d={`M${cx + 12},${cy + 14} L${cx + 22},${cy + 10} L${cx + 14},${cy + 6} L${cx + 24},${cy + 0} L${cx + 12},${cy - 10} L${cx + 2},${cy + 4} Z`} />
        </g>
      );
    case 6:
      return (
        <g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path d={`M${cx},${cy + 24} L${cx},${cy - 4}`} strokeWidth={3} />
          <path d={`M${cx},${cy - 4} Q${cx - 24},${cy - 14} ${cx - 20},${cy - 28}`} />
          <path d={`M${cx},${cy - 4} Q${cx + 24},${cy - 14} ${cx + 20},${cy - 28}`} />
          <path d={`M${cx},${cy + 2} Q${cx - 16},${cy - 4} ${cx - 14},${cy - 14}`} />
          <path d={`M${cx},${cy + 2} Q${cx + 16},${cy - 4} ${cx + 14},${cy - 14}`} />
          <path d={`M${cx},${cy + 8} Q${cx - 10},${cy + 4} ${cx - 10},${cy - 2}`} />
          <path d={`M${cx},${cy + 8} Q${cx + 10},${cy + 4} ${cx + 10},${cy - 2}`} />
          <ellipse cx={cx} cy={cy + 22} rx={7} ry={3} fill={color} fillOpacity={0.3} stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

function StarDots({ count, color, cx, cy }: { count: number; color: string; cx: number; cy: number }) {
  const positions = [
    { x: cx - 46, y: cy - 44 },
    { x: cx + 46, y: cy - 44 },
    { x: cx - 52, y: cy },
    { x: cx + 52, y: cy },
  ].slice(0, count);

  return (
    <>
      {positions.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} opacity={0.85} />
      ))}
    </>
  );
}
