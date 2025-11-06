"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, CloudUpload, AlertCircle } from "lucide-react";
import { db } from "@/lib/dexie/db";
import { processPhotoQueue, setupPhotoSync } from "@/lib/sync/photo-queue";

type PhotoSyncStatus = "idle" | "syncing" | "synced" | "error";

export function PhotoSyncIndicator() {
  const [status, setStatus] = useState<PhotoSyncStatus>("idle");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Controlla stato iniziale
    const checkStatus = async () => {
      const count = await db.photoOutbox.where("status").equals("pending").count();
      setPendingCount(count);
    };

    checkStatus();

    // Listener per cambio connessione
    const handleOnline = async () => {
      setStatus("syncing");

      try {
        const result = await processPhotoQueue();

        // Ricontrolla pending dopo sync
        const count = await db.photoOutbox.where("status").equals("pending").count();
        setPendingCount(count);

        if (result.failed > 0) {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 5000);
        } else if (result.success > 0) {
          setStatus("synced");
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          setStatus("idle");
        }
      } catch (error) {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    };

    window.addEventListener("online", handleOnline);

    // Setup auto-sync
    const cleanupPhotoSync = setupPhotoSync();

    // Polling per aggiornare il conteggio pending
    const interval = setInterval(async () => {
      const count = await db.photoOutbox.where("status").equals("pending").count();
      setPendingCount(count);

      // Se ci sono pending e siamo online, mostra syncing
      if (count > 0 && navigator.onLine && status === "idle") {
        setStatus("syncing");
        try {
          await processPhotoQueue();
          setStatus("synced");
          setTimeout(() => setStatus("idle"), 2000);
        } catch (error) {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
        }
      }
    }, 10000); // Check ogni 10 secondi

    return () => {
      window.removeEventListener("online", handleOnline);
      cleanupPhotoSync();
      clearInterval(interval);
    };
  }, [status]);

  // Non mostrare nulla se non ci sono foto pending e non stiamo sincronizzando
  if (pendingCount === 0 && status === "idle") {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-2">
      {pendingCount > 0 && status === "idle" && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <ImageIcon className="h-5 w-5" />
          <div>
            <p>Foto in attesa</p>
            <p className="text-xs opacity-90">{pendingCount} da sincronizzare</p>
          </div>
        </div>
      )}

      {status === "syncing" && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CloudUpload className="h-5 w-5 animate-pulse" />
          <div>
            <p>Sincronizzazione foto...</p>
            {pendingCount > 0 && (
              <p className="text-xs opacity-90">{pendingCount} foto</p>
            )}
          </div>
        </div>
      )}

      {status === "synced" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CloudUpload className="h-5 w-5" />
          <p>Foto sincronizzate!</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p>Errore sincronizzazione foto</p>
            <p className="text-xs opacity-90">Riprova più tardi</p>
          </div>
        </div>
      )}
    </div>
  );
}
