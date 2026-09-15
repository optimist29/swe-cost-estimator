# swe-cost-estimator ⚡

> Instant, zero-dependency CLI to estimate multi-turn inference costs and **effective cost-per-resolved-issue** for autonomous software engineering agents across leading frontier AI models.

## Why This Exists

Most AI pricing comparisons only measure price-per-token ($/1M tokens). But in autonomous software engineering, **accuracy determines the true cost**. 

If a cheaper model fails 40% of tasks, you pay for repeated retry loops, failed test runs, and developer review overhead.

$$\text{Effective Cost per Solved Issue} = \frac{\text{Total Multi-Turn Inference Cost}}{\text{DeepSWE v1.1 Pass Rate}}$$

This tool scans your repository context and simulates realistic agentic workloads over complex SWE benchmarks.

## Quickstart (Zero Install)

Run directly in any code repository using `npx`:

```bash
npx swe-cost-estimator
```

## CLI Options & Customization

```bash
npx swe-cost-estimator [path] [options]
```

| Flag | Description | Default |
| :--- | :--- | :--- |
| `[path]` | Target directory or codebase to scan | `.` (current directory) |
| `--issues <num>` | Number of tasks or issues to simulate | `100` |
| `--turns <num>` | Average agent iterations/turns per issue | `4` |
| `--cache-ratio <float>` | Context caching fraction per turn | `0.4` (40%) |
| `--output-tokens <num>` | Output tokens per turn (reasoning + git diff) | `3500` |
| `--json` | Output raw JSON data for CI/CD or scripting | `false` |
| `-h, --help` | Show help and options | |

### Examples

```bash
# Simulate a sprint of 50 complex issues with 6 agent turns per issue:
npx swe-cost-estimator . --issues 50 --turns 6

# Pipe JSON into jq for CI/CD cost auditing:
npx swe-cost-estimator . --issues 100 --json | jq .
```

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
