#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { z } from 'zod';

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'vitest',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const RunTestsSchema = z.object({
  projectPath: z.string().optional(),
  pattern: z.string().optional(),
  watch: z.boolean().optional(),
});

const CheckCoverageSchema = z.object({
  projectPath: z.string().optional(),
  threshold: z.number().optional(),
});

const RunSpecificTestSchema = z.object({
  projectPath: z.string().optional(),
  testFile: z.string(),
});

interface TestResult {
  success: boolean;
  output: string;
  tests?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  coverage?: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
}

async function findVitestConfig(projectPath: string): Promise<boolean> {
  const configs = [
    'vitest.config.ts',
    'vitest.config.js',
    'vite.config.ts',
    'vite.config.js',
  ];

  for (const config of configs) {
    try {
      await fs.access(path.join(projectPath, config));
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

async function runTests(
  projectPath: string,
  pattern?: string,
  watch = false
): Promise<TestResult> {
  const hasConfig = await findVitestConfig(projectPath);

  if (!hasConfig) {
    return {
      success: false,
      output: 'No vitest configuration found (vitest.config.ts or vite.config.ts)',
    };
  }

  const args = ['vitest', 'run'];
  if (pattern) args.push(pattern);
  if (watch) args.push('--watch');

  try {
    const { stdout, stderr } = await execAsync(args.join(' '), {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024,
    });

    const output = stdout + stderr;
    const testStats = parseTestOutput(output);

    return {
      success: testStats.failed === 0,
      output,
      tests: testStats,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.message + '\n' + (error.stdout || '') + (error.stderr || ''),
    };
  }
}

async function checkCoverage(
  projectPath: string,
  threshold?: number
): Promise<TestResult> {
  const hasConfig = await findVitestConfig(projectPath);

  if (!hasConfig) {
    return {
      success: false,
      output: 'No vitest configuration found',
    };
  }

  try {
    const { stdout, stderr } = await execAsync('vitest run --coverage', {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024,
    });

    const output = stdout + stderr;
    const coverage = parseCoverageOutput(output);

    const meetsThreshold = threshold
      ? coverage.lines >= threshold
      : true;

    return {
      success: meetsThreshold,
      output,
      coverage,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.message + '\n' + (error.stdout || '') + (error.stderr || ''),
    };
  }
}

async function runSpecificTest(
  projectPath: string,
  testFile: string
): Promise<TestResult> {
  const hasConfig = await findVitestConfig(projectPath);

  if (!hasConfig) {
    return {
      success: false,
      output: 'No vitest configuration found',
    };
  }

  try {
    const { stdout, stderr } = await execAsync(`vitest run ${testFile}`, {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024,
    });

    const output = stdout + stderr;
    const testStats = parseTestOutput(output);

    return {
      success: testStats.failed === 0,
      output,
      tests: testStats,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.message + '\n' + (error.stdout || '') + (error.stderr || ''),
    };
  }
}

function parseTestOutput(output: string): {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
} {
  const passedMatch = output.match(/(\d+) passed/);
  const failedMatch = output.match(/(\d+) failed/);
  const skippedMatch = output.match(/(\d+) skipped/);
  const totalMatch = output.match(/Test Files\s+\d+\s+passed.*?\((\d+)\)/);

  const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
  const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
  const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
  const total = totalMatch ? parseInt(totalMatch[1]) : passed + failed + skipped;

  return { total, passed, failed, skipped };
}

function parseCoverageOutput(output: string): {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
} {
  const linesMatch = output.match(/Lines\s+:\s+([\d.]+)%/);
  const statementsMatch = output.match(/Statements\s+:\s+([\d.]+)%/);
  const functionsMatch = output.match(/Functions\s+:\s+([\d.]+)%/);
  const branchesMatch = output.match(/Branches\s+:\s+([\d.]+)%/);

  return {
    lines: linesMatch ? parseFloat(linesMatch[1]) : 0,
    statements: statementsMatch ? parseFloat(statementsMatch[1]) : 0,
    functions: functionsMatch ? parseFloat(functionsMatch[1]) : 0,
    branches: branchesMatch ? parseFloat(branchesMatch[1]) : 0,
  };
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'run_tests',
        description: 'Run Vitest tests in the project',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Project root path (default: cwd)',
            },
            pattern: {
              type: 'string',
              description: 'Test file pattern (e.g., "user")',
            },
            watch: {
              type: 'boolean',
              description: 'Run in watch mode (default: false)',
            },
          },
        },
      },
      {
        name: 'check_coverage',
        description: 'Run tests with coverage report',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Project root path (default: cwd)',
            },
            threshold: {
              type: 'number',
              description: 'Minimum coverage threshold % (e.g., 70)',
            },
          },
        },
      },
      {
        name: 'run_specific_test',
        description: 'Run a specific test file',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Project root path (default: cwd)',
            },
            testFile: {
              type: 'string',
              description: 'Path to test file',
            },
          },
          required: ['testFile'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'run_tests': {
        const parsed = RunTestsSchema.parse(args);
        const projectPath = parsed.projectPath || process.cwd();
        const result = await runTests(projectPath, parsed.pattern, parsed.watch);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  tests: result.tests,
                  output: result.output,
                  summary: result.tests
                    ? `${result.tests.passed}/${result.tests.total} tests passed`
                    : 'No test results',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'check_coverage': {
        const parsed = CheckCoverageSchema.parse(args);
        const projectPath = parsed.projectPath || process.cwd();
        const result = await checkCoverage(projectPath, parsed.threshold);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  coverage: result.coverage,
                  output: result.output,
                  summary: result.coverage
                    ? `Coverage: ${result.coverage.lines}% lines, ${result.coverage.statements}% statements`
                    : 'No coverage data',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'run_specific_test': {
        const parsed = RunSpecificTestSchema.parse(args);
        const projectPath = parsed.projectPath || process.cwd();
        const result = await runSpecificTest(projectPath, parsed.testFile);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  tests: result.tests,
                  output: result.output,
                  testFile: parsed.testFile,
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Vitest MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
