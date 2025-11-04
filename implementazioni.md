# 🍷 Piano di Implementazione - Cantina Vini

## 📊 STATO ATTUALE DEL PROGETTO

### ✅ Funzionalità Complete (75% del progetto)

**CRUD Completo per tutte le entità:**
- **Vini**: Lista con filtri (ricerca, regione, tipologia), creazione, dettaglio, modifica inline, eliminazione
- **Bottiglie**: Lista con filtri (ricerca, ubicazione, stato maturità), foto upload, scanner barcode, CRUD completo
- **Degustazioni**: Lista con filtri (ricerca, anno, punteggio), CRUD completo con note dettagliate di degustazione
- **Ubicazioni**: Albero gerarchico espandibile, CRUD completo, ricerca filtrata, visualizzazione condizioni ambientali
- **Dashboard**: Statistiche base (conteggi), link rapidi alle sezioni principali

**Infrastruttura Solida:**
- ✅ Autenticazione Supabase completa (login/register/logout)
- ✅ API layer completo e ben strutturato (`lib/api/*.ts`)
- ✅ React Query hooks per tutte le entità (`lib/hooks/*.ts`)
- ✅ Database schema eccellente con RLS (Row Level Security)
- ✅ TypeScript su tutto il progetto
- ✅ PWA configurato con next-pwa
- ✅ TailwindCSS con tema personalizzato wine colors

**Librerie Installate:**
- `@tanstack/react-query` - State management (✅ USATO)
- `@supabase/supabase-js` - Backend (✅ USATO)
- `dexie` - IndexedDB per offline (❌ NON USATO)
- `recharts` - Grafici (❌ NON USATO)
- `@zxing/library` - Barcode scanner (✅ USATO)
- `lucide-react` - Icone (✅ USATO)
- `next-pwa` - PWA support (⚠️ PARZIALMENTE USATO)

---

## 🚨 PROBLEMI CRITICI DA RISOLVERE

### 1. **Funzionalità Offline NON Implementata** 🔴 CRITICO

**File coinvolto:** `lib/dexie/db.ts` (configurato ma mai usato)

**Problema:**
- Dexie è configurato con schema completo + pattern outbox
- Ma NON è mai integrato nei hooks o nelle API calls
- Nessun meccanismo di sync implementato
- App crasha completamente quando offline

**Impatto:**
- PWA promessa non mantenuta
- App inutilizzabile senza connessione
- Utenti perdono dati se lavorano offline

**Soluzione:**
1. Modificare tutti gli hooks in `lib/hooks/*.ts` per salvare in IndexedDB
2. Implementare sync queue per operazioni offline
3. Gestire conflitti di sincronizzazione
4. Aggiungere indicatore stato connessione nell'UI

**Stima tempo:** 16 ore
**Priorità:** MASSIMA

---

### 2. **Dashboard Location Counter Rotto** 🔴

**File:** `app/dashboard/page.tsx` (linea 108)

**Problema:**
```tsx
// Attualmente hardcoded a 0
<p className="text-2xl font-bold text-gray-900">0</p>
```

**Fix:**
```tsx
// Aggiungere
const { data: locations } = useLocations();

// E usare
<p className="text-2xl font-bold text-gray-900">
  {locations?.length || 0}
</p>
```

**Stima tempo:** 30 minuti
**Priorità:** ALTA

---

### 3. **Nessun Sistema di Notifiche** 🟠

**Problema:**
- Form salvano silenziosamente
- Nessun feedback "Vino salvato con successo!"
- Errori mostrati solo inline o in console
- UX confusionaria per l'utente

**Soluzione:**
1. Installare `sonner` o `react-hot-toast`
2. Creare wrapper per toast notifications
3. Aggiungere in tutte le mutation (create/update/delete)

**Esempio implementazione:**
```tsx
// lib/toast.ts
import { toast } from 'sonner';

export const showSuccess = (message: string) =>
  toast.success(message);

export const showError = (message: string) =>
  toast.error(message);

// In hooks/use-wines.ts
export function useCreateWine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWine,
    onSuccess: () => {
      showSuccess('Vino creato con successo!');
      queryClient.invalidateQueries(['wines']);
    },
    onError: (error) => {
      showError(error.message);
    }
  });
}
```

