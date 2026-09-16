# swe-cost-estimator ⚡

> Instant, zero-dependency CLI to estimate multi-turn inference costs and **effective cost-per-resolved-issue** for autonomous software engineering agents across leading frontier AI models.

## Why This Exists

Most AI pricing comparisons only measure price-per-token ($/1M tokens). But in autonomous software engineering, **accuracy determines the true cost**. 

If a cheaper model fails 40% of tasks, you pay for repeated retry loops, failed test runs, and developer review overhead.

$$\text{Effective Cost per Solved Issue} = \frac{\text{Total Multi-Turn Inference Cost}}{\text{DeepSWE v1.1 Pass Rate}}$$

This tool scans your repository context and simulates realistic agentic workloads over complex SWE benchmarks.

## Interactive Web Calculator & 1-Click Presets

Prefer a visual simulator? Try the live interactive calculator with 1-click team presets:
👉 **[https://optimist29.github.io/swe-cost-estimator/](https://optimist29.github.io/swe-cost-estimator/)**

- **📦 Small Service / MVP:** 10k LOC (~30k tokens), 20 issues, 3 turns
- **🚀 Active Team Repo:** 40k LOC (~120k tokens), 100 issues, 5 turns, git rebase contention
- **🏢 Enterprise Monorepo:** 100k+ LOC (~350k tokens), 250 issues, 8 turns, heavy branch conflict churn

---

## Quickstart (Zero Install)

Run directly in any code repository using `npx`:

```bash
npx swe-cost-estimator
```

The CLI automatically:
1. Scans codebase size and estimates total token context (skipping `.git`, `node_modules`, lockfiles).
2. Inspects 14-day Git commit velocity to dynamically calculate team rebase contention & rework multiplier.
3. Auto-detects local agent session logs (`~/.claude`) to extract empirical turn counts.

## CLI Options & Customization

```bash
npx swe-cost-estimator [path] [options]
```

| Flag | Description | Default |
| :--- | :--- | :--- |
| `[path]` | Target directory or codebase to scan | `.` (current directory) |
| `--issues <num>` | Number of tasks or issues to simulate | `100` |
| `--turns <num>` | Average agent iterations/turns per issue | `4` (or auto-detected from local sessions) |
| `--rebase-factor <float>` | Multiplier for branch conflicts and rework | Auto-detected from 14-day git churn (`1.0x`–`1.45x`) |
| `--cache-ratio <float>` | Context caching fraction per turn | `0.4` (40%) |
| `--output-tokens <num>` | Output tokens per turn (reasoning + git diff) | `3500` |
| `--no-churn` | Disable automatic git commit velocity detection | `false` |
| `--json` | Output raw JSON data for CI/CD or scripting | `false` |
| `-h, --help` | Show help and options | |

### Examples

```bash
# Auto-detect context, git churn contention, and local session turns:
npx swe-cost-estimator

# Simulate a sprint of 50 complex issues with custom turns:
npx swe-cost-estimator . --issues 50 --turns 6

# Explicitly model a high-contention team repo (1.5x rework multiplier):
npx swe-cost-estimator . --rebase-factor 1.5

# Pipe JSON into jq for CI/CD cost auditing:
npx swe-cost-estimator . --issues 100 --json | jq .
```

## Empirical Verification (`EXPERIMENT.md`)

Want to see how these benchmarks hold up against real agent CLI executions?
Check out [`EXPERIMENT.md`](./EXPERIMENT.md) for our reproducible "State X to State Y" protocol measuring end-to-end task cost on real bugs across Claude Code CLI and Gemini Flash.

## Supported Models & Benchmark Data

All benchmarks are sourced from verified evaluations (DeepSWE v1.1):

| Model | Input / 1M | Output / 1M | DeepSWE v1.1 | Terminal-bench 2.1 | Context Window |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini 3.8 Flash** | **$0.75** | **$3.75** | **73.7%** | **89.4%** | 1,048,576 |
| **Claude Opus 5** | $5.00 | $25.00 | 74.0% | 89.1% | 200,000 |
| **GPT-5.6 Sol** | $5.00 | $30.00 | 73.0% | 88.8% | 1,100,000 |
| **Claude Sonnet 5** | $2.00 | $10.00 | 54.0% | 80.4% | 1,000,000 |

## License

MIT © Praveen
