# Guida al Deployment in Produzione

## Panoramica

Questa guida ti aiuterà a deployare l'applicazione "Cantina Vini" in produzione usando:
- **Vercel** per l'hosting dell'applicazione Next.js
- **Supabase** per il database PostgreSQL e autenticazione

## FASE 1: Preparazione Supabase Production

### 1.1 Crea il Progetto Supabase Production

1. Vai su [https://supabase.com](https://supabase.com)
2. Clicca su "New Project"
3. Compila i campi:
   - **Name**: `cantina-vini-prod` (o il nome che preferisci)
   - **Database Password**: Scegli una password sicura e SALVALA
   - **Region**: Scegli la regione più vicina (es. Frankfurt per l'Italia)
4. Clicca "Create new project"
5. Attendi che il progetto venga creato (ci vogliono ~2 minuti)

### 1.2 Annota le Credenziali

Una volta creato il progetto, vai su **Settings > API** e annota:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

Vai anche su **Settings > Database** per la connessione diretta:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 1.3 Esegui le Migrazioni Database

Hai due opzioni:

**OPZIONE A - Via Dashboard Supabase (più semplice)**:

1. Vai su **SQL Editor** nella dashboard Supabase
2. Apri il file `supabase/migrations/add_wine_photo.sql` dal tuo progetto
3. Copia tutto il contenuto e incollalo nell'editor SQL
4. Clicca "Run"
5. Ripeti con il file `supabase/migrations/add_vivino_fields.sql`

**OPZIONE B - Via CLI Supabase**:

```bash
# Installa Supabase CLI (solo la prima volta)
npm install -g supabase

# Collega il progetto
supabase link --project-ref xxxxx

# Esegui tutte le migrazioni
supabase db push
```

### 1.4 Configura Authentication

1. Vai su **Authentication > Providers**
2. Abilita **Email** provider (già abilitato di default)
3. Opzionale: Configura **Site URL** e **Redirect URLs**:
   - Site URL: `https://tuodominio.vercel.app`
   - Redirect URLs: `https://tuodominio.vercel.app/callback`

## FASE 2: Deploy su Vercel

### 2.1 Prepara il Repository Git

Se non l'hai già fatto, inizializza Git e fai push su GitHub:

```bash
# Inizializza repository (se non fatto)
git init

# Aggiungi tutti i file
git add .

# Crea il primo commit
git commit -m "Ready for production deployment"

# Crea repository su GitHub e collega
git remote add origin https://github.com/tuousername/cantina-vini.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy su Vercel

1. Vai su [https://vercel.com](https://vercel.com)
2. Clicca "Import Project"
3. Seleziona il repository GitHub che hai appena creato
4. Configura il progetto:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (lascia default)
   - **Build Command**: `npm run build` (lascia default)
   - **Output Directory**: `.next` (lascia default)

### 2.3 Configura le Variabili d'Ambiente

Nella schermata di deploy, clicca su "Environment Variables" e aggiungi TUTTE queste variabili:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_NAME=Cantina Vini
```

**IMPORTANTE**:
- Usa i valori del tuo progetto Supabase PRODUCTION
- NON committare mai le chiavi nel repository
- Aggiungi le variabili per tutti gli environment (Production, Preview, Development)

### 2.4 Deploy

1. Clicca "Deploy"
2. Attendi che il deployment sia completato (~2-3 minuti)
3. Vercel ti fornirà un URL tipo: `https://cantina-vini-xxxxx.vercel.app`

## FASE 3: Configurazione Post-Deploy

### 3.1 Aggiorna Redirect URLs in Supabase

1. Torna su Supabase Dashboard
2. Vai su **Authentication > URL Configuration**
3. Aggiungi il tuo URL Vercel alle Redirect URLs:
   ```
   https://cantina-vini-xxxxx.vercel.app/callback
   ```

### 3.2 Test dell'Applicazione

1. Apri l'URL Vercel nel browser
2. Registra un nuovo account
3. Verifica che la registrazione funzioni
4. Prova a creare un vino
5. Controlla che tutti i dati vengano salvati correttamente

## FASE 4: Configurazione Dominio Personalizzato (Opzionale)

Se vuoi usare un dominio personalizzato:

1. Vai su Vercel Dashboard → Settings → Domains
2. Aggiungi il tuo dominio (es. `cantina.tuodominio.com`)
3. Segui le istruzioni per configurare i DNS:
   - Aggiungi un record CNAME che punta a `cname.vercel-dns.com`
4. Attendi la propagazione DNS (~24h max)
5. Aggiorna le Redirect URLs in Supabase con il nuovo dominio

## FASE 5: Monitoraggio e Manutenzione

### 5.1 Logs e Debugging

- **Vercel Logs**: Dashboard Vercel → Deployments → Clicca sul deployment → Function Logs
- **Supabase Logs**: Dashboard Supabase → Logs → seleziona il tipo di log

### 5.2 Aggiornamenti Futuri

Per deployare nuove versioni:

```bash
# Fai le modifiche
git add .
git commit -m "Descrizione modifiche"
git push

# Vercel deploierà automaticamente!
```

### 5.3 Rollback

Se qualcosa va storto:
1. Vai su Vercel Dashboard → Deployments
2. Trova un deployment precedente funzionante
3. Clicca sui tre puntini → "Promote to Production"

## Checklist Pre-Produzione

- [ ] Database Supabase production creato e configurato
- [ ] Migrazioni eseguite correttamente
- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Redirect URLs configurati in Supabase
- [ ] Build locale completata senza errori
- [ ] Repository Git pushato su GitHub
- [ ] Deploy su Vercel completato
- [ ] Registrazione utente testata
- [ ] Funzionalità principali testate
- [ ] PWA funzionante (testa "Add to Home Screen")

## Troubleshooting

### Errore: "Invalid API key"
- Verifica che le variabili d'ambiente siano configurate correttamente
- Controlla che non ci siano spazi extra nelle chiavi

### Errore: "CORS error"
- Verifica le Redirect URLs in Supabase
- Assicurati che il dominio Vercel sia corretto

### Errore di build su Vercel
- Controlla i logs di build
- Verifica che tutte le dipendenze siano in `package.json`
- Assicurati che il codice compili localmente con `npm run build`

### Database non accessibile
- Verifica la `DATABASE_URL`
- Controlla che il progetto Supabase sia attivo
- Verifica la password del database

## Supporto

Per problemi o domande:
- Documentazione Vercel: [https://vercel.com/docs](https://vercel.com/docs)
- Documentazione Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- Documentazione Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
