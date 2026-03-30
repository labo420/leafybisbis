const loginStreak = 3;
const bpStreakClaimed = 2;

const DAY_DATA = [
  { emoji: "🌱", label: "G1", reward: "+20" },
  { emoji: "💧", label: "G2", reward: "+30" },
  { emoji: "⚡", label: "G3", reward: "+40" },
  { emoji: "🍃", label: "G4", reward: "+60" },
  { emoji: "💰", label: "G5", reward: "+80" },
  { emoji: "🌟", label: "G6", reward: "+100" },
  { emoji: "🏆", label: "BON", reward: "+250" },
];

const GOLD_DATA = [
  { emoji: "⭐", label: "G1", reward: "+5" },
  { emoji: "🎯", label: "G2", reward: "+10" },
  { emoji: "🔮", label: "G3", reward: "+15" },
  { emoji: "💎", label: "G4", reward: "+25" },
  { emoji: "👑", label: "G5", reward: "+40" },
  { emoji: "🌈", label: "G6", reward: "+60" },
  { emoji: "🎁", label: "BON", reward: "+500" },
];

function StickerCard({ gold = false }: { gold?: boolean }) {
  const streak = gold ? bpStreakClaimed : loginStreak;
  const primary = gold ? "#B8860B" : "#2E6B50";
  const mint = gold ? "#F5C842" : "#51B888";
  const light = gold ? "#FEF9E7" : "#EBF5EE";
  const bg = gold ? "#FFFDF5" : "#FAFFFE";
  const title = gold ? "CHECK IN GOLD" : "CHECK IN";
  const reward = gold ? "+500" : "+250";
  const data = gold ? GOLD_DATA : DAY_DATA;

  return (
    <div
      style={{
        background: bg,
        borderRadius: 20,
        padding: "16px 14px",
        boxShadow: `0 4px 20px ${gold ? "rgba(184,134,11,0.12)" : "rgba(46,107,80,0.10)"}`,
        border: `1px solid ${light}`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: `linear-gradient(135deg, ${primary}, ${mint})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            {gold ? "⭐" : "🌿"}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 12, color: primary, letterSpacing: 1.5, textTransform: "uppercase" as const }}>
              {title}
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>Accedi ogni giorno</div>
          </div>
        </div>
        <div style={{
          background: primary, color: "#fff",
          fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 100,
        }}>
          {streak}/7
        </div>
      </div>

      {/* Sticker row */}
      <div style={{ display: "flex", gap: 4, justifyContent: "space-between" }}>
        {data.map((d, i) => {
          const done = i < streak;
          const isNext = i === streak;
          const isFinal = i === 6;
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, flex: 1,
            }}>
              {/* Sticker circle */}
              <div style={{
                position: "relative" as const,
                width: 42, height: 42, borderRadius: "50%",
                background: done
                  ? `linear-gradient(135deg, ${primary}CC, ${primary})`
                  : isNext
                    ? "#fff"
                    : "#F3F4F6",
                border: done
                  ? "none"
                  : isNext
                    ? `2.5px dashed ${mint}`
                    : "2px solid #E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? 20 : 14,
                boxShadow: done
                  ? `0 4px 12px ${primary}40, 0 0 0 3px ${light}`
                  : isNext
                    ? `0 0 0 3px ${light}`
                    : "none",
              }}>
                <span style={{ opacity: done ? 1 : isNext ? 0.9 : 0.4 }}>
                  {d.emoji}
                </span>
                {done && (
                  <div style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#22c55e", border: "2px solid #fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>✓</span>
                  </div>
                )}
              </div>

              {/* Reward */}
              <span style={{
                fontSize: 8, fontWeight: 700,
                color: done ? primary : "#CBD5E1",
              }}>
                {d.reward}
              </span>

              {/* Label */}
              <span style={{
                fontSize: 8, fontWeight: done ? 700 : 400,
                color: done ? primary : "#D1D5DB",
              }}>
                {done ? "✓" : d.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: `1px solid ${light}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <span style={{ fontSize: 11, color: "#6B7280" }}>
            {streak > 0 ? `${streak} giorni di fila` : "Inizia oggi"}
          </span>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${primary}, ${mint})`,
          padding: "4px 14px", borderRadius: 100,
          display: "flex", alignItems: "center", gap: 4,
          boxShadow: `0 2px 8px ${primary}40`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{reward}</span>
          <span style={{ fontSize: 11 }}>💧</span>
        </div>
      </div>
    </div>
  );
}

export function StickerGaming() {
  return (
    <div style={{
      width: 390, padding: 16, background: "#F0F4F2",
      fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" as const, gap: 16,
      minHeight: 580,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 4 }}>
        D — Sticker Gaming
      </div>
      <StickerCard gold={false} />
      <StickerCard gold={true} />
    </div>
  );
}
