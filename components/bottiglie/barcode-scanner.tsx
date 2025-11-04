"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isScanning = true;

    const startScanning = async () => {
      try {
        const videoInputDevices =
          await codeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError("Nessuna fotocamera trovata");
          return;
        }

        // Usa la fotocamera posteriore se disponibile
        const backCamera = videoInputDevices.find((device) =>
          device.label.toLowerCase().includes("back")
        );
        const selectedDevice = backCamera || videoInputDevices[0];

        if (videoRef.current) {
          await codeReader.decodeFromVideoDevice(
            selectedDevice.deviceId,
            videoRef.current,
            (result, error) => {
              if (result && isScanning) {
                onDetected(result.getText());
                isScanning = false;
                codeReader.reset();
              }
            }
          );
        }
      } catch (err) {
        console.error("Errore scanner:", err);
        setError("Errore nell'avvio della fotocamera");
      }
    };

    startScanning();

    return () => {
      isScanning = false;
      codeReader.reset();
    };
  }, [onDetected]);

  return (
    <div className="rounded-lg bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scansiona Barcode</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-800">{error}</div>
      ) : (
        <div>
          <video
            ref={videoRef}
            className="w-full rounded-md bg-black"
            autoPlay
            playsInline
          />
          <p className="mt-2 text-center text-sm text-gray-600">
            Inquadra il codice a barre dell'etichetta
          </p>
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-md border px-4 py-2 text-sm font-semibold"
      >
        Chiudi
      </button>
    </div>
  );
}
