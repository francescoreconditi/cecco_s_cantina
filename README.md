# 🍷 Cantina Vini - PWA per Gestione Cantina Personale

> Applicazione web progressiva (PWA) per la gestione professionale della propria collezione di vini con funzionalità offline, integrazione Vivino e export avanzato.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)

## 📋 Indice

- [Panoramica](#-panoramica)
- [Caratteristiche Principali](#-caratteristiche-principali)
- [Tecnologie Utilizzate](#-tecnologie-utilizzate)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Installazione](#-installazione)
- [Configurazione](#-configurazione)
- [Comandi Disponibili](#-comandi-disponibili)
- [Schema Database](#-schema-database)
- [Architettura](#-architettura)
- [Funzionalità Implementate](#-funzionalità-implementate)
- [Roadmap](#-roadmap)
- [Deploy in Produzione](#-deploy-in-produzione)
- [Licenza](#-licenza)

## 🎯 Panoramica

**Cantina Vini** è un'applicazione moderna e completa per gestire la propria collezione di vini. Pensata sia per appassionati che per professionisti del settore, offre un sistema completo di catalogazione, inventario, degustazione e analisi.

### Versione Attuale
**v0.1.1** - MVP in sviluppo attivo (Aggiornato: 06 Gennaio 2025)

### Caratteristiche Uniche
- **Progressive Web App (PWA)**: Installabile su dispositivi mobile e desktop
- **Offline-First**: Funziona anche senza connessione internet
- **Integrazione Vivino**: Importa automaticamente dati dai vini dal database Vivino
- **Scanner Barcode**: Scansiona codici a barre per identificare rapidamente le bottiglie
- **Export Multipli**: Esporta catalogo in PDF, inventario in Excel, etichette QR
- **Certificati di Degustazione**: Genera certificati professionali in PDF

## ✨ Caratteristiche Principali

### Gestione Vini
- Catalogazione completa vini con dati strutturati
- Ricerca e filtri avanzati (per produttore, regione, tipologia, annata)
- Import automatico dati da Vivino API
- Upload foto etichette con zoom interattivo
- Gestione vitigni multipli
- Loader animato tematico (bicchiere che si riempe)

### Inventario Bottiglie
- Tracciamento quantità disponibili
- Gestione ubicazioni gerarchiche (cantina → scaffale → ripiano)
- Visualizzazione posizioni in cantina con tooltip informativi
- Tooltip intelligenti: mostra produttore, vino e annata su hover
- Storico acquisti con prezzi e fornitori
- Calcolo finestra di maturazione (pronto da/meglio entro)
- Scanner barcode integrato per identificazione rapida
- Generazione etichette QR per ogni bottiglia

### Degustazioni
- Schede di degustazione complete
- Valutazione aspetto visivo, profumo, gusto
- Sistema di punteggio (0-100)
- Abbinamenti cibo e occasioni
- Partecipanti multipli
- Export certificati di degustazione in PDF

### Statistiche e Analytics
- Dashboard con panoramica collezione
- Grafici distribuzione per regione e tipologia
- Timeline maturazione vini
- Statistiche valore collezione
- Grafici interattivi con Recharts

### Offline & Sincronizzazione
- Cache locale con IndexedDB (Dexie)
- Sincronizzazione automatica in background
- Queue system per operazioni offline
- Indicatore stato connessione

### Export e Condivisione
- **Catalogo PDF**: Catalogo completo con foto e dettagli
- **Inventario Excel**: Export strutturato per analisi
- **Etichette QR**: Generazione etichette con QR code
- **Certificati Degustazione**: Documenti professionali

## 🛠 Tecnologie Utilizzate

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React con App Router
- **[React 19](https://react.dev/)** - Libreria UI con nuove features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety completo
- **[TailwindCSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Icone moderne e leggere

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication (Email/Password)
  - Storage per foto etichette
  - Row-Level Security (RLS)
- **[Prisma 6](https://www.prisma.io/)** - ORM con type-safe queries
- **[Dexie 4](https://dexie.org/)** - IndexedDB wrapper per cache offline

### State Management & Data Fetching
- **[TanStack Query 5](https://tanstack.com/query)** - Data fetching e cache
- **[React Hook Form 7](https://react-hook-form.com/)** - Gestione form performante
- **[Zod 4](https://zod.dev/)** - Validazione schema runtime

### Features & Utilities
- **[@zxing/library](https://github.com/zxing-js/library)** - Barcode scanner
- **[Recharts 2](https://recharts.org/)** - Grafici e visualizzazioni
- **[jsPDF 3](https://github.com/parallax/jsPDF)** - Generazione PDF
- **[xlsx 0.18](https://github.com/SheetJS/sheetjs)** - Export Excel
- **[qrcode 1.5](https://github.com/soldair/node-qrcode)** - Generazione QR code
- **[next-pwa 5](https://github.com/shadowwalker/next-pwa)** - Progressive Web App
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications eleganti

### Dev Tools
- **ESLint 9** - Linting
- **Autoprefixer** - CSS vendor prefixes
- **PostCSS** - CSS processing

## 📁 Struttura del Progetto

```
tvini/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Gruppo route autenticazione
│   │   ├── accedi/                   # Login page
│   │   ├── registrati/               # Signup page
│   │   └── callback/                 # OAuth callback
│   ├── dashboard/                    # Dashboard principale
│   ├── vini/                         # CRUD vini
│   │   ├── page.tsx                 # Lista vini con filtri
│   │   ├── nuovo/                   # Crea vino
│   │   └── [id]/                    # Dettaglio e modifica
│   ├── bottiglie/                   # Gestione inventario
│   │   ├── page.tsx                 # Lista bottiglie
│   │   ├── nuova/                   # Aggiungi bottiglia
│   │   └── [id]/                    # Dettaglio e modifica
│   ├── degustazioni/                # Schede degustazione
│   │   ├── page.tsx                 # Lista degustazioni
│   │   ├── nuova/                   # Nuova degustazione
│   │   └── [id]/                    # Dettaglio e modifica
│   ├── ubicazioni/                  # Gestione luoghi di stoccaggio
│   ├── api/                         # API Routes
│   │   └── vivino/                  # Integrazione Vivino
│   │       ├── search/              # Ricerca vini
│   │       └── sync/                # Sincronizzazione dati
│   ├── layout.tsx                   # Layout root
│   ├── page.tsx                     # Homepage (redirect)
│   ├── providers.tsx                # TanStack Query Provider
│   └── globals.css                  # Stili globali
│
├── components/                      # Componenti React riusabili
│   ├── auth/                        # Componenti autenticazione
│   │   ├── accedi-form.tsx
│   │   ├── registrati-form.tsx
│   │   └── logout-button.tsx
│   ├── layout/                      # Layout components
│   │   └── header.tsx              # Header navigazione
│   ├── vini/                        # Componenti vini
│   │   ├── wine-card.tsx           # Card vino
│   │   ├── wine-filters.tsx        # Filtri ricerca
│   │   └── wine-edit-form.tsx      # Form creazione/modifica
│   ├── bottiglie/                   # Componenti bottiglie
│   │   └── barcode-scanner.tsx     # Scanner barcode
│   ├── dashboard/                   # Componenti dashboard
│   │   ├── wine-type-chart.tsx     # Grafico tipologie
│   │   ├── wine-region-chart.tsx   # Grafico regioni
│   │   └── maturity-timeline.tsx   # Timeline maturazione
│   ├── vivino/                      # Componenti Vivino
│   │   ├── vivino-search-dialog.tsx
│   │   └── vivino-card.tsx
│   ├── export/                      # Componenti export
│   │   └── export-menu.tsx         # Menu export multiplo
│   ├── ui/                          # Componenti UI generici
│   │   ├── breadcrumbs.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── connection-indicator.tsx
│   │   ├── image-zoom-hover.tsx
│   │   └── skeleton.tsx
│   └── error-boundary.tsx          # Error boundary
│
├── lib/                             # Librerie e utilities
│   ├── api/                         # API client functions
│   │   ├── wines.ts                # CRUD vini
│   │   ├── bottles.ts              # CRUD bottiglie
│   │   ├── tastings.ts             # CRUD degustazioni
│   │   └── locations.ts            # CRUD ubicazioni
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-wines.ts            # TanStack Query hooks per vini
│   │   ├── use-bottles.ts          # Hooks bottiglie
│   │   ├── use-tastings.ts         # Hooks degustazioni
│   │   └── use-locations.ts        # Hooks ubicazioni
│   ├── supabase/                    # Supabase clients
│   │   ├── client.ts               # Client browser
│   │   ├── server.ts               # Client server components
│   │   └── middleware.ts           # Middleware utilities
│   ├── dexie/                       # IndexedDB
│   │   └── db.ts                   # Database locale schema
│   ├── sync/                        # Sincronizzazione
│   │   └── queue.ts                # Queue system per offline
│   ├── export/                      # Export utilities
│   │   ├── pdf-catalog.ts          # Export catalogo PDF
│   │   ├── excel-inventory.ts      # Export inventario Excel
│   │   ├── qr-labels.ts            # Generazione etichette QR
│   │   └── tasting-certificate.ts  # Certificati degustazione
│   ├── vivino/                      # Integrazione Vivino
│   │   └── api.ts                  # Vivino API client
│   ├── types/                       # TypeScript types
│   │   └── database.ts             # Database types
│   ├── validation/                  # Validazione dati
│   │   └── schemas.ts              # Zod schemas
│   └── utils/                       # Utilities generiche
│       └── toast.ts                # Toast notifications
│
├── prisma/                          # Database schema
│   └── schema.prisma               # Schema Prisma completo
│
├── supabase/                        # Supabase migrations
│   └── migrations/
│       ├── add_wine_photo.sql
│       └── add_vivino_fields.sql
│
├── public/                          # File statici
│   └── manifest.json               # PWA manifest
│
├── .env.local                       # Variabili ambiente (non versionato)
├── .env.example                     # Template variabili
├── middleware.ts                    # Next.js middleware
├── next.config.js                   # Configurazione Next.js
├── tsconfig.json                    # Configurazione TypeScript
├── tailwind.config.ts              # Configurazione Tailwind
├── postcss.config.js               # Configurazione PostCSS
├── package.json                    # Dipendenze Node
└── README.md                       # Questo file
```

## 🚀 Installazione

### Prerequisiti

- **Node.js**: >= 18.0.0
- **npm** o **yarn** o **pnpm**
- **Account Supabase**: Gratuito su [supabase.com](https://supabase.com)
- **Git**: Per clonare il repository

### Passo 1: Clona il Repository

```bash
git clone https://github.com/tuousername/tvini.git
cd tvini
```

### Passo 2: Installa le Dipendenze

```bash
npm install
# oppure
yarn install
# oppure
pnpm install
```

### Passo 3: Configura Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Vai su **Settings → API** e copia:
   - Project URL
   - Anon public key
   - Service role key (ATTENZIONE: mantienila segreta!)
3. Vai su **Settings → Database** e copia la Connection string

Per istruzioni dettagliate vedi [SETUP-SUPABASE.md](./SETUP-SUPABASE.md)

### Passo 4: Configura le Variabili d'Ambiente

Copia il file `.env.example` in `.env.local`:

```bash
cp .env.example .env.local
```

Modifica `.env.local` con i tuoi valori:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key
SUPABASE_SERVICE_ROLE_KEY=tua-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.tuo-progetto.supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_APP_NAME=Cantina Vini
```

### Passo 5: Esegui le Migrazioni Database

```bash
# Genera Prisma Client
npm run db:generate

# Sincronizza schema con database
npm run db:push
```

### Passo 6: Configura Supabase Storage e RLS

Esegui gli script SQL nella dashboard Supabase (**SQL Editor**):

1. `supabase-rls-setup.sql` - Row-Level Security policies
2. `supabase-storage-setup.sql` - Storage bucket per foto

### Passo 7: Avvia il Server di Sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## ⚙️ Configurazione

### Configurazione Supabase

Vedi la guida completa: [SETUP-SUPABASE.md](./SETUP-SUPABASE.md)

### Configurazione PWA

Il file `public/manifest.json` contiene la configurazione PWA. Personalizza:
- Nome app
- Descrizione
- Colori tema
- Icone (aggiungi in `/public`)

### Configurazione Tema

I colori del tema "wine" sono definiti in [tailwind.config.ts](./tailwind.config.ts):

```typescript
colors: {
  wine: {
    50: '#fdf2f8',
    100: '#fce7f3',
    // ... altri toni
    900: '#831843',
  }
}
```

## 📜 Comandi Disponibili

### Sviluppo

```bash
npm run dev              # Avvia server sviluppo (http://localhost:3000)
npm run build            # Build produzione
npm run start            # Avvia server produzione
npm run lint             # Lint codice con ESLint
```

### Database

```bash
npm run db:generate      # Genera Prisma Client da schema
npm run db:push          # Sincronizza schema con DB (senza migrazioni)
npm run db:migrate       # Crea e applica migrazioni
npm run db:studio        # Apri Prisma Studio (GUI database)
```

### Utilities

```bash
# Test build locale prima del deploy
npm run build && npm run start

# Verifica TypeScript
npx tsc --noEmit

# Format code
npx prettier --write .
```

## 🗄️ Schema Database

### Tabella: `wines` (Vini)

Rappresenta un "vino astratto" - il tipo di vino indipendentemente dalle bottiglie fisiche.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | String (CUID) | ID univoco |
| `owner_id` | String | ID proprietario (FK → auth.users) |
| `nome` | String | Nome del vino |
| `produttore` | String? | Nome produttore |
| `denominazione` | String? | DOC, DOCG, IGT, etc. |
| `annata` | Int? | Anno di produzione |
| `vitigni` | String[] | Array di vitigni |
| `regione` | String? | Regione di produzione |
| `paese` | String? | Paese (default: "Italia") |
| `formato_ml` | Int? | Formato bottiglia (default: 750) |
| `grado_alcolico` | Float? | Percentuale alcol |
| `tipologia` | String? | Rosso, Bianco, Rosato, Spumante |
| `note` | Text? | Note personali |
| `created_at` | DateTime | Data creazione |
| `updated_at` | DateTime | Data ultima modifica |

**Indici:**
- `(owner_id, annata)`
- `(owner_id, produttore)`
- `(owner_id, regione)`

### Tabella: `bottles` (Bottiglie)

Rappresenta le bottiglie fisiche in inventario.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | String (CUID) | ID univoco |
| `owner_id` | String | ID proprietario |
| `wine_id` | String | FK → wines.id (CASCADE) |
| `quantita` | Int | Numero bottiglie (default: 1) |
| `data_acquisto` | DateTime? | Data di acquisto |
| `prezzo_acquisto` | Decimal(10,2)? | Prezzo pagato |
| `fornitore` | String? | Nome fornitore/enoteca |
| `location_id` | String? | FK → locations.id (SET NULL) |
| `pronto_da` | DateTime? | Data da cui è pronto |
| `meglio_entro` | DateTime? | Data entro cui berlo |
| `stato_maturita` | String? | "pronta", "in_evoluzione", "oltre_picco" |
| `barcode` | String? | Codice a barre (UNIQUE) |
| `foto_etichetta_url` | String? | URL foto in Supabase Storage |
| `note_posizione` | String? | Note sulla posizione |
| `note_private` | Text? | Note private |
| `created_at` | DateTime | Data creazione |
| `updated_at` | DateTime | Data ultima modifica |

**Indici:**
- `(owner_id, stato_maturita)`
- `(owner_id, wine_id)`
- `(barcode)` - UNIQUE

### Tabella: `tastings` (Degustazioni)

Schede di degustazione complete.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | String (CUID) | ID univoco |
| `owner_id` | String | ID proprietario |
| `wine_id` | String | FK → wines.id (CASCADE) |
| `data` | DateTime | Data degustazione |
| `punteggio` | Int? | Punteggio 0-100 |
| `aspetto_visivo` | Text? | Note aspetto |
| `profumo` | Text? | Note profumo |
| `gusto` | Text? | Note gusto |
| `note_generali` | Text? | Note generali |
| `occasione` | String? | Occasione degustazione |
| `abbinamento_cibo` | String? | Piatto abbinato |
| `partecipanti` | String[] | Nomi partecipanti |
| `created_at` | DateTime | Data creazione |
| `updated_at` | DateTime | Data ultima modifica |

**Indici:**
- `(owner_id, data)`
- `(owner_id, wine_id)`

### Tabella: `locations` (Ubicazioni)

Gerarchia di ubicazioni (es: Cantina → Scaffale → Ripiano).

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | String (CUID) | ID univoco |
| `owner_id` | String | ID proprietario |
| `nome` | String | Nome ubicazione |
| `descrizione` | Text? | Descrizione |
| `parent_id` | String? | FK → locations.id (CASCADE) per gerarchia |
| `temperatura` | Float? | Temperatura media (°C) |
| `umidita` | Int? | Umidità percentuale |
| `note_ambientali` | Text? | Note condizioni ambientali |
| `capacita_massima` | Int? | Numero max bottiglie |
| `created_at` | DateTime | Data creazione |
| `updated_at` | DateTime | Data ultima modifica |

**Indici:**
- `(owner_id, parent_id)`

### Row-Level Security (RLS)

Tutte le tabelle hanno RLS abilitato:
- **SELECT**: Solo record con `owner_id = auth.uid()`
- **INSERT**: Automaticamente imposta `owner_id = auth.uid()`
- **UPDATE/DELETE**: Solo propri record

## 🏗️ Architettura

### Pattern Architetturale

```
┌─────────────────────────────────────────────┐
│          React Components (UI)              │
│   app/*/page.tsx, components/**/*.tsx       │
└─────────────┬───────────────────────────────┘
              │ use hooks
              ▼
┌─────────────────────────────────────────────┐
│      Custom Hooks (TanStack Query)          │
│          lib/hooks/use-*.ts                 │
└─────────────┬───────────────────────────────┘
              │ call API functions
              ▼
┌─────────────────────────────────────────────┐
│         API Functions (Business Logic)      │
│            lib/api/*.ts                     │
└─────────────┬───────────────────────────────┘
              │ use Supabase client
              ▼
┌─────────────────────────────────────────────┐
│         Supabase Client (Network)           │
│       lib/supabase/client.ts                │
└─────────────┬───────────────────────────────┘
              │ HTTP requests
              ▼
┌─────────────────────────────────────────────┐
│         Supabase Backend (Cloud)            │
│   PostgreSQL + Auth + Storage + RLS         │
└─────────────────────────────────────────────┘
```

### Offline-First Strategy

```
User Action
    │
    ▼
Queue Operation (Dexie)
    │
    ├─→ [ONLINE] ──→ Execute immediately ──→ Clear queue
    │                      │
    │                      └─→ Update cache
    │
    └─→ [OFFLINE] ──→ Store in queue ──→ Wait for connection
                           │
                           └─→ Auto-sync when online
```

### Authentication Flow

```
1. User submits login/signup form
   │
   ▼
2. Supabase Auth validates credentials
   │
   ▼
3. Callback handler at /callback processes auth code
   │
   ▼
4. Session stored in httpOnly cookie
   │
   ▼
5. middleware.ts refreshes session on every request
   │
   ▼
6. Protected routes check auth.getUser()
   │
   ├─→ [Authenticated] ──→ Render page
   │
   └─→ [Not authenticated] ──→ Redirect to /accedi
```

## ✅ Funzionalità Implementate

### Autenticazione ✅
- [x] Registrazione utente con email/password
- [x] Login e logout
- [x] Gestione sessione con cookie httpOnly
- [x] Refresh automatico token
- [x] Protezione route con middleware
- [x] Row-Level Security su tutte le tabelle

### Gestione Vini ✅
- [x] CRUD completo vini
- [x] Ricerca full-text
- [x] Filtri multipli (produttore, regione, tipologia, annata)
- [x] Upload foto etichette su Supabase Storage
- [x] Integrazione Vivino per import dati
- [x] Visualizzazione dettaglio con tutti i dati

### Inventario Bottiglie ✅
- [x] CRUD bottiglie
- [x] Associazione bottiglia → vino
- [x] Gestione quantità
- [x] Tracciamento prezzi e fornitori
- [x] Barcode scanner (in progress)
- [x] Gestione ubicazioni gerarchiche
- [x] Calcolo stato maturazione

### Degustazioni ✅
- [x] CRUD degustazioni
- [x] Scheda completa (aspetto, profumo, gusto)
- [x] Sistema punteggio 0-100
- [x] Abbinamenti cibo
- [x] Gestione partecipanti multipli
- [x] Storico degustazioni per vino

### Dashboard e Analytics ✅
- [x] Panoramica collezione
- [x] Grafici distribuzione tipologie (Recharts)
- [x] Grafici distribuzione regioni
- [x] Timeline maturazione
- [x] Statistiche valore totale

### Export ✅
- [x] Catalogo PDF completo con foto
- [x] Inventario Excel strutturato
- [x] Etichette QR per bottiglie
- [x] Certificati degustazione PDF

### Offline & PWA ✅
- [x] PWA manifest configurato
- [x] Cache locale con Dexie/IndexedDB
- [x] Indicatore stato connessione
- [x] Queue system per operazioni offline (in progress)
- [x] Installabile come app

### UX & UI ✅
- [x] Design responsive mobile-first
- [x] Tema personalizzato "wine"
- [x] Toast notifications (Sonner)
- [x] **WineGlassLoader**: Animazione tematica bicchiere che si riempe
- [x] **Tooltip Informativi**: Info bottiglia su hover nelle posizioni cantina
- [x] Animazioni CSS personalizzate (fillWine, sway, shimmer)
- [x] Loading states e skeleton screens
- [x] Error boundaries
- [x] Breadcrumb navigation
- [x] Confirm dialogs per eliminazioni
- [x] Image zoom su hover
- [x] Supporto Dark Mode completo

## 🗺️ Roadmap

### Fase 1: Completamento MVP (In corso)
- [ ] Completare scanner barcode integrato
- [ ] Migliorare sincronizzazione offline
- [ ] Aggiungere ricerca avanzata con filtri combinati
- [ ] Test completi su dispositivi mobile

### Fase 2: Features Avanzate
- [ ] Raccomandazioni AI basate su preferenze
- [ ] Condivisione collezione (read-only link)
- [ ] Backup automatico su cloud storage esterno
- [ ] Import/export CSV massivo
- [ ] Notifiche push per vini da bere

### Fase 3: Social & Community
- [ ] Profili pubblici opzionali
- [ ] Condivisione degustazioni
- [ ] Rating e recensioni community
- [ ] Marketplace integrato (opzionale)

### Fase 4: Enterprise Features
- [ ] Multi-tenancy per enoteche/ristoranti
- [ ] Gestione team multipli
- [ ] Permessi granulari
- [ ] API pubblica per integrazioni
- [ ] White-label customization

### Fase 5: Analytics Avanzati
- [ ] Machine learning per predizioni prezzo
- [ ] Trend analysis mercato
- [ ] Suggerimenti acquisto basati su storico
- [ ] Export reports avanzati

## 🚀 Deploy in Produzione

### Deploy Rapido su Vercel

1. **Push su GitHub**:
   ```bash
   git push origin main
   ```

2. **Importa in Vercel**:
   - Vai su [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Seleziona il repository GitHub

3. **Configura Environment Variables**:
   - Aggiungi tutte le variabili da `.env.local`
   - Include per Production, Preview e Development

4. **Deploy**:
   - Click "Deploy"
   - Attendi ~2 minuti
   - Copia l'URL Vercel

5. **Aggiorna Supabase**:
   - Vai su Supabase Dashboard → Authentication → URL Configuration
   - Aggiungi redirect URL: `https://tuo-app.vercel.app/callback`

**Documentazione Completa**: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deploy con Docker (Self-hosted)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 💰 Costi Stimati

### Piano Free (Sufficiente per MVP)
- **Supabase Free Tier**: $0/mese
  - 500 MB database
  - 1 GB storage
  - 50 MB file uploads
  - 50,000 autenticazioni/mese
- **Vercel Hobby**: $0/mese
  - Hosting illimitato
  - Bandwidth generoso
  - SSL automatico
- **Dominio personalizzato**: €10-15/anno (opzionale)

**Totale startup**: €0-15/anno

### Piano Production (Per uso intensivo)
- **Supabase Pro**: $25/mese
- **Vercel Pro**: $20/mese
- **Totale**: ~$45/mese (~€42/mese)

## 🤝 Contribuire

Questo è un progetto personale, ma se vuoi contribuire:

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit i cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Convenzioni Codice
- **TypeScript strict mode** abilitato
- **ESLint** per linting
- **Prettier** per formatting (opzionale)
- **Commit messages** descrittivi in italiano
- **Nomi file** in kebab-case
- **Commenti** in italiano

## 📝 Documentazione Aggiuntiva

- [SETUP-SUPABASE.md](./SETUP-SUPABASE.md) - Setup completo Supabase
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy in produzione
- [CODEBASE-STRUCTURE.md](./CODEBASE-STRUCTURE.md) - Architettura dettagliata
- [CODEBASE-ANALYSIS.md](./CODEBASE-ANALYSIS.md) - Analisi tecnica completa

## 🐛 Bug Known & Troubleshooting

### Build Errors
- **Errore**: `Cannot find module '@/lib/...'`
  - **Soluzione**: Verifica `tsconfig.json` paths configuration

### Database Connection
- **Errore**: `Connection timeout`
  - **Soluzione**: Verifica `DATABASE_URL` in `.env.local`
  - Controlla che il progetto Supabase sia attivo

### Authentication Issues
- **Errore**: `Invalid redirect URL`
  - **Soluzione**: Aggiungi l'URL in Supabase → Auth → URL Configuration

### PWA Issues
- **Errore**: Service worker non si registra
  - **Soluzione**: PWA funziona solo in produzione (`npm run build && npm start`)

## 📞 Supporto

Per problemi o domande:
1. Controlla la [documentazione](#-documentazione-aggiuntiva)
2. Verifica i [bug known](#-bug-known--troubleshooting)
3. Apri una issue su GitHub
4. Consulta le docs ufficiali:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Prisma Docs](https://www.prisma.io/docs)

## 📄 Licenza

Questo progetto è per **uso personale**.

Sviluppato con ❤️ e 🍷 da [Il Tuo Nome]

---

**Versione**: 0.1.1
**Ultimo aggiornamento**: 2025-01-06
**Status**: 🟢 In sviluppo attivo

## 🎨 Novità Recenti (v0.1.1)

### WineGlassLoader - Animazione Tematica
Sostituito lo spinner generico con un'elegante animazione SVG di un bicchiere di vino che si riempe progressivamente. Include tre animazioni CSS personalizzate:
- **fillWine**: Vino che sale dal basso (2s loop)
- **sway**: Movimento oscillante del bicchiere (3s loop)
- **shimmer**: Effetto brillantezza (2s loop)

Implementato in tutte le 11 pagine dell'applicazione con messaggi contestuali.

### Tooltip Informazioni Bottiglia
Aggiunto tooltip interattivo nella visualizzazione cantina che mostra:
- Produttore
- Nome vino
- Annata
- Posizione esatta (Fila X, Pos. Y)

Funziona su hover desktop e tap-and-hold mobile, completamente accessibile.

---

Per dettagli tecnici completi delle implementazioni, consulta [implementazioni.md](./implementazioni.md).
