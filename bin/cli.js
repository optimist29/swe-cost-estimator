#!/usr/bin/env node

import path from "path";
import { scanRepositoryTokens } from "../src/scanner.js";
import { calculateCosts } from "../src/calculator.js";

// ANSI colors for clean, zero-dependency terminal rendering
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
${BOLD}${CYAN}⚡ swe-cost-estimator (DeepSWE v1.1)${RESET}

Estimate multi-turn SWE agent costs and effective cost-per-resolved-issue across frontier AI models.

${BOLD}USAGE:${RESET}
  npx swe-cost-estimator [path] [options]

${BOLD}OPTIONS:${RESET}
  [path]                 Target repository to scan (default: current working directory)
  --issues <number>      Number of tasks/issues to simulate (default: 100)
  --turns <number>       Average agent turns/iterations per issue (default: auto-detected or 4)
  --rebase-factor <num>  Override team git churn rebase multiplier (e.g. 1.3 for +30% rework)
  --cache-ratio <float>  Fraction of codebase context ingested per turn (default: 0.4)
  --output-tokens <num>  Output tokens per turn for reasoning + git diff (default: 3500)
  --no-churn             Disable automatic Git velocity / rebase contention detection
  --json                 Output raw JSON data for CI/CD or scripting
  -h, --help             Show this help message

${BOLD}EXAMPLES:${RESET}
  npx swe-cost-estimator
  npx swe-cost-estimator ./my-app --issues 250
  npx swe-cost-estimator . --issues 50 --turns 6
  npx swe-cost-estimator . --rebase-factor 1.5
  npx swe-cost-estimator . --json | jq .
`);
  process.exit(0);
}

const targetDir = args[0] && !args[0].startsWith("-") ? path.resolve(args[0]) : process.cwd();

function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  return (idx !== -1 && args[idx + 1]) ? args[idx + 1] : fallback;
}

const issuesCount = parseInt(getArg("--issues", "100"), 10);
const cachedRatio = parseFloat(getArg("--cache-ratio", "0.4"));
const outputTokensPerTurn = parseInt(getArg("--output-tokens", "3500"), 10);
const isJson = args.includes("--json");
const disableChurn = args.includes("--no-churn");

const { fileCount, estimatedTokens, gitVelocity, localAgentData } = scanRepositoryTokens(targetDir);
const repoTokens = estimatedTokens > 5000 ? estimatedTokens : 120_000;

// Determine baseline turns
let turnsPerIssue = 4;
const explicitTurns = getArg("--turns", null);

if (explicitTurns) {
  turnsPerIssue = parseInt(explicitTurns, 10);
} else if (localAgentData && localAgentData.detected && localAgentData.avgTurns) {
  turnsPerIssue = Math.round(localAgentData.avgTurns);
}

// Apply Sathish's "Git Churn & Rebase Contention Multiplier"
let rebaseMultiplier = 1.0;
const explicitRebase = getArg("--rebase-factor", null);

if (explicitRebase) {
  rebaseMultiplier = parseFloat(explicitRebase);
} else if (!disableChurn && gitVelocity && gitVelocity.reworkMultiplier > 1.0) {
  rebaseMultiplier = gitVelocity.reworkMultiplier;
}

const effectiveTurns = Math.round(turnsPerIssue * rebaseMultiplier);

const results = calculateCosts({ 
  repoTokens, 
  issuesCount, 
  turnsPerIssue: effectiveTurns, 
  cachedRatio, 
  outputTokensPerTurn 
});

if (isJson) {
  console.log(JSON.stringify({
    metadata: {
      targetDir,
      fileCount,
      repoTokens,
      issuesCount,
      baseTurns: turnsPerIssue,
      effectiveTurns,
      rebaseMultiplier,
      gitVelocity,
      localAgentData,
      cachedRatio,
      outputTokensPerTurn,
      benchmark: "DeepSWE v1.1"
    },
    models: results
  }, null, 2));
  process.exit(0);
}

console.log(`\n${BOLD}${CYAN}⚡ SWE Cost & Agent Efficiency Estimator (DeepSWE v1.1)${RESET}\n`);
console.log(`${DIM}Scanning repository context: ${targetDir}...${RESET}`);
console.log(`${GREEN}✔${RESET} Analyzed ${BOLD}${fileCount}${RESET} code files (~${BOLD}${repoTokens.toLocaleString()}${RESET} tokens of repository context).`);

if (gitVelocity && gitVelocity.commitsLast14Days > 0) {
  const churnColor = gitVelocity.churnLevel === "High" ? YELLOW : CYAN;
  console.log(`${churnColor}⚡ Team Git Churn:${RESET} ${gitVelocity.commitsLast14Days} commits in last 14d (${gitVelocity.churnLevel} velocity).`);
  if (rebaseMultiplier > 1.0) {
    console.log(`   ${DIM}↳ Applied ${BOLD}${rebaseMultiplier}x${RESET}${DIM} Rebase Contention Factor (accounts for merge conflict rework).${RESET}`);
  }
}

if (localAgentData && localAgentData.detected) {
  console.log(`${MAGENTA}🔍 Local Agent History:${RESET} Detected ${localAgentData.name} session logs.`);
}

console.log(`${DIM}Simulating workload: ${BOLD}${issuesCount}${DIM} issues (${BOLD}${effectiveTurns}${DIM} effective turns/issue with rebase factor, ${BOLD}${Math.round(cachedRatio*100)}%${DIM} context cached)...\n${RESET}`);

console.log("-----------------------------------------------------------------------------------------");
console.log(`| Model               | DeepSWE v1.1 | Est. Solved | Total Cost  | Cost / Solved Issue     |`);
console.log("-----------------------------------------------------------------------------------------");

for (const row of results) {
  const leaderBadge = row.isLeader ? ` ${GREEN}★ BEST VALUE${RESET}` : "";
  const nameCol = (row.name + leaderBadge).padEnd(28 + (row.isLeader ? 10 : 0));
  const passCol = row.passRate.padEnd(12);
  const solvedCol = `${row.expectedSolved}/${issuesCount}`.padEnd(11);
  const totalCol = `$${row.totalCost.toFixed(2)}`.padEnd(11);
  const costPerSolved = `$${row.effectiveCostPerSolved.toFixed(2)}`.padEnd(23);

  console.log(`| ${nameCol} | ${passCol} | ${solvedCol} | ${totalCol} | ${costPerSolved} |`);
}
console.log("-----------------------------------------------------------------------------------------\n");

const gemini = results.find(r => r.key === "gemini-3.8-flash");
const opus = results.find(r => r.key === "claude-opus-5");
const savingsPct = Math.round((1 - (gemini.totalCost / opus.totalCost)) * 100);

console.log(`${BOLD}Key Finding:${RESET}`);
console.log(`• Gemini 3.8 Flash achieves ${BOLD}73.7%${RESET} on DeepSWE v1.1 (virtually tied with Claude Opus 5's ${BOLD}74.0%${RESET}).`);
console.log(`• Total inference cost for ${issuesCount} issues: ${GREEN}${BOLD}$${gemini.totalCost.toFixed(2)}${RESET} vs ${YELLOW}$${opus.totalCost.toFixed(2)}${RESET} (${savingsPct}% savings).`);
console.log(`• Effective cost per verified fix: ${GREEN}${BOLD}$${gemini.effectiveCostPerSolved.toFixed(2)}${RESET} vs ${YELLOW}$${opus.effectiveCostPerSolved.toFixed(2)}${RESET}.\n`);

console.log(`${DIM}Verified benchmarks & methodology: deepmind.google/models/evals-methodology/gemini-3-8-flash${RESET}\n`);
