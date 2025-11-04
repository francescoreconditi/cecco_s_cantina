// API client per operazioni sulle bottiglie
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Bottle = Database["public"]["Tables"]["bottles"]["Row"];
type BottleInsert = Database["public"]["Tables"]["bottles"]["Insert"];
type BottleUpdate = Database["public"]["Tables"]["bottles"]["Update"];

// Tipo esteso con relazione wine
export type BottleWithWine = Bottle & {
  wine: Database["public"]["Tables"]["wines"]["Row"];
};

// Recupera tutte le bottiglie con info vino
export async function getBottles() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bottles")
    .select(
      `
      *,
      wine:wines(*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Converti path foto in signed URL per ogni bottiglia
  const bottlesWithUrls = await Promise.all(
    data.map(async (bottle) => {
      if (bottle.foto_etichetta_url) {
        const signedUrl = await getLabelSignedUrl(bottle.foto_etichetta_url);
        if (signedUrl) {
          bottle.foto_etichetta_url = signedUrl;
        }
      }
      return bottle;
    })
  );

  return bottlesWithUrls as BottleWithWine[];
}

// Recupera una singola bottiglia
export async function getBottle(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bottles")
    .select(
      `
      *,
      wine:wines(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  // Se c'è una foto etichetta (path), converti in signed URL
  if (data.foto_etichetta_url) {
    const signedUrl = await getLabelSignedUrl(data.foto_etichetta_url);
    if (signedUrl) {
      data.foto_etichetta_url = signedUrl;
    }
  }

  return data as BottleWithWine;
}

// Recupera bottiglie per vino
export async function getBottlesByWine(wineId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bottles")
    .select("*")
    .eq("wine_id", wineId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Bottle[];
}

// Crea una nuova bottiglia
export async function createBottle(
  bottle: Omit<BottleInsert, "id" | "owner_id">
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato");

  // Genera ID e timestamp manualmente
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("bottles")
    .insert({
      id,
      ...bottle,
      owner_id: user.id,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Bottle;
}

// Aggiorna una bottiglia
export async function updateBottle(id: string, bottle: BottleUpdate) {
  const supabase = createClient();

  // Aggiungi timestamp aggiornamento
  const now = new Date().toISOString();
  const updateData = {
    ...bottle,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("bottles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Errore update bottiglia:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error,
    });
    throw error;
  }
  return data as Bottle;
}

// Elimina una bottiglia
export async function deleteBottle(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("bottles").delete().eq("id", id);

  if (error) throw error;
}

// Upload foto etichetta - restituisce il PATH (non URL)
export async function uploadLabel(file: File, userId: string) {
  const supabase = createClient();

  // Genera nome file univoco
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `user/${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("labels")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Restituisci il PATH (non l'URL) - lo convertiremo in signed URL quando serve
  return filePath;
}

// Genera signed URL temporaneo per visualizzare foto (valido 1 ora)
// Gestisce sia path che vecchi URL completi
export async function getLabelSignedUrl(pathOrUrl: string) {
  const supabase = createClient();

  let filePath: string;

  // Se è un URL completo, estrai solo il path
  if (pathOrUrl.startsWith("http")) {
    try {
      const urlObj = new URL(pathOrUrl);
      const pathParts = urlObj.pathname.split("/");
      const labelsIndex = pathParts.indexOf("labels");
      if (labelsIndex !== -1) {
        // Estrai tutto dopo "labels/"
        filePath = pathParts.slice(labelsIndex + 1).join("/");
      } else {
        console.error("URL non valido - 'labels' non trovato:", pathOrUrl);
        return null;
      }
    } catch (error) {
      console.error("Errore parsing URL:", error);
      return null;
    }
  } else {
    // È già un path
    filePath = pathOrUrl;
  }

  const { data, error } = await supabase.storage
    .from("labels")
    .createSignedUrl(filePath, 3600); // 3600 secondi = 1 ora

  if (error) {
    console.error("Errore generazione signed URL:", error, "Path:", filePath);
    return null;
  }

  return data.signedUrl;
}

// Elimina foto etichetta (accetta sia path che URL per retrocompatibilità)
export async function deleteLabel(pathOrUrl: string) {
  const supabase = createClient();

  let filePath: string;

  // Se è un URL, estrai il path
  if (pathOrUrl.startsWith("http")) {
    const urlObj = new URL(pathOrUrl);
    const pathParts = urlObj.pathname.split("/");
    filePath = pathParts.slice(pathParts.indexOf("labels") + 1).join("/");
  } else {
    // Altrimenti è già un path
    filePath = pathOrUrl;
  }

  const { error } = await supabase.storage.from("labels").remove([filePath]);

  if (error) throw error;
}

// Statistiche bottiglie
export async function getBottleStats() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bottles")
    .select("id, quantita, stato_maturita");

  if (error) throw error;

  const total = data.reduce((sum, b) => sum + (b.quantita || 0), 0);
  const byMaturity = data.reduce(
    (acc, bottle) => {
      const status = bottle.stato_maturita || "Sconosciuto";
      acc[status] = (acc[status] || 0) + (bottle.quantita || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total,
    byMaturity,
    count: data.length,
  };
}
