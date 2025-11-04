// Utility per export inventario bottiglie in Excel/CSV
import * as XLSX from "xlsx";
import type { Database } from "@/lib/types/database";

type Bottle = Database["public"]["Tables"]["bottles"]["Row"];
type Wine = Database["public"]["Tables"]["wines"]["Row"];

export interface BottleWithWine extends Bottle {
  wine: Wine;
}

interface InventoryExportOptions {
  format: "xlsx" | "csv";
  includeValuation?: boolean;
  groupBy?: "wine" | "location" | "maturity";
}

export async function exportInventoryExcel(
  bottles: BottleWithWine[],
  options: InventoryExportOptions = { format: "xlsx" }
) {
  const { format, includeValuation = true, groupBy } = options;

  // Prepara dati per export
  const data = bottles.map((bottle) => {
    const row: any = {
      "ID Bottiglia": bottle.id,
      "Nome Vino": bottle.wine.nome,
      Produttore: bottle.wine.produttore || "",
      Annata: bottle.wine.annata || "",
      Denominazione: bottle.wine.denominazione || "",
      Regione: bottle.wine.regione || "",
      Tipologia: bottle.wine.tipologia || "",
      Quantità: bottle.quantita,
      "Data Acquisto": bottle.data_acquisto
        ? new Date(bottle.data_acquisto).toLocaleDateString("it-IT")
        : "",
      Fornitore: bottle.fornitore || "",
      "Stato Maturità": bottle.stato_maturita || "",
      Barcode: bottle.barcode || "",
    };

    if (includeValuation) {
      row["Prezzo Acquisto (€)"] = bottle.prezzo_acquisto || "";
      row["Valore Totale (€)"] = bottle.prezzo_acquisto
        ? (bottle.prezzo_acquisto * bottle.quantita).toFixed(2)
        : "";
    }

    row["Note"] = bottle.note_private || "";

    return row;
  });

  // Aggiungi riga di totali
  if (includeValuation) {
    const totalBottles = bottles.reduce((sum, b) => sum + b.quantita, 0);
    const totalValue = bottles.reduce(
      (sum, b) => sum + (b.prezzo_acquisto || 0) * b.quantita,
      0
    );

    data.push({
      "ID Bottiglia": "",
      "Nome Vino": "TOTALE",
      Produttore: "",
      Annata: "",
      Denominazione: "",
      Regione: "",
      Tipologia: "",
      Quantità: totalBottles,
      "Data Acquisto": "",
      Fornitore: "",
      "Stato Maturità": "",
      Barcode: "",
      "Prezzo Acquisto (€)": "",
      "Valore Totale (€)": totalValue.toFixed(2),
      Note: "",
    });
  }

  // Crea workbook
  const ws = XLSX.utils.json_to_sheet(data);

  // Stile header
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "7A1C3B" } },
      alignment: { horizontal: "center" },
    };
  }

  // Auto-width colonne
  const cols: any[] = [];
  Object.keys(data[0] || {}).forEach((key) => {
    cols.push({ wch: Math.max(key.length, 15) });
  });
  ws["!cols"] = cols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  // Aggiungi sheet statistiche
  const statsData = generateInventoryStats(bottles);
  const statsWs = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, statsWs, "Statistiche");

  // Salva file
  const fileName = `inventario-${new Date().toISOString().split("T")[0]}.${format}`;

  if (format === "csv") {
    // Export solo primo sheet come CSV
    XLSX.writeFile(wb, fileName, { bookType: "csv" });
  } else {
    XLSX.writeFile(wb, fileName);
  }

  return fileName;
}

// Genera statistiche inventario
function generateInventoryStats(bottles: BottleWithWine[]) {
  const totalBottles = bottles.reduce((sum, b) => sum + b.quantita, 0);
  const totalValue = bottles.reduce(
    (sum, b) => sum + (b.prezzo_acquisto || 0) * b.quantita,
    0
  );

  // Statistiche per regione
  const byRegion: Record<string, { count: number; value: number }> = {};
  bottles.forEach((bottle) => {
    const region = bottle.wine.regione || "Sconosciuta";
    if (!byRegion[region]) {
      byRegion[region] = { count: 0, value: 0 };
    }
    byRegion[region].count += bottle.quantita;
    byRegion[region].value +=
      (bottle.prezzo_acquisto || 0) * bottle.quantita;
  });

  // Statistiche per tipologia
  const byType: Record<string, { count: number; value: number }> = {};
  bottles.forEach((bottle) => {
    const type = bottle.wine.tipologia || "Altro";
    if (!byType[type]) {
      byType[type] = { count: 0, value: 0 };
    }
    byType[type].count += bottle.quantita;
    byType[type].value += (bottle.prezzo_acquisto || 0) * bottle.quantita;
  });

  // Statistiche per stato maturità
  const byMaturity: Record<string, number> = {};
  bottles.forEach((bottle) => {
    const maturity = bottle.stato_maturita || "Non specificato";
    byMaturity[maturity] = (byMaturity[maturity] || 0) + bottle.quantita;
  });

  // Prepara dati per sheet
  const stats: any[] = [
    { Metrica: "Totale Bottiglie", Valore: totalBottles },
    { Metrica: "Valore Totale (€)", Valore: totalValue.toFixed(2) },
    {
      Metrica: "Valore Medio per Bottiglia (€)",
      Valore: totalBottles > 0 ? (totalValue / totalBottles).toFixed(2) : "0",
    },
    { Metrica: "", Valore: "" },
    { Metrica: "PER REGIONE", Valore: "" },
  ];

  Object.entries(byRegion)
    .sort(([, a], [, b]) => b.count - a.count)
    .forEach(([region, data]) => {
      stats.push({
        Metrica: region,
        Valore: `${data.count} bottiglie - €${data.value.toFixed(2)}`,
      });
    });

  stats.push({ Metrica: "", Valore: "" });
  stats.push({ Metrica: "PER TIPOLOGIA", Valore: "" });

  Object.entries(byType)
    .sort(([, a], [, b]) => b.count - a.count)
    .forEach(([type, data]) => {
      stats.push({
        Metrica: type,
        Valore: `${data.count} bottiglie - €${data.value.toFixed(2)}`,
      });
    });

  stats.push({ Metrica: "", Valore: "" });
  stats.push({ Metrica: "PER STATO MATURITÀ", Valore: "" });

  Object.entries(byMaturity)
    .sort(([, a], [, b]) => b - a)
    .forEach(([maturity, count]) => {
      stats.push({
        Metrica: maturity,
        Valore: `${count} bottiglie`,
      });
    });

  return stats;
}

// Export rapido CSV semplificato
export async function exportInventoryCSV(bottles: BottleWithWine[]) {
  return exportInventoryExcel(bottles, { format: "csv" });
}
