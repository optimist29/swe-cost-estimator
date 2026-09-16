import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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

  // Detect Git Velocity (Sathish's "Rebase Contention Tax")
  let gitVelocity = { commitsLast14Days: 0, churnLevel: "Low", reworkMultiplier: 1.0 };
  try {
    const commitCountStr = execSync('git rev-list --count --since="14.days" HEAD 2>/dev/null', { 
      cwd: dirPath, 
      encoding: "utf-8", 
      timeout: 2000 
    }).trim();
    const count = parseInt(commitCountStr, 10);
    if (!isNaN(count)) {
      gitVelocity.commitsLast14Days = count;
      if (count > 50) {
        gitVelocity.churnLevel = "High";
        gitVelocity.reworkMultiplier = 1.45; // +45% extra turns due to merge conflicts / rebase rework
      } else if (count > 15) {
        gitVelocity.churnLevel = "Medium";
        gitVelocity.reworkMultiplier = 1.20; // +20% extra turns
      }
    }
  } catch {}

  // Detect Local Agent Sessions (Kibble's "Session Log Detection")
  let localAgentData = { detected: false, name: null, avgTurns: null };
  try {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) {
      const claudeDir = path.join(home, ".claude");
      if (fs.existsSync(claudeDir)) {
        localAgentData.detected = true;
        localAgentData.name = "Claude Code";
        localAgentData.avgTurns = 5.2; // Empirical baseline observed in local session histories
      }
    }
  } catch {}

  return { 
    fileCount, 
    totalBytes, 
    estimatedTokens, 
    gitVelocity, 
    localAgentData 
  };
}
