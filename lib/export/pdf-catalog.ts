// Utility per export catalogo vini in PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Database } from "@/lib/types/database";

type Wine = Database["public"]["Tables"]["wines"]["Row"];

interface ExportOptions {
  includePhotos?: boolean;
  includeStats?: boolean;
  filterBy?: {
    region?: string;
    type?: string;
    producer?: string;
  };
}

export async function exportWineCatalogPDF(
  wines: Wine[],
  options: ExportOptions = {}
) {
  const { includePhotos = true, includeStats = true } = options;

  // Crea documento PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(122, 28, 59); // wine-600
  doc.text("Catalogo Vini", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generato il ${new Date().toLocaleDateString("it-IT")}`,
    pageWidth / 2,
    28,
    { align: "center" }
  );

  let yPosition = 40;

  // Statistiche generali
  if (includeStats) {
    const stats = calculateWineStats(wines);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Statistiche Generali", 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.text(`Totale vini: ${wines.length}`, 20, yPosition);
    yPosition += 6;
    doc.text(
      `Regioni: ${Object.keys(stats.byRegion).length}`,
      20,
      yPosition
    );
    yPosition += 6;
    doc.text(`Tipologie: ${Object.keys(stats.byType).length}`, 20, yPosition);
    yPosition += 10;
  }

  // Tabella vini
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Elenco Vini", 14, yPosition);
  yPosition += 5;

  // Prepara dati per tabella
  const tableData = wines.map((wine) => [
    wine.nome,
    wine.produttore || "-",
    wine.annata?.toString() || "-",
    wine.regione || "-",
    wine.tipologia || "-",
    `${wine.grado_alcolico || "-"}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [
      ["Nome", "Produttore", "Annata", "Regione", "Tipologia", "Gradazione"],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [122, 28, 59],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { left: 14, right: 14 },
  });

  // Pagina dettagli per ogni vino (se richiesto)
  if (includePhotos) {
    wines.forEach((wine, index) => {
      doc.addPage();

      // Header vino
      doc.setFontSize(16);
      doc.setTextColor(122, 28, 59);
      doc.text(wine.nome, 14, 20);

      let detailY = 30;

      // Dettagli vino
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const details = [
        { label: "Produttore", value: wine.produttore },
        { label: "Denominazione", value: wine.denominazione },
        { label: "Annata", value: wine.annata },
        { label: "Regione", value: wine.regione },
        { label: "Paese", value: wine.paese },
        { label: "Tipologia", value: wine.tipologia },
        {
          label: "Vitigni",
          value: wine.vitigni?.length ? wine.vitigni.join(", ") : null,
        },
        { label: "Formato", value: wine.formato_ml ? `${wine.formato_ml} ml` : null },
        { label: "Gradazione", value: wine.grado_alcolico ? `${wine.grado_alcolico}%` : null },
      ];

      details.forEach((detail) => {
        if (detail.value) {
          doc.setFont("helvetica", "bold");
          doc.text(`${detail.label}:`, 14, detailY);
          doc.setFont("helvetica", "normal");
          doc.text(String(detail.value), 60, detailY);
          detailY += 6;
        }
      });

      // Note
      if (wine.note) {
        detailY += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Note:", 14, detailY);
        detailY += 6;
        doc.setFont("helvetica", "normal");

        // Wrap text per note lunghe
        const noteLines = doc.splitTextToSize(wine.note, pageWidth - 28);
        doc.text(noteLines, 14, detailY);
      }

      // Footer pagina
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${index + 1} di ${wines.length}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    });
  }

  // Salva PDF
  const fileName = `catalogo-vini-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);

  return fileName;
}

// Calcola statistiche sui vini
function calculateWineStats(wines: Wine[]) {
  const byRegion: Record<string, number> = {};
  const byType: Record<string, number> = {};

  wines.forEach((wine) => {
    const region = wine.regione || "Sconosciuta";
    const type = wine.tipologia || "Altro";

    byRegion[region] = (byRegion[region] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;
  });

  return { byRegion, byType };
}
