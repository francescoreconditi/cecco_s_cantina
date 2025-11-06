// API client per degustazioni
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Tasting = Database["public"]["Tables"]["tastings"]["Row"];
type TastingInsert = Database["public"]["Tables"]["tastings"]["Insert"];
type TastingUpdate = Database["public"]["Tables"]["tastings"]["Update"];

export type TastingWithWine = Tasting & {
  wine: Database["public"]["Tables"]["wines"]["Row"];
};

export async function getTastings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tastings")
    .select(`*, wine:wines(*)`)
    .order("data", { ascending: false });
  if (error) throw error;
  return data as TastingWithWine[];
}

export async function getTasting(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tastings")
    .select(`*, wine:wines(*)`)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as TastingWithWine;
}

export async function createTasting(tasting: Omit<TastingInsert, "id" | "owner_id">) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato");

  // Genera ID e timestamp manualmente
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tastings")
    .insert({
      id,
      ...tasting,
      owner_id: user.id,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Tasting;
}

export async function updateTasting(id: string, tasting: TastingUpdate) {
  const supabase = createClient();

  const now = new Date().toISOString();
  const updateData = {
    ...tasting,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("tastings")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Errore update degustazione:", error);
    throw error;
  }
  return data as Tasting;
}

export async function deleteTasting(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tastings").delete().eq("id", id);
  if (error) throw error;
}

// Upload foto degustazione
export async function uploadTastingPhoto(file: File, userId: string) {
  const supabase = createClient();

  // Genera nome file univoco
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `user/${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("tasting-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Restituisci il PATH (non l'URL) - lo convertiremo in signed URL quando serve
  return filePath;
}

// Genera signed URL temporaneo per visualizzare foto (valido 1 ora)
export async function getTastingPhotoSignedUrl(pathOrUrl: string) {
  const supabase = createClient();

  let filePath: string;

  // Se è un URL completo, estrai solo il path
  if (pathOrUrl.startsWith("http")) {
    try {
      const urlObj = new URL(pathOrUrl);
      const pathParts = urlObj.pathname.split("/");
      filePath = pathParts.slice(pathParts.indexOf("tasting-photos") + 1).join("/");
    } catch (e) {
      console.error("Errore parsing URL foto degustazione:", e);
      return null;
    }
  } else {
    // Altrimenti è già un path relativo
    filePath = pathOrUrl;
  }

  const { data, error } = await supabase.storage
    .from("tasting-photos")
    .createSignedUrl(filePath, 3600); // 1 ora

  if (error) {
    console.error("Errore generazione signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

// Elimina foto degustazione
export async function deleteTastingPhoto(pathOrUrl: string) {
  const supabase = createClient();

  let filePath: string;

  // Se è un URL, estrai il path
  if (pathOrUrl.startsWith("http")) {
    const urlObj = new URL(pathOrUrl);
    const pathParts = urlObj.pathname.split("/");
    filePath = pathParts.slice(pathParts.indexOf("tasting-photos") + 1).join("/");
  } else {
    // Altrimenti è già un path
    filePath = pathOrUrl;
  }

  const { error } = await supabase.storage.from("tasting-photos").remove([filePath]);

  if (error) throw error;
}
