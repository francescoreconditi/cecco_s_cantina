-- ============================================
-- Aggiunta campi layout fisico ubicazione
-- Data: 2025-01-06
-- Descrizione: Aggiunge i campi per definire
-- la struttura fisica della cantina (file e bottiglie)
-- per abilitare rappresentazione visiva
-- ============================================

-- Aggiungi colonna nr_file per numero totale di file/righe
ALTER TABLE locations
ADD COLUMN nr_file INTEGER;

-- Aggiungi colonna bottiglie_fila_dispari per file 1^, 3^, 5^...
ALTER TABLE locations
ADD COLUMN bottiglie_fila_dispari INTEGER;

-- Aggiungi colonna bottiglie_fila_pari per file 2^, 4^, 6^...
ALTER TABLE locations
ADD COLUMN bottiglie_fila_pari INTEGER;

-- Commenti per documentare le colonne
COMMENT ON COLUMN locations.nr_file IS 'Numero totale di file (righe) nella struttura fisica della cantina';
COMMENT ON COLUMN locations.bottiglie_fila_dispari IS 'Numero di bottiglie per fila in posizioni dispari (1^, 3^, 5^...)';
COMMENT ON COLUMN locations.bottiglie_fila_pari IS 'Numero di bottiglie per fila in posizioni pari (2^, 4^, 6^...)';
