export const ACCEPTED_STORES = {
  standard: [
    "A&O",
    "Bennet",
    "Billa",
    "Cadoro",
    "Carrefour",
    "Carrefour Express",
    "Carrefour Iper",
    "Carrefour Market",
    "Coal",
    "Conad",
    "Conad City",
    "Conad Superstore",
    "Coop",
    "Crai",
    "Despar",
    "Dì per Dì",
    "E.Leclerc",
    "Esselunga",
    "Eurospar",
    "Famila",
    "Il Gigante",
    "Iper",
    "Interspar",
    "Ipercoop",
    "NovaCoop",
    "Pam",
    "Pam Local",
    "Panorama",
    "Prix Quality",
    "Selex",
    "Sigma",
    "Simply Market",
    "Spar",
    "Tigros",
    "Tuodì",
    "UniCoop",
  ],
  discount: [
    "Aldi",
    "Ard Discount",
    "Dok Discount",
    "Eurospin",
    "In's Mercato",
    "Lidl",
    "MD Discount",
    "Penny",
    "Penny Market",
    "Todis",
  ],
} as const;

const ALL_CHAINS: string[] = [
  ...ACCEPTED_STORES.standard,
  ...ACCEPTED_STORES.discount,
];

const CHAIN_LOOKUP: Map<string, string> = new Map();
for (const chain of ALL_CHAINS) {
  CHAIN_LOOKUP.set(chain.toLowerCase().replace(/[^a-z0-9àèéìòùü]/g, ""), chain);
}

const PARENT_BRANDS: Record<string, string[]> = {
  "Coop": ["Ipercoop", "UniCoop", "NovaCoop"],
  "Conad": ["Conad City", "Conad Superstore"],
  "Carrefour": ["Carrefour Express", "Carrefour Market", "Carrefour Iper"],
  "Pam": ["Panorama", "Pam Local"],
  "Despar": ["Eurospar", "Interspar", "Spar"],
  "Penny": ["Penny Market"],
};

const MIN_CHAIN_LENGTH = 4;

const SORTED_CHAINS: { chain: string; norm: string }[] = ALL_CHAINS
  .map(chain => ({ chain, norm: chain.toLowerCase().replace(/[^a-z0-9àèéìòùü]/g, "") }))
  .sort((a, b) => b.norm.length - a.norm.length);

export function matchChain(storeName: string | null | undefined): string | null {
  if (!storeName) return null;

  const normalized = storeName.toLowerCase().replace(/[^a-z0-9àèéìòùü]/g, "");
  if (!normalized) return null;

  const exact = CHAIN_LOOKUP.get(normalized);
  if (exact) return exact;

  for (const { chain, norm } of SORTED_CHAINS) {
    if (norm.length < MIN_CHAIN_LENGTH) continue;
    if (normalized.includes(norm)) return chain;
  }

  for (const [parent, variants] of Object.entries(PARENT_BRANDS)) {
    const parentNorm = parent.toLowerCase().replace(/[^a-z0-9àèéìòùü]/g, "");
    if (parentNorm.length >= MIN_CHAIN_LENGTH && normalized.includes(parentNorm)) {
      for (const variant of variants) {
        const varNorm = variant.toLowerCase().replace(/[^a-z0-9àèéìòùü]/g, "");
        if (normalized.includes(varNorm)) return variant;
      }
      return parent;
    }
  }

  return null;
}

export function isAcceptedStore(storeChain: string | null): boolean {
  if (!storeChain) return false;
  return ALL_CHAINS.some(c => c.toLowerCase() === storeChain.toLowerCase());
}

export function getAcceptedStoresList() {
  return {
    standard: [...ACCEPTED_STORES.standard],
    discount: [...ACCEPTED_STORES.discount],
  };
}
