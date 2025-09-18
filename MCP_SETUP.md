# MCP Servers Setup for Sequel Tracker

This project includes integration with multiple Model Context Protocol (MCP) servers to enhance AI capabilities.

## Configured MCP Servers

### 1. Supabase MCP Server
**Purpose**: Database operations and management
- **Package**: `@supabase/mcp-server-supabase`
- **Capabilities**: Query tables, manage database, fetch project config
- **Required**: Supabase project reference and access token
- **Safety**: Configured in read-only mode

### 2. Sequel Tracker Custom MCP Server
**Purpose**: Movie and TV show tracking operations
- **Location**: `./mcp-server/dist/index.js`
- **Capabilities**: Add movies/shows, track progress, get recommendations
- **Required**: No external API keys

## Setup Instructions

### 1. Get Required API Keys

#### Supabase Configuration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Get your project reference from the URL or settings
4. Generate an access token from your account settings


### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
SUPABASE_PROJECT_REF=your_supabase_project_ref_here
SUPABASE_ACCESS_TOKEN=your_supabase_access_token_here
```

### 3. Update Claude Desktop Configuration

Copy the configuration from `.claude/claude_desktop_config.json` to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

Update the placeholder values with your actual API keys and project references.

### 4. Build the Custom MCP Server

```bash
npm run build:mcp
```

### 5. Test MCP Servers

Start the custom MCP server:
```bash
npm run start:mcp
```

## Usage Examples

### Supabase MCP
- "Show me the structure of the movies table"
- "Query the users table to see recent signups"

### Sequel Tracker MCP
- "Add 'Dune: Part Two' to my want to watch list"
- "Update my progress on Breaking Bad to season 3 episode 5"
- "Show me my viewing statistics"

## Security Notes

1. **Read-only Mode**: Supabase MCP is configured in read-only mode for safety
2. **Environment Variables**: Keep API keys secure and never commit them to version control
3. **Development Only**: Use development/staging environments, not production databases
4. **Limited Scope**: Each MCP server is scoped to specific capabilities

## Troubleshooting

### MCP Server Not Starting
1. Ensure all required packages are installed: `npm install`
2. Check that API keys are correctly set in environment variables
3. Verify the build completed successfully: `npm run build:mcp`

### API Key Issues
1. Verify API keys are valid and not expired
2. Check rate limits for each service
3. Ensure correct permissions for Supabase access token

### Connection Issues
1. Restart Claude Desktop after configuration changes
2. Check the Claude Desktop logs for error messages
3. Verify the configuration file syntax is valid JSON

## Development

To develop or modify the custom Sequel Tracker MCP server:

1. Edit files in `mcp-server/src/`
2. Run in development mode: `npm run dev:mcp`
3. Test changes with: `npm run start:mcp`
4. Build for production: `npm run build:mcp`

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