**Stima tempo:** 2-3 ore
**Priorità:** ALTA

---

### 4. **Charts Library NON Usata** 🟠

**Problema:**
- `recharts` installato ma mai importato
- Dashboard mostra solo numeri statici
- Dati statistici già disponibili nelle API ma non visualizzati

**Grafici da implementare:**
1. **Torta**: Distribuzione vini per regione
2. **Barre**: Vini per tipologia (Rosso/Bianco/Rosato/etc)
3. **Timeline**: Stato maturità bottiglie
4. **Linea**: Andamento punteggi degustazioni nel tempo
5. **KPI Cards**: Valore inventario, trend consumo mensile

**API già disponibili:**
- `getWineStats()` - statistiche per regione e tipo
- `getBottleStats()` - statistiche bottiglie

**Stima tempo:** 8 ore
**Priorità:** ALTA

---

### 5. **Type Casting in Bottle Detail** 🟡

**File:** `app/bottiglie/[id]/page.tsx` (linee 160, 166, 226, 230)

**Problema:**
```tsx
// Uso di (bottle as any) per accedere a location
const location = (bottle as any).location;
```

**Fix:**
Espandere il tipo `BottleWithWine` per includere la relazione location:

```tsx
// lib/types/database.ts
export type BottleWithWineAndLocation = BottleWithWine & {
  location: Location | null;
};

// Modificare query in lib/api/bottles.ts
.select(`
  *,
  wine:wines(*),
  location:locations(*)
`)
```

**Stima tempo:** 1 ora
**Priorità:** MEDIA

---

### 6. **Breadcrumb Navigation Mancante** 🟡

**Problema:**
- Nessun breadcrumb trail nelle pagine di dettaglio/modifica
- Solo link "← Torna alla lista"
- Difficile capire posizione nella gerarchia

**Esempio necessario:**
```
Home > Bottiglie > Barolo 2015 > Modifica
Home > Ubicazioni > Cantina > Scaffale A > Ripiano 3
```

