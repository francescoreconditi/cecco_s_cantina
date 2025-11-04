// Sistema di sincronizzazione offline -> online
import { db } from "@/lib/dexie/db";
import type { OutboxEntry } from "@/lib/dexie/db";
import { createWine, updateWine, deleteWine } from "@/lib/api/wines";
import { createBottle, updateBottle, deleteBottle } from "@/lib/api/bottles";
import { createTasting, updateTasting, deleteTasting } from "@/lib/api/tastings";
import { createLocation, updateLocation, deleteLocation } from "@/lib/api/locations";

// Processa la sync queue - da chiamare quando si torna online
export async function processSyncQueue() {
  // Ottieni tutte le entry pending dalla outbox
  const pendingEntries = await db.outbox
    .where("status")
    .equals("pending")
    .sortBy("timestamp");

  if (pendingEntries.length === 0) {
    console.log("Nessuna sincronizzazione necessaria");
    return { success: 0, failed: 0 };
  }

  console.log(`Sincronizzazione di ${pendingEntries.length} operazioni...`);

  let successCount = 0;
  let failCount = 0;

  for (const entry of pendingEntries) {
    try {
      // Marca come "syncing"
      await db.outbox.update(entry.seq!, { status: "syncing" });

      // Esegui l'operazione in base a tipo e tabella
      await syncEntry(entry);

      // Marca come completata
      await db.outbox.update(entry.seq!, { status: "synced" });
      successCount++;

      console.log(`✓ Sincronizzato: ${entry.table} ${entry.type} ${entry.id}`);
    } catch (error) {
      // In caso di errore, incrementa retry e salva errore
      const retryCount = entry.retryCount + 1;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await db.outbox.update(entry.seq!, {
        status: "error",
        retryCount,
        error: errorMessage,
      });

      failCount++;
      console.error(`✗ Errore sincronizzazione: ${entry.table} ${entry.type}`, error);

      // Se supera 3 tentativi, logga e continua
      if (retryCount >= 3) {
        console.error(`Operazione fallita dopo 3 tentativi, skip`);
      }
    }
  }

  // Pulisci le entry sincronizzate con successo
  await db.outbox.where("status").equals("synced").delete();

  console.log(`Sync completato: ${successCount} ok, ${failCount} failed`);

  return { success: successCount, failed: failCount };
}

// Sincronizza una singola entry
async function syncEntry(entry: OutboxEntry) {
  const { table, type, payload } = entry;

  switch (table) {
    case "wines":
      return await syncWine(type, payload);
    case "bottles":
      return await syncBottle(type, payload);
    case "tastings":
      return await syncTasting(type, payload);
    case "locations":
      return await syncLocation(type, payload);
    default:
      throw new Error(`Tabella sconosciuta: ${table}`);
  }
}

// Sincronizzazione vini
async function syncWine(type: OutboxEntry["type"], payload: any) {
  switch (type) {
    case "insert":
      // Rimuovi l'ID temporaneo e crea su Supabase
      const { id: tempId, ...wineData } = payload;
      const created = await createWine(wineData);

      // Aggiorna l'ID locale con quello reale
      await db.wines.delete(tempId);
      await db.wines.put({
        id: created.id,
        ownerId: created.owner_id,
        nome: created.nome,
        produttore: created.produttore || undefined,
        denominazione: created.denominazione || undefined,
        annata: created.annata || undefined,
        vitigni: created.vitigni || [],
        regione: created.regione || undefined,
        paese: created.paese || undefined,
        formatoMl: created.formato_ml || undefined,
        gradoAlcolico: created.grado_alcolico || undefined,
        tipologia: created.tipologia || undefined,
        note: created.note || undefined,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      });
      break;

    case "update":
      const { id: wineId, ...updateData } = payload;
      await updateWine(wineId, updateData);
      break;

    case "delete":
      await deleteWine(payload.id);
      break;
  }
}

