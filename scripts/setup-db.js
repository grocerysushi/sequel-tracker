const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bplyxhysnhgwawjwflcm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHl4aHlzbmhnd2F3andmbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwODI2MTYsImV4cCI6MjA3MzY1ODYxNn0.esNby8Bd85rL588Fb5PoDDCKVVmE_k8z36vP5Y8lAhQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Sequel Tracker database...');

  try {
    // Check existing tables
    console.log('🔍 Checking existing tables...');

    // First, let's create our tables using the supabase client
    console.log('🏗️ Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR ALL USING (auth.uid() = id);
      `
    });

    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
    } else {
      console.log('✅ Profiles table created');
    }

    console.log('🏗️ Creating movies table...');
    const { error: moviesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.movies (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

        ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can manage own movies" ON public.movies
          FOR ALL USING (auth.uid() = user_id);

        CREATE INDEX IF NOT EXISTS idx_movies_user_id ON public.movies(user_id);
        CREATE INDEX IF NOT EXISTS idx_movies_status ON public.movies(status);
      `
    });

    if (moviesError) {
      console.error('Error creating movies table:', moviesError);
    } else {
      console.log('✅ Movies table created');
    }

    console.log('🏗️ Creating tv_shows table...');
    const { error: tvShowsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.tv_shows (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

        ALTER TABLE public.tv_shows ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can manage own tv_shows" ON public.tv_shows
          FOR ALL USING (auth.uid() = user_id);

        CREATE INDEX IF NOT EXISTS idx_tv_shows_user_id ON public.tv_shows(user_id);
        CREATE INDEX IF NOT EXISTS idx_tv_shows_status ON public.tv_shows(status);
      `
    });

    if (tvShowsError) {
      console.error('Error creating tv_shows table:', tvShowsError);
    } else {
      console.log('✅ TV Shows table created');
    }

    console.log('✅ Database setup complete!');
    console.log('📊 You can now start using the Sequel Tracker with Supabase!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();