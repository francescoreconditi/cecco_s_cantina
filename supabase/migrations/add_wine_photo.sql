-- Migrazione: Aggiunge campo foto_etichetta_url alla tabella wines
-- Data: 2025-11-03
-- Scopo: Permettere upload foto etichette per i vini

-- Aggiungi colonna foto_etichetta_url
ALTER TABLE wines
ADD COLUMN foto_etichetta_url TEXT;

-- Aggiungi commento alla colonna
COMMENT ON COLUMN wines.foto_etichetta_url IS 'Path della foto etichetta nel bucket Supabase Storage';
