#!/usr/bin/env node

import path from "path";
import { scanRepositoryTokens } from "../src/scanner.js";
import { calculateCosts } from "../src/calculator.js";

// ANSI colors for clean, zero-dependency terminal rendering
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const args = process.argv.slice(2);
const targetDir = args[0] && !args[0].startsWith("-") ? path.resolve(args[0]) : process.cwd();

let issuesCount = 100;
const issuesIndex = args.indexOf("--issues");
if (issuesIndex !== -1 && args[issuesIndex + 1]) {
  issuesCount = parseInt(args[issuesIndex + 1], 10);
}

console.log(`\n${BOLD}${CYAN}⚡ SWE Cost & Agent Efficiency Estimator (DeepSWE v1.1)${RESET}\n`);
console.log(`${DIM}Scanning repository context: ${targetDir}...${RESET}`);

const { fileCount, estimatedTokens } = scanRepositoryTokens(targetDir);

// Fallback baseline tokens if scanning an empty directory
const repoTokens = estimatedTokens > 5000 ? estimatedTokens : 120_000;

console.log(`${GREEN}✔${RESET} Analyzed ${BOLD}${fileCount}${RESET} code files (~${BOLD}${repoTokens.toLocaleString()}${RESET} tokens of repository context).`);
console.log(`${DIM}Simulating workload: ${BOLD}${issuesCount}${DIM} software engineering tasks (4 agent turns/issue)...\n${RESET}`);

const results = calculateCosts({ repoTokens, issuesCount });

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
