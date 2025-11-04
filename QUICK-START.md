# Guida Rapida - Cantina Vini

## Testa Subito l'Applicazione!

### 1. Avvia il Server

```bash
npm run dev
```

### 2. Apri il Browser

Vai su **http://localhost:3000**

### 3. Crea il Tuo Account

1. Verrai reindirizzato automaticamente a `/accedi`
2. Clicca **"Registrati"**
3. Inserisci:
   - **Email**: la tua email (anche fittizia)
   - **Password**: almeno 6 caratteri
   - **Conferma Password**: ripeti la password
4. Clicca **"Registrati"**
5. Verrai reindirizzato alla **Dashboard**

### 4. Esplora la Dashboard

La dashboard mostra:
- Il tuo email in alto a destra
- 4 card con statistiche (ancora a zero)
- Pulsante "Esci" per logout

### 5. Testa il Logout e Login

1. Clicca **"Esci"** → torni a `/accedi`
2. Inserisci email e password → torni alla dashboard

---

## Setup Completato

L'applicazione è **pronta e funzionante** con:

✅ Autenticazione completa (signup, login, logout)
✅ Database Postgres su Supabase
✅ Row-Level Security attivo (ogni utente vede solo i suoi dati)
✅ Storage configurato per foto etichette
✅ Cache offline pronta (IndexedDB con Dexie)
✅ PWA manifest configurato

---

## Prossimi Sviluppi

Ora implementeremo:

### 1. Gestione Vini
- Pagina lista vini con ricerca/filtri
- Form per aggiungere nuovo vino
- Dettaglio vino
- Modifica/eliminazione

### 2. Gestione Bottiglie
- Inventario completo
- Upload foto etichetta
- Associazione a ubicazioni
- Scanner barcode

### 3. Ubicazioni e Degustazioni
- Creazione ubicazioni (cantina → scaffale → ripiano)
- Registrazione degustazioni
- Note di assaggio

---

## File Importanti

- **README.md**: Documentazione completa del progetto
- **SETUP-SUPABASE.md**: Istruzioni configurazione Supabase (già completato)
- **analisi.md**: Analisi architetturale originale
- **.env.local**: Variabili ambiente (NON versionare!)

---

## Comandi Utili

```bash
# Sviluppo
npm run dev                 # Avvia server sviluppo

# Database
npm run db:studio           # Apri Prisma Studio (GUI database)
npm run db:generate         # Rigenera Prisma Client

# Build
npm run build               # Build produzione
npm run start               # Server produzione
```

---

## Verifica Supabase

Puoi verificare i dati su Supabase:

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard/project/qnxegjokkqnyqtoltedp)
2. **Table Editor** → Vedi le tabelle `wines`, `bottles`, `tastings`, `locations`
3. **Authentication** → **Users** → Vedi gli utenti registrati
4. **Storage** → **labels** → Bucket per foto etichette

---

## Vuoi Continuare?

Dimmi **"procedi con i vini"** e implementerò:
- Pagina lista vini
- Form creazione vino
- CRUD completo

Oppure dimmi cosa preferisci implementare prima!
