const TMDB_API_KEY = process.env.TMDB_API_KEY || '0516f25de82267acf54e3dd3fc372307';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDB API interfaces
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: { id: number; name: string }[];
  created_by?: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

class TMDBService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseUrl = TMDB_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Search functions
  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
    return this.makeRequest<TMDBSearchResponse<TMDBMovie>>('/search/movie', {
      query,
      page: page.toString(),
      include_adult: 'false',
    });
  }

  async searchTVShows(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBSearchResponse<TMDBTVShow>>('/search/tv', {
      query,
      page: page.toString(),
      include_adult: 'false',
    });
  }

  async searchMulti(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow>> {
    return this.makeRequest<TMDBSearchResponse<TMDBMovie | TMDBTVShow>>('/search/multi', {
      query,
      page: page.toString(),
      include_adult: 'false',
    });
  }

  // Movie details
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return this.makeRequest<TMDBMovie>(`/movie/${movieId}`, {
      append_to_response: 'credits,genres',
    });
  }

  // TV Show details
  async getTVShowDetails(tvId: number): Promise<TMDBTVShow> {
    return this.makeRequest<TMDBTVShow>(`/tv/${tvId}`, {
      append_to_response: 'credits,genres',
    });
  }

  // Popular/Trending content
  async getPopularMovies(page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
    return this.makeRequest<TMDBSearchResponse<TMDBMovie>>('/movie/popular', {
      page: page.toString(),
    });
  }

  async getPopularTVShows(page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBSearchResponse<TMDBTVShow>>('/tv/popular', {
      page: page.toString(),
    });
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse<TMDBMovie>> {
    return this.makeRequest<TMDBSearchResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`);
  }

  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBSearchResponse<TMDBTVShow>>(`/trending/tv/${timeWindow}`);
  }

  // Genres
  async getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
    return this.makeRequest<{ genres: TMDBGenre[] }>('/genre/movie/list');
  }

  async getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
    return this.makeRequest<{ genres: TMDBGenre[] }>('/genre/tv/list');
  }

  // Discover
  async discoverMovies(params: {
    with_genres?: string;
    year?: number;
    sort_by?: string;
    page?: number;
  } = {}): Promise<TMDBSearchResponse<TMDBMovie>> {
    const queryParams = {
      page: '1',
      sort_by: 'popularity.desc',
      ...Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value.toString()])
      ),
    };

    return this.makeRequest<TMDBSearchResponse<TMDBMovie>>('/discover/movie', queryParams);
  }

  async discoverTVShows(params: {
    with_genres?: string;
    first_air_date_year?: number;
    sort_by?: string;
    page?: number;
  } = {}): Promise<TMDBSearchResponse<TMDBTVShow>> {
    const queryParams = {
      page: '1',
      sort_by: 'popularity.desc',
      ...Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value.toString()])
      ),
    };

    return this.makeRequest<TMDBSearchResponse<TMDBTVShow>>('/discover/tv', queryParams);
  }

  // Image URLs
  getPosterUrl(posterPath: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!posterPath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
  }

  getBackdropUrl(backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
    if (!backdropPath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
  }

  getProfileUrl(profilePath: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string | null {
    if (!profilePath) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${profilePath}`;
  }

  // Utility functions
  extractYear(dateString: string): number {
    return new Date(dateString).getFullYear();
  }

  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  }

  isMovie(item: TMDBMovie | TMDBTVShow): item is TMDBMovie {
    return 'title' in item;
  }

  isTVShow(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
    return 'name' in item;
  }
}

// Create singleton instance
export const tmdbService = new TMDBService();

// Export utility functions
export { TMDB_IMAGE_BASE_URL };

// Type guards
export function isTMDBMovie(item: any): item is TMDBMovie {
  return item && typeof item === 'object' && 'title' in item;
}

export function isTMDBTVShow(item: any): item is TMDBTVShow {
  return item && typeof item === 'object' && 'name' in item;
}