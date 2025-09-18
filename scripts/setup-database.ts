import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bplyxhysnhgwawjwflcm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHl4aHlzbmhnd2F3andmbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwODI2MTYsImV4cCI6MjA3MzY1ODYxNn0.esNby8Bd85rL588Fb5PoDDCKVVmE_k8z36vP5Y8lAhQ';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExistingTables() {
  console.log('🔍 Checking existing tables...');

  try {
    // Query to get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations'); // Exclude system tables

    if (error) {
      console.error('Error checking tables:', error);
      return [];
    }

    const tableNames = data.map(row => row.table_name);
    console.log('📋 Found tables:', tableNames);
    return tableNames;
  } catch (error) {
    console.error('Failed to check tables:', error);
    return [];
  }
}

async function dropAllTables() {
  console.log('🗑️ Dropping all existing tables...');

  const tables = await checkExistingTables();

  if (tables.length === 0) {
    console.log('✅ No tables to drop');
    return;
  }

  // Drop tables in reverse dependency order to avoid foreign key conflicts
  const dropOrder = [
    'episodes',
    'collection_items',
    'watchlist',
    'collections',
    'tv_shows',
    'movies',
    'profiles'
  ];

  for (const tableName of dropOrder) {
    if (tables.includes(tableName)) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `DROP TABLE IF EXISTS public.${tableName} CASCADE;`
        });

        if (error) {
          console.error(`Error dropping table ${tableName}:`, error);
        } else {
          console.log(`✅ Dropped table: ${tableName}`);
        }
      } catch (error) {
        console.error(`Failed to drop table ${tableName}:`, error);
      }
    }
  }

  // Drop any remaining tables
  for (const tableName of tables) {
    if (!dropOrder.includes(tableName)) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `DROP TABLE IF EXISTS public.${tableName} CASCADE;`
        });

        if (error) {
          console.error(`Error dropping table ${tableName}:`, error);
        } else {
          console.log(`✅ Dropped table: ${tableName}`);
        }
      } catch (error) {
        console.error(`Failed to drop table ${tableName}:`, error);
      }
    }
  }
}

async function createSchema() {
  console.log('🏗️ Creating new database schema...');

  const schemaSql = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movies table
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  genre TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('want_to_watch', 'watching', 'completed')) DEFAULT 'want_to_watch',
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  poster_url TEXT,
  tmdb_id INTEGER,
  runtime INTEGER,
  director TEXT,
  cast TEXT[],
  plot TEXT,
  date_completed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TV Shows table
CREATE TABLE IF NOT EXISTS public.tv_shows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  genre TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('want_to_watch', 'watching', 'completed')) DEFAULT 'want_to_watch',
  current_season INTEGER DEFAULT 1,
  current_episode INTEGER DEFAULT 1,
  total_seasons INTEGER,
  total_episodes INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  poster_url TEXT,
  tmdb_id INTEGER,
  creator TEXT,
  cast TEXT[],
  plot TEXT,
  date_completed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection items junction table
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES public.tv_shows(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_items_item_check CHECK (
    (movie_id IS NOT NULL AND tv_show_id IS NULL) OR
    (movie_id IS NULL AND tv_show_id IS NOT NULL)
  )
);

-- Episodes tracking table
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tv_show_id UUID REFERENCES public.tv_shows(id) ON DELETE CASCADE NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT,
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  UNIQUE(tv_show_id, season_number, episode_number)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own movies" ON public.movies;
DROP POLICY IF EXISTS "Users can insert own movies" ON public.movies;
DROP POLICY IF EXISTS "Users can update own movies" ON public.movies;
DROP POLICY IF EXISTS "Users can delete own movies" ON public.movies;

DROP POLICY IF EXISTS "Users can view own tv_shows" ON public.tv_shows;
DROP POLICY IF EXISTS "Users can insert own tv_shows" ON public.tv_shows;
DROP POLICY IF EXISTS "Users can update own tv_shows" ON public.tv_shows;
DROP POLICY IF EXISTS "Users can delete own tv_shows" ON public.tv_shows;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own movies" ON public.movies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movies" ON public.movies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movies" ON public.movies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movies" ON public.movies
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tv_shows" ON public.tv_shows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tv_shows" ON public.tv_shows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tv_shows" ON public.tv_shows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tv_shows" ON public.tv_shows
  FOR DELETE USING (auth.uid() = user_id);

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tv_shows_updated_at BEFORE UPDATE ON public.tv_shows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_user_id ON public.movies(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_status ON public.movies(status);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_tv_shows_user_id ON public.tv_shows(user_id);
CREATE INDEX IF NOT EXISTS idx_tv_shows_status ON public.tv_shows(status);
CREATE INDEX IF NOT EXISTS idx_tv_shows_tmdb_id ON public.tv_shows(tmdb_id);
`;

  try {
    // Execute the schema creation in smaller chunks to avoid issues
    const statements = schemaSql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          console.error('Error executing statement:', error);
          console.error('Statement:', statement);
        }
      }
    }

    console.log('✅ Database schema created successfully');
  } catch (error) {
    console.error('Failed to create schema:', error);
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Sequel Tracker database...');

  await dropAllTables();
  await createSchema();

  console.log('✅ Database setup complete!');
}

// Run if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

export { setupDatabase, checkExistingTables, dropAllTables, createSchema };