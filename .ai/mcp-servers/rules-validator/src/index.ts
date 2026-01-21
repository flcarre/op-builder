#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as path from 'path';
import { z } from 'zod';

const server = new Server(
  {
    name: 'rules-validator',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Level-specific rules
const RULES = {
  rapid: {
    maxLinesPerFunction: 100,
    maxParameters: Infinity,
    duplicationThreshold: 3,
    maxCyclomaticComplexity: Infinity,
    requiresComments: false,
  },
  balanced: {
    maxLinesPerFunction: 50,
    maxParameters: 3,
    duplicationThreshold: 2,
    maxCyclomaticComplexity: 10,
    requiresComments: true,
  },
  crafted: {
    maxLinesPerFunction: 20,
    maxParameters: 2,
    duplicationThreshold: 0,
    maxCyclomaticComplexity: 5,
    requiresComments: true,
  },
};

// Schema definitions
const ValidateCodeSchema = z.object({
  code: z.string().describe('The code to validate'),
  filePath: z.string().optional().describe('File path for context'),
  level: z.enum(['rapid', 'balanced', 'crafted']).optional().describe('Quality level (default: auto-detect from .craftedrc.json)'),
});

const CheckCoverageSchema = z.object({
  testPath: z.string().describe('Path to test directory'),
  level: z.enum(['rapid', 'balanced', 'crafted']).optional(),
});

// Validation functions
function countLines(code: string): number {
  return code.split('\n').length;
}

function extractFunctions(code: string): Array<{ name: string; lines: number; params: number }> {
  const functions: Array<{ name: string; lines: number; params: number }> = [];

  // Simple regex to find function declarations
  const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:async\s*)?\(([^)]*)\)/g;
  let match;

  while ((match = functionRegex.exec(code)) !== null) {
    const name = match[1];
    const params = match[2].split(',').filter(p => p.trim()).length;

    // Count lines (simplified - would need proper AST parsing for accuracy)
    const startIndex = match.index;
    const endIndex = code.indexOf('}', startIndex);
    if (endIndex > startIndex) {
      const functionCode = code.substring(startIndex, endIndex + 1);
      const lines = countLines(functionCode);
      functions.push({ name, lines, params });
    }
  }

  return functions;
}

function calculateCyclomaticComplexity(code: string): number {
  // Simplified: count decision points
  const decisionPoints = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b\?\s*:/g, // ternary
    /&&/g,
    /\|\|/g,
  ];

  let complexity = 1; // Base complexity
  for (const pattern of decisionPoints) {
    const matches = code.match(pattern);
    if (matches) complexity += matches.length;
  }

  return complexity;
}

async function getProjectLevel(): Promise<'rapid' | 'balanced' | 'crafted'> {
  try {
    const fs = await import('fs/promises');
    const configPath = path.join(process.cwd(), '.craftedrc.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return config.level || 'balanced';
  } catch {
    return 'balanced'; // Default
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'validate_code',
        description: 'Validate code against Crafted quality rules',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The code to validate',
            },
            filePath: {
              type: 'string',
              description: 'File path for context',
            },
            level: {
              type: 'string',
              enum: ['rapid', 'balanced', 'crafted'],
              description: 'Quality level (default: auto-detect)',
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'get_rules',
        description: 'Get the rules for a specific quality level',
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
      {
        name: 'check_test_coverage',
        description: 'Check if test coverage meets the level requirements',
        inputSchema: {
          type: 'object',
          properties: {
            testPath: {
              type: 'string',
              description: 'Path to test directory',
            },
            level: {
              type: 'string',
              enum: ['rapid', 'balanced', 'crafted'],
              description: 'Quality level',
            },
          },
          required: ['testPath'],
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
      case 'validate_code': {
        const parsed = ValidateCodeSchema.parse(args);
        const level = parsed.level || await getProjectLevel();
        const rules = RULES[level];

        const violations: string[] = [];
        const warnings: string[] = [];

        // Check function length
        const functions = extractFunctions(parsed.code);
        for (const func of functions) {
          if (func.lines > rules.maxLinesPerFunction) {
            violations.push(
              `Function "${func.name}" has ${func.lines} lines (max: ${rules.maxLinesPerFunction})`
            );
          }

          if (rules.maxParameters < Infinity && func.params > rules.maxParameters) {
            violations.push(
              `Function "${func.name}" has ${func.params} parameters (max: ${rules.maxParameters})`
            );
          }
        }

        // Check cyclomatic complexity
        const complexity = calculateCyclomaticComplexity(parsed.code);
        if (rules.maxCyclomaticComplexity < Infinity && complexity > rules.maxCyclomaticComplexity) {
          violations.push(
            `Cyclomatic complexity is ${complexity} (max: ${rules.maxCyclomaticComplexity})`
          );
        }

        // Check for inline comments (should not exist)
        const inlineComments = parsed.code.match(/\/\/.+$/gm) || [];
        if (inlineComments.length > 0) {
          warnings.push(
            `Found ${inlineComments.length} inline comments. Consider refactoring for self-documenting code.`
          );
        }

        const result = {
          level,
          valid: violations.length === 0,
          violations,
          warnings,
          stats: {
            totalLines: countLines(parsed.code),
            functions: functions.length,
            complexity,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_rules': {
        const level = z.object({ level: z.enum(['rapid', 'balanced', 'crafted']) }).parse(args).level;
        const rules = RULES[level];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                level,
                rules,
                description: {
                  rapid: 'Ship Fast - Code qui fonctionne > Code parfait',
                  balanced: 'Pragmatic Quality - Qualité où ça compte',
                  crafted: 'Software Craftsmanship - Build it right',
                }[level],
              }, null, 2),
            },
          ],
        };
      }

      case 'check_test_coverage': {
        const parsed = CheckCoverageSchema.parse(args);
        const level = parsed.level || await getProjectLevel();

        const requiredCoverage = {
          rapid: 0,
          balanced: 70,
          crafted: 100,
        }[level];

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                level,
                requiredCoverage: `${requiredCoverage}%`,
                message: `For ${level} level, ${requiredCoverage}% coverage is required`,
                note: 'Run your test suite with coverage enabled to check actual coverage',
              }, null, 2),
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
  console.error('Rules Validator MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
