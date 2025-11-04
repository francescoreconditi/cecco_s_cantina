# Migrazioni Database

Questa cartella contiene le migrazioni SQL per il database Supabase.

## Come Applicare le Migrazioni

### Metodo 1: Dashboard Supabase (Consigliato)

1. Accedi alla [Dashboard Supabase](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** nel menu laterale
4. Copia e incolla il contenuto del file di migrazione (`add_wine_photo.sql`)
5. Clicca su **Run** per eseguire la migrazione

### Metodo 2: Supabase CLI

Se hai installato la [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
# Assicurati di essere nella directory del progetto
cd c:\Progetti\tvini

# Esegui la migrazione
supabase db push

# Oppure applica una migrazione specifica
supabase db execute --file supabase/migrations/add_wine_photo.sql
```

## Migrazioni Disponibili

### add_wine_photo.sql
**Data:** 2025-11-03
**Scopo:** Aggiunge il campo `foto_etichetta_url` alla tabella `wines`

**Dettagli:**
- Aggiunge colonna `foto_etichetta_url` di tipo `TEXT`
- Permette il caricamento di foto etichette per i vini
- Le foto vengono salvate nel bucket Supabase Storage `labels` (stesso bucket delle bottiglie)

**Tabella modificata:** `wines`

**Colonna aggiunta:**
- `foto_etichetta_url` (TEXT, nullable) - Path della foto nel bucket Storage

## Verifica

Dopo aver applicato la migrazione, puoi verificare che sia stata eseguita correttamente:

```sql
-- Verifica che la colonna esista
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'wines'
AND column_name = 'foto_etichetta_url';
```

Dovresti vedere:
- `column_name`: foto_etichetta_url
- `data_type`: text
- `is_nullable`: YES
