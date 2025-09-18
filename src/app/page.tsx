'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';

interface SearchResult {
  id: number;
  title: string;
  year: number;
  type: 'movie' | 'tv';
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

export default function Home() {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const handleSearchSelect = (result: SearchResult) => {
    setSelectedResult(result);
    // TODO: Add to user's library/watchlist
    console.log('Selected:', result);
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '/placeholder-poster.svg';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
              Sequel Tracker
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your free, open-source alternative to track movies and TV shows without paywalls.
              Keep track of what you're watching, what you want to watch, and never miss an episode again.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSelect={handleSearchSelect}
              placeholder="Search for movies and TV shows to start tracking..."
              className="w-full"
            />
          </div>

          {/* Selected Result Display */}
          {selectedResult && (
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selected: {selectedResult.title}
              </h3>
              <div className="flex items-start space-x-4">
                <img
                  src={getPosterUrl(selectedResult.poster_path)}
                  alt={selectedResult.title}
                  className="w-24 h-36 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-poster.svg';
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      selectedResult.type === 'movie'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedResult.type === 'movie' ? 'Movie' : 'TV Show'}
                    </span>
                    {selectedResult.year > 0 && (
                      <span className="text-sm text-gray-500">({selectedResult.year})</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {selectedResult.overview}
                  </p>
                  {selectedResult.vote_average > 0 && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedResult.vote_average.toFixed(1)}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Database setup required to save to your library.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Run the SQL schema in your Supabase dashboard to enable tracking.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium">
              ✅ Search & Discovery Ready
            </div>
            <div className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium">
              100% Free Forever
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p>Built with Next.js, TypeScript, Tailwind CSS, and TMDB API</p>
            <p>Phase 2: Core Tracking Features - Search functionality implemented!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
