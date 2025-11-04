-- Migrazione: Aggiunge campi Vivino alla tabella wines
-- Data: 2025-11-03
-- Scopo: Integrare dati Vivino (rating, prezzi, link)

-- Aggiungi colonne Vivino
ALTER TABLE wines
ADD COLUMN vivino_id INTEGER,
ADD COLUMN vivino_rating DECIMAL(3,2),
ADD COLUMN vivino_rating_count INTEGER,
ADD COLUMN vivino_price DECIMAL(10,2),
ADD COLUMN vivino_currency VARCHAR(3) DEFAULT 'EUR',
ADD COLUMN vivino_url TEXT,
ADD COLUMN vivino_image_url TEXT,
ADD COLUMN vivino_last_updated TIMESTAMP;

-- Aggiungi commenti
COMMENT ON COLUMN wines.vivino_id IS 'ID del vino su Vivino';
COMMENT ON COLUMN wines.vivino_rating IS 'Rating medio su Vivino (1-5)';
COMMENT ON COLUMN wines.vivino_rating_count IS 'Numero di rating su Vivino';
COMMENT ON COLUMN wines.vivino_price IS 'Prezzo medio su Vivino';
COMMENT ON COLUMN wines.vivino_currency IS 'Valuta del prezzo Vivino';
COMMENT ON COLUMN wines.vivino_url IS 'URL della pagina Vivino';
COMMENT ON COLUMN wines.vivino_image_url IS 'URL immagine etichetta da Vivino';
COMMENT ON COLUMN wines.vivino_last_updated IS 'Ultima sincronizzazione con Vivino';

-- Indice per ricerca rapida
CREATE INDEX IF NOT EXISTS idx_wines_vivino_id ON wines(vivino_id);
