// API client per operazioni sulle ubicazioni
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Location = Database["public"]["Tables"]["locations"]["Row"];
type LocationInsert = Database["public"]["Tables"]["locations"]["Insert"];
type LocationUpdate = Database["public"]["Tables"]["locations"]["Update"];

// Recupera tutte le ubicazioni dell'utente
export async function getLocations() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;
  return data as Location[];
}

// Recupera una singola ubicazione
export async function getLocation(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Location;
}

// Recupera ubicazioni figlie di un parent
export async function getChildLocations(parentId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("parent_id", parentId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data as Location[];
}

// Recupera ubicazioni root (senza parent)
export async function getRootLocations() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .is("parent_id", null)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data as Location[];
}

// Crea una nuova ubicazione
export async function createLocation(
  location: Omit<LocationInsert, "id" | "owner_id">
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
    .from("locations")
    .insert({
      id,
      ...location,
      owner_id: user.id,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Location;
}

// Aggiorna un'ubicazione
export async function updateLocation(id: string, location: LocationUpdate) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("locations")
    .update(location)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Location;
}

// Elimina un'ubicazione
export async function deleteLocation(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("locations").delete().eq("id", id);

  if (error) throw error;
}

// Recupera albero gerarchico completo
export async function getLocationsTree() {
  const locations = await getLocations();

  // Costruisci mappa per accesso veloce
  const locationMap = new Map<string, Location & { children: Location[] }>();
  locations.forEach((loc) => {
    locationMap.set(loc.id, { ...loc, children: [] });
  });

  // Costruisci albero
  const roots: (Location & { children: Location[] })[] = [];
  locations.forEach((loc) => {
    const node = locationMap.get(loc.id)!;
    if (loc.parent_id) {
      const parent = locationMap.get(loc.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
