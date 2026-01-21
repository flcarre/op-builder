import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectContext, ProjectFile, loadProjectContext } from './loader.js';

export interface UpdateResult {
  updated: boolean;
  filesAdded: string[];
  filesModified: string[];
  filesRemoved: string[];
  newContext: ProjectContext;
}

/**
 * Updates context selectively by checking file modifications
 * @param currentContext - Current context to update
 * @param projectPath - Project root path
 * @returns Updated context with only changed files reloaded
 */
export async function updateContext(
  currentContext: ProjectContext,
  projectPath: string
): Promise<UpdateResult> {
  const filesAdded: string[] = [];
  const filesModified: string[] = [];
  const filesRemoved: string[] = [];

  // Create a map of current files for quick lookup
  const currentFilesMap = new Map<string, ProjectFile>();
  currentContext.files.forEach((file) => {
    currentFilesMap.set(file.path, file);
  });

  // Load fresh context to compare
  const freshContext = await loadProjectContext(projectPath);

  // Create a map of fresh files
  const freshFilesMap = new Map<string, ProjectFile>();
  freshContext.files.forEach((file) => {
    freshFilesMap.set(file.path, file);
  });

  // Check for added and modified files
  for (const [filePath, freshFile] of freshFilesMap.entries()) {
    const currentFile = currentFilesMap.get(filePath);

    if (!currentFile) {
      // New file
      filesAdded.push(filePath);
    } else if (freshFile.lastModified !== currentFile.lastModified) {
      // Modified file
      filesModified.push(filePath);
    }
  }

  // Check for removed files
  for (const filePath of currentFilesMap.keys()) {
    if (!freshFilesMap.has(filePath)) {
      filesRemoved.push(filePath);
    }
  }

  const updated = filesAdded.length > 0 || filesModified.length > 0 || filesRemoved.length > 0;

  return {
    updated,
    filesAdded,
    filesModified,
    filesRemoved,
    newContext: freshContext,
  };
}

/**
 * Updates a single file in the context
 * @param context - Current context
 * @param projectPath - Project root path
 * @param relativePath - Relative path of file to update
 * @returns Updated context
 */
export async function updateSingleFile(
  context: ProjectContext,
  projectPath: string,
  relativePath: string
): Promise<ProjectContext> {
  const fullPath = path.join(projectPath, relativePath);

  try {
    const stats = await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf-8');

    const newFile: ProjectFile = {
      path: relativePath,
      content,
      size: stats.size,
      lastModified: stats.mtimeMs,
    };

    // Find and replace or add file
    const fileIndex = context.files.findIndex((f) => f.path === relativePath);

    if (fileIndex >= 0) {
      // Update existing file
      context.files[fileIndex] = newFile;
    } else {
      // Add new file
      context.files.push(newFile);
    }

    // Recalculate stats
    context.stats.totalFiles = context.files.length;
    context.stats.totalSize = context.files.reduce((sum, f) => sum + f.size, 0);
    context.stats.totalTokens = context.files.reduce(
      (sum, f) => sum + Math.ceil(f.content.length / 4),
      0
    );
    context.timestamp = Date.now();

    return context;
  } catch (error) {
    console.error(`Error updating file ${relativePath}:`, error);
    return context;
  }
}

/**
 * Removes a file from the context
 * @param context - Current context
 * @param relativePath - Relative path of file to remove
 * @returns Updated context
 */
export function removeFile(context: ProjectContext, relativePath: string): ProjectContext {
  const fileIndex = context.files.findIndex((f) => f.path === relativePath);

  if (fileIndex >= 0) {
    context.files.splice(fileIndex, 1);

    // Recalculate stats
    context.stats.totalFiles = context.files.length;
    context.stats.totalSize = context.files.reduce((sum, f) => sum + f.size, 0);
    context.stats.totalTokens = context.files.reduce(
      (sum, f) => sum + Math.ceil(f.content.length / 4),
      0
    );
    context.timestamp = Date.now();
  }

  return context;
}

/**
 * Gets context update summary
 */
export function getUpdateSummary(result: UpdateResult): string {
  if (!result.updated) {
    return 'No changes detected';
  }

  const parts: string[] = [];

  if (result.filesAdded.length > 0) {
    parts.push(`${result.filesAdded.length} added`);
  }

  if (result.filesModified.length > 0) {
    parts.push(`${result.filesModified.length} modified`);
  }

  if (result.filesRemoved.length > 0) {
    parts.push(`${result.filesRemoved.length} removed`);
  }

  return parts.join(', ');
}
