const loginStreak = 3;
const bpStreakClaimed = 2;

function SplitCard({ gold = false }: { gold?: boolean }) {
  const streak = gold ? bpStreakClaimed : loginStreak;
  const primary = gold ? "#B8860B" : "#2E6B50";
  const mint = gold ? "#F5C842" : "#51B888";
  const light = gold ? "#FEF9E7" : "#EBF5EE";
  const title = gold ? "CHECK IN GOLD" : "CHECK IN";
  const reward = gold ? "+500" : "+250";
  const dayLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: `0 4px 20px ${gold ? "rgba(184,134,11,0.12)" : "rgba(46,107,80,0.10)"}`,
        border: `1px solid ${light}`,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column" as const,
      }}
    >
      {/* Top bar */}
      <div style={{
        background: `linear-gradient(135deg, ${primary}, ${mint})`,
        padding: "12px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 800, fontSize: 12, color: "#fff", letterSpacing: 2, textTransform: "uppercase" as const }}>
          {title}
        </span>
        <span style={{
          background: "rgba(255,255,255,0.2)", color: "#fff",
          fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100,
        }}>
          {streak}/7
        </span>
      </div>

      {/* Two column body */}
      <div style={{ display: "flex", padding: 16, gap: 16 }}>
        {/* Left: vertical timeline */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0, position: "relative" as const, width: 120 }}>
          {/* Vertical track line */}
          <div style={{
            position: "absolute", left: 14, top: 8, bottom: 8,
            width: 2, background: `linear-gradient(to bottom, ${primary} ${(streak / 7) * 100}%, #E5E7EB ${(streak / 7) * 100}%)`,
          }} />

          {Array.from({ length: 7 }, (_, i) => {
            const done = i < streak;
            const isNext = i === streak;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                paddingBottom: i < 6 ? 10 : 0,
                position: "relative" as const, zIndex: 1,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: done ? primary : isNext ? "#fff" : "#F3F4F6",
                  border: done ? "none" : isNext ? `2px dashed ${mint}` : "2px solid #E5E7EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: done ? `0 2px 6px ${primary}30` : "none",
                }}>
                  {done
                    ? <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>
                    : <span style={{ color: isNext ? mint : "#D1D5DB", fontSize: 10, fontWeight: 600 }}>{i + 1}</span>
                  }
                </div>
                <span style={{
                  fontSize: 11, fontWeight: done ? 700 : 400,
                  color: done ? primary : isNext ? "#374151" : "#9CA3AF",
                }}>
                  {dayLabels[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: reward focus */}
        <div style={{
          flex: 1,
          display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
          gap: 6,
          background: light,
          borderRadius: 16,
          padding: "20px 12px",
        }}>
          <span style={{ fontSize: 11, color: primary, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, opacity: 0.8 }}>
            Ricompensa
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: primary, lineHeight: 1, letterSpacing: -2 }}>
              {reward.replace("+", "")}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: primary }}>💧</span>
          </div>
          <span style={{ fontSize: 11, color: primary, opacity: 0.7, fontWeight: 500 }}>completamento</span>

          <div style={{ width: "100%", height: 1, background: `${primary}20`, margin: "8px 0" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#F97316", lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 500 }}>streak</div>
            </div>
          </div>

          <div style={{
            marginTop: 4,
            width: "100%",
            background: `${primary}18`,
            borderRadius: 100,
            height: 6,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${(streak / 7) * 100}%`,
              background: `linear-gradient(to right, ${primary}, ${mint})`,
              borderRadius: 100,
            }} />
          </div>
          <span style={{ fontSize: 9, color: primary, fontWeight: 600 }}>{streak}/7 giorni</span>
        </div>
      </div>
    </div>
  );
}

export function DueColonne() {
  return (
    <div style={{
      width: 390, padding: 16, background: "#F0F4F2",
      fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" as const, gap: 16,
      minHeight: 580,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 4 }}>
        C — Due Colonne
      </div>
      <SplitCard gold={false} />
      <SplitCard gold={true} />
    </div>
  );
}
