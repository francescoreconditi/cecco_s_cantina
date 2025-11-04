// Database locale IndexedDB con Dexie
// Per cache offline e sync pattern
import Dexie, { type EntityTable } from "dexie";

// Tipi per le tabelle locali
export interface LocalWine {
  id: string;
  ownerId: string;
  nome: string;
  produttore?: string;
  denominazione?: string;
  annata?: number;
  vitigni: string[];
  regione?: string;
  paese?: string;
  formatoMl?: number;
  gradoAlcolico?: number;
  tipologia?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalBottle {
  id: string;
  ownerId: string;
  wineId: string;
  quantita: number;
  dataAcquisto?: string;
  prezzoAcquisto?: number;
  fornitore?: string;
  locationId?: string;
  prontoDA?: string;
  meglioEntro?: string;
  statoMaturita?: string;
  barcode?: string;
  fotoEtichettaUrl?: string;
  notePosizione?: string;
  notePrivate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalTasting {
  id: string;
  ownerId: string;
  wineId: string;
  data: string;
  punteggio?: number;
  aspettoVisivo?: string;
  profumo?: string;
  gusto?: string;
  noteGenerali?: string;
  occasione?: string;
  abbinamentoCibo?: string;
  partecipanti: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LocalLocation {
  id: string;
  ownerId: string;
  nome: string;
  descrizione?: string;
  parentId?: string;
  temperatura?: number;
  umidita?: number;
  noteAmbientali?: string;
  capacitaMassima?: number;
  createdAt: string;
  updatedAt: string;
}

// Outbox per operazioni offline
export interface OutboxEntry {
  seq?: number; // auto-incrementale
  id: string; // ID univoco operazione
  type: "insert" | "update" | "delete";
  table: "wines" | "bottles" | "tastings" | "locations";
  payload: Record<string, unknown>;
  timestamp: string;
  status: "pending" | "syncing" | "synced" | "error";
  error?: string;
  retryCount: number;
}

// Definizione database Dexie
class CantinaDatabase extends Dexie {
  wines!: EntityTable<LocalWine, "id">;
  bottles!: EntityTable<LocalBottle, "id">;
  tastings!: EntityTable<LocalTasting, "id">;
  locations!: EntityTable<LocalLocation, "id">;
  outbox!: EntityTable<OutboxEntry, "seq">;

  constructor() {
    super("cantina-vini");

    this.version(1).stores({
      wines: "id, ownerId, updatedAt, annata, regione, produttore",
      bottles:
        "id, ownerId, wineId, updatedAt, statoMaturita, barcode, locationId",
      tastings: "id, ownerId, wineId, data, updatedAt",
      locations: "id, ownerId, parentId, updatedAt",
      outbox: "++seq, id, type, table, timestamp, status",
    });
  }
}

// Istanza singleton del database
export const db = new CantinaDatabase();

// Helper per aggiungere entry all'outbox
export async function addToOutbox(
  type: OutboxEntry["type"],
  table: OutboxEntry["table"],
  payload: Record<string, unknown>
) {
  const entry: OutboxEntry = {
    id: crypto.randomUUID(),
    type,
    table,
    payload,
    timestamp: new Date().toISOString(),
    status: "pending",
    retryCount: 0,
  };

  await db.outbox.add(entry);
  return entry;
}

// Helper per pulire l'outbox (voci sincronizzate)
export async function cleanOutbox() {
  await db.outbox.where("status").equals("synced").delete();
}
