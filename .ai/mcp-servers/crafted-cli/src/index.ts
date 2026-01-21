#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import * as path from 'path';
import { z } from 'zod';

const server = new Server(
  {
    name: 'crafted-cli',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schema definitions
const AddRouterSchema = z.object({
  name: z.string().describe('Router name (e.g., "products", "users")'),
  package: z.string().optional().describe('Package name (default: "api")'),
});

const AddPageSchema = z.object({
  path: z.string().describe('Page path (e.g., "/dashboard", "/settings")'),
  app: z.string().optional().describe('App name (default: "web")'),
});

const AddComponentSchema = z.object({
  name: z.string().describe('Component name (e.g., "Button", "Card")'),
  type: z.enum(['ui', 'feature']).describe('Component type'),
  package: z.string().optional().describe('Package name'),
});

// Helper function to execute CLI commands
function executeCraftedCommand(command: string, args: string[]): string {
  try {
    const cliPath = path.join(process.cwd(), 'node_modules/.bin/crafted');
    const fullCommand = `${cliPath} ${command} ${args.join(' ')}`;

    const output = execSync(fullCommand, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return output;
  } catch (error: any) {
    throw new Error(`CLI command failed: ${error.message}\n${error.stderr || ''}`);
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_router',
        description: 'Add a new tRPC router to the API package',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Router name (e.g., "products", "users")',
            },
            package: {
              type: 'string',
              description: 'Package name (default: "api")',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'add_page',
        description: 'Add a new page to the Next.js app',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Page path (e.g., "/dashboard", "/settings")',
            },
            app: {
              type: 'string',
              description: 'App name (default: "web")',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'add_component',
        description: 'Add a new component to the UI package',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (e.g., "Button", "Card")',
            },
            type: {
              type: 'string',
              enum: ['ui', 'feature'],
              description: 'Component type (ui or feature)',
            },
            package: {
              type: 'string',
              description: 'Package name',
            },
          },
          required: ['name', 'type'],
        },
      },
      {
        name: 'detect_template',
        description: 'Detect which Crafted template is being used in the project',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'add_router': {
        const parsed = AddRouterSchema.parse(args);
        const cmdArgs = [parsed.name];
        if (parsed.package) cmdArgs.push('--package', parsed.package);

        const output = executeCraftedCommand('add:router', cmdArgs);

        return {
          content: [
            {
              type: 'text',
              text: `Router "${parsed.name}" added successfully!\n\n${output}`,
            },
          ],
        };
      }

      case 'add_page': {
        const parsed = AddPageSchema.parse(args);
        const cmdArgs = [parsed.path];
        if (parsed.app) cmdArgs.push('--app', parsed.app);

        const output = executeCraftedCommand('add:page', cmdArgs);

        return {
          content: [
            {
              type: 'text',
              text: `Page "${parsed.path}" added successfully!\n\n${output}`,
            },
          ],
        };
      }

      case 'add_component': {
        const parsed = AddComponentSchema.parse(args);
        const cmdArgs = [parsed.name, '--type', parsed.type];
        if (parsed.package) cmdArgs.push('--package', parsed.package);

        const output = executeCraftedCommand('add:component', cmdArgs);

        return {
          content: [
            {
              type: 'text',
              text: `Component "${parsed.name}" added successfully!\n\n${output}`,
            },
          ],
        };
      }

      case 'detect_template': {
        // Read .craftedrc.json to detect template
        const fs = await import('fs/promises');
        const configPath = path.join(process.cwd(), '.craftedrc.json');

        try {
          const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  template: config.template || 'unknown',
                  level: config.level || 'unknown',
                  platform: config.platform || 'unknown',
                  version: config.version || 'unknown',
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: 'No .craftedrc.json found. This might not be a Crafted project.',
              },
            ],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Crafted CLI MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
