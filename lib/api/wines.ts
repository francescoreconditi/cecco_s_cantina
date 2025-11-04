// API client per operazioni sui vini
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";
import { uploadLabel, deleteLabel, getLabelSignedUrl } from "./bottles";

type Wine = Database["public"]["Tables"]["wines"]["Row"];
type WineInsert = Database["public"]["Tables"]["wines"]["Insert"];
type WineUpdate = Database["public"]["Tables"]["wines"]["Update"];

// Recupera tutti i vini dell'utente corrente
export async function getWines() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Converti path foto in signed URL per ogni vino
  const winesWithUrls = await Promise.all(
    data.map(async (wine) => {
      if (wine.foto_etichetta_url) {
        const signedUrl = await getLabelSignedUrl(wine.foto_etichetta_url);
        if (signedUrl) {
          wine.foto_etichetta_url = signedUrl;
        }
      }
      return wine;
    })
  );

  return winesWithUrls as Wine[];
}

// Recupera un singolo vino per ID
export async function getWine(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wines")
    .select("*")
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

  return data as Wine;
}

// Cerca vini per nome, produttore o denominazione
export async function searchWines(query: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .or(
      `nome.ilike.%${query}%,produttore.ilike.%${query}%,denominazione.ilike.%${query}%`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Wine[];
}

// Filtra vini per regione
export async function getWinesByRegion(regione: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .eq("regione", regione)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Wine[];
}

// Crea un nuovo vino
export async function createWine(wine: Omit<WineInsert, "id" | "owner_id">) {
  const supabase = createClient();

  // Recupera l'utente corrente
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato");

  // Genera ID e timestamp manualmente
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("wines")
    .insert({
      id,
      ...wine,
      owner_id: user.id,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Wine;
}

// Aggiorna un vino esistente
export async function updateWine(id: string, wine: WineUpdate) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wines")
    .update(wine)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Wine;
}

// Elimina un vino
export async function deleteWine(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("wines").delete().eq("id", id);

  if (error) throw error;
}

// Recupera statistiche vini
export async function getWineStats() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("wines")
    .select("id, regione, paese, tipologia");

  if (error) throw error;

  // Calcola statistiche
  const total = data.length;
  const byRegion = data.reduce(
    (acc, wine) => {
      const region = wine.regione || "Sconosciuta";
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const byType = data.reduce(
    (acc, wine) => {
      const type = wine.tipologia || "Altro";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total,
    byRegion,
    byType,
  };
}

// Esporta funzioni upload/delete foto (riutilizza quelle di bottles)
export { uploadLabel as uploadWineLabel, deleteLabel as deleteWineLabel };
