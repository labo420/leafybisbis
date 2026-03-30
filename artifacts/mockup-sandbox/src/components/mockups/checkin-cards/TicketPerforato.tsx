const loginStreak = 3;
const bpStreakClaimed = 2;

function TicketCard({ gold = false }: { gold?: boolean }) {
  const streak = gold ? bpStreakClaimed : loginStreak;
  const primary = gold ? "#B8860B" : "#2E6B50";
  const mint = gold ? "#F5C842" : "#51B888";
  const light = gold ? "#FEF9E7" : "#D6EFE2";
  const cardBg = gold ? "#FFFBF0" : "#FFFFFF";
  const title = gold ? "CHECK IN GOLD" : "CHECK IN";
  const reward = gold ? "+500" : "+250";
  const prizes = ["🌱", "💧", "⚡", "🍃", "💰", "🌟", "🏆"];

  return (
    <div
      style={{
        background: cardBg,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: `0 4px 20px ${gold ? "rgba(184,134,11,0.15)" : "rgba(46,107,80,0.12)"}`,
        border: `1px solid ${light}`,
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      {/* Scalloped top edge */}
      <div
        style={{
          height: 14,
          background: `radial-gradient(circle at 50% -2px, ${cardBg} 9px, ${light} 9px)`,
          backgroundSize: "22px 14px",
          backgroundRepeat: "repeat-x",
          marginTop: -1,
        }}
      />

      <div style={{ padding: "0 20px 0" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: primary,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{gold ? "★" : "✓"}</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 12, color: "#1a2e22", letterSpacing: 2, textTransform: "uppercase" as const }}>
              {title}
            </span>
          </div>
          <span
            style={{
              fontSize: 11, fontWeight: 700, color: primary,
              background: light, padding: "3px 10px", borderRadius: 100,
            }}
          >
            {streak}/7 giorni
          </span>
        </div>

        {/* 7 stamp circles */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const done = i < streak;
            const isNext = i === streak;
            const isFinal = i === 6;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: done ? "none" : `2px ${isNext ? "dashed" : "solid"} ${isNext ? mint : "#E5E7EB"}`,
                    background: done ? primary : isNext ? `${light}` : "#F9FAFB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: done ? 16 : 12,
                    boxShadow: done ? `0 2px 8px ${primary}40` : "none",
                  }}
                >
                  {done
                    ? <span>{prizes[i]}</span>
                    : <span style={{ color: isNext ? primary : "#D1D5DB", fontWeight: 600, fontSize: 11 }}>
                        {isFinal ? "🏆" : `${i + 1}`}
                      </span>
                  }
                </div>
                <span style={{ fontSize: 9, color: done ? primary : "#CBD5E1", fontWeight: done ? 700 : 400 }}>
                  {done ? "fatto" : isFinal ? "bonus" : `G${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Perforated divider */}
      <div
        style={{
          margin: "0 20px",
          borderTop: `2px dashed ${light}`,
          position: "relative",
        }}
      />

      {/* Notches on sides */}
      <div style={{ position: "absolute", left: -10, top: "calc(100% - 60px)", width: 20, height: 20, borderRadius: "50%", background: "#F0F4F8" }} />
      <div style={{ position: "absolute", right: -10, top: "calc(100% - 60px)", width: 20, height: 20, borderRadius: "50%", background: "#F0F4F8" }} />

      {/* Footer */}
      <div style={{ padding: "10px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontSize: 11, color: "#6B7280" }}>
            {streak > 0 ? `${streak} giorni di fila` : "Inizia oggi"}
          </span>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: light, padding: "4px 12px", borderRadius: 100,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 800, color: primary }}>{reward}</span>
          <span style={{ fontSize: 11 }}>💧</span>
        </div>
      </div>

      {/* Scalloped bottom */}
      <div
        style={{
          height: 14,
          background: `radial-gradient(circle at 50% 100%, ${cardBg} 9px, ${light} 9px)`,
          backgroundSize: "22px 14px",
          backgroundRepeat: "repeat-x",
          marginBottom: -1,
        }}
      />
    </div>
  );
}

export function TicketPerforato() {
  return (
    <div
      style={{
        width: 390, padding: 16, background: "#F0F4F2",
        fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" as const, gap: 16,
        minHeight: 580,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 4 }}>
        A — Ticket Perforato
      </div>
      <TicketCard gold={false} />
      <TicketCard gold={true} />
    </div>
  );
}
