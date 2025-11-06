-- Migration: Aggiunge supporto foto alle degustazioni
-- Data: 2025-01-06
-- Descrizione: Aggiunge colonna per memorizzare URL foto degustazioni

-- Aggiungi colonna per foto degustazione
ALTER TABLE tastings
ADD COLUMN IF NOT EXISTS foto_degustazione_url TEXT;

-- Commento sulla colonna
COMMENT ON COLUMN tastings.foto_degustazione_url IS 'Path relativo della foto degustazione in Supabase Storage (bucket: tasting-photos)';

-- Nessun indice necessario, query filtrano sempre per owner_id che è già indicizzato
