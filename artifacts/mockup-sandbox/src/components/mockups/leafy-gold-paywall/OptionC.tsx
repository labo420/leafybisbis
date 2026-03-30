import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";

const features = [
  {
    emoji: "⚡",
    title: "Doppio cashback LEA",
    subtitle: "Ogni scontrino vale il doppio",
    description:
      "Con Leafy Gold guadagni il doppio dei LEA su ogni acquisto sostenibile. Il tuo impatto ambientale si moltiplica, e il tuo portafoglio anche.",
    bg: "from-amber-50 to-yellow-50",
    accent: "#D97706",
  },
  {
    emoji: "💸",
    title: "Preleva su PayPal",
    subtitle: "Trasforma i LEA in denaro reale",
    description:
      "Converti i tuoi LEA guadagnati in euro reali e preleva direttamente sul tuo conto PayPal. Nessun limite mensile.",
    bg: "from-blue-50 to-sky-50",
    accent: "#0369A1",
  },
  {
    emoji: "📈",
    title: "Moltiplicatore mensile",
    subtitle: "I tuoi guadagni crescono ogni mese",
    description:
      "Ogni mese che resti abbonato, il tuo moltiplicatore LEA aumenta. Più resti, più guadagni — e l'ambiente ringrazia.",
    bg: "from-green-50 to-emerald-50",
    accent: "#15803D",
  },
];

export function OptionC() {
  const [active, setActive] = useState(0);
  const [sliding, setSliding] = useState<"left" | "right" | null>(null);

  const goTo = (idx: number, dir: "left" | "right") => {
    setSliding(dir);
    setTimeout(() => {
      setActive(idx);
      setSliding(null);
    }, 220);
  };

  const prev = () => {
    if (active > 0) goTo(active - 1, "right");
  };
  const next = () => {
    if (active < features.length - 1) goTo(active + 1, "left");
  };

  const f = features[active];

  const slideClass = sliding === "left"
    ? "opacity-0 translate-x-8"
    : sliding === "right"
    ? "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

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
      {/* Status bar simulation */}
      <div className="w-full flex justify-between items-center px-7 pt-3 pb-1">
        <span className="text-xs font-semibold text-gray-500">14:04</span>
        <div className="w-28 h-7 bg-black rounded-full" />
        <span className="text-xs font-semibold text-gray-500">●●●</span>
      </div>

      {/* Close button */}
      <button
        className="absolute top-12 right-5 w-8 h-8 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        <X size={16} strokeWidth={2.2} color="#6B7280" />
      </button>

      {/* Hero section */}
      <div className="flex flex-col items-center mt-10 mb-2">
        {/* Gold glow behind icon */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full"
            style={{
              width: 180,
              height: 180,
              background:
                "radial-gradient(circle, rgba(255,215,0,0.22) 0%, rgba(255,215,0,0.04) 70%, transparent 100%)",
            }}
          />
          <img
            src="/__mockup/images/leafy-gold-icon.png"
            alt="Leafy Gold"
            style={{
              width: 130,
              height: 130,
              objectFit: "contain",
              position: "relative",
              filter: "drop-shadow(0 8px 24px rgba(217,119,6,0.28))",
            }}
          />
        </div>

        {/* Badge */}
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

        {/* Title */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#111827",
            marginTop: 12,
            letterSpacing: -0.5,
            textAlign: "center",
          }}
        >
          Passa a Premium
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: "center" }}>
          Sblocca il massimo potenziale di Leafy
        </p>
      </div>

      {/* Feature carousel */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-start mt-4 px-6">
        {/* Card */}
        <div
          className={`w-full rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-200 ease-out ${slideClass} bg-gradient-to-br ${f.bg}`}
          style={{
            minHeight: 230,
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Emoji icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.7)", fontSize: 30, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            {f.emoji}
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: f.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
            {f.subtitle}
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 10, letterSpacing: -0.3 }}>
            {f.title}
          </h2>
          <p style={{ fontSize: 13.5, color: "#4B5563", lineHeight: 1.6 }}>
            {f.description}
          </p>
        </div>

        {/* Carousel nav */}
        <div className="flex items-center gap-5 mt-5">
          <button
            onClick={prev}
            disabled={active === 0}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
            style={{
              background: active === 0 ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.08)",
              opacity: active === 0 ? 0.35 : 1,
            }}
          >
            <ChevronLeft size={18} color="#374151" />
          </button>

          {/* Dots */}
          <div className="flex gap-2 items-center">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > active ? "left" : "right")}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === active ? 20 : 7,
                  height: 7,
                  background: i === active ? "#2E6B50" : "rgba(0,0,0,0.15)",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={active === features.length - 1}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
            style={{
              background: active === features.length - 1 ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.08)",
              opacity: active === features.length - 1 ? 0.35 : 1,
            }}
          >
            <ChevronRight size={18} color="#374151" />
          </button>
        </div>
      </div>

      {/* Bottom section — price + CTA */}
      <div className="w-full px-6 pb-8 flex flex-col items-center gap-3 mt-2">
        {/* Price row */}
        <div className="flex items-baseline gap-1.5 justify-center">
          <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>Solo</span>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#111827", letterSpacing: -2, lineHeight: 1 }}>0,89</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#374151", lineHeight: 1 }}>€</span>
          <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500, alignSelf: "flex-end", paddingBottom: 4 }}>/mese</span>
        </div>

        {/* Included bullets */}
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
          className="w-full flex items-center justify-center gap-2 rounded-2xl"
          style={{
            height: 58,
            background: "#2E6B50",
            boxShadow: "0 8px 32px rgba(46,107,80,0.32)",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: -0.2 }}>
            Attiva Leafy Gold
          </span>
        </button>

        {/* Dismiss */}
        <button>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>Non ora</span>
        </button>
      </div>
    </div>
  );
}
