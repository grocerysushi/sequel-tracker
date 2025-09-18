import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bplyxhysnhgwawjwflcm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHl4aHlzbmhnd2F3andmbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwODI2MTYsImV4cCI6MjA3MzY1ODYxNn0.esNby8Bd85rL588Fb5PoDDCKVVmE_k8z36vP5Y8lAhQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will be generated from Supabase later)
export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  status: 'want_to_watch' | 'watching' | 'completed';
  rating?: number;
  notes?: string;
  poster_url?: string;
  tmdb_id?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TVShow {
  id: string;
  title: string;
  year: number;
  genre: string[];
  status: 'want_to_watch' | 'watching' | 'completed';
  current_season?: number;
  current_episode?: number;
  total_seasons?: number;
  rating?: number;
  notes?: string;
  poster_url?: string;
  tmdb_id?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}