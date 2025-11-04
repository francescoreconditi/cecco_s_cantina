# Setup Supabase - Istruzioni Complete

## 1. Configurazione Row-Level Security (RLS)

1. Vai su [Supabase SQL Editor](https://supabase.com/dashboard/project/qnxegjokkqnyqtoltedp/sql)
2. Clicca **"New query"**
3. Copia tutto il contenuto del file `supabase-rls-setup.sql`
4. Incollalo nell'editor
5. Clicca **"Run"** (o Ctrl+Enter)
6. Verifica che compaia "Success"

## 2. Configurazione Storage per Foto Etichette

### A. Crea il bucket

1. Vai su [Storage](https://supabase.com/dashboard/project/qnxegjokkqnyqtoltedp/storage/buckets)
2. Clicca **"New bucket"**
3. Compila:
   - **Name**: `labels`
   - **Public**: NO (deseleziona)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
   - **Max file size**: `5 MB` (o a piacere)
4. Clicca **"Create bucket"**

### B. Applica le politiche storage

1. Torna su [SQL Editor](https://supabase.com/dashboard/project/qnxegjokkqnyqtoltedp/sql)
2. Clicca **"New query"**
3. Copia tutto il contenuto del file `supabase-storage-setup.sql`
4. Incollalo nell'editor
5. Clicca **"Run"**
6. Verifica che compaia "Success"

## 3. Verifica Configurazione

### Verifica RLS

1. Vai su [Table Editor](https://supabase.com/dashboard/project/qnxegjokkqnyqtoltedp/editor)
2. Seleziona una tabella (es. `wines`)
3. Clicca sull'icona dello scudo in alto a destra
4. Dovresti vedere **RLS enabled** e le 4 politiche (SELECT, INSERT, UPDATE, DELETE)

### Verifica Storage

1. Vai su [Storage](https://supabase.com/dashboard/project/qnxegjokkqnyqtoltedp/storage/buckets)
2. Seleziona il bucket `labels`
3. Clicca **"Policies"**
4. Dovresti vedere 4 politiche (SELECT, INSERT, UPDATE, DELETE)

## 4. Abilita Email Authentication

1. Vai su [Authentication > Providers](https://supabase.com/dashboard/project/qnxegjokkqnyqtoltedp/auth/providers)
2. Sotto **Email**, assicurati che sia **Enabled**
3. Opzionale: Disabilita **"Confirm email"** durante lo sviluppo per testing più veloce
4. Salva le modifiche

## Completato!

Quando hai fatto tutto, torna al progetto e dimmi **"setup Supabase completato"**.
