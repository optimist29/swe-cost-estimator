export const MODELS = {
  "gemini-3.8-flash": {
    name: "Gemini 3.8 Flash",
    inputPricePerMillion: 0.75,
    outputPricePerMillion: 3.75,
    deepSwePassRate: 0.737,
    terminalBench: 0.894,
    contextLimit: "1,048,576",
    isLeader: true
  },
  "claude-opus-5": {
    name: "Claude Opus 5",
    inputPricePerMillion: 5.00,
    outputPricePerMillion: 25.00,
    deepSwePassRate: 0.740,
    terminalBench: 0.891,
    contextLimit: "200,000"
  },
  "gpt-5.6-sol": {
    name: "GPT-5.6 Sol",
    inputPricePerMillion: 4.00,
    outputPricePerMillion: 20.00,
    deepSwePassRate: 0.727,
    terminalBench: 0.888,
    contextLimit: "256,000"
  },
  "claude-sonnet-5": {
    name: "Claude Sonnet 5",
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 10.00,
    deepSwePassRate: 0.538,
    terminalBench: 0.804,
    contextLimit: "200,000"
  }
};

export function calculateCosts({ 
  repoTokens, 
  issuesCount = 100, 
  turnsPerIssue = 4,
  cachedRatio = 0.4,
  outputTokensPerTurn = 3500
}) {
  // Configurable SWE agent assumptions:
  // Input tokens per issue = context tokens * cache factor * turns
  // Output tokens per issue = tokens per turn * turns
  const inputTokensPerIssue = repoTokens * cachedRatio * turnsPerIssue;
  const outputTokensPerIssue = outputTokensPerTurn * turnsPerIssue;

  const results = [];

  for (const [key, model] of Object.entries(MODELS)) {
    const totalInputCost = (inputTokensPerIssue * issuesCount / 1_000_000) * model.inputPricePerMillion;
    const totalOutputCost = (outputTokensPerIssue * issuesCount / 1_000_000) * model.outputPricePerMillion;
    const totalCost = totalInputCost + totalOutputCost;
    
    const expectedSolved = Math.round(issuesCount * model.deepSwePassRate);
    const effectiveCostPerSolved = expectedSolved > 0 ? (totalCost / expectedSolved) : 0;

    results.push({
      key,
      name: model.name,
      totalCost,
      expectedSolved,
      effectiveCostPerSolved,
      passRate: (model.deepSwePassRate * 100).toFixed(1) + "%",
      isLeader: !!model.isLeader
    });
  }

  // Sort by lowest effective cost per solved issue
  return results.sort((a, b) => a.effectiveCostPerSolved - b.effectiveCostPerSolved);
}
