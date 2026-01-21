import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { ProjectContext } from './loader.js';
import { FSWatcher, watch } from 'fs';

const CACHE_DIR = '.ai/.cache';
const CACHE_FILE = 'context.json';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export class ContextCache {
  private cachePath: string;
  private watcher: FSWatcher | null = null;
  private watchedPaths: Set<string> = new Set();

  constructor(private projectPath: string) {
    this.cachePath = path.join(projectPath, CACHE_DIR, CACHE_FILE);
  }

  /**
   * Gets cache file path
   */
  getCachePath(): string {
    return this.cachePath;
  }

  /**
   * Saves context to cache
   */
  async save(context: ProjectContext): Promise<void> {
    const cacheDir = path.dirname(this.cachePath);

    // Ensure cache directory exists
    await fs.mkdir(cacheDir, { recursive: true });

    // Add metadata
    const cacheData = {
      ...context,
      cachedAt: Date.now(),
      hash: this.calculateHash(context),
    };

    await fs.writeFile(this.cachePath, JSON.stringify(cacheData, null, 2), 'utf-8');
  }

  /**
   * Loads context from cache if valid
   */
  async load(): Promise<ProjectContext | null> {
    try {
      const cacheContent = await fs.readFile(this.cachePath, 'utf-8');
      const cacheData = JSON.parse(cacheContent);

      // Check if cache is too old
      const age = Date.now() - (cacheData.cachedAt || 0);
      if (age > CACHE_MAX_AGE) {
        console.log('Cache expired, needs refresh');
        return null;
      }

      // Remove metadata before returning
      const { cachedAt, hash, ...context } = cacheData;

      return context as ProjectContext;
    } catch (error) {
      // Cache doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Checks if cache exists and is valid
   */
  async isValid(): Promise<boolean> {
    try {
      await fs.access(this.cachePath);
      const cached = await this.load();
      return cached !== null;
    } catch {
      return false;
    }
  }

  /**
   * Invalidates cache
   */
  async invalidate(): Promise<void> {
    try {
      await fs.unlink(this.cachePath);
    } catch {
      // Cache file doesn't exist, nothing to do
    }
  }

  /**
   * Calculates hash of context for change detection
   */
  private calculateHash(context: ProjectContext): string {
    const data = JSON.stringify({
      files: context.files.map((f) => ({
        path: f.path,
        size: f.size,
        lastModified: f.lastModified,
      })),
      architecture: context.architecture,
    });

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Starts watching project files for changes
   */
  startWatching(onChange: () => void): void {
    if (this.watcher) {
      console.warn('Already watching files');
      return;
    }

    const watchPaths = [
      path.join(this.projectPath, 'src'),
      path.join(this.projectPath, 'apps'),
      path.join(this.projectPath, 'packages'),
      path.join(this.projectPath, '.craftedrc.json'),
      path.join(this.projectPath, 'package.json'),
    ];

    // Check which paths exist
    watchPaths.forEach((watchPath) => {
      fs.access(watchPath)
        .then(() => {
          const watcher = watch(
            watchPath,
            { recursive: true },
            (eventType, filename) => {
              if (filename) {
                // Ignore certain file changes
                if (
                  filename.includes('node_modules') ||
                  filename.includes('.next') ||
                  filename.includes('dist') ||
                  filename.endsWith('.test.ts') ||
                  filename.endsWith('.spec.ts')
                ) {
                  return;
                }

                console.log(`File changed: ${filename}`);
                this.invalidate().then(() => onChange());
              }
            }
          );

          this.watchedPaths.add(watchPath);
        })
        .catch(() => {
          // Path doesn't exist, skip
        });
    });

    console.log(`Watching ${this.watchedPaths.size} paths for changes`);
  }

  /**
   * Stops watching files
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.watchedPaths.clear();
    }
  }
}

/**
 * Creates a new cache instance
 */
export function createCache(projectPath: string): ContextCache {
  return new ContextCache(projectPath);
}