// Sincronizzazione bottiglie
async function syncBottle(type: OutboxEntry["type"], payload: any) {
  switch (type) {
    case "insert":
      const { id: tempId, ...bottleData } = payload;
      const created = await createBottle(bottleData);

      // Aggiorna l'ID locale
      await db.bottles.delete(tempId);
      await db.bottles.put({
        id: created.id,
        ownerId: created.owner_id,
        wineId: created.wine_id,
        quantita: created.quantita,
        dataAcquisto: created.data_acquisto || undefined,
        prezzoAcquisto: created.prezzo_acquisto || undefined,
        fornitore: created.fornitore || undefined,
        locationId: created.location_id || undefined,
        prontoDA: created.pronto_da || undefined,
        meglioEntro: created.meglio_entro || undefined,
        statoMaturita: created.stato_maturita || undefined,
        barcode: created.barcode || undefined,
        fotoEtichettaUrl: created.foto_etichetta_url || undefined,
        notePosizione: created.note_posizione || undefined,
        notePrivate: created.note_private || undefined,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      });
      break;

    case "update":
      const { id: bottleId, ...updateData } = payload;
      await updateBottle(bottleId, updateData);
      break;

    case "delete":
      await deleteBottle(payload.id);
      break;
  }
}

// Sincronizzazione degustazioni
async function syncTasting(type: OutboxEntry["type"], payload: any) {
  switch (type) {
    case "insert":
      const { id: tempId, ...tastingData } = payload;
      const created = await createTasting(tastingData);

      await db.tastings.delete(tempId);
      await db.tastings.put({
        id: created.id,
        ownerId: created.owner_id,
        wineId: created.wine_id,
        data: created.data,
        punteggio: created.punteggio || undefined,
        aspettoVisivo: created.aspetto_visivo || undefined,
        profumo: created.profumo || undefined,
        gusto: created.gusto || undefined,
        noteGenerali: created.note_generali || undefined,
        occasione: created.occasione || undefined,
        abbinamentoCibo: created.abbinamento_cibo || undefined,
        partecipanti: created.partecipanti || [],
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      });
      break;

    case "update":
      const { id: tastingId, ...updateData } = payload;
      await updateTasting(tastingId, updateData);
      break;

    case "delete":
      await deleteTasting(payload.id);
      break;
  }
}

// Sincronizzazione ubicazioni
async function syncLocation(type: OutboxEntry["type"], payload: any) {
  switch (type) {
    case "insert":
      const { id: tempId, ...locationData } = payload;
      const created = await createLocation(locationData);

      await db.locations.delete(tempId);
      await db.locations.put({
        id: created.id,
        ownerId: created.owner_id,
        nome: created.nome,
        descrizione: created.descrizione || undefined,
        parentId: created.parent_id || undefined,
        temperatura: created.temperatura || undefined,
        umidita: created.umidita || undefined,
        noteAmbientali: created.note_ambientali || undefined,
        capacitaMassima: created.capacita_massima || undefined,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      });
      break;

    case "update":
      const { id: locationId, ...updateData } = payload;
      await updateLocation(locationId, updateData);
      break;

    case "delete":
      await deleteLocation(payload.id);
      break;
  }
}

// Hook per monitorare lo stato di connessione e sincronizzare automaticamente
export function setupAutoSync() {
  // Listener per quando si ritorna online
  const handleOnline = async () => {
    console.log("🌐 Connessione ripristinata - avvio sincronizzazione...");

    try {
      const result = await processSyncQueue();

      if (result.success > 0) {
        // Qui puoi mostrare un toast di successo
        console.log(`✓ ${result.success} operazioni sincronizzate`);
      }

      if (result.failed > 0) {
        // Qui puoi mostrare un toast di errore
        console.warn(`⚠ ${result.failed} operazioni fallite`);
      }
    } catch (error) {
      console.error("Errore durante la sincronizzazione automatica:", error);
    }
  };

  // Registra listener
  window.addEventListener("online", handleOnline);

  // Ritorna funzione di cleanup
  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
