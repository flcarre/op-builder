#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadProjectContext, getContextSummary, ProjectContext } from './loader.js';
import { createCache } from './cache.js';
import { updateContext } from './updater.js';

let cachedContext: ProjectContext | null = null;
const projectPath = process.cwd();
const cache = createCache(projectPath);

/**
 * Gets or loads project context with caching
 */
async function getContext(): Promise<ProjectContext> {
  if (cachedContext) {
    return cachedContext;
  }

  // Try to load from cache
  const cached = await cache.load();
  if (cached) {
    console.error('[Context MCP] Loaded from cache');
    cachedContext = cached;
    return cached;
  }

  // Load fresh context
  console.error('[Context MCP] Loading fresh context...');
  const context = await loadProjectContext(projectPath);

  // Save to cache
  await cache.save(context);

  cachedContext = context;
  return context;
}

/**
 * Refreshes context from disk
 */
async function refreshContext(): Promise<ProjectContext> {
  console.error('[Context MCP] Refreshing context...');

  if (cachedContext) {
    const updateResult = await updateContext(cachedContext, projectPath);

    if (updateResult.updated) {
      console.error(
        `[Context MCP] Updated: ${updateResult.filesAdded.length} added, ${updateResult.filesModified.length} modified, ${updateResult.filesRemoved.length} removed`
      );
      cachedContext = updateResult.newContext;
      await cache.save(cachedContext);
    } else {
      console.error('[Context MCP] No changes detected');
    }

    return cachedContext;
  }

  return await getContext();
}

const server = new Server(
  {
    name: 'crafted-context',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_full_context',
        description:
          'Get complete project context with all source files (150-200K tokens). Use this to understand the entire codebase.',
        inputSchema: {
          type: 'object',
          properties: {
            refresh: {
              type: 'boolean',
              description: 'Force refresh from disk (default: false, uses cache)',
              default: false,
            },
          },
        },
      },
      {
        name: 'search_in_context',
        description: 'Search for files or content patterns in the project context',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (filename or content pattern)',
            },
            type: {
              type: 'string',
              enum: ['filename', 'content', 'both'],
              description: 'Search type',
              default: 'both',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_architecture_info',
        description:
          'Get architecture information (level, platform, packages, apps, dependencies)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_file_content',
        description: 'Get content of a specific file from context',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to the file',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'get_context_summary',
        description: 'Get a summary of project context (stats, key files, architecture)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('Missing arguments');
  }

  switch (name) {
    case 'get_full_context': {
      const context = args.refresh ? await refreshContext() : await getContext();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(context, null, 2),
          },
        ],
      };
    }

    case 'search_in_context': {
      const context = await getContext();
      const query = (args.query as string).toLowerCase();
      const searchType = (args.type as 'filename' | 'content' | 'both') || 'both';

      const results = context.files.filter((file) => {
        if (searchType === 'filename' || searchType === 'both') {
          if (file.path.toLowerCase().includes(query)) {
            return true;
          }
        }

        if (searchType === 'content' || searchType === 'both') {
          if (file.content.toLowerCase().includes(query)) {
            return true;
          }
        }

        return false;
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query,
                results: results.map((f) => ({
                  path: f.path,
                  size: f.size,
                  preview: f.content.substring(0, 200),
                })),
                total: results.length,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'get_architecture_info': {
      const context = await getContext();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                architecture: context.architecture,
                dependencies: {
                  production: Object.keys(context.dependencies.production),
                  development: Object.keys(context.dependencies.development),
                },
                stats: context.stats,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'get_file_content': {
      const context = await getContext();
      const filePath = args.path as string;

      const file = context.files.find((f) => f.path === filePath);

      if (!file) {
        throw new Error(`File not found: ${filePath}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: file.content,
          },
        ],
      };
    }

    case 'get_context_summary': {
      const context = await getContext();

      return {
        content: [
          {
            type: 'text',
            text: getContextSummary(context),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'crafted://context/full',
        name: 'Full Project Context',
        description: 'Complete project context with all files (150-200K tokens)',
        mimeType: 'application/json',
      },
      {
        uri: 'crafted://context/summary',
        name: 'Context Summary',
        description: 'Summary of project context (architecture, stats, key files)',
        mimeType: 'text/markdown',
      },
      {
        uri: 'crafted://context/architecture',
        name: 'Architecture Info',
        description: 'Project architecture information',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'crafted://context/full') {
    const context = await getContext();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(context, null, 2),
        },
      ],
    };
  }

  if (uri === 'crafted://context/summary') {
    const context = await getContext();
    return {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: getContextSummary(context),
        },
      ],
    };
  }

  if (uri === 'crafted://context/architecture') {
    const context = await getContext();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              architecture: context.architecture,
              dependencies: context.dependencies,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Crafted Context MCP Server running on stdio');
}

runServer().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