**Componente da creare:**
```tsx
// components/ui/breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, idx) => (
          <li key={idx}>
            {idx > 0 && <span className="text-gray-400">/</span>}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**Stima tempo:** 4 ore
**Priorità:** MEDIA

---

## 🎯 PROSSIMI STEP CONSIGLIATI

### **SPRINT 1 - Fixes Rapidi** (1 settimana)

**Obiettivo:** Risolvere bug critici e migliorare UX base

**Tasks:**
1. ✅ Fix dashboard location counter (30 min)
   - File: `app/dashboard/page.tsx`
   - Aggiungere `useLocations()` hook

2. ✅ Fix type casts in bottle detail (1 ora)
   - File: `app/bottiglie/[id]/page.tsx`, `lib/types/database.ts`
   - Creare tipo `BottleWithWineAndLocation`

3. ✅ Aggiungere toast notifications (2-3 ore)
   - Installare: `npm install sonner`
   - Creare: `lib/toast.ts`
   - Modificare: tutti gli hooks in `lib/hooks/*.ts`

4. ✅ Implementare Error Boundaries (3 ore)
   - Creare: `components/error-boundary.tsx`
   - Wrappare: layout principale e singole pagine

5. ✅ Aggiungere breadcrumbs (4 ore)
   - Creare: `components/ui/breadcrumbs.tsx`
   - Aggiungere: tutte le pagine di dettaglio/modifica

6. ✅ Verificare form edit (4 ore)
   - Testare: `app/degustazioni/[id]/modifica/page.tsx`
   - Testare: `app/ubicazioni/[id]/modifica/page.tsx`
   - Fixare eventuali bug

**Deliverable:** App più stabile, UX migliorata, bug critici risolti

---

### **SPRINT 2 - Funzionalità Offline** (2 settimane)

**Obiettivo:** Implementare vera PWA con funzionamento offline

**Tasks principali:**

#### 1. Integrare Dexie negli hooks (8 ore)

**Modificare `lib/hooks/use-wines.ts`:**
```tsx
import { db } from '@/lib/dexie/db';

export function useWines() {
  const { data: onlineWines, isLoading } = useQuery({
    queryKey: ['wines'],
    queryFn: getWines,
  });

  // Salva in IndexedDB quando ricevi dati online
  useEffect(() => {
    if (onlineWines) {
      db.wines.bulkPut(onlineWines);
    }
  }, [onlineWines]);

  // Leggi da IndexedDB se offline
  const { data: offlineWines } = useQuery({
    queryKey: ['wines', 'offline'],
    queryFn: () => db.wines.toArray(),
    enabled: !navigator.onLine,
  });

  return {
    data: navigator.onLine ? onlineWines : offlineWines,
    isLoading,
  };
}
```

**Ripetere per:** `use-bottles.ts`, `use-tastings.ts`, `use-locations.ts`

#### 2. Implementare Sync Queue (4 ore)

**Creare `lib/sync/queue.ts`:**
```tsx
export async function addToSyncQueue(
  operation: 'create' | 'update' | 'delete',
  table: 'wines' | 'bottles' | 'tastings' | 'locations',
  data: any
) {
  await db.outbox.add({
    id: crypto.randomUUID(),
    operation,
    table,
    data,
    createdAt: new Date().toISOString(),
  });
}

export async function processSyncQueue() {
  const pending = await db.outbox.toArray();

  for (const item of pending) {
    try {
      // Esegui operazione su Supabase
      await syncToSupabase(item);
      // Rimuovi da queue
      await db.outbox.delete(item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

#### 3. Gestire Conflitti (2 ore)

**Strategia:** Last Write Wins + merge intelligente per array

#### 4. UI Indicatore Stato (2 ore)

**Creare `components/ui/connection-indicator.tsx`:**
```tsx
export function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
      Modalità offline - Le modifiche saranno sincronizzate
    </div>
  );
}
```

**Deliverable:** App funzionante completamente offline, vera PWA

---

### **SPRINT 3 - Dashboard Migliorata** (1 settimana)

**Obiettivo:** Visualizzazioni statistiche con grafici

**Tasks:**

#### 1. Grafico Torta - Distribuzione Vini per Regione (2 ore)

```tsx
// components/dashboard/wine-region-chart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export function WineRegionChart({ wines }: { wines: Wine[] }) {
  const regionData = Object.entries(
    wines.reduce((acc, wine) => {
      const region = wine.regione || 'Non specificato';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={regionData} dataKey="value" nameKey="name" fill="#7c2d12">
          {regionData.map((_, index) => (
            <Cell key={index} fill={WINE_COLORS[index % WINE_COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

#### 2. Grafico Barre - Vini per Tipologia (2 ore)

```tsx
// components/dashboard/wine-type-chart.tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function WineTypeChart({ wines }: { wines: Wine[] }) {
  const typeData = Object.entries(
    wines.reduce((acc, wine) => {
      const type = wine.tipologia || 'Non specificato';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={typeData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Bar dataKey="count" fill="#7c2d12" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### 3. Timeline Maturità Bottiglie (2 ore)

```tsx
// components/dashboard/maturity-timeline.tsx
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function MaturityTimeline({ bottles }: { bottles: Bottle[] }) {
  // Raggruppa per stato maturità
  const maturityData = bottles.reduce((acc, bottle) => {
    const status = bottle.stato_maturita || 'Non specificato';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return <LineChart data={...} />;
}
```

#### 4. Integrazione in Dashboard (2 ore)

**Modificare `app/dashboard/page.tsx`:**
```tsx
export default function DashboardPage() {
  const { data: wines } = useWines();
  const { data: bottles } = useBottles();

  return (
    <div>
      {/* KPI Cards esistenti */}

      {/* Nuova sezione grafici */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Vini per Regione</h2>
          <WineRegionChart wines={wines} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Vini per Tipologia</h2>
          <WineTypeChart wines={wines} />
        </div>
      </div>
    </div>
  );
}
```

**Deliverable:** Dashboard informativa e visualmente ricca

---

### **SPRINT 4 - Validazione e UX** (1 settimana)

**Obiettivo:** Form più robusti e UX professionale

#### 1. Implementare Zod (3 ore)

**Installare:** `npm install zod @hookform/resolvers react-hook-form`

**Creare schemas:**
```tsx
// lib/validation/schemas.ts
import { z } from 'zod';

