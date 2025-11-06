// Sistema di sincronizzazione foto offline -> online
import { db } from "@/lib/dexie/db";
import type { PhotoOutbox } from "@/lib/dexie/db";
import { createClient } from "@/lib/supabase/client";

// Processa la photo queue - da chiamare quando si torna online
export async function processPhotoQueue() {
  // Ottieni tutte le foto pending dalla photo outbox
  const pendingPhotos = await db.photoOutbox
    .where("status")
    .equals("pending")
    .sortBy("timestamp");

  if (pendingPhotos.length === 0) {
    console.log("Nessuna foto da sincronizzare");
    return { success: 0, failed: 0 };
  }

  console.log(`Sincronizzazione di ${pendingPhotos.length} foto...`);

  let successCount = 0;
  let failCount = 0;

  for (const photoEntry of pendingPhotos) {
    try {
      // Marca come "uploading"
      await db.photoOutbox.update(photoEntry.seq!, { status: "uploading" });

      // Upload foto su Supabase Storage
      const uploadedPath = await uploadPhotoToSupabase(photoEntry);

      // Aggiorna entità con nuovo URL
      await updateEntityPhotoUrl(
        photoEntry.entityType,
        photoEntry.entityId,
        uploadedPath
      );

      // Marca come completata
      await db.photoOutbox.update(photoEntry.seq!, {
        status: "uploaded",
        uploadedPath,
      });
      successCount++;

      console.log(
        `✓ Foto sincronizzata: ${photoEntry.fileName} → ${uploadedPath}`
      );
    } catch (error) {
      // In caso di errore, incrementa retry e salva errore
      const retryCount = photoEntry.retryCount + 1;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await db.photoOutbox.update(photoEntry.seq!, {
        status: "error",
        retryCount,
        error: errorMessage,
      });

      failCount++;
      console.error(
        `✗ Errore sincronizzazione foto: ${photoEntry.fileName}`,
        error
      );

      // Se supera 3 tentativi, logga e continua
      if (retryCount >= 3) {
        console.error(`Foto fallita dopo 3 tentativi, skip`);
      }
    }
  }

  // Pulisci le foto sincronizzate con successo
  await db.photoOutbox.where("status").equals("uploaded").delete();

  console.log(`Photo sync completato: ${successCount} ok, ${failCount} failed`);

  return { success: successCount, failed: failCount };
}

// Upload foto su Supabase Storage
async function uploadPhotoToSupabase(photoEntry: PhotoOutbox): Promise<string> {
  const supabase = createClient();

  // Genera nome file univoco
  const fileExt = photoEntry.fileName.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `user/${photoEntry.userId}/${fileName}`;

  // Converti Blob in File per upload
  const file = new File([photoEntry.fileBlob], photoEntry.fileName, {
    type: photoEntry.fileType,
  });

  const { data, error } = await supabase.storage
    .from(photoEntry.bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  return filePath;
}

// Aggiorna URL foto nell'entità associata
async function updateEntityPhotoUrl(
  entityType: PhotoOutbox["entityType"],
  entityId: string,
  photoPath: string
) {
  const supabase = createClient();
  const bucket = entityType === "tasting" ? "tasting-photos" : "labels";

  // Genera URL pubblico permanente (bucket ora è pubblico)
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(photoPath);

  const publicUrl = data.publicUrl;

  // Aggiorna nella cache locale
  if (entityType === "tasting") {
    await db.tastings.update(entityId, {
      fotoDegustazioneUrl: publicUrl,
    });
  } else if (entityType === "bottle") {
    await db.bottles.update(entityId, {
      fotoEtichettaUrl: publicUrl,
    });
  }

  // Se non è un ID temporaneo, aggiorna anche su Supabase
  if (!entityId.startsWith("temp-")) {
    if (entityType === "tasting") {
      await supabase
        .from("tastings")
        .update({ foto_degustazione_url: publicUrl })
        .eq("id", entityId);
    } else if (entityType === "bottle") {
      await supabase
        .from("bottles")
        .update({ foto_etichetta_url: publicUrl })
        .eq("id", entityId);
    }
  }
}

// Hook per monitorare e sincronizzare automaticamente
export function setupPhotoSync() {
  // Listener per quando si ritorna online
  const handleOnline = async () => {
    console.log("🌐 Connessione ripristinata - avvio sync foto...");

    try {
      const result = await processPhotoQueue();

      if (result.success > 0) {
        console.log(`✓ ${result.success} foto sincronizzate`);
      }

      if (result.failed > 0) {
        console.warn(`⚠ ${result.failed} foto fallite`);
      }
    } catch (error) {
      console.error("Errore durante la sincronizzazione foto:", error);
    }
  };

  // Registra listener
  window.addEventListener("online", handleOnline);

  // Ritorna funzione di cleanup
  return () => {
    window.removeEventListener("online", handleOnline);
  };
}

// Conta foto pending
export async function countPendingPhotos(): Promise<number> {
  return await db.photoOutbox.where("status").equals("pending").count();
}
