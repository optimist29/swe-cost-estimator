import fs from "fs";
import path from "path";

const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".cache", 
  "target", "vendor", "coverage", ".venv", "env", ".system_generated"
]);

const CODE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs", ".java", 
  ".c", ".cpp", ".h", ".cs", ".php", ".rb", ".json", ".md", ".yaml", ".yml"
]);

export function scanRepositoryTokens(dirPath) {
  let totalBytes = 0;
  let fileCount = 0;

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CODE_EXTENSIONS.has(ext)) {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.size < 500_000) { // ignore minified or huge bundle files
              totalBytes += stat.size;
              fileCount++;
            }
          } catch {}
        }
      }
    }
  }

  walk(dirPath);

  // Industry empirical average: ~3.8 bytes per code token
  const estimatedTokens = Math.round(totalBytes / 3.8);
  return { fileCount, totalBytes, estimatedTokens };
}