export const wineSchema = z.object({
  nome: z.string().min(1, 'Nome obbligatorio').max(200),
  produttore: z.string().optional(),
  annata: z.number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  vitigni: z.array(z.string()).optional(),
  regione: z.string().optional(),
  paese: z.string().default('Italia'),
  tipologia: z.enum(['Rosso', 'Bianco', 'Rosato', 'Spumante', 'Passito', 'Fortificato']).optional(),
});

export type WineFormData = z.infer<typeof wineSchema>;
```

**Usare nei form:**
```tsx
// app/vini/nuovo/page.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function NuovoVinoPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(wineSchema),
  });

  const onSubmit = (data: WineFormData) => {
    // Data è già validata
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('nome')} />
      {errors.nome && <span>{errors.nome.message}</span>}
    </form>
  );
}
```

#### 2. Skeleton Loaders (2 ore)

**Creare `components/ui/skeleton.tsx`:**
```tsx
export function WineCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white p-6 shadow">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
```

**Usare al posto di spinner:**
```tsx
if (isLoading) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => <WineCardSkeleton key={i} />)}
    </div>
  );
}
```

#### 3. Modale Conferma Riutilizzabile (2 ore)

```tsx
// components/ui/confirm-dialog.tsx
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="rounded-lg bg-white p-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={onClose}>Annulla</button>
            <button onClick={onConfirm}>Conferma</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

#### 4. Upload Foto per Vini (2 ore)

**Modificare `app/vini/nuovo/page.tsx`:**
- Riutilizzare componente upload già esistente per bottiglie
- Stessa logica: Supabase Storage + signed URLs

**Deliverable:** UX più professionale, meno errori utente

---

## 🔮 FUNZIONALITÀ AVANZATE (Medio/Lungo Termine)

### **Features di Business Value**

#### 1. **Export/Report System** (Media priorità - 2 settimane)

**Funzionalità:**
- Export catalogo vini in PDF (con foto e dettagli)
- Report inventario CSV/Excel
- Stampa etichette per cantina con QR code
- Certificati degustazione personalizzati

**Librerie necessarie:**
- `jspdf` per PDF generation
- `xlsx` per Excel export
- `qrcode` per QR codes

**Stima tempo:** 16 ore

---

#### 2. **Sistema di Alert** (Media priorità - 1 settimana)

**Funzionalità:**
- Notifiche push per vini pronti da bere (`pronto_da` raggiunto)
- Alert vini da consumare entro (`meglio_entro` vicino)
- Warning stock basso (sotto soglia)
- Reminder condizioni cantina non ottimali (temperatura/umidità)

**Implementazione:**
- Cron job Supabase Edge Function (controllo giornaliero)
- Push notifications via Service Worker
- Email notifications via Supabase Auth

**Stima tempo:** 12 ore

---

#### 3. **Operazioni Bulk** (Media priorità - 1 settimana)

**Funzionalità:**
- Selezione multipla bottiglie (checkbox)
- Spostamento batch a nuova ubicazione
- Eliminazione multipla con conferma
- Export selezione (solo items selezionati)
- Cambio stato maturità massivo

**UI Pattern:**
```tsx
// Esempio
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<button onClick={() => bulkMove(selectedIds, newLocationId)}>
  Sposta {selectedIds.length} bottiglie
</button>
```

**Stima tempo:** 12 ore

---

#### 4. **Ricerca Avanzata** (Bassa priorità - 1 settimana)

**Funzionalità:**
- Full-text search su PostgreSQL
- Fuzzy matching (tolleranza errori di battitura)
- Ricerca cross-entità (es. "trova bottiglie di vini piemontesi")
- Filtri salvati (preferiti utente)
- Ricerca per range date/prezzi

**Implementazione:**
```sql
-- Abilitare in Supabase
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX wines_search_idx ON wines
USING GIN (to_tsvector('italian', nome || ' ' || COALESCE(produttore, '')));
```

**Stima tempo:** 8 ore

---

### **Features AI/ML** (Lungo termine)

#### 5. **Raccomandazioni Intelligenti** (3 settimane)

**Funzionalità:**
- "Vini simili a quelli che ti piacciono"
- Suggerimenti basati su storia degustazioni
- Previsione picco maturazione (ML su dati storici)
- Abbinamenti cibo automatici

