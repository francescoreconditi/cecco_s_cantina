// Tipi TypeScript generati da schema Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      wines: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          produttore: string | null;
          denominazione: string | null;
          annata: number | null;
          vitigni: string[];
          regione: string | null;
          paese: string | null;
          formato_ml: number | null;
          grado_alcolico: number | null;
          tipologia: string | null;
          note: string | null;
          foto_etichetta_url: string | null;
          vivino_id: number | null;
          vivino_rating: number | null;
          vivino_rating_count: number | null;
          vivino_price: number | null;
          vivino_currency: string | null;
          vivino_url: string | null;
          vivino_image_url: string | null;
          vivino_last_updated: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          nome: string;
          produttore?: string | null;
          denominazione?: string | null;
          annata?: number | null;
          vitigni?: string[];
          regione?: string | null;
          paese?: string | null;
          formato_ml?: number | null;
          grado_alcolico?: number | null;
          tipologia?: string | null;
          note?: string | null;
          foto_etichetta_url?: string | null;
          vivino_id?: number | null;
          vivino_rating?: number | null;
          vivino_rating_count?: number | null;
          vivino_price?: number | null;
          vivino_currency?: string | null;
          vivino_url?: string | null;
          vivino_image_url?: string | null;
          vivino_last_updated?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          nome?: string;
          produttore?: string | null;
          denominazione?: string | null;
          annata?: number | null;
          vitigni?: string[];
          regione?: string | null;
          paese?: string | null;
          formato_ml?: number | null;
          grado_alcolico?: number | null;
          tipologia?: string | null;
          note?: string | null;
          foto_etichetta_url?: string | null;
          vivino_id?: number | null;
          vivino_rating?: number | null;
          vivino_rating_count?: number | null;
          vivino_price?: number | null;
          vivino_currency?: string | null;
          vivino_url?: string | null;
          vivino_image_url?: string | null;
          vivino_last_updated?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bottles: {
        Row: {
          id: string;
          owner_id: string;
          wine_id: string;
          quantita: number;
          data_acquisto: string | null;
          prezzo_acquisto: number | null;
          fornitore: string | null;
          location_id: string | null;
          pronto_da: string | null;
          meglio_entro: string | null;
          stato_maturita: string | null;
          barcode: string | null;
          foto_etichetta_url: string | null;
          foto_retro_url: string | null;
          note_posizione: string | null;
          note_private: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          wine_id: string;
          quantita?: number;
          data_acquisto?: string | null;
          prezzo_acquisto?: number | null;
          fornitore?: string | null;
          location_id?: string | null;
          pronto_da?: string | null;
          meglio_entro?: string | null;
          stato_maturita?: string | null;
          barcode?: string | null;
          foto_etichetta_url?: string | null;
          foto_retro_url?: string | null;
          note_posizione?: string | null;
          note_private?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          wine_id?: string;
          quantita?: number;
          data_acquisto?: string | null;
          prezzo_acquisto?: number | null;
          fornitore?: string | null;
          location_id?: string | null;
          pronto_da?: string | null;
          meglio_entro?: string | null;
          stato_maturita?: string | null;
          barcode?: string | null;
          foto_etichetta_url?: string | null;
          foto_retro_url?: string | null;
          note_posizione?: string | null;
          note_private?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tastings: {
        Row: {
          id: string;
          owner_id: string;
          wine_id: string;
          data: string;
          punteggio: number | null;
          aspetto_visivo: string | null;
          profumo: string | null;
          gusto: string | null;
          note_generali: string | null;
          occasione: string | null;
          abbinamento_cibo: string | null;
          partecipanti: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          wine_id: string;
          data?: string;
          punteggio?: number | null;
          aspetto_visivo?: string | null;
          profumo?: string | null;
          gusto?: string | null;
          note_generali?: string | null;
          occasione?: string | null;
          abbinamento_cibo?: string | null;
          partecipanti?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          wine_id?: string;
          data?: string;
          punteggio?: number | null;
          aspetto_visivo?: string | null;
          profumo?: string | null;
          gusto?: string | null;
          note_generali?: string | null;
          occasione?: string | null;
          abbinamento_cibo?: string | null;
          partecipanti?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          descrizione: string | null;
          parent_id: string | null;
          temperatura: number | null;
          umidita: number | null;
          note_ambientali: string | null;
          capacita_massima: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          nome: string;
          descrizione?: string | null;
          parent_id?: string | null;
          temperatura?: number | null;
          umidita?: number | null;
          note_ambientali?: string | null;
          capacita_massima?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          nome?: string;
          descrizione?: string | null;
          parent_id?: string | null;
          temperatura?: number | null;
          umidita?: number | null;
          note_ambientali?: string | null;
          capacita_massima?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Export dei tipi delle tabelle per facilitare l'uso
export type Wine = Database["public"]["Tables"]["wines"]["Row"];
export type Bottle = Database["public"]["Tables"]["bottles"]["Row"];
export type Tasting = Database["public"]["Tables"]["tastings"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
