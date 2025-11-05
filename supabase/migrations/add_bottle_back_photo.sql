-- ============================================
-- Aggiunta foto retro bottiglia
-- Data: 2025-01-05
-- Descrizione: Aggiunge il campo foto_retro_url
-- per supportare due immagini per bottiglia
-- ============================================

-- Aggiungi colonna foto_retro_url alla tabella bottles
ALTER TABLE bottles
ADD COLUMN foto_retro_url TEXT;

-- Commento per documentare la colonna
COMMENT ON COLUMN bottles.foto_retro_url IS 'URL della foto del retro della bottiglia (etichetta posteriore)';
