# swe-cost-estimator ⚡

> Instant, zero-dependency CLI to estimate inference costs and **effective cost-per-resolved-issue** for autonomous software engineering agents across leading frontier AI models.

## Why This Exists

Most AI pricing comparisons only measure price-per-token ($/1M tokens). But in autonomous software engineering, **accuracy determines the true cost**. 

If a cheaper model fails 50% of tasks, you pay for wasted agent loops, retry storms, and human developer review overhead.

$$\text{Effective Cost per Solved Issue} = \frac{\text{Total Inference Cost}}{\text{DeepSWE v1.1 Pass Rate}}$$

This tool scans your repository context and simulates realistic agentic workloads over complex SWE benchmarks.

## Quickstart (Zero Install)

Run directly in any code repository using `npx`:

```bash
npx swe-cost-estimator
```

Or simulate a specific volume of issues:

```bash
npx swe-cost-estimator . --issues 250
```

## Supported Models & Benchmark Data

All benchmarks are sourced from verified DeepMind evaluations (September 2026):

| Model | Input / 1M | Output / 1M | DeepSWE v1.1 | Terminal-bench 2.1 | Context Window |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini 3.8 Flash** | **$0.75** | **$3.75** | **73.7%** | **89.4%** | 1,048,576 |
| **Claude Opus 5** | $5.00 | $25.00 | 74.0% | 89.1% | 200,000 |
| **GPT-5.6 Sol** | $4.00 | $20.00 | 72.7% | 88.8% | 256,000 |
| **Claude Sonnet 5** | $2.00 | $10.00 | 53.8% | 80.4% | 200,000 |

## License

MIT © Praveen
