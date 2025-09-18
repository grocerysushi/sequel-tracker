import { NextRequest, NextResponse } from 'next/server';
import { tmdbService } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';
    const category = searchParams.get('category') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');

    let results;

    if (type === 'movie') {
      switch (category) {
        case 'trending':
          results = await tmdbService.getTrendingMovies();
          break;
        case 'popular':
        default:
          results = await tmdbService.getPopularMovies(page);
          break;
      }
    } else if (type === 'tv') {
      switch (category) {
        case 'trending':
          results = await tmdbService.getTrendingTVShows();
          break;
        case 'popular':
        default:
          results = await tmdbService.getPopularTVShows(page);
          break;
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "movie" or "tv"' },
        { status: 400 }
      );
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Discover API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}