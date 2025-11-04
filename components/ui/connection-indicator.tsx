"use client";

import { useEffect, useState } from "react";
import { WifiOff, CloudOff, Cloud, CheckCircle, AlertCircle } from "lucide-react";
import { db } from "@/lib/dexie/db";
import { setupAutoSync } from "@/lib/sync/queue";

type ConnectionStatus = "online" | "offline" | "syncing" | "synced" | "error";

export function ConnectionIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>("online");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Controlla stato iniziale
    const checkStatus = async () => {
      const isOnline = navigator.onLine;
      setStatus(isOnline ? "online" : "offline");

      // Conta operazioni pending
      const count = await db.outbox.where("status").equals("pending").count();
      setPendingCount(count);
    };

    checkStatus();

    // Listener per cambio connessione
    const handleOnline = () => {
      setStatus("syncing");
      // Ricontrolla pending dopo un secondo
      setTimeout(async () => {
        const count = await db.outbox.where("status").equals("pending").count();
        setPendingCount(count);
        setStatus(count > 0 ? "syncing" : "synced");

        // Torna a online dopo 3 secondi
        if (count === 0) {
          setTimeout(() => setStatus("online"), 3000);
        }
      }, 1000);
    };

    const handleOffline = () => {
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Setup auto-sync
    const cleanupAutoSync = setupAutoSync();

    // Polling per aggiornare il conteggio pending
    const interval = setInterval(async () => {
      const count = await db.outbox.where("status").equals("pending").count();
      setPendingCount(count);

      // Se ci sono pending e siamo online, mostra syncing
      if (count > 0 && navigator.onLine && status === "online") {
        setStatus("syncing");
      } else if (count === 0 && status === "syncing") {
        setStatus("synced");
        setTimeout(() => setStatus("online"), 2000);
      }
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      cleanupAutoSync();
      clearInterval(interval);
    };
  }, [status]);

  // Non mostrare nulla se online e nessuna operazione pending
  if (status === "online" && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      {status === "offline" && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <WifiOff className="h-5 w-5" />
          <div>
            <p>Modalità offline</p>
            {pendingCount > 0 && (
              <p className="text-xs opacity-90">{pendingCount} modifiche in attesa</p>
            )}
          </div>
        </div>
      )}

      {status === "syncing" && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <Cloud className="h-5 w-5 animate-pulse" />
          <div>
            <p>Sincronizzazione...</p>
            {pendingCount > 0 && (
              <p className="text-xs opacity-90">{pendingCount} operazioni</p>
            )}
          </div>
        </div>
      )}

      {status === "synced" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle className="h-5 w-5" />
          <p>Sincronizzato!</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p>Errore sincronizzazione</p>
            <p className="text-xs opacity-90">Riprova più tardi</p>
          </div>
        </div>
      )}
    </div>
  );
}
