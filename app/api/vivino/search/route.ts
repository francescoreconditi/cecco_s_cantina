import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route proxy per cercare vini su Vivino
 * Necessario perché CORS blocca chiamate dirette dal client
 *
 * GET /api/vivino/search?wineId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    // Leggi wineId dai query params
    const searchParams = request.nextUrl.searchParams;
    const wineId = searchParams.get("wineId");

    if (!wineId) {
      return NextResponse.json(
        { error: "wineId obbligatorio" },
        { status: 400 }
      );
    }

    // Recupera il vino dal database
    const { data: wine, error: wineError } = await supabase
      .from("wines")
      .select("nome, produttore, annata, regione, denominazione")
      .eq("id", wineId)
      .eq("owner_id", user.id)
      .single();

    if (wineError || !wine) {
      return NextResponse.json(
        { error: "Vino non trovato" },
        { status: 404 }
      );
    }

    // Costruisci query di ricerca
    let searchQuery = wine.nome;
    if (wine.produttore) searchQuery += ` ${wine.produttore}`;
    if (wine.annata) searchQuery += ` ${wine.annata}`;

    console.log("=== VIVINO SEARCH DEBUG ===");
    console.log("Vino cercato:", {
      nome: wine.nome,
      produttore: wine.produttore,
      annata: wine.annata,
      regione: wine.regione,
      denominazione: wine.denominazione,
    });
    console.log("Query costruita:", searchQuery);

    // Chiama API Vivino usando l'endpoint di ricerca principale
    // Questo è l'endpoint usato dal sito web per le ricerche
    const vivinoUrl = new URL("https://www.vivino.com/search/wines");
    vivinoUrl.searchParams.append("q", searchQuery);

    console.log("URL Vivino:", vivinoUrl.toString());

    const vivinoResponse = await fetch(vivinoUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!vivinoResponse.ok) {
      console.error(`Vivino API error: ${vivinoResponse.status}`);
      console.error("Query:", searchQuery);
      throw new Error(`Vivino API error: ${vivinoResponse.status}`);
    }

    // Controlla il content-type della risposta
    const contentType = vivinoResponse.headers.get("content-type");
    console.log("Content-Type risposta:", contentType);

    const responseText = await vivinoResponse.text();
    console.log("Prime 500 caratteri risposta:", responseText.substring(0, 500));

    // Prova a parsare come JSON
    let vivinoData;
    try {
      vivinoData = JSON.parse(responseText);
    } catch (e) {
      console.error("La risposta non è JSON valido - probabilmente HTML");
      throw new Error("Vivino API ha restituito HTML invece di JSON");
    }

    // L'endpoint explore restituisce explore_vintage.records
    const matches = vivinoData.explore_vintage?.records || [];

    console.log(`Trovati ${matches.length} risultati`);

    // Log dei primi 5 risultati per debug
    matches.slice(0, 5).forEach((match: any, idx: number) => {
      console.log(`\nRisultato ${idx + 1}:`, {
        nome: match.vintage?.name || match.wine?.name,
        produttore: match.vintage?.wine?.winery?.name || match.wine?.winery?.name,
        annata: match.vintage?.year,
        paese: match.vintage?.wine?.region?.country?.name || match.wine?.region?.country?.name,
        regione: match.vintage?.wine?.region?.name || match.wine?.region?.name,
      });
    });

    if (matches.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Nessun risultato trovato su Vivino",
      });
    }

    // Prepara tutti i risultati per il client (max 5)
    const results = matches.slice(0, 5).map((match: any) => {
      const vintage = match.vintage;
      const wineData = vintage?.wine || match.wine || {};

      // Prepara i dati
      const currencyObj = match.price?.currency;
      const currencyCode = currencyObj
        ? (typeof currencyObj === 'string' ? currencyObj : currencyObj.code || currencyObj.prefix || 'EUR')
        : null;

      // Prezzo: Vivino restituisce il prezzo in centesimi, dividiamo per 100
      const priceInEuros = match.price?.amount ? match.price.amount / 100 : null;

      return {
        id: wineData.id,
        name: vintage?.name || wineData.name,
        winery: wineData.winery?.name || null,
        year: vintage?.year || null,
        rating: (vintage?.statistics || wineData.statistics)?.ratings_average || null,
        rating_count: (vintage?.statistics || wineData.statistics)?.ratings_count || null,
        price: priceInEuros,
        currency: currencyCode,
        image_url: (vintage?.image || wineData.image)?.variations?.medium || (vintage?.image || wineData.image)?.location || null,
        url: `https://www.vivino.com/wines/${wineData.id}`,
      };
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Errore ricerca Vivino:", error);
    return NextResponse.json(
      {
        error: "Errore durante la ricerca su Vivino",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
