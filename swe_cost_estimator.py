#!/usr/bin/env python3
"""
⚡ SWE Cost & Agent Efficiency Estimator (DeepSWE v1.1)
Zero-dependency Python CLI tool.
"""

import os
import sys
import json
import argparse

MODELS = {
    "gemini-3.8-flash": {
        "name": "Gemini 3.8 Flash",
        "input_price": 0.75,
        "output_price": 3.75,
        "deepswe": 0.737,
        "is_leader": True
    },
    "claude-opus-5": {
        "name": "Claude Opus 5",
        "input_price": 5.00,
        "output_price": 25.00,
        "deepswe": 0.740,
        "is_leader": False
    },
    "gpt-5.6-sol": {
        "name": "GPT-5.6 Sol",
        "input_price": 4.00,
        "output_price": 20.00,
        "deepswe": 0.727,
        "is_leader": False
    },
    "claude-sonnet-5": {
        "name": "Claude Sonnet 5",
        "input_price": 2.00,
        "output_price": 10.00,
        "deepswe": 0.538,
        "is_leader": False
    }
}

IGNORE_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", ".cache", 
    "target", "vendor", "coverage", ".venv", "env", ".system_generated"
}
CODE_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs", ".java", 
    ".c", ".cpp", ".h", ".cs", ".php", ".rb", ".json", ".md", ".yaml", ".yml"
}

def scan_repo(directory):
    total_bytes = 0
    file_count = 0
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in CODE_EXTENSIONS:
                path = os.path.join(root, f)
                try:
                    size = os.path.getsize(path)
                    if size < 500_000:
                        total_bytes += size
                        file_count += 1
                except Exception:
                    pass
    estimated_tokens = int(total_bytes / 3.8)
    return file_count, (estimated_tokens if estimated_tokens > 5000 else 120_000)

def main():
    parser = argparse.ArgumentParser(description="Estimate SWE agent costs and effective cost per solved bug.")
    parser.add_argument("path", nargs="?", default=".", help="Target repository path")
    parser.add_argument("--issues", type=int, default=100, help="Number of tasks/issues to simulate (default: 100)")
    parser.add_argument("--turns", type=int, default=4, help="Average agent turns/iterations per issue (default: 4)")
    parser.add_argument("--cache-ratio", type=float, default=0.4, help="Context cache ratio per turn (default: 0.4)")
    parser.add_argument("--output-tokens", type=int, default=3500, help="Output tokens per turn (default: 3500)")
    parser.add_argument("--json", action="store_true", help="Output raw JSON data")
    args = parser.parse_args()

    files, tokens = scan_repo(args.path)

    input_tokens = tokens * args.cache_ratio * args.turns
    output_tokens = args.output_tokens * args.turns

    rows = []
    for key, m in MODELS.items():
        in_cost = (input_tokens * args.issues / 1_000_000) * m["input_price"]
        out_cost = (output_tokens * args.issues / 1_000_000) * m["output_price"]
        total = in_cost + out_cost
        solved = round(args.issues * m["deepswe"])
        eff_cost = total / solved if solved > 0 else 0
        rows.append({
            "key": key,
            "name": m["name"],
            "deepswe": f"{m['deepswe']*100:.1f}%",
            "solved": f"{solved}/{args.issues}",
            "total": total,
            "eff": eff_cost,
            "is_leader": m["is_leader"]
        })

    rows.sort(key=lambda r: r["eff"])

    if args.json:
        output_data = {
            "metadata": {
                "targetDir": os.path.abspath(args.path),
                "fileCount": files,
                "repoTokens": tokens,
                "issuesCount": args.issues,
                "turnsPerIssue": args.turns,
                "cacheRatio": args.cache_ratio,
                "outputTokensPerTurn": args.output_tokens,
                "benchmark": "DeepSWE v1.1"
            },
            "models": rows
        }
        print(json.dumps(output_data, indent=2))
        return

    print(f"\n\033[1m\033[36m⚡ SWE Cost & Agent Efficiency Estimator (DeepSWE v1.1)\033[0m\n")
    print(f"\033[32m✔\033[0m Scanned \033[1m{files}\033[0m code files (~{tokens:,} tokens of context).")
    print(f"Simulating workload: \033[1m{args.issues}\033[0m issues (\033[1m{args.turns}\033[0m turns/issue, \033[1m{int(args.cache_ratio*100)}%\033[0m context cached)...\n")

    print("-----------------------------------------------------------------------------------------")
    print(f"| Model               | DeepSWE v1.1 | Est. Solved | Total Cost  | Cost / Solved Issue     |")
    print("-----------------------------------------------------------------------------------------")
    for r in rows:
        badge = " \033[32m★ BEST VALUE\033[0m" if r["is_leader"] else ""
        name_str = f"{r['name']}{badge}".ljust(38 if r['is_leader'] else 19)
        print(f"| {name_str} | {r['deepswe'].ljust(12)} | {r['solved'].ljust(11)} | ${r['total']:<10.2f} | ${r['eff']:<21.2f} |")
    print("-----------------------------------------------------------------------------------------\n")

    gemini = next(r for r in rows if r["key"] == "gemini-3.8-flash")
    opus = next(r for r in rows if r["key"] == "claude-opus-5")
    savings = round((1 - (gemini["total"] / opus["total"])) * 100)

    print("\033[1mKey Finding:\033[0m")
    print(f"• Gemini 3.8 Flash achieves \033[1m73.7%\033[0m on DeepSWE v1.1 (virtually tied with Claude Opus 5's \033[1m74.0%\033[0m).")
    print(f"• Total cost for {args.issues} issues: \033[1m\033[32m${gemini['total']:.2f}\033[0m vs \033[33m${opus['total']:.2f}\033[0m ({savings}% savings).")
    print(f"• Effective cost per verified fix: \033[1m\033[32m${gemini['eff']:.2f}\033[0m vs \033[33m${opus['eff']:.2f}\033[0m.\n")

if __name__ == "__main__":
    main()
