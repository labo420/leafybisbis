import crypto from "crypto";

export type GreenCategory = "Bio" | "Km 0" | "Senza Plastica" | "Equo Solidale" | "Vegano" | "Artigianale" | "DOP/IGP";

export interface FoundItem {
  name: string;
  category: GreenCategory;
  points: number;
  emoji: string;
}

const KEYWORD_RULES: Array<{ keywords: string[]; category: GreenCategory; points: number; emoji: string }> = [
  {
    keywords: ["bio", "biologico", "biologica", "biologici", "organic", "organico"],
    category: "Bio",
    points: 15,
    emoji: "🌱",
  },
  {
    keywords: ["km 0", "km0", "chilometro zero", "filiera corta", "locale", "prodotto locale"],
    category: "Km 0",
    points: 12,
    emoji: "📍",
  },
  {
    keywords: ["senza plastica", "plastic free", "plasticfree", "zero plastica", "biodegradabile", "compostabile"],
    category: "Senza Plastica",
    points: 20,
    emoji: "♻️",
  },
  {
    keywords: ["fairtrade", "fair trade", "equo solidale", "commercio equo", "equosolidale"],
    category: "Equo Solidale",
    points: 18,
    emoji: "❤️",
  },
  {
    keywords: ["vegan", "vegano", "vegana", "vegani", "100% vegetale", "plant based", "plant-based"],
    category: "Vegano",
    points: 12,
    emoji: "🌿",
  },
  {
    keywords: ["artigianale", "artigianali", "fatto a mano", "artigiano", "produzione propria"],
    category: "Artigianale",
    points: 8,
    emoji: "🏺",
  },
  {
    keywords: ["dop", "igp", "stg", "denominazione di origine", "indicazione geografica"],
    category: "DOP/IGP",
    points: 10,
    emoji: "🏷️",
  },
];

export function parseReceiptText(text: string): FoundItem[] {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const foundItems: FoundItem[] = [];
  const usedKeywords = new Set<string>();

  for (const rule of KEYWORD_RULES) {
    for (const keyword of rule.keywords) {
      const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(normalizedKeyword) && !usedKeywords.has(rule.category)) {
        usedKeywords.add(rule.category);
        foundItems.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          category: rule.category,
          points: rule.points,
          emoji: rule.emoji,
        });
        break;
      }
    }
  }

  return foundItems;
}

export function hashImage(base64: string): string {
  return crypto.createHash("sha256").update(base64.substring(0, 1000)).digest("hex");
}

export function calculateImpact(greenItemsCount: number, categories: string[]): {
  co2: number;
  plastic: number;
  water: number;
} {
  let co2 = 0;
  let plastic = 0;
  let water = 0;

  for (const cat of categories) {
    if (cat === "Bio") { co2 += 0.3; water += 50; }
    if (cat === "Km 0") { co2 += 0.5; water += 20; }
    if (cat === "Senza Plastica") { plastic += 0.05; }
    if (cat === "Vegano") { co2 += 0.8; water += 100; }
    if (cat === "Equo Solidale") { co2 += 0.1; }
  }

  return {
    co2: Math.round(co2 * 100) / 100,
    plastic: Math.round(plastic * 1000) / 1000,
    water: Math.round(water),
  };
}

export type LevelName = "Germoglio" | "Ramoscello" | "Arbusto" | "Albero" | "Foresta" | "Giungla";

export const CHECKIN_REWARDS: Record<LevelName, { daily: number; finalBonus: number }> = {
  Germoglio:  { daily: 5,  finalBonus: 100  },
  Ramoscello: { daily: 7,  finalBonus: 150  },
  Arbusto:    { daily: 10, finalBonus: 250  },
  Albero:     { daily: 15, finalBonus: 400  },
  Foresta:    { daily: 25, finalBonus: 700  },
  Giungla:    { daily: 50, finalBonus: 1000 },
};

export function getCheckinRewards(level: LevelName): { daily: number; finalBonus: number } {
  return CHECKIN_REWARDS[level] ?? CHECKIN_REWARDS.Germoglio;
}

export const GOLD_CHECKIN_REWARDS: Record<LevelName, { daily: { drops: number; lea: number }; finalBonus: { drops: number; lea: number } }> = {
  Germoglio:  { daily: { drops: 10,  lea: 1  }, finalBonus: { drops: 200,  lea: 5   } },
  Ramoscello: { daily: { drops: 15,  lea: 2  }, finalBonus: { drops: 300,  lea: 10  } },
  Arbusto:    { daily: { drops: 20,  lea: 3  }, finalBonus: { drops: 500,  lea: 15  } },
  Albero:     { daily: { drops: 30,  lea: 5  }, finalBonus: { drops: 800,  lea: 25  } },
  Foresta:    { daily: { drops: 50,  lea: 10 }, finalBonus: { drops: 1500, lea: 50  } },
  Giungla:    { daily: { drops: 100, lea: 20 }, finalBonus: { drops: 2500, lea: 100 } },
};

export function getGoldCheckinRewards(level: LevelName): { daily: { drops: number; lea: number }; finalBonus: { drops: number; lea: number } } {
  return GOLD_CHECKIN_REWARDS[level] ?? GOLD_CHECKIN_REWARDS.Germoglio;
}

export const LEVEL_THRESHOLDS: { name: LevelName; minPoints: number }[] = [
  { name: "Germoglio", minPoints: 0 },
  { name: "Ramoscello", minPoints: 500 },
  { name: "Arbusto", minPoints: 2000 },
  { name: "Albero", minPoints: 5000 },
  { name: "Foresta", minPoints: 10000 },
  { name: "Giungla", minPoints: 25000 },
];

export function calculateLevel(points: number): {
  level: LevelName;
  nextLevelPoints: number;
  progressPercent: number;
  levelIndex: number;
} {
  let currentIdx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i].minPoints) {
      currentIdx = i;
      break;
    }
  }

  const current = LEVEL_THRESHOLDS[currentIdx];
  const isMax = currentIdx === LEVEL_THRESHOLDS.length - 1;

  if (isMax) {
    return { level: current.name, nextLevelPoints: current.minPoints, progressPercent: 100, levelIndex: currentIdx };
  }

  const next = LEVEL_THRESHOLDS[currentIdx + 1];
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return {
    level: current.name,
    nextLevelPoints: next.minPoints,
    progressPercent: Math.round((progress / range) * 100),
    levelIndex: currentIdx,
  };
}

export function generateReferralCode(): string {
  return "LEAFY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateVoucherCode(): string {
  return "VCH-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function extractTextViaGoogleVision(base64: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Google Vision API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json() as { responses?: Array<{ fullTextAnnotation?: { text?: string } }> };
    const text = data.responses?.[0]?.fullTextAnnotation?.text;
    return text || null;
  } catch (err) {
    console.error("Google Vision API request failed:", err);
    return null;
  }
}
