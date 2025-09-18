-- Sequel Tracker Database Schema
-- This file contains the database schema for the Sequel Tracker application

-- Enable RLS (Row Level Security)
-- This ensures users can only see their own data

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
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  genre TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('want_to_watch', 'watching', 'completed')) DEFAULT 'want_to_watch',
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  poster_url TEXT,
  tmdb_id INTEGER UNIQUE,
  runtime INTEGER, -- in minutes
  director TEXT,
  cast TEXT[],
  plot TEXT,
  date_completed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TV Shows table
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
  tmdb_id INTEGER UNIQUE,
  creator TEXT,
  cast TEXT[],
  plot TEXT,
  date_completed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections table (for custom lists/collections)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection items junction table
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES public.tv_shows(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT collection_items_item_check CHECK (
    (movie_id IS NOT NULL AND tv_show_id IS NULL) OR
    (movie_id IS NULL AND tv_show_id IS NOT NULL)
  )
);

-- Watchlist table (simplified want_to_watch list)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES public.tv_shows(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1, -- 1-5 priority level
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT watchlist_item_check CHECK (
    (movie_id IS NOT NULL AND tv_show_id IS NULL) OR
    (movie_id IS NULL AND tv_show_id IS NOT NULL)
  )
);

-- Episodes tracking table (for detailed TV show progress)
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Movies policies
CREATE POLICY "Users can view own movies" ON public.movies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movies" ON public.movies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movies" ON public.movies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movies" ON public.movies
  FOR DELETE USING (auth.uid() = user_id);

-- TV Shows policies
CREATE POLICY "Users can view own tv_shows" ON public.tv_shows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tv_shows" ON public.tv_shows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tv_shows" ON public.tv_shows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tv_shows" ON public.tv_shows
  FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Users can view own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- Collection items policies
CREATE POLICY "Users can view collection items" ON public.collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_id
      AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

CREATE POLICY "Users can insert into own collections" ON public.collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete from own collections" ON public.collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_id
      AND user_id = auth.uid()
    )
  );

-- Watchlist policies
CREATE POLICY "Users can view own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist" ON public.watchlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Episodes policies
CREATE POLICY "Users can view episodes of own shows" ON public.episodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tv_shows
      WHERE id = tv_show_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert episodes for own shows" ON public.episodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tv_shows
      WHERE id = tv_show_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update episodes of own shows" ON public.episodes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tv_shows
      WHERE id = tv_show_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete episodes of own shows" ON public.episodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tv_shows
      WHERE id = tv_show_id
      AND user_id = auth.uid()
    )
  );

-- Functions for updated_at timestamps
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
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_episodes_tv_show_id ON public.episodes(tv_show_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_episode ON public.episodes(tv_show_id, season_number, episode_number);