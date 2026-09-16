# Empirical Agent Benchmark: State X to State Y Experiment

> *"Benchmarking needs real proof. Take a simple application in State X, move it to State Y with feature enhancements and fixes across actual harnesses (Claude Code CLI vs. Gemini), and measure the real end-to-end receipt."*  
> — Rajesh Kamal Kamalanathan

This document outlines the **empirical verification protocol** to validate the `swe-cost-estimator` theoretical model against live production agent harnesses.

---

## ⚡ Quickstart: Run the Experiment with 1 Command

This repository contains a self-contained test environment in [`sample-task/`](./sample-task/):

```bash
# Run the automated empirical benchmark runner:
npm run experiment
```

The runner:
1. Validates the baseline **State X** application and runs the unit test suite (`sample-task/test.js`).
2. Calculates exact token context and harness prompt overhead.
3. Computes the real multi-turn token receipt and cost across Gemini 3.8 Flash, Claude Opus 5, Claude Sonnet 5, and GPT-5.6 Sol.
4. Outputs the comparative cost multiplier.

---

## 1. The Target Application (State X)

* **Location:** [`sample-task/`](./sample-task/)
* **Stack:** Zero-dependency Node.js HTTP REST API + `node:test` test runner.
* **Initial State (State X):**
  - In-memory CRUD operations for items (`/items`, `/items/:id`).
  - Unit test suite (5 passing tests).
  - Clean git state with no uncommitted changes.

---

## 2. The Task Prompt (Moving to State Y)

Each agent harness receives the exact same multi-step software engineering prompt (specified in [`sample-task/TASK.md`](./sample-task/TASK.md)):

```markdown
You are a senior software engineer working on this repository. Complete the following task:

1. Add token-bucket rate limiting middleware allowing max 60 requests/minute per IP address.
2. Add an authenticated system health check endpoint at `/health/system` requiring bearer token authentication.
3. Update the existing database schema to track item creation timestamps (`createdAt`).
4. Write comprehensive unit tests in `test.js` for the rate limiter and health endpoint.
5. Run `node --test test.js` and ensure 100% of tests pass before finishing.
```

---

## 3. The Comparison Matrix

We run this prompt end-to-end across two actual production harnesses:

| Dimension | **Harness A: Claude Code CLI** | **Harness B: Gemini 3.8 Flash Agent** |
| :--- | :--- | :--- |
| **Model** | Claude Opus 5 / Sonnet 5 | Gemini 3.8 Flash (`thinking_level=MEDIUM`) |
| **Execution Environment** | Claude Code Terminal CLI (`claude`) | Google GenAI SDK / Antigravity CLI |
| **Tool Capabilities** | Bash, File Edit, Grep, Git | Bash, File Edit, Grep, Git |
| **Scaffolding Overhead** | Claude Code system prompts + tool definitions | Gemini system prompt + tool declarations |

---

## 4. Empirical Telemetry Captured

At the end of each run, we extract the **actual receipt** directly from session logs:

1. **Total Agent Turns / Iterations:** (Prompt → Tool Call → Tool Execution → Verification)
2. **Total Tokens Consumed:**
   - Input Tokens (base prompt + file reads)
   - Cached Input Tokens (re-read context discount)
   - Output Tokens (reasoning tokens + code diffs)
3. **Execution Wall-Clock Time:** (Minutes/Seconds to test pass)
4. **Actual Dollar Cost:** Billed against live API rate cards.
5. **Patch Quality & Cleanliness:**
   - Number of lines added / deleted in `git diff`.
   - Did all tests pass without manual human intervention?

---

## 5. Live Claude Code CLI Execution (Manual Run)

If you have Claude Code CLI installed (`claude`), run this in your terminal:

```bash
claude -p "Read sample-task/TASK.md and implement the requirements in sample-task/. Run 'node --test sample-task/test.js' to verify."
```

When Claude Code finishes, check the token receipt displayed at the end of the session, and compare it to `npm run experiment`!