**Tecnologie:**
- TensorFlow.js o API esterna
- Collaborative filtering
- Content-based recommendations

**Stima tempo:** 40+ ore

---

#### 6. **OCR Etichette** (4 settimane)

**Funzionalità:**
- Scan foto etichetta → auto-fill dati vino
- Estrazione automatica: nome, produttore, annata, denominazione
- Integrazione API Vivino per prezzi/rating
- Riconoscimento automatico regione/vitigni

**Tecnologie:**
- Tesseract.js per OCR
- API Vivino/Wine-Searcher
- Cloud Vision API (Google/AWS)

**Stima tempo:** 32 ore

---

#### 7. **Previsione Prezzi** (2 settimane)

**Funzionalità:**
- Tracking valore portafoglio nel tempo
- Previsione apprezzamento vini da investimento
- Alert quando vino aumenta di valore
- Storico prezzi da marketplace

**Stima tempo:** 16 ore

---

### **Features Social** (Molto lungo termine)

#### 8. **Condivisione e Community** (2+ mesi)

**Funzionalità:**
- Profili pubblici cantina
- Condivisione degustazioni su social
- Eventi collaborativi (blind tastings)
- Marketplace scambio/vendita tra utenti
- Rating community su vini

**Tecnologie:**
- Public/private profiles
- Social auth (Google, Facebook)
- Chat system per scambi
- Payment integration (Stripe)

**Stima tempo:** 80+ ore

---

## 📈 ROADMAP VISIVA

```
┌─────────────────────────────────────────────────┐
│ OGGI (75% Complete) - Gennaio 2025              │
│ ✅ CRUD Completo per tutte le entità            │
│ ✅ Auth Funzionante                              │
│ ✅ Filtri Avanzati su tutte le liste            │
│ ✅ Upload Foto + Barcode Scanner                │
│ ⚠️  Offline Sync NON funzionante                │
│ ⚠️  Dashboard con solo numeri                    │
│ ⚠️  Nessun sistema notifiche                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ MESE 1 - Stabilità (Febbraio 2025)              │
│ Sprint 1-2                                       │
│                                                  │
│ → Fix bugs critici (dashboard, type casts)      │
│ → Implementa offline sync con Dexie             │
│ → Toast notifications su tutte le azioni        │
│ → Error boundaries per crash handling           │
│ → Breadcrumb navigation                          │
│                                                  │
│ Obiettivo: App stabile e affidabile             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ MESE 2 - Completezza (Marzo 2025)               │
│ Sprint 3-4                                       │
│                                                  │
│ → Dashboard con grafici recharts                │
│ → Validazione form completa con Zod             │
│ → Skeleton loaders                               │
│ → Upload foto per vini                           │
│ → Modale conferme riutilizzabili                │
│                                                  │
│ Obiettivo: UX professionale                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ MESE 3 - Business Features (Aprile 2025)        │
│                                                  │
│ → Export PDF/CSV/Excel                           │
│ → Sistema alert automatici                       │
│ → Operazioni bulk                                │
│ → Ricerca avanzata full-text                    │
│ → QR code labels                                 │
│                                                  │
│ Obiettivo: Feature complete per produzione      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ MESE 4+ - Innovazione (Maggio+ 2025)            │
│                                                  │
│ → OCR riconoscimento etichette                   │
│ → Raccomandazioni AI                             │
│ → Previsioni maturazione ML                     │
│ → Features social (community)                    │
│ → Mobile app React Native                        │
│ → Integrazione Vivino/Wine-Searcher             │
│                                                  │
│ Obiettivo: Differenziazione competitiva         │
└─────────────────────────────────────────────────┘
```

---

## 💡 PRIORITÀ AZIONI IMMEDIATE

### **DA FARE OGGI** (1-2 ore)

```bash
# 1. Fix dashboard location counter
File: app/dashboard/page.tsx
Modifica: Aggiungere useLocations() hook

# 2. Fix type casts in bottle detail
File: app/bottiglie/[id]/page.tsx
Modifica: Rimuovere (bottle as any)
```

### **DA FARE QUESTA SETTIMANA** (Sprint 1)

