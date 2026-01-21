#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs/promises';
import { z } from 'zod';

const server = new Server(
  {
    name: 'typescript',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const CheckTypesSchema = z.object({
  projectPath: z.string().optional(),
  files: z.array(z.string()).optional(),
});

const CompileSchema = z.object({
  projectPath: z.string().optional(),
  outDir: z.string().optional(),
});

const GenerateTypesSchema = z.object({
  filePath: z.string(),
});

async function findTsConfig(projectPath: string): Promise<string | null> {
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');
  try {
    await fs.access(tsconfigPath);
    return tsconfigPath;
  } catch {
    return null;
  }
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  if (diagnostic.file && diagnostic.start !== undefined) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start
    );
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n'
    );
    return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
  } else {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  }
}

async function checkTypes(
  projectPath: string,
  files?: string[]
): Promise<{ errors: string[]; warnings: string[]; success: boolean }> {
  const tsconfigPath = await findTsConfig(projectPath);

  if (!tsconfigPath) {
    return {
      errors: ['No tsconfig.json found in project'],
      warnings: [],
      success: false,
    };
  }

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    return {
      errors: [formatDiagnostic(configFile.error)],
      warnings: [],
      success: false,
    };
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );

  const fileNames = files || parsedConfig.fileNames;

  const program = ts.createProgram(fileNames, parsedConfig.options);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  const errors: string[] = [];
  const warnings: string[] = [];

  diagnostics.forEach((diagnostic) => {
    const formatted = formatDiagnostic(diagnostic);
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      errors.push(formatted);
    } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
      warnings.push(formatted);
    }
  });

  return {
    errors,
    warnings,
    success: errors.length === 0,
  };
}

async function compile(
  projectPath: string,
  outDir?: string
): Promise<{ success: boolean; errors: string[]; outputFiles: string[] }> {
  const tsconfigPath = await findTsConfig(projectPath);

  if (!tsconfigPath) {
    return {
      success: false,
      errors: ['No tsconfig.json found in project'],
      outputFiles: [],
    };
  }

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    return {
      success: false,
      errors: [formatDiagnostic(configFile.error)],
      outputFiles: [],
    };
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );

  if (outDir) {
    parsedConfig.options.outDir = outDir;
  }

  const program = ts.createProgram(
    parsedConfig.fileNames,
    parsedConfig.options
  );

  const emitResult = program.emit();
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  const errors: string[] = [];
  diagnostics.forEach((diagnostic) => {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      errors.push(formatDiagnostic(diagnostic));
    }
  });

  const outputFiles: string[] = [];
  if (parsedConfig.options.outDir) {
    try {
      const files = await fs.readdir(parsedConfig.options.outDir);
      outputFiles.push(...files.map((f) => path.join(parsedConfig.options.outDir!, f)));
    } catch {
      // outDir might not exist yet
    }
  }

  return {
    success: errors.length === 0 && !emitResult.emitSkipped,
    errors,
    outputFiles,
  };
}

async function generateTypes(filePath: string): Promise<{ types: string; success: boolean }> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const types: string[] = [];

    function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        const start = node.getStart(sourceFile);
        const end = node.getEnd();
        types.push(content.substring(start, end));
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return {
      types: types.join('\n\n'),
      success: true,
    };
  } catch (error: any) {
    return {
      types: '',
      success: false,
    };
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'check_types',
        description: 'Type-check TypeScript project or specific files',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Project root path (default: cwd)',
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific files to check (default: all)',
            },
          },
        },
      },
      {
        name: 'compile',
        description: 'Compile TypeScript project',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Project root path (default: cwd)',
            },
            outDir: {
              type: 'string',
              description: 'Output directory (default: tsconfig outDir)',
            },
          },
        },
      },
      {
        name: 'generate_types',
        description: 'Extract type definitions from a TypeScript file',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to TypeScript file',
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'check_types': {
        const parsed = CheckTypesSchema.parse(args);
        const projectPath = parsed.projectPath || process.cwd();
        const result = await checkTypes(projectPath, parsed.files);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  errors: result.errors,
                  warnings: result.warnings,
                  summary: result.success
                    ? 'No type errors found'
                    : `Found ${result.errors.length} error(s)`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'compile': {
        const parsed = CompileSchema.parse(args);
        const projectPath = parsed.projectPath || process.cwd();
        const result = await compile(projectPath, parsed.outDir);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  errors: result.errors,
                  outputFiles: result.outputFiles,
                  summary: result.success
                    ? `Compiled successfully. Generated ${result.outputFiles.length} files`
                    : `Compilation failed with ${result.errors.length} error(s)`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'generate_types': {
        const parsed = GenerateTypesSchema.parse(args);
        const result = await generateTypes(parsed.filePath);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  types: result.types,
                  file: parsed.filePath,
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
  console.error('TypeScript MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
