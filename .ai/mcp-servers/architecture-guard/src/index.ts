#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as path from 'path';
import * as fs from 'fs/promises';
import { z } from 'zod';

const server = new Server(
  {
    name: 'architecture-guard',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Architecture rules by level
const ARCHITECTURE_RULES = {
  rapid: {
    name: 'Flat Architecture',
    allowedImports: {
      routers: ['*'], // Can import anything
    },
    maxDependencies: Infinity,
  },
  balanced: {
    name: '3-Layer Architecture',
    allowedImports: {
      routers: ['services', 'validators'],
      services: ['repositories', 'validators'],
      repositories: ['database'],
    },
    maxDependencies: 10,
  },
  crafted: {
    name: 'Hexagonal Architecture',
    allowedImports: {
      domain: [], // ZERO external dependencies
      'use-cases': ['domain'],
      infrastructure: ['domain', 'external-libs'],
      api: ['use-cases', 'domain'],
    },
    maxDependencies: 5,
  },
};

// Schema definitions
const CheckDependenciesSchema = z.object({
  filePath: z.string().describe('Path to file to check'),
  level: z.enum(['rapid', 'balanced', 'crafted']).optional(),
});

const CheckBoundariesSchema = z.object({
  level: z.enum(['rapid', 'balanced', 'crafted']).optional(),
});

async function getProjectLevel(): Promise<'rapid' | 'balanced' | 'crafted'> {
  try {
    const configPath = path.join(process.cwd(), '.craftedrc.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return config.level || 'balanced';
  } catch {
    return 'balanced';
  }
}

async function analyzeImports(filePath: string): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract imports using regex
    const importRegex = /import\s+(?:[\w\s{},*]*\s+from\s+)?['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // Skip node_modules and relative imports to focus on architecture
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        continue;
      }

      imports.push(importPath);
    }

    return imports;
  } catch (error) {
    return [];
  }
}

function detectLayer(filePath: string): string {
  const normalized = filePath.toLowerCase();

  if (normalized.includes('/domain/')) return 'domain';
  if (normalized.includes('/use-cases/')) return 'use-cases';
  if (normalized.includes('/infrastructure/')) return 'infrastructure';
  if (normalized.includes('/api/') || normalized.includes('/routers/')) return 'api';
  if (normalized.includes('/services/')) return 'services';
  if (normalized.includes('/repositories/')) return 'repositories';

  return 'unknown';
}

function checkLayerViolation(
  layer: string,
  imports: string[],
  rules: any
): string[] {
  const violations: string[] = [];
  const allowedLayers = rules.allowedImports[layer] || [];

  if (allowedLayers.includes('*')) {
    return []; // No restrictions
  }

  for (const imp of imports) {
    const importLayer = detectLayer(imp);

    if (importLayer !== 'unknown' && !allowedLayers.includes(importLayer)) {
      violations.push(
        `Layer "${layer}" should not import from "${importLayer}" (imported: ${imp})`
      );
    }
  }

  return violations;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'check_dependencies',
        description: 'Check if a file respects architecture dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to file to check',
            },
            level: {
              type: 'string',
              enum: ['rapid', 'balanced', 'crafted'],
              description: 'Quality level (default: auto-detect)',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'check_layer_boundaries',
        description: 'Check all architecture layer boundaries in the project',
        inputSchema: {
          type: 'object',
          properties: {
            level: {
              type: 'string',
              enum: ['rapid', 'balanced', 'crafted'],
              description: 'Quality level (default: auto-detect)',
            },
          },
        },
      },
      {
        name: 'get_architecture_rules',
        description: 'Get architecture rules for a quality level',
        inputSchema: {
          type: 'object',
          properties: {
            level: {
              type: 'string',
              enum: ['rapid', 'balanced', 'crafted'],
              description: 'Quality level',
            },
          },
          required: ['level'],
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
      case 'check_dependencies': {
        const parsed = CheckDependenciesSchema.parse(args);
        const level = parsed.level || (await getProjectLevel());
        const rules = ARCHITECTURE_RULES[level];

        const fullPath = path.resolve(process.cwd(), parsed.filePath);
        const imports = await analyzeImports(fullPath);
        const layer = detectLayer(parsed.filePath);

        const violations = checkLayerViolation(layer, imports, rules);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  file: parsed.filePath,
                  layer,
                  level,
                  architecture: rules.name,
                  imports: imports.length,
                  violations: violations.length,
                  details: violations,
                  valid: violations.length === 0,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'check_layer_boundaries': {
        const parsed = CheckBoundariesSchema.parse(args);
        const level = parsed.level || (await getProjectLevel());
        const rules = ARCHITECTURE_RULES[level];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  level,
                  architecture: rules.name,
                  rules: rules.allowedImports,
                  message:
                    'Run check_dependencies on individual files to validate boundaries',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_architecture_rules': {
        const level = z
          .object({ level: z.enum(['rapid', 'balanced', 'crafted']) })
          .parse(args).level;
        const rules = ARCHITECTURE_RULES[level];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  level,
                  architecture: rules.name,
                  rules: rules.allowedImports,
                  maxDependencies: rules.maxDependencies,
                  description: {
                    rapid: 'Flat - No restrictions on imports',
                    balanced: '3-Layer - Routers → Services → Repositories',
                    crafted:
                      'Hexagonal - Domain has ZERO external dependencies',
                  }[level],
                },
                null,
                2
              ),
            },
          ],
        };
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
  console.error('Architecture Guard MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
