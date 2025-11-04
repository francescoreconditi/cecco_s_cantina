-- ============================================
-- STORAGE SETUP PER FOTO ETICHETTE
-- Bucket: labels
-- Struttura: user/{user_id}/{file_uuid}.jpg
-- ============================================

-- NOTA: Il bucket deve essere creato tramite UI di Supabase
-- Vai su Storage -> Create bucket -> Nome: "labels" -> Public: NO

-- Dopo aver creato il bucket "labels", esegui queste politiche:

-- ============================================
-- POLITICHE STORAGE: LETTURA
-- ============================================

-- Gli utenti possono leggere solo i propri file
CREATE POLICY "Utenti possono leggere le proprie foto etichette"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'labels'
  AND (storage.foldername(name))[1] = 'user'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ============================================
-- POLITICHE STORAGE: UPLOAD
-- ============================================

-- Gli utenti possono caricare solo nella propria cartella
CREATE POLICY "Utenti possono caricare le proprie foto etichette"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'labels'
  AND (storage.foldername(name))[1] = 'user'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ============================================
-- POLITICHE STORAGE: AGGIORNAMENTO
-- ============================================

-- Gli utenti possono aggiornare solo i propri file
CREATE POLICY "Utenti possono aggiornare le proprie foto etichette"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'labels'
  AND (storage.foldername(name))[1] = 'user'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'labels'
  AND (storage.foldername(name))[1] = 'user'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ============================================
-- POLITICHE STORAGE: CANCELLAZIONE
-- ============================================

-- Gli utenti possono cancellare solo i propri file
CREATE POLICY "Utenti possono cancellare le proprie foto etichette"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'labels'
  AND (storage.foldername(name))[1] = 'user'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
