"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, QrCode, Award, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export interface ExportOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => Promise<void> | void;
  description?: string;
}

interface ExportMenuProps {
  options: ExportOption[];
  label?: string;
  variant?: "primary" | "secondary";
}

export function ExportMenu({
  options,
  label = "Esporta",
  variant = "primary",
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (option: ExportOption) => {
    setIsOpen(false);
    setIsExporting(true);

    try {
      await option.action();
      toast.success(`${option.label} completato con successo`);
    } catch (error) {
      console.error("Errore export:", error);
      toast.error(
        `Errore durante ${option.label.toLowerCase()}. Riprova.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const buttonClass =
    variant === "primary"
      ? "bg-wine-600 text-white hover:bg-wine-500"
      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 ${buttonClass}`}
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Esportazione..." : label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleExport(option)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 text-wine-600">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="mt-1 text-xs text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export icons pre-configurati
export const ExportIcons = {
  PDF: <FileText className="h-5 w-5" />,
  Excel: <FileSpreadsheet className="h-5 w-5" />,
  CSV: <FileSpreadsheet className="h-5 w-5" />,
  QR: <QrCode className="h-5 w-5" />,
  Certificate: <Award className="h-5 w-5" />,
};
