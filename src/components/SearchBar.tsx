'use client';

import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { TMDBMovie, TMDBTVShow, isTMDBMovie, isTMDBTVShow } from '@/lib/tmdb';

interface SearchResult {
  id: number;
  title: string;
  year: number;
  type: 'movie' | 'tv';
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

interface SearchBarProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  onSelect,
  placeholder = 'Search for movies and TV shows...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchMedia = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&type=multi`
        );
        const data = await response.json();

        if (data.results) {
          const formattedResults: SearchResult[] = data.results
            .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
            .slice(0, 8) // Limit to 8 results
            .map((item: any) => {
              if (item.media_type === 'movie') {
                return {
                  id: item.id,
                  title: item.title,
                  year: item.release_date ? new Date(item.release_date).getFullYear() : 0,
                  type: 'movie' as const,
                  poster_path: item.poster_path,
                  overview: item.overview,
                  vote_average: item.vote_average,
                };
              } else {
                return {
                  id: item.id,
                  title: item.name,
                  year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : 0,
                  type: 'tv' as const,
                  poster_path: item.poster_path,
                  overview: item.overview,
                  vote_average: item.vote_average,
                };
              }
            });

          setResults(formattedResults);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchMedia(query);
  }, [query, searchMedia]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    onSelect?.(result);
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '/placeholder-poster.svg';
    return `https://image.tmdb.org/t/p/w185${posterPath}`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={getPosterUrl(result.poster_path)}
                  alt={result.title}
                  className="w-12 h-18 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-poster.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </h3>
                    {result.year > 0 && (
                      <span className="text-xs text-gray-500">({result.year})</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      result.type === 'movie'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {result.type === 'movie' ? 'Movie' : 'TV Show'}
                    </span>
                    {result.vote_average > 0 && (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-gray-600 ml-1">
                          {result.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {result.overview}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-gray-500 text-center">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}