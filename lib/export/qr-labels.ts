// Utility per generazione etichette cantina con QR code
import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { Database } from "@/lib/types/database";

type Bottle = Database["public"]["Tables"]["bottles"]["Row"];
type Wine = Database["public"]["Tables"]["wines"]["Row"];

export interface BottleWithWine extends Bottle {
  wine: Wine;
}

interface LabelOptions {
  labelSize?: "small" | "medium" | "large"; // 5x3cm, 7x5cm, 10x7cm
  includePrice?: boolean;
  includeBarcode?: boolean;
  baseUrl?: string; // URL base per QR code (es. https://tuodominio.com/bottiglie/)
}

export async function generateBottleLabels(
  bottles: BottleWithWine[],
  options: LabelOptions = {}
) {
  const {
    labelSize = "medium",
    includePrice = false,
    includeBarcode = true,
    baseUrl = window.location.origin + "/bottiglie/",
  } = options;

  // Dimensioni etichette in mm
  const sizes = {
    small: { width: 50, height: 30 },
    medium: { width: 70, height: 50 },
    large: { width: 100, height: 70 },
  };

  const { width, height } = sizes[labelSize];

  // Crea PDF in formato A4
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const spacing = 5;

  // Calcola quante etichette entrano per riga e colonna
  const labelsPerRow = Math.floor((pageWidth - 2 * margin) / (width + spacing));
  const labelsPerCol = Math.floor(
    (pageHeight - 2 * margin) / (height + spacing)
  );
  const labelsPerPage = labelsPerRow * labelsPerCol;

  let labelIndex = 0;

  for (const bottle of bottles) {
    // Genera QR code
    const qrUrl = `${baseUrl}${bottle.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 1,
    });

    // Calcola posizione etichetta
    const pageIndex = Math.floor(labelIndex / labelsPerPage);
    const labelOnPage = labelIndex % labelsPerPage;
    const row = Math.floor(labelOnPage / labelsPerRow);
    const col = labelOnPage % labelsPerRow;

    // Aggiungi nuova pagina se necessario
    if (labelIndex > 0 && labelOnPage === 0) {
      doc.addPage();
    }

    const x = margin + col * (width + spacing);
    const y = margin + row * (height + spacing);

    // Disegna bordo etichetta
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(x, y, width, height);

    // QR Code
    const qrSize = Math.min(width * 0.35, height * 0.6);
    doc.addImage(qrDataUrl, "PNG", x + 2, y + 2, qrSize, qrSize);

    // Informazioni vino
    const textX = x + qrSize + 4;
    let textY = y + 5;

    doc.setFontSize(labelSize === "small" ? 7 : labelSize === "medium" ? 8 : 10);
    doc.setFont("helvetica", "bold");

    // Nome vino (troncato se troppo lungo)
    const wineName = truncateText(
      bottle.wine.nome,
      width - qrSize - 8,
      doc,
      doc.getFontSize()
    );
    doc.text(wineName, textX, textY);
    textY += labelSize === "small" ? 3 : 4;

    // Produttore
    if (bottle.wine.produttore) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(labelSize === "small" ? 6 : labelSize === "medium" ? 7 : 8);
      const producer = truncateText(
        bottle.wine.produttore,
        width - qrSize - 8,
        doc,
        doc.getFontSize()
      );
      doc.text(producer, textX, textY);
      textY += labelSize === "small" ? 2.5 : 3;
    }

    // Annata
    if (bottle.wine.annata) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(labelSize === "small" ? 7 : labelSize === "medium" ? 8 : 9);
      doc.text(`${bottle.wine.annata}`, textX, textY);
      textY += labelSize === "small" ? 3 : 3.5;
    }

    // Quantità
    doc.setFont("helvetica", "normal");
    doc.setFontSize(labelSize === "small" ? 6 : 7);
    doc.text(`Qtà: ${bottle.quantita}`, textX, textY);
    textY += labelSize === "small" ? 2.5 : 3;

    // Prezzo (se richiesto)
    if (includePrice && bottle.prezzo_acquisto) {
      doc.text(`€${bottle.prezzo_acquisto.toFixed(2)}`, textX, textY);
      textY += labelSize === "small" ? 2.5 : 3;
    }

    // Barcode (se presente e richiesto)
    if (includeBarcode && bottle.barcode) {
      doc.setFontSize(5);
      doc.setTextColor(100, 100, 100);
      const barcode = truncateText(
        bottle.barcode,
        width - qrSize - 8,
        doc,
        doc.getFontSize()
      );
      doc.text(barcode, textX, y + height - 2);
      doc.setTextColor(0, 0, 0);
    }

    labelIndex++;
  }

  // Salva PDF
  const fileName = `etichette-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);

  return fileName;
}

// Helper per troncare testo che non entra
function truncateText(
  text: string,
  maxWidth: number,
  doc: jsPDF,
  fontSize: number
): string {
  doc.setFontSize(fontSize);
  const textWidth = doc.getTextWidth(text);

  if (textWidth <= maxWidth) {
    return text;
  }

  // Tronca e aggiungi "..."
  let truncated = text;
  while (doc.getTextWidth(truncated + "...") > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }

  return truncated + "...";
}

// Genera singola etichetta (per preview)
export async function generateSingleLabel(
  bottle: BottleWithWine,
  options: LabelOptions = {}
) {
  return generateBottleLabels([bottle], options);
}
