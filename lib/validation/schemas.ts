// Schemas di validazione con Zod per tutti i form
import { z } from "zod";

// Schema per vini
export const wineSchema = z.object({
  nome: z.string().min(1, "Nome obbligatorio").max(200, "Nome troppo lungo"),
  produttore: z.string().max(200, "Produttore troppo lungo").optional().or(z.literal("")),
  denominazione: z.string().max(200, "Denominazione troppo lunga").optional().or(z.literal("")),
  annata: z
    .number()
    .int("Annata deve essere un numero intero")
    .min(1900, "Annata non valida")
    .max(new Date().getFullYear(), "Annata non può essere nel futuro")
    .optional()
    .or(z.nan()),
  vitigni: z.array(z.string()).optional(),
  regione: z.string().max(100, "Regione troppo lunga").optional().or(z.literal("")),
  paese: z.string().max(100, "Paese troppo lungo").default("Italia"),
  formato_ml: z
    .number()
    .positive("Formato deve essere positivo")
    .optional()
    .or(z.nan()),
  grado_alcolico: z
    .number()
    .min(0, "Grado alcolico deve essere positivo")
    .max(100, "Grado alcolico non valido")
    .optional()
    .or(z.nan()),
  tipologia: z
    .enum(["Rosso", "Bianco", "Rosato", "Spumante", "Passito", "Fortificato"])
    .optional()
    .or(z.literal("")),
  note: z.string().max(2000, "Note troppo lunghe").optional().or(z.literal("")),
});

export type WineFormData = z.infer<typeof wineSchema>;

// Schema per bottiglie
export const bottleSchema = z.object({
  wine_id: z.string().uuid("Vino non valido"),
  quantita: z
    .number()
    .int("Quantità deve essere un numero intero")
    .min(1, "Quantità deve essere almeno 1"),
  data_acquisto: z.string().optional().or(z.literal("")),
  prezzo_acquisto: z
    .number()
    .min(0, "Prezzo deve essere positivo")
    .optional()
    .or(z.nan()),
  fornitore: z.string().max(200, "Fornitore troppo lungo").optional().or(z.literal("")),
  location_id: z.string().uuid("Ubicazione non valida").optional().or(z.literal("")),
  pronto_da: z.string().optional().or(z.literal("")),
  meglio_entro: z.string().optional().or(z.literal("")),
  stato_maturita: z
    .enum(["pronta", "in_evoluzione", "oltre_picco"])
    .optional()
    .or(z.literal("")),
  barcode: z.string().max(100, "Barcode troppo lungo").optional().or(z.literal("")),
  note_posizione: z.string().max(500, "Note posizione troppo lunghe").optional().or(z.literal("")),
  note_private: z.string().max(2000, "Note troppo lunghe").optional().or(z.literal("")),
});

export type BottleFormData = z.infer<typeof bottleSchema>;

// Schema per degustazioni
export const tastingSchema = z.object({
  wine_id: z.string().uuid("Vino non valido"),
  data: z.string().min(1, "Data obbligatoria"),
  punteggio: z
    .number()
    .int("Punteggio deve essere un numero intero")
    .min(1, "Punteggio minimo: 1")
    .max(100, "Punteggio massimo: 100")
    .optional()
    .or(z.nan()),
  aspetto_visivo: z.string().max(500, "Aspetto visivo troppo lungo").optional().or(z.literal("")),
  profumo: z.string().max(500, "Profumo troppo lungo").optional().or(z.literal("")),
  gusto: z.string().max(500, "Gusto troppo lungo").optional().or(z.literal("")),
  note_generali: z.string().max(2000, "Note troppo lunghe").optional().or(z.literal("")),
  occasione: z.string().max(200, "Occasione troppo lunga").optional().or(z.literal("")),
  abbinamento_cibo: z.string().max(500, "Abbinamento troppo lungo").optional().or(z.literal("")),
  partecipanti: z.array(z.string()).optional(),
});

export type TastingFormData = z.infer<typeof tastingSchema>;

// Schema per ubicazioni
export const locationSchema = z.object({
  nome: z.string().min(1, "Nome obbligatorio").max(200, "Nome troppo lungo"),
  descrizione: z.string().max(500, "Descrizione troppo lunga").optional().or(z.literal("")),
  parent_id: z.string().uuid("Ubicazione padre non valida").optional().or(z.literal("")),
  temperatura: z
    .number()
    .min(-50, "Temperatura troppo bassa")
    .max(100, "Temperatura troppo alta")
    .optional()
    .or(z.nan()),
  umidita: z
    .number()
    .min(0, "Umidità deve essere positiva")
    .max(100, "Umidità massima: 100%")
    .optional()
    .or(z.nan()),
  note_ambientali: z.string().max(1000, "Note troppo lunghe").optional().or(z.literal("")),
  capacita_massima: z
    .number()
    .int("Capacità deve essere un numero intero")
    .min(1, "Capacità deve essere almeno 1")
    .optional()
    .or(z.nan()),
});

export type LocationFormData = z.infer<typeof locationSchema>;

// Helper per convertire FormData in oggetto tipizzato
export function parseFormData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper per validazione safe (non throws)
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}
