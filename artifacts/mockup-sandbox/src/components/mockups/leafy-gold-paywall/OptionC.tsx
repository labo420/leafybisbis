import { Check, X } from "lucide-react";

const features = [
  {
    emoji: "⚡",
    title: "Doppio cashback LEA",
    description: "Guadagni il doppio su ogni scontrino sostenibile",
    bg: "#FFFBEB",
    border: "rgba(217,119,6,0.15)",
    accent: "#B45309",
  },
  {
    emoji: "💸",
    title: "Preleva su PayPal",
    description: "Converti i tuoi LEA in euro reali, quando vuoi",
    bg: "#EFF6FF",
    border: "rgba(3,105,161,0.15)",
    accent: "#0369A1",
  },
  {
    emoji: "📈",
    title: "Moltiplicatore mensile",
    description: "I tuoi guadagni crescono più a lungo sei abbonato",
    bg: "#F0FDF4",
    border: "rgba(21,128,61,0.15)",
    accent: "#15803D",
  },
];

export function OptionC() {
  return (
    <div
      className="relative flex flex-col items-center overflow-hidden select-none"
      style={{
        width: 390,
        height: 844,
        background: "#FAFAF8",
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      }}
    >
      {/* Status bar */}
      <div className="w-full flex justify-between items-center px-7 pt-3 pb-1">
        <span className="text-xs font-semibold text-gray-400">14:04</span>
        <div className="w-28 h-6 bg-black rounded-full" />
        <span className="text-xs font-semibold text-gray-400">●●●</span>
      </div>

      {/* Close button */}
      <button
        className="absolute top-12 right-5 w-8 h-8 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        <X size={16} strokeWidth={2.2} color="#6B7280" />
      </button>

      {/* Hero */}
      <div className="flex flex-col items-center mt-8 mb-5">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              background:
                "radial-gradient(circle, rgba(255,215,0,0.22) 0%, rgba(255,215,0,0.04) 70%, transparent 100%)",
            }}
          />
          <img
            src="/__mockup/images/leafy-gold-icon.png"
            alt="Leafy Gold"
            style={{
              width: 112,
              height: 112,
              objectFit: "contain",
              position: "relative",
              filter: "drop-shadow(0 8px 24px rgba(217,119,6,0.28))",
            }}
          />
        </div>

        <div
          className="flex items-center gap-1.5 mt-3 px-4 py-1 rounded-full"
          style={{
            background: "rgba(217,119,6,0.10)",
            border: "1px solid rgba(217,119,6,0.25)",
          }}
        >
          <span style={{ fontSize: 10, letterSpacing: 2, fontWeight: 700, color: "#B45309" }}>
            ✦ LEAFY GOLD
          </span>
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            marginTop: 10,
            letterSpacing: -0.5,
            textAlign: "center",
          }}
        >
          Passa a Premium
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 3, textAlign: "center" }}>
          Sblocca il massimo potenziale di Leafy
        </p>
      </div>

      {/* Features — tutti visibili subito */}
      <div className="w-full px-5 flex flex-col gap-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-center gap-4 rounded-2xl px-4 py-3.5"
            style={{
              background: f.bg,
              border: `1px solid ${f.border}`,
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 46,
                height: 46,
                background: "rgba(255,255,255,0.75)",
                fontSize: 22,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {f.emoji}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: -0.2 }}>
                {f.title}
              </span>
              <span style={{ fontSize: 12.5, color: "#6B7280", marginTop: 1, lineHeight: 1.4 }}>
                {f.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Price + CTA */}
      <div className="w-full px-5 flex flex-col items-center gap-3 mt-5">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 justify-center">
          <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>Solo</span>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#111827", letterSpacing: -2, lineHeight: 1 }}>
            0,89
          </span>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#374151", lineHeight: 1 }}>€</span>
          <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500, alignSelf: "flex-end", paddingBottom: 4 }}>
            /mese
          </span>
        </div>

        {/* Bullets */}
        <div className="flex gap-5">
          {["Nessun vincolo", "Annulla quando vuoi"].map((t) => (
            <div key={t} className="flex items-center gap-1">
              <Check size={12} color="#2E6B50" strokeWidth={3} />
              <span style={{ fontSize: 11, color: "#6B7280" }}>{t}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center rounded-2xl"
          style={{
            height: 58,
            background: "#2E6B50",
            boxShadow: "0 8px 32px rgba(46,107,80,0.32)",
            marginTop: 2,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: -0.2 }}>
            Attiva Leafy Gold
          </span>
        </button>

        <button>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>Non ora</span>
        </button>
      </div>
    </div>
  );
}
