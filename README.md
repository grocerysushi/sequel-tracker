# 🎬 Sequel Tracker

**Free, open-source movie and TV show tracker - Your alternative to Sequel without paywalls**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green)](https://supabase.com/)
[![TMDB](https://img.shields.io/badge/TMDB-API-yellow)](https://www.themoviedb.org/)

## ✨ Features

### ✅ **Currently Available (Phase 2)**
- 🔍 **Smart Search**: Real-time movie and TV show search with TMDB API
- 🎯 **Autocomplete**: Debounced search with rich media displays
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🤖 **MCP Integration**: Model Context Protocol servers for AI development
- 🔒 **Type Safe**: Full TypeScript implementation
- 📊 **Rich Metadata**: Posters, ratings, cast, and detailed information

### 🚀 **Coming Soon (Phase 3)**
- 👤 User authentication and profiles
- 📚 Personal movie/TV libraries
- ⏱️ Episode progress tracking
- 📋 Custom collections and lists
- 📈 Viewing statistics and insights
- 🔔 New episode notifications

## 🎯 Why Sequel Tracker?

- **100% Free Forever** - No subscription fees or paywalls
- **Open Source** - Community-driven development
- **Privacy First** - Your data stays yours
- **Modern Tech Stack** - Built with latest web technologies
- **MCP Ready** - Integrated with Model Context Protocol for AI assistance

## 🚀 Quick Start

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 🔧 Setup Requirements

1. **TMDB API Key** ✅ - Already configured
2. **Supabase Project** ✅ - Already configured
3. **Database Schema** ⏳ - Needs manual setup (see below)

## 📋 Database Setup

**Required**: Run the database schema in your Supabase Dashboard:

1. Visit: [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Run the complete schema from `supabase-schema.sql`
4. Verify tables are created successfully

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **API**: TMDB (The Movie Database)
- **MCP**: Model Context Protocol servers
- **Authentication**: Supabase Auth (Phase 3)

## 📁 Project Structure

```
sequel-tracker/
├── src/
│   ├── app/
│   │   ├── api/           # Next.js API routes
│   │   └── page.tsx       # Main homepage
│   ├── components/        # React components
│   └── lib/              # Utilities and services
├── mcp-server/           # Custom MCP server
├── supabase-schema.sql   # Database schema
└── docs/                 # Documentation
```

## 🤖 MCP Integration

This project includes Model Context Protocol servers for AI-powered development:

- **Supabase MCP**: Database operations
- **Custom Sequel MCP**: Movie/TV tracking operations

See `MCP_SETUP.md` for configuration instructions.

## 📚 Documentation

- [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md) - Complete setup guide
- [`MCP_SETUP.md`](./MCP_SETUP.md) - MCP server configuration
- [`GITHUB_SETUP.md`](./GITHUB_SETUP.md) - Repository setup guide

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# MCP Server
npm run build:mcp       # Build MCP server
npm run start:mcp       # Start MCP server

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
```

## 🤝 Contributing

Contributions are welcome! This is an open-source project aimed at providing a free alternative to paid movie/TV tracking apps.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **TMDB** for providing the movie/TV database API
- **Supabase** for the backend infrastructure
- **Next.js** team for the amazing framework
- **Anthropic** for Claude Code and MCP

---

**Built with ❤️ for the community** | **No paywalls, just great software**