// Hook per gestire URL foto che possono essere blob URL dalla photoOutbox
import { useEffect, useState } from "react";
import { db } from "@/lib/dexie/db";
import { createClient } from "@/lib/supabase/client";

export function usePhotoUrl(
  photoUrl: string | null | undefined,
  entityType: "tasting" | "bottle",
  entityId: string
): string | null {
  const [validUrl, setValidUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadPhoto() {
      // Trim e valida l'URL
      const trimmedUrl = photoUrl?.trim();

      if (!trimmedUrl) {
        setValidUrl(null);
        return;
      }

      // Se l'URL inizia con blob:, prova a recuperare dalla photoOutbox
      if (trimmedUrl.startsWith("blob:")) {
        try {
          // Cerca nella photoOutbox per questo entity
          const pendingPhotos = await db.photoOutbox
            .where("entityId")
            .equals(entityId)
            .and((photo) => photo.entityType === entityType && photo.status !== "uploaded")
            .toArray();

          if (pendingPhotos.length > 0) {
            // Usa la foto più recente
            const latestPhoto = pendingPhotos.sort((a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0];

            // Crea un nuovo blob URL dal blob salvato
            const newBlobUrl = URL.createObjectURL(latestPhoto.fileBlob);
            setValidUrl(newBlobUrl);

            // Cleanup quando il componente si smonta
            return () => URL.revokeObjectURL(newBlobUrl);
          } else {
            // Nessuna foto pending, forse è già stata sincronizzata
            setValidUrl(null);
          }
        } catch (error) {
          console.error("Errore nel recupero della foto dalla photoOutbox:", error);
          setValidUrl(null);
        }
      } else if (trimmedUrl.startsWith("user/")) {
        // Path di storage Supabase - converti in URL pubblico permanente
        try {
          const supabase = createClient();
          const bucket = entityType === "tasting" ? "tasting-photos" : "labels";

          const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(trimmedUrl);

          if (data?.publicUrl) {
            setValidUrl(data.publicUrl);
          } else {
            setValidUrl(null);
          }
        } catch (error) {
          console.error("Errore nella costruzione dell'URL di storage:", error);
          setValidUrl(null);
        }
      } else {
        // URL normale (già completo) - valida che sia un URL valido
        try {
          // Prova a costruire un URL per validarlo
          new URL(trimmedUrl);
          setValidUrl(trimmedUrl);
        } catch (error) {
          console.error("URL foto non valido:", trimmedUrl, error);
          setValidUrl(null);
        }
      }
    }

    loadPhoto();
  }, [photoUrl, entityType, entityId]);

  return validUrl;
}
