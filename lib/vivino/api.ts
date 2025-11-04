// Utility per integrazione con API Vivino (non ufficiale)
// API pubblica di ricerca Vivino

export interface VivinoWine {
  id: number;
  name: string;
  seo_name: string;
  winery?: {
    id: number;
    name: string;
    seo_name: string;
  };
  vintage?: {
    year: number;
    name: string;
  };
  statistics?: {
    ratings_count: number;
    ratings_average: number;
    labels_count: number;
  };
  price?: {
    amount: number;
    currency: string;
    discounted_from?: number;
  };
  image?: {
    location: string;
    variations: {
      medium: string;
      large: string;
    };
  };
  region?: {
    name: string;
    country: {
      name: string;
    };
  };
}

export interface VivinoSearchResult {
  matches: VivinoWine[];
  total: number;
}

const VIVINO_API_BASE = "https://www.vivino.com/api";
const CACHE_PREFIX = "vivino_cache_";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 giorni

// Cerca vini su Vivino
export async function searchVivinoWine(
  query: string,
  options: {
    year?: number;
    country?: string;
    limit?: number;
  } = {}
): Promise<VivinoSearchResult> {
  const { year, country, limit = 10 } = options;

  // Costruisci query
  let searchQuery = query;
  if (year) searchQuery += ` ${year}`;
  if (country) searchQuery += ` ${country}`;

  // Controlla cache
  const cacheKey = `${CACHE_PREFIX}search_${searchQuery}`;
  const cached = getCachedData<VivinoSearchResult>(cacheKey);
  if (cached) {
    console.log("Vivino: usando cache per", searchQuery);
    return cached;
  }

  try {
    const url = new URL(`${VIVINO_API_BASE}/wines/search`);
    url.searchParams.append("q", searchQuery);
    url.searchParams.append("per_page", limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Vivino API error: ${response.status}`);
    }

    const data = await response.json();

    const result: VivinoSearchResult = {
      matches: data.explore_vintage?.records || [],
      total: data.explore_vintage?.records_matched || 0,
    };

    // Salva in cache
    setCachedData(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Errore ricerca Vivino:", error);
    throw new Error("Impossibile cercare su Vivino. Riprova più tardi.");
  }
}

// Ottieni dettagli specifici di un vino
export async function getVivinoWineDetails(
  wineId: number
): Promise<VivinoWine | null> {
  const cacheKey = `${CACHE_PREFIX}wine_${wineId}`;
  const cached = getCachedData<VivinoWine>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${VIVINO_API_BASE}/wines/${wineId}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Vivino API error: ${response.status}`);
    }

    const wine: VivinoWine = await response.json();
    setCachedData(cacheKey, wine);

    return wine;
  } catch (error) {
    console.error("Errore dettagli Vivino:", error);
    return null;
  }
}

// Genera URL Vivino per un vino
export function getVivinoUrl(wine: VivinoWine): string {
  const seoName = wine.seo_name || wine.name.toLowerCase().replace(/\s+/g, "-");
  const winerySeo = wine.winery?.seo_name || "";

  if (winerySeo) {
    return `https://www.vivino.com/w/${winerySeo}/${seoName}/${wine.id}`;
  }

  return `https://www.vivino.com/wines/${wine.id}`;
}

// Formatta rating Vivino (es. "4.2/5")
export function formatVivinoRating(wine: VivinoWine): string | null {
  if (!wine.statistics?.ratings_average) return null;
  return `${wine.statistics.ratings_average.toFixed(1)}/5`;
}

// Formatta prezzo Vivino
export function formatVivinoPrice(wine: VivinoWine): string | null {
  if (!wine.price?.amount) return null;

  const currency = wine.price.currency === "EUR" ? "€" : wine.price.currency;
  const price = wine.price.amount.toFixed(2);

  if (wine.price.discounted_from) {
    const original = wine.price.discounted_from.toFixed(2);
    return `${currency}${price} (era ${currency}${original})`;
  }

  return `${currency}${price}`;
}

// Helper cache (localStorage)
function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Verifica scadenza cache
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return data as T;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn("Impossibile salvare cache Vivino:", error);
  }
}

// Pulisci cache vecchia
export function clearVivinoCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

// Matcher automatico: cerca il miglior match per un vino
export async function findBestVivinoMatch(wineData: {
  nome: string;
  produttore?: string | null;
  annata?: number | null;
  regione?: string | null;
}): Promise<VivinoWine | null> {
  try {
    // Costruisci query di ricerca
    const searchTerms = [wineData.nome];
    if (wineData.produttore) searchTerms.push(wineData.produttore);

    const query = searchTerms.join(" ");

    const results = await searchVivinoWine(query, {
      year: wineData.annata || undefined,
      limit: 5,
    });

    if (results.matches.length === 0) {
      return null;
    }

    // Trova miglior match
    const bestMatch = results.matches[0]; // Primo risultato è solitamente il più rilevante

    // Verifica match annata se specificata
    if (wineData.annata && bestMatch.vintage?.year !== wineData.annata) {
      // Cerca tra i risultati uno con annata corretta
      const yearMatch = results.matches.find(
        (w) => w.vintage?.year === wineData.annata
      );
      if (yearMatch) return yearMatch;
    }

    return bestMatch;
  } catch (error) {
    console.error("Errore ricerca automatica Vivino:", error);
    return null;
  }
}
