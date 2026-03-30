const loginStreak = 3;
const bpStreakClaimed = 2;

function PathCard({ gold = false }: { gold?: boolean }) {
  const streak = gold ? bpStreakClaimed : loginStreak;
  const primary = gold ? "#B8860B" : "#2E6B50";
  const mint = gold ? "#F5C842" : "#51B888";
  const light = gold ? "#FEF9E7" : "#EBF5EE";
  const title = gold ? "CHECK IN GOLD" : "CHECK IN";
  const reward = gold ? "+500" : "+250";
  const emojis = ["🌱", "🌿", "🍃", "🌳", "🌲", "🏔️", "🏆"];

  const nodes = Array.from({ length: 7 }, (_, i) => ({
    i,
    done: i < streak,
    isNext: i === streak,
    isFinal: i === 6,
    emoji: emojis[i],
  }));

  // Row 1: days 0-3 (left → right)
  const row1 = nodes.slice(0, 4);
  // Row 2: days 4-6 (right → left)
  const row2 = [...nodes.slice(4)].reverse();

  const NodeEl = ({ n }: { n: typeof nodes[0] }) => (
    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 44, height: 44, borderRadius: "50%",
          background: n.done ? primary : n.isNext ? "#fff" : "#F3F4F6",
          border: n.isNext ? `2.5px dashed ${mint}` : n.done ? "none" : "2px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: n.done ? 20 : 14,
          boxShadow: n.done ? `0 4px 12px ${primary}35` : n.isNext ? `0 0 0 4px ${light}` : "none",
          transition: "all 0.2s",
          position: "relative" as const,
          zIndex: 1,
        }}
      >
        {n.done
          ? <span>{n.emoji}</span>
          : <span style={{ color: n.isNext ? mint : "#D1D5DB", fontWeight: 700, fontSize: 12 }}>
              {n.isFinal ? "🏆" : `${n.i + 1}`}
            </span>
        }
        {n.isNext && (
          <div style={{
            position: "absolute", top: -3, right: -3,
            width: 16, height: 16, borderRadius: "50%",
            background: mint, border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>+</span>
          </div>
        )}
      </div>
      <span style={{
        fontSize: 9, fontWeight: n.done ? 700 : 400,
        color: n.done ? primary : "#9CA3AF"
      }}>
        {n.done ? "fatto" : n.isFinal ? "bonus" : `G${n.i + 1}`}
      </span>
    </div>
  );

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "16px 20px",
        boxShadow: `0 4px 20px ${gold ? "rgba(184,134,11,0.12)" : "rgba(46,107,80,0.1)"}`,
        border: `1px solid ${light}`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{gold ? "⭐" : "📍"}</span>
          <span style={{ fontWeight: 800, fontSize: 12, color: primary, letterSpacing: 1.5, textTransform: "uppercase" as const }}>
            {title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: primary }}>{streak}/7</span>
          <span style={{ fontSize: 9, color: "#9CA3AF" }}>giorni</span>
        </div>
      </div>

      {/* Path row 1: 0→3 */}
      <div style={{ position: "relative" as const }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" as const }}>
          {/* Connecting line */}
          <div style={{
            position: "absolute", top: 22, left: 22, right: 22,
            height: 2,
            background: `linear-gradient(to right, ${primary} ${(Math.min(streak, 4) / 4) * 100}%, #E5E7EB ${(Math.min(streak, 4) / 4) * 100}%)`,
            zIndex: 0,
          }} />
          {row1.map(n => <NodeEl key={n.i} n={n} />)}
        </div>

        {/* Connector curve from row1 to row2 */}
        <div style={{
          display: "flex", justifyContent: "flex-end", margin: "8px 0",
          paddingRight: 22,
        }}>
          <div style={{
            width: 2, height: 24,
            background: streak >= 4 ? primary : "#E5E7EB",
            borderRadius: 2,
          }} />
        </div>

        {/* Path row 2: 6→4 (reversed display) */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 0, alignItems: "center", position: "relative" as const }}>
          <div style={{
            position: "absolute", top: 22, left: 22, right: 22,
            height: 2,
            background: streak >= 6
              ? primary
              : streak >= 4
                ? `linear-gradient(to left, ${primary} ${((streak - 4) / 3) * 100}%, #E5E7EB ${((streak - 4) / 3) * 100}%)`
                : "#E5E7EB",
            zIndex: 0,
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {/* Show right-to-left: day 6, 5, 4 but in positions right, center, left */}
            {row2.map(n => <NodeEl key={n.i} n={n} />)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${light}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <span style={{ fontSize: 11, color: "#6B7280" }}>
            {streak > 0 ? `${streak} giorni di fila` : "Inizia oggi"}
          </span>
        </div>
        <div style={{ background: light, padding: "4px 12px", borderRadius: 100, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: primary }}>{reward}</span>
          <span style={{ fontSize: 11 }}>💧</span>
        </div>
      </div>
    </div>
  );
}

export function SerpentinaPath() {
  return (
    <div style={{
      width: 390, padding: 16, background: "#F0F4F2",
      fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" as const, gap: 16,
      minHeight: 580,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 4 }}>
        B — Serpentina Path
      </div>
      <PathCard gold={false} />
      <PathCard gold={true} />
    </div>
  );
}
