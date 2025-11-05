-- ============================================
-- Aggiunta campo posizioni cantina per bottiglie
-- Data: 2025-01-06
-- Descrizione: Aggiunge il campo posizioni_cantina
-- per memorizzare riga e colonna di ogni bottiglia
-- nel layout fisico della cantina
-- ============================================

-- Aggiungi colonna posizioni_cantina per memorizzare array di posizioni
ALTER TABLE bottles
ADD COLUMN posizioni_cantina JSONB;

-- Commento per documentare la colonna
COMMENT ON COLUMN bottles.posizioni_cantina IS 'Array JSON di posizioni della bottiglia nel layout cantina: [{riga: number, colonna: number}, ...]';
