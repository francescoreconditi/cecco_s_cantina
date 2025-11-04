-- ============================================
-- ROW-LEVEL SECURITY (RLS) SETUP
-- Protegge i dati garantendo che ogni utente
-- veda solo le proprie informazioni
-- ============================================

-- ABILITA RLS su tutte le tabelle
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITICHE PER WINES
-- ============================================

-- Lettura: solo i propri vini
CREATE POLICY "Utenti possono leggere solo i propri vini"
ON wines FOR SELECT
USING (auth.uid()::text = owner_id);

-- Inserimento: solo con proprio owner_id
CREATE POLICY "Utenti possono inserire i propri vini"
ON wines FOR INSERT
WITH CHECK (auth.uid()::text = owner_id);

-- Aggiornamento: solo i propri vini
CREATE POLICY "Utenti possono aggiornare i propri vini"
ON wines FOR UPDATE
USING (auth.uid()::text = owner_id)
WITH CHECK (auth.uid()::text = owner_id);

-- Cancellazione: solo i propri vini
CREATE POLICY "Utenti possono cancellare i propri vini"
ON wines FOR DELETE
USING (auth.uid()::text = owner_id);

-- ============================================
-- POLITICHE PER BOTTLES
-- ============================================

CREATE POLICY "Utenti possono leggere le proprie bottiglie"
ON bottles FOR SELECT
USING (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono inserire le proprie bottiglie"
ON bottles FOR INSERT
WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono aggiornare le proprie bottiglie"
ON bottles FOR UPDATE
USING (auth.uid()::text = owner_id)
WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono cancellare le proprie bottiglie"
ON bottles FOR DELETE
USING (auth.uid()::text = owner_id);

-- ============================================
-- POLITICHE PER TASTINGS
-- ============================================

CREATE POLICY "Utenti possono leggere le proprie degustazioni"
ON tastings FOR SELECT
USING (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono inserire le proprie degustazioni"
ON tastings FOR INSERT
WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono aggiornare le proprie degustazioni"
ON tastings FOR UPDATE
USING (auth.uid()::text = owner_id)
WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono cancellare le proprie degustazioni"
ON tastings FOR DELETE
USING (auth.uid()::text = owner_id);

-- ============================================
-- POLITICHE PER LOCATIONS
-- ============================================

CREATE POLICY "Utenti possono leggere le proprie ubicazioni"
ON locations FOR SELECT
USING (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono inserire le proprie ubicazioni"
ON locations FOR INSERT
WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono aggiornare le proprie ubicazioni"
ON locations FOR UPDATE
USING (auth.uid()::text = owner_id)
WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Utenti possono cancellare le proprie ubicazioni"
ON locations FOR DELETE
USING (auth.uid()::text = owner_id);

-- ============================================
-- FUNZIONI HELPER PER API (RPC)
-- ============================================

-- Funzione per inserire una bottiglia in modo sicuro
-- Imposta automaticamente owner_id = auth.uid()
CREATE OR REPLACE FUNCTION api_insert_bottle(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO bottles (
    id, owner_id, wine_id, quantita,
    data_acquisto, prezzo_acquisto, fornitore,
    location_id, pronto_da, meglio_entro, stato_maturita,
    barcode, foto_etichetta_url, note_posizione, note_private
  )
  VALUES (
    gen_random_uuid(),
    auth.uid()::text,
    (payload->>'wineId')::text,
    COALESCE((payload->>'quantita')::int, 1),
    (payload->>'dataAcquisto')::timestamptz,
    (payload->>'prezzoAcquisto')::decimal,
    payload->>'fornitore',
    (payload->>'locationId')::text,
    (payload->>'prontoDA')::timestamptz,
    (payload->>'meglioEntro')::timestamptz,
    payload->>'statoMaturita',
    payload->>'barcode',
    payload->>'fotoEtichettaUrl',
    payload->>'notePosizione',
    payload->>'notePrivate'
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Funzione per inserire un vino in modo sicuro
CREATE OR REPLACE FUNCTION api_insert_wine(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id uuid;
  vitigni_array text[];
BEGIN
  -- Converti JSON array a PostgreSQL array
  SELECT ARRAY(SELECT jsonb_array_elements_text(payload->'vitigni'))
  INTO vitigni_array;

  INSERT INTO wines (
    id, owner_id, nome, produttore, denominazione, annata,
    vitigni, regione, paese, formato_ml, grado_alcolico, tipologia, note
  )
  VALUES (
    gen_random_uuid(),
    auth.uid()::text,
    payload->>'nome',
    payload->>'produttore',
    payload->>'denominazione',
    (payload->>'annata')::int,
    vitigni_array,
    payload->>'regione',
    COALESCE(payload->>'paese', 'Italia'),
    COALESCE((payload->>'formatoMl')::int, 750),
    (payload->>'gradoAlcolico')::float,
    payload->>'tipologia',
    payload->>'note'
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
