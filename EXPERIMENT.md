# Empirical Agent Benchmark: State X to State Y Experiment

> *"Benchmarking needs real proof. Take a simple application in State X, move it to State Y with feature enhancements and fixes across actual harnesses (Claude Code CLI vs. Gemini), and measure the real end-to-end receipt."*  
> — Rajesh Kamal Kamalanathan

This document outlines the **empirical verification protocol** to validate the `swe-cost-estimator` theoretical model against live production agent harnesses.

---

## 1. The Target Application (State X)

* **Repository:** A minimal production FastAPI or Express.js REST API (~2,500 lines of code across 8 files).
* **Initial State (State X):**
  - CRUD operations for items (`/items`).
  - SQLite database backend.
  - Basic Pytest / Jest test suite (12 passing tests).
  - Clean git state with no uncommitted changes.

---

## 2. The Task Prompt (Moving to State Y)

Each agent harness receives the exact same multi-step software engineering prompt:

```markdown
You are a senior software engineer working on this repository. Complete the following task:

1. Add token-bucket rate limiting middleware allowing max 60 requests/minute per IP address.
2. Add an authenticated system health check endpoint at `/health/system` requiring bearer token authentication.
3. Update the existing database schema to track item creation timestamps (`created_at`).
4. Write comprehensive unit tests for the rate limiter and health endpoint.
5. Run the test suite and ensure 100% of tests pass before finishing.
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

## 5. Connecting Back to `swe-cost-estimator`

Once the empirical run completes:
$$\text{Empirical Cost per Fix} = \text{Actual API Bill}$$

We compare the empirical bill to what `swe-cost-estimator` projected:
```bash
npx swe-cost-estimator . --issues 1 --turns [ActualTurns]
```

This closes the loop between **theoretical modeling** and **real-world empirical verification**!
