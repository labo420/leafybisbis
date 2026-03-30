import "./welcome-cards.css";

const LEAF_GREEN = "#2E6B50";

const STEPS = [
  {
    image: "/__mockup/images/tutorial/slide1-leaf.png",
    tag: "01 / 04",
    title: "Benvenuto in Leafy!",
    body: "La prima app italiana che trasforma ogni tua spesa in drops e cashback reale in €.",
    activeDot: 0,
  },
  {
    image: "/__mockup/images/tutorial/slide2-scan.png",
    tag: "02 / 04",
    title: "Scansiona & Guadagna",
    body: "Carica i tuoi scontrini al supermercato: ogni prodotto con buon Eco-Score ti porta drops e $LEA.",
    activeDot: 1,
  },
  {
    image: "/__mockup/images/tutorial/slide3-giungla.png",
    tag: "03 / 04",
    title: "Sali di Livello",
    body: "Da Germoglio a Giungla: ogni acquisto eco ti avvicina al prossimo livello, con premi esclusivi da sbloccare.",
    activeDot: 2,
  },
  {
    image: "/__mockup/images/tutorial/slide4-wallet.png",
    tag: "04 / 04",
    title: "Ritira il tuo $LEA",
    body: "$LEA è il tuo cashback reale. Accumulalo con acquisti green e prelevalo direttamente su PayPal.",
    activeDot: 3,
  },
];

function SlideCard({ step, index }: { step: (typeof STEPS)[0]; index: number }) {
  const isLast = index === STEPS.length - 1;
  return (
    <div className="slide-card">
      <div className="slide-skip">Salta</div>

      <div className="slide-image-area">
        <img
          src={step.image}
          alt={step.title}
          className="slide-image"
        />
      </div>

      <div className="slide-text-area">
        <span className="slide-tag">{step.tag}</span>
        <h2 className="slide-title">{step.title}</h2>
        <p className="slide-body">{step.body}</p>
      </div>

      <div className="slide-dots">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="slide-dot"
            style={{
              width: i === step.activeDot ? 28 : 8,
              backgroundColor: i === step.activeDot ? LEAF_GREEN : "#D6EFE2",
            }}
          />
        ))}
      </div>

      <button className="slide-cta">
        {isLast ? "Inizia a guadagnare! 🌱" : "Avanti"}
      </button>
    </div>
  );
}

export function WelcomeCards() {
  return (
    <div className="cards-wrapper">
      <div className="cards-header">
        <span className="cards-app-name">🌿 Leafy</span>
        <span className="cards-subtitle">Tutorial di benvenuto — anteprima card</span>
      </div>
      <div className="cards-row">
        {STEPS.map((step, i) => (
          <SlideCard key={i} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}