```bash
# 1. Installare e configurare toast notifications
npm install sonner
# Creare lib/toast.ts
# Integrare in tutti gli hooks

# 2. Creare Error Boundary
# File: components/error-boundary.tsx

# 3. Implementare Breadcrumbs
# File: components/ui/breadcrumbs.tsx
# Aggiungere a tutte le pagine di dettaglio
```

### **DA FARE QUESTO MESE** (Sprint 1-2)

1. ✅ Completare Sprint 1 (fixes rapidi)
2. ✅ Implementare offline sync con Dexie (CRITICO)
3. ✅ Testare PWA offline su mobile
4. ✅ Deploy su Vercel per test produzione

---

## 🎓 VALUTAZIONE COMPLESSIVA

### **Stato Progetto:** ⭐⭐⭐⭐ (4/5)

| Categoria | Voto | Note |
|-----------|------|------|
| **Architettura** | 9/10 | Eccellente, ben strutturata |
| **Funzionalità Core** | 8/10 | CRUD completo, manca offline |
| **UX/UI** | 7/10 | Buona ma migliorabile |
| **Stabilità** | 6/10 | Da testare meglio, errori non gestiti |
| **Performance** | 8/10 | Buona, query ottimizzate |
| **Accessibilità** | 5/10 | Base, serve lavoro |
| **Sicurezza** | 7/10 | RLS ok, validazione da migliorare |
| **Documentazione** | 4/10 | Minima, solo README |

### **Pronto per Produzione:** 70%

**Cosa Manca per 100%:**
- ✅ Offline sync funzionante (CRITICO)
- ✅ Gestione errori robusta
- ✅ Validazione completa con Zod
- ✅ Test automatici (unit + integration)
- ✅ Documentazione utente
- ✅ Accessibilità WCAG AA
- ✅ Performance audit superato
- ✅ Security audit superato

---

## 📝 NOTE TECNICHE

### **File Chiave da Modificare**

**Per Offline Sync:**
- `lib/hooks/use-*.ts` (tutti e 4)
- `lib/dexie/db.ts` (già configurato, da usare)
- Creare: `lib/sync/queue.ts`
- Creare: `lib/sync/manager.ts`

**Per Dashboard:**
- `app/dashboard/page.tsx`
- Creare: `components/dashboard/*-chart.tsx`

**Per Notifications:**
- Creare: `lib/toast.ts`
- Modificare: tutti i mutation hooks

**Per Validazione:**
- Creare: `lib/validation/schemas.ts`
- Modificare: tutti i form in `app/*/nuovo/page.tsx`

### **Metriche di Successo**

**Sprint 1:**
- ✅ 0 bug critici aperti
- ✅ Tutte le mutation mostrano toast
- ✅ Dashboard mostra dati corretti
- ✅ 100% pagine con breadcrumb

**Sprint 2:**
- ✅ App funziona offline al 100%
- ✅ Sync queue processa senza errori
- ✅ Lighthouse PWA score > 90

**Sprint 3:**
- ✅ Dashboard ha almeno 4 grafici
- ✅ Tempo caricamento dashboard < 2s
- ✅ User engagement aumentato 30%

**Sprint 4:**
- ✅ 0 errori di validazione non gestiti
- ✅ Form submission success rate > 95%
- ✅ User satisfaction score > 4/5

---

## 🚀 CONCLUSIONE

Il progetto **Cantina Vini** è un'applicazione solida con un'architettura eccellente. L'80% del lavoro complesso (architettura, CRUD, auth, database) è completato con successo.

**Il gap più grande** è la mancanza di funzionalità offline, che rende la PWA inutilizzabile senza connessione.

**Raccomandazione:** Seguire la roadmap proposta, partendo dai fix rapidi (Sprint 1) per poi concentrarsi sull'implementazione offline (Sprint 2), che rappresenta il valore aggiunto più significativo per gli utenti.

Con gli Sprint 1-4 completati (circa 2 mesi di lavoro), l'applicazione sarà pronta per il lancio in produzione con una solida base per future espansioni.

---

*Documento creato: Gennaio 2025*
*Ultima revisione: Gennaio 2025*
*Progetto: Cantina Vini - Wine Cellar Management PWA*
