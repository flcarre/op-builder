import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

export interface ProjectFile {
  path: string;
  content: string;
  size: number;
  lastModified: number;
}

export interface ProjectContext {
  files: ProjectFile[];
  architecture: {
    level: 'rapid' | 'balanced' | 'crafted';
    platform: 'web' | 'web+mobile';
    packages: string[];
    apps: string[];
  };
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };
  stats: {
    totalFiles: number;
    totalSize: number;
    totalTokens: number;
    loadTime: number;
  };
  timestamp: number;
}

const INCLUDE_PATTERNS = [
  'src/**/*.ts',
  'src/**/*.tsx',
  '*.config.ts',
  '*.config.js',
  'package.json',
  'README.md',
  'docs/**/*.md',
  'apps/*/src/**/*.ts',
  'apps/*/src/**/*.tsx',
  'packages/*/src/**/*.ts',
  'packages/*/src/**/*.tsx',
  '.craftedrc.json',
  'CLAUDE.md',
];

const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/build/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/.git/**',
  '**/coverage/**',
];

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const MAX_TOTAL_TOKENS = 200_000;

/**
 * Scans project and loads all relevant source files
 * @param projectPath - Root path of the project
 * @returns ProjectContext with all files and metadata
 */
export async function loadProjectContext(projectPath: string): Promise<ProjectContext> {
  const startTime = Date.now();

  const files: ProjectFile[] = [];
  let totalSize = 0;
  let totalTokens = 0;

  // Find all matching files
  const matchedFiles = await glob(INCLUDE_PATTERNS, {
    cwd: projectPath,
    ignore: EXCLUDE_PATTERNS,
    nodir: true,
    absolute: false,
  });

  // Load files
  for (const relativePath of matchedFiles) {
    const fullPath = path.join(projectPath, relativePath);

    try {
      const stats = await fs.stat(fullPath);

      // Skip files that are too large
      if (stats.size > MAX_FILE_SIZE) {
        console.warn(`Skipping large file: ${relativePath} (${stats.size} bytes)`);
        continue;
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      const fileTokens = estimateTokens(content);

      // Stop if we're approaching token limit
      if (totalTokens + fileTokens > MAX_TOTAL_TOKENS) {
        console.warn(`Approaching token limit, skipping remaining files`);
        break;
      }

      files.push({
        path: relativePath,
        content,
        size: stats.size,
        lastModified: stats.mtimeMs,
      });

      totalSize += stats.size;
      totalTokens += fileTokens;
    } catch (error) {
      console.error(`Error loading file ${relativePath}:`, error);
    }
  }

  // Analyze architecture
  const architecture = await analyzeArchitecture(projectPath, files);

  // Extract dependencies
  const dependencies = await extractDependencies(projectPath);

  const loadTime = Date.now() - startTime;

  return {
    files,
    architecture,
    dependencies,
    stats: {
      totalFiles: files.length,
      totalSize,
      totalTokens,
      loadTime,
    },
    timestamp: Date.now(),
  };
}

/**
 * Estimates token count for text (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Analyzes project architecture by reading .craftedrc.json and scanning structure
 */
async function analyzeArchitecture(
  projectPath: string,
  files: ProjectFile[]
): Promise<ProjectContext['architecture']> {
  // Read .craftedrc.json
  const craftedrcFile = files.find((f) => f.path === '.craftedrc.json');
  let level: 'rapid' | 'balanced' | 'crafted' = 'rapid';
  let platform: 'web' | 'web+mobile' = 'web';

  if (craftedrcFile) {
    try {
      const config = JSON.parse(craftedrcFile.content);
      level = config.project?.level || 'rapid';
      platform = config.project?.platform || 'web';
    } catch (error) {
      console.error('Error parsing .craftedrc.json:', error);
    }
  }

  // Scan for packages and apps
  const packages: string[] = [];
  const apps: string[] = [];

  try {
    const packagesDir = path.join(projectPath, 'packages');
    const packagesDirs = await fs.readdir(packagesDir, { withFileTypes: true });
    packages.push(...packagesDirs.filter((d) => d.isDirectory()).map((d) => d.name));
  } catch {
    // packages directory doesn't exist
  }

  try {
    const appsDir = path.join(projectPath, 'apps');
    const appsDirs = await fs.readdir(appsDir, { withFileTypes: true });
    apps.push(...appsDirs.filter((d) => d.isDirectory()).map((d) => d.name));
  } catch {
    // apps directory doesn't exist
  }

  return {
    level,
    platform,
    packages,
    apps,
  };
}

/**
 * Extracts dependencies from package.json
 */
async function extractDependencies(projectPath: string): Promise<ProjectContext['dependencies']> {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    return {
      production: packageJson.dependencies || {},
      development: packageJson.devDependencies || {},
    };
  } catch (error) {
    console.error('Error reading package.json:', error);
    return {
      production: {},
      development: {},
    };
  }
}

/**
 * Gets a summary of the project context (without full file contents)
 */
export function getContextSummary(context: ProjectContext): string {
  const { architecture, stats } = context;

  return `
# Project Context Summary

## Architecture
- Level: ${architecture.level}
- Platform: ${architecture.platform}
- Apps: ${architecture.apps.join(', ') || 'none'}
- Packages: ${architecture.packages.join(', ') || 'none'}

## Statistics
- Total Files: ${stats.totalFiles}
- Total Size: ${(stats.totalSize / 1024).toFixed(2)} KB
- Estimated Tokens: ${stats.totalTokens.toLocaleString()}
- Load Time: ${stats.loadTime}ms

## Dependencies
- Production: ${Object.keys(context.dependencies.production).length}
- Development: ${Object.keys(context.dependencies.development).length}

## Key Files
${context.files
  .slice(0, 20)
  .map((f) => `- ${f.path} (${(f.size / 1024).toFixed(2)} KB)`)
  .join('\n')}
${context.files.length > 20 ? `\n... and ${context.files.length - 20} more files` : ''}
`.trim();
}
