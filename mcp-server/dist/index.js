#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListResourcesRequestSchema, ListToolsRequestSchema, McpError, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
// In-memory storage (in production, this would be a database)
class MediaStorage {
    movies = new Map();
    tvShows = new Map();
    // Movie methods
    addMovie(movie) {
        const id = `movie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const movieData = {
            ...movie,
            id,
            dateAdded: new Date().toISOString(),
        };
        this.movies.set(id, movieData);
        return movieData;
    }
    getMovie(id) {
        return this.movies.get(id);
    }
    getAllMovies() {
        return Array.from(this.movies.values());
    }
    updateMovie(id, updates) {
        const movie = this.movies.get(id);
        if (!movie)
            return undefined;
        const updatedMovie = { ...movie, ...updates };
        this.movies.set(id, updatedMovie);
        return updatedMovie;
    }
    deleteMovie(id) {
        return this.movies.delete(id);
    }
    // TV Show methods
    addTVShow(show) {
        const id = `tv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const showData = {
            ...show,
            id,
            dateAdded: new Date().toISOString(),
        };
        this.tvShows.set(id, showData);
        return showData;
    }
    getTVShow(id) {
        return this.tvShows.get(id);
    }
    getAllTVShows() {
        return Array.from(this.tvShows.values());
    }
    updateTVShow(id, updates) {
        const show = this.tvShows.get(id);
        if (!show)
            return undefined;
        const updatedShow = { ...show, ...updates };
        this.tvShows.set(id, updatedShow);
        return updatedShow;
    }
    deleteTVShow(id) {
        return this.tvShows.delete(id);
    }
    // Statistics and insights
    getStats() {
        const movies = this.getAllMovies();
        const tvShows = this.getAllTVShows();
        return {
            total: {
                movies: movies.length,
                tvShows: tvShows.length,
            },
            movies: {
                wantToWatch: movies.filter(m => m.status === 'want_to_watch').length,
                watching: movies.filter(m => m.status === 'watching').length,
                completed: movies.filter(m => m.status === 'completed').length,
            },
            tvShows: {
                wantToWatch: tvShows.filter(s => s.status === 'want_to_watch').length,
                watching: tvShows.filter(s => s.status === 'watching').length,
                completed: tvShows.filter(s => s.status === 'completed').length,
            },
        };
    }
}
// Initialize storage
const storage = new MediaStorage();
// Add some sample data
storage.addMovie({
    title: 'The Matrix',
    year: 1999,
    genre: ['Action', 'Sci-Fi'],
    status: 'completed',
    rating: 9,
    notes: 'Mind-bending classic!',
});
storage.addTVShow({
    title: 'Breaking Bad',
    year: 2008,
    genre: ['Drama', 'Crime'],
    status: 'completed',
    currentSeason: 5,
    currentEpisode: 16,
    totalSeasons: 5,
    rating: 10,
    notes: 'One of the best series ever made',
});
// Create MCP server
const server = new Server({
    name: 'sequel-tracker-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: 'sequel://movies/all',
                mimeType: 'application/json',
                name: 'All Movies',
                description: 'List of all tracked movies',
            },
            {
                uri: 'sequel://tv-shows/all',
                mimeType: 'application/json',
                name: 'All TV Shows',
                description: 'List of all tracked TV shows',
            },
            {
                uri: 'sequel://stats',
                mimeType: 'application/json',
                name: 'Statistics',
                description: 'Viewing statistics and insights',
            },
        ],
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    switch (uri) {
        case 'sequel://movies/all':
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(storage.getAllMovies(), null, 2),
                    },
                ],
            };
        case 'sequel://tv-shows/all':
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(storage.getAllTVShows(), null, 2),
                    },
                ],
            };
        case 'sequel://stats':
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(storage.getStats(), null, 2),
                    },
                ],
            };
        default:
            throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
    }
});
// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'add_movie',
                description: 'Add a new movie to the tracking list',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: 'Movie title' },
                        year: { type: 'number', description: 'Release year' },
                        genre: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Movie genres'
                        },
                        status: {
                            type: 'string',
                            enum: ['want_to_watch', 'watching', 'completed'],
                            description: 'Viewing status'
                        },
                        rating: { type: 'number', minimum: 1, maximum: 10, description: 'Personal rating (1-10)' },
                        notes: { type: 'string', description: 'Personal notes' },
                    },
                    required: ['title', 'year', 'genre', 'status'],
                },
            },
            {
                name: 'add_tv_show',
                description: 'Add a new TV show to the tracking list',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: 'TV show title' },
                        year: { type: 'number', description: 'First air year' },
                        genre: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'TV show genres'
                        },
                        status: {
                            type: 'string',
                            enum: ['want_to_watch', 'watching', 'completed'],
                            description: 'Viewing status'
                        },
                        currentSeason: { type: 'number', description: 'Current season number' },
                        currentEpisode: { type: 'number', description: 'Current episode number' },
                        totalSeasons: { type: 'number', description: 'Total number of seasons' },
                        rating: { type: 'number', minimum: 1, maximum: 10, description: 'Personal rating (1-10)' },
                        notes: { type: 'string', description: 'Personal notes' },
                    },
                    required: ['title', 'year', 'genre', 'status'],
                },
            },
            {
                name: 'update_movie_status',
                description: 'Update the viewing status of a movie',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Movie ID' },
                        status: {
                            type: 'string',
                            enum: ['want_to_watch', 'watching', 'completed'],
                            description: 'New viewing status'
                        },
                        rating: { type: 'number', minimum: 1, maximum: 10, description: 'Personal rating (1-10)' },
                        notes: { type: 'string', description: 'Personal notes' },
                    },
                    required: ['id', 'status'],
                },
            },
            {
                name: 'update_tv_show_progress',
                description: 'Update the viewing progress of a TV show',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'TV show ID' },
                        currentSeason: { type: 'number', description: 'Current season number' },
                        currentEpisode: { type: 'number', description: 'Current episode number' },
                        status: {
                            type: 'string',
                            enum: ['want_to_watch', 'watching', 'completed'],
                            description: 'New viewing status'
                        },
                        rating: { type: 'number', minimum: 1, maximum: 10, description: 'Personal rating (1-10)' },
                        notes: { type: 'string', description: 'Personal notes' },
                    },
                    required: ['id'],
                },
            },
            {
                name: 'get_recommendations',
                description: 'Get personalized recommendations based on viewing history',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['movies', 'tv-shows', 'both'],
                            description: 'Type of recommendations to get'
                        },
                        genre: { type: 'string', description: 'Preferred genre filter' },
                    },
                    required: ['type'],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    switch (name) {
        case 'add_movie': {
            const movie = storage.addMovie(args);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully added movie: ${movie.title} (${movie.year})\nID: ${movie.id}`,
                    },
                ],
            };
        }
        case 'add_tv_show': {
            const show = storage.addTVShow(args);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully added TV show: ${show.title} (${show.year})\nID: ${show.id}`,
                    },
                ],
            };
        }
        case 'update_movie_status': {
            const { id, ...updates } = args;
            const updatedMovie = storage.updateMovie(id, {
                ...updates,
                ...(updates.status === 'completed' && !updates.dateCompleted ? { dateCompleted: new Date().toISOString() } : {}),
            });
            if (!updatedMovie) {
                throw new McpError(ErrorCode.InvalidRequest, `Movie with ID ${id} not found`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully updated movie: ${updatedMovie.title}\nNew status: ${updatedMovie.status}`,
                    },
                ],
            };
        }
        case 'update_tv_show_progress': {
            const { id, ...updates } = args;
            const updatedShow = storage.updateTVShow(id, {
                ...updates,
                ...(updates.status === 'completed' && !updates.dateCompleted ? { dateCompleted: new Date().toISOString() } : {}),
            });
            if (!updatedShow) {
                throw new McpError(ErrorCode.InvalidRequest, `TV show with ID ${id} not found`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully updated TV show: ${updatedShow.title}\nProgress: S${updatedShow.currentSeason}E${updatedShow.currentEpisode}\nStatus: ${updatedShow.status}`,
                    },
                ],
            };
        }
        case 'get_recommendations': {
            const { type, genre } = args;
            const stats = storage.getStats();
            // Simple recommendation logic based on completed items
            const completedMovies = storage.getAllMovies().filter(m => m.status === 'completed');
            const completedShows = storage.getAllTVShows().filter(s => s.status === 'completed');
            let recommendations = [];
            if (type === 'movies' || type === 'both') {
                const topGenres = completedMovies.flatMap(m => m.genre).reduce((acc, g) => {
                    acc[g] = (acc[g] || 0) + 1;
                    return acc;
                }, {});
                recommendations.push(`Based on your ${completedMovies.length} completed movies, you seem to enjoy: ${Object.keys(topGenres).slice(0, 3).join(', ')}`);
            }
            if (type === 'tv-shows' || type === 'both') {
                const topGenres = completedShows.flatMap(s => s.genre).reduce((acc, g) => {
                    acc[g] = (acc[g] || 0) + 1;
                    return acc;
                }, {});
                recommendations.push(`Based on your ${completedShows.length} completed TV shows, you seem to enjoy: ${Object.keys(topGenres).slice(0, 3).join(', ')}`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: recommendations.join('\n\n') || 'Start tracking some movies and TV shows to get personalized recommendations!',
                    },
                ],
            };
        }
        default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Sequel Tracker MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map