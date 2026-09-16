# Changelog

All notable changes to `swe-cost-estimator` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-16

### Added
- **1-Click Quick Presets on Web Simulator**:
  - Added 3 interactive team archetypes to [GitHub Pages](https://optimist29.github.io/swe-cost-estimator/):
    - 📦 **Small Service / MVP**: 10k LOC (~30k tokens), 20 issues, 3 turns, 50% caching.
    - 🚀 **Active Team Repo**: 40k LOC (~120k tokens), 100 issues, 5 turns, 50% caching.
    - 🏢 **Enterprise Monorepo**: 100k+ LOC (~350k tokens), 250 issues, 8 turns, 75% caching.
- **Git Velocity & Rebase Contention Multiplier (`src/scanner.js`)**:
  - Automatically inspects the last 14 days of Git commit velocity (`git rev-list --count HEAD --since="14 days ago"`).
  - Automatically models branch contention and merge conflict rework overhead:
    - `>50 commits / 14d`: **1.45x** contention factor (+45% agent turns).
    - `15–50 commits / 14d`: **1.20x** contention factor (+20% agent turns).
    - `<15 commits / 14d`: **1.0x** (baseline).
  - Added `--rebase-factor <float>` to manually override and `--no-churn` to disable.
- **Local Agent Session Auto-Detection (`src/scanner.js`)**:
  - Automatically detects local CLI agent working directories (e.g. `~/.claude`) to calibrate baseline turn counts against real engineer logs rather than relying solely on simulation defaults.
- **Empirical Verification Protocol ([`EXPERIMENT.md`](./EXPERIMENT.md))**:
  - Added a complete reproducible test harness specification to evaluate real-world "State X to State Y" task execution across Claude Code CLI vs. Gemini 3.8 Flash, tracking wall-clock latency, token usage, API receipts, and patch correctness.

### Changed
- Refactored CLI output table and summaries to display detected git velocity and effective turns per issue.
- Updated README with interactive web calculator links, CLI options table, and empirical test instructions.

---

## [1.0.2] - 2026-09-15

### Added
- `--turns <num>`: Customizable average agent turns/iterations per issue (default: `4`).
- `--cache-ratio <float>`: Customizable prompt context caching percentage (default: `0.4`).
- `--output-tokens <num>`: Customizable reasoning and patch generation tokens per turn (default: `3500`).
- `--json`: Machine-readable JSON output mode for CI/CD budgeting scripts and piping to `jq`.
- `-h, --help`: Detailed help text with clear usage examples.

---

## [1.0.1] - 2026-09-15

### Changed
- Standardized packaging and CLI binary executable permissions.
- Added repository context scanner to automatically measure lines of code and token equivalents while ignoring build artifacts and lockfiles.

---

## [1.0.0] - 2026-09-15

### Added
- Initial release of `swe-cost-estimator`.
- Verified benchmarks from **DataCurve DeepSWE v1.1** (Gemini 3.8 Flash @ 73.7%, Claude Opus 5 @ 74.0%, GPT-5.6 Sol @ 72.7%, Claude Sonnet 5 @ 53.8%).
- Formula implementation: $\text{Effective Cost per Solved Issue} = \frac{\text{Total Inference Cost}}{\text{Pass Rate}}$.
- Python single-file script (`swe_cost_estimator.py`).
- Standalone HTML/Tailwind interactive widget (`index.html`).
