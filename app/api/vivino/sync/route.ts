import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route per salvare i dati Vivino nel database
 *
 * POST /api/vivino/sync
 * Body: { wineId: string, vivinoData: {...} }
 *
 * Salva i dati Vivino ricevuti dal client nel database
 */
export async function POST(request: NextRequest) {
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

    // Leggi wineId e vivinoData dal body
    const body = await request.json();
    const { wineId, vivinoData } = body;

    if (!wineId || !vivinoData) {
      return NextResponse.json(
        { error: "wineId e vivinoData obbligatori" },
        { status: 400 }
      );
    }

    // Verifica che il vino appartenga all'utente
    const { data: wine, error: wineError } = await supabase
      .from("wines")
      .select("id")
      .eq("id", wineId)
      .eq("owner_id", user.id)
      .single();

    if (wineError || !wine) {
      return NextResponse.json(
        { error: "Vino non trovato" },
        { status: 404 }
      );
    }

    // Aggiorna il vino con i dati Vivino ricevuti dal client
    const { data: updatedWine, error: updateError } = await supabase
      .from("wines")
      .update({
        vivino_id: vivinoData.id || null,
        vivino_rating: vivinoData.rating || null,
        vivino_rating_count: vivinoData.rating_count || null,
        vivino_price: vivinoData.price || null,
        vivino_currency: vivinoData.currency || "EUR",
        vivino_url: vivinoData.url || null,
        vivino_image_url: vivinoData.image_url || null,
        vivino_last_updated: new Date().toISOString(),
      })
      .eq("id", wineId)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Errore aggiornamento vino:", updateError);
      return NextResponse.json(
        { error: "Errore salvando dati Vivino" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wine: updatedWine,
    });
  } catch (error) {
    console.error("Errore sync Vivino:", error);
    return NextResponse.json(
      {
        error: "Errore interno del server",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

