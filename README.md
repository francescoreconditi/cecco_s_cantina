# Cantina Vini - PWA per Gestione Cantina Personale

## Stato del Progetto

**Versione**: 0.1.0 (MVP in sviluppo)
**Stack**: Next.js 15, React 19, TypeScript, Supabase, Prisma, TailwindCSS

## Setup Completato

### Infrastruttura Base
- [x] Progetto Next.js con App Router e TypeScript
- [x] Configurazione TailwindCSS con tema personalizzato wine
- [x] Supabase configurato (database, auth, storage)
- [x] Schema Prisma completo (Wine, Bottle, Tasting, Location)
- [x] Row-Level Security (RLS) attivato su tutte le tabelle
- [x] Storage bucket `labels` per foto etichette
- [x] Dexie (IndexedDB) per cache offline
- [x] TanStack Query per data fetching
- [x] PWA manifest configurato
- [x] Middleware Supabase per refresh sessione

### Autenticazione
- [x] Pagina login (`/accedi`)
- [x] Pagina registrazione (`/registrati`)
- [x] Callback handler Supabase
- [x] Dashboard protetta con redirect automatico
- [x] Logout funzionante

## Struttura Progetto

```
tvini/
├── app/
│   ├── (auth)/
│   │   ├── accedi/         # Login
│   │   ├── registrati/     # Signup
│   │   └── callback/       # Auth callback
│   ├── dashboard/          # Dashboard protetta
│   ├── layout.tsx          # Layout root con Providers
│   ├── page.tsx            # Homepage (redirect)
│   ├── globals.css         # Stili globali
│   └── providers.tsx       # TanStack Query Provider
├── components/
│   └── auth/
│       ├── accedi-form.tsx
│       ├── registrati-form.tsx
│       └── logout-button.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Client browser
│   │   ├── server.ts       # Client server
│   │   └── middleware.ts   # Middleware helper
│   └── dexie/
│       └── db.ts           # Database locale IndexedDB
├── prisma/
│   └── schema.prisma       # Schema database completo
├── public/
│   └── manifest.json       # PWA manifest
├── .env.local              # Variabili ambiente (non versionato)
├── .env.example            # Template variabili
├── migration.sql           # SQL schema iniziale
├── supabase-rls-setup.sql  # SQL per RLS policies
├── supabase-storage-setup.sql # SQL per storage policies
└── SETUP-SUPABASE.md       # Istruzioni setup Supabase
```

## Comandi Disponibili

```bash
# Sviluppo
npm run dev              # Avvia server sviluppo (http://localhost:3000)

# Build
npm run build            # Build produzione
npm run start            # Avvia server produzione

# Database
npm run db:generate      # Genera Prisma Client
npm run db:push          # Push schema a DB (senza migrazioni)
npm run db:migrate       # Crea e applica migrazioni
npm run db:studio        # Apri Prisma Studio

# Lint
npm run lint             # Verifica codice
```

## Testare l'Applicazione

1. **Avvia il server**:
   ```bash
   npm run dev
   ```

2. **Apri il browser**:
   - Vai su http://localhost:3000
   - Verrai reindirizzato a `/accedi`

3. **Registra un nuovo utente**:
   - Clicca "Registrati"
   - Inserisci email e password (min 6 caratteri)
   - Dovresti essere reindirizzato alla dashboard

4. **Verifica autenticazione**:
   - La dashboard mostra il tuo email
   - Puoi fare logout e login nuovamente

## Database Schema

### Tabelle Principali

**wines** - Vino "astratto" (tipo di vino)
- id, owner_id, nome, produttore, denominazione, annata
- vitigni[], regione, paese, formato_ml, grado_alcolico, tipologia
- note, created_at, updated_at

**bottles** - Bottiglie fisiche (inventario)
- id, owner_id, wine_id, quantita
- data_acquisto, prezzo_acquisto, fornitore
- location_id, pronto_da, meglio_entro, stato_maturita
- barcode, foto_etichetta_url, note_posizione, note_private
- created_at, updated_at

**tastings** - Degustazioni
- id, owner_id, wine_id, data, punteggio
- aspetto_visivo, profumo, gusto, note_generali
- occasione, abbinamento_cibo, partecipanti[]
- created_at, updated_at

**locations** - Ubicazioni (gerarchia)
- id, owner_id, nome, descrizione
- parent_id, temperatura, umidita, note_ambientali
- capacita_massima, created_at, updated_at

## Prossimi Passi

### Fase 1: CRUD Base (in corso)
- [ ] Pagina lista vini con filtri
- [ ] Form creazione vino
- [ ] Dettaglio vino
- [ ] Modifica/eliminazione vino
- [ ] Gestione bottiglie
- [ ] Upload foto etichetta
- [ ] Gestione ubicazioni

### Fase 2: Funzionalità Avanzate
- [ ] Scanner barcode integrato
- [ ] Degustazioni complete
- [ ] Grafici e statistiche
- [ ] Ricerca full-text
- [ ] Filtri avanzati

### Fase 3: Offline-First
- [ ] Sync engine (outbox pattern)
- [ ] Conflict resolution (Last Writer Wins)
- [ ] Notifiche stato connessione
- [ ] Background sync

### Fase 4: PWA & UX
- [ ] Service worker attivo
- [ ] Installabile su mobile/desktop
- [ ] Push notifications (opzionale)
- [ ] Icone PWA

### Fase 5: Deploy
- [ ] Deploy su Vercel
- [ ] CI/CD automatico
- [ ] Monitoring (Sentry opzionale)

## Variabili Ambiente

Necessarie in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[tuo-progetto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tua-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tua-service-role-key]
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_APP_NAME=Cantina Vini
```

## Tecnologie

- **Next.js 15**: Framework React con App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Supabase**: Backend-as-a-Service (Auth, DB, Storage)
- **Prisma**: ORM e migrazioni
- **TanStack Query**: Data fetching e cache
- **Dexie**: IndexedDB wrapper per cache offline
- **TailwindCSS**: Utility-first CSS
- **next-pwa**: Service worker e PWA
- **@zxing/library**: Barcode scanner (da integrare)
- **Recharts**: Grafici (da integrare)

## Costi Stimati

- **Supabase Free**: $0/mese (limiti generosi per MVP)
- **Vercel Hobby**: $0/mese
- **Dominio**: ~€10-15/anno

**Totale iniziale**: €0-15/anno

## Supporto

Per domande o problemi:
1. Verifica [SETUP-SUPABASE.md](SETUP-SUPABASE.md) per configurazione
2. Controlla i log del server (`npm run dev`)
3. Verifica che RLS sia configurato correttamente su Supabase

## Licenza

Progetto personale - Uso privato
