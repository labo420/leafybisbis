import { db, challengesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function endOfDay(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function endOfWeek(): Date {
  const d = new Date();
  const daysUntilSunday = 7 - d.getDay();
  d.setDate(d.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday));
  d.setHours(23, 59, 59, 999);
  return d;
}

const seedChallengesList = [
  {
    title: "Passeggiata Green",
    description: "Entra in un'Oasi Green o in un supermercato partner Leafy",
    category: "walkin",
    emoji: "🚶",
    challengeType: "daily",
    targetCount: 1,
    rewardPoints: 0,
    expiresAt: endOfDay(),
    isActive: true,
  },
  {
    title: "Il Cercatore di Corsia",
    description: "Scansiona il barcode di un prodotto suggerito dall'app (senza obbligo d'acquisto)",
    category: "barcode",
    emoji: "🔍",
    challengeType: "daily",
    targetCount: 1,
    rewardPoints: 0,
    expiresAt: endOfDay(),
    isActive: true,
  },
  {
    title: "Tris Bio",
    description: "Carica scontrini da 3 negozi diversi in 7 giorni",
    category: "receipts_multi_store",
    emoji: "🛒",
    challengeType: "weekly",
    targetCount: 3,
    rewardPoints: 0,
    expiresAt: endOfWeek(),
    isActive: true,
  },
  {
    title: "Settimana A",
    description: "Acquista almeno 5 prodotti Cat A in una settimana",
    category: "cat_a",
    emoji: "🌿",
    challengeType: "weekly",
    targetCount: 5,
    rewardPoints: 0,
    expiresAt: endOfWeek(),
    isActive: true,
  },
  {
    title: "Guerra alla Plastica",
    description: "Carica almeno 3 scontrini che non contengano bottiglie di plastica",
    category: "plastic_free",
    emoji: "🌊",
    challengeType: "weekly",
    targetCount: 3,
    rewardPoints: 0,
    expiresAt: endOfWeek(),
    isActive: true,
  },
  {
    title: "Master dello Scontrino",
    description: "Raggiungi il tetto massimo di $LEA accumulabili in una settimana",
    category: "lea_max",
    emoji: "🏆",
    challengeType: "weekly",
    targetCount: 1,
    rewardPoints: 0,
    expiresAt: endOfWeek(),
    isActive: true,
  },
];

export async function seedChallenges() {
  for (const ch of seedChallengesList) {
    const existing = await db.select().from(challengesTable)
      .where(eq(challengesTable.title, ch.title));
    if (existing.length === 0) {
      await db.insert(challengesTable).values(ch);
    }
  }
  const total = await db.select().from(challengesTable);
  console.log(`Challenges ready: ${total.length} total (${seedChallengesList.length} from seed).`);
}
