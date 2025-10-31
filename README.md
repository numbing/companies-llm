# Startup Scouting Automation Tool

You should build a command line tool that automates the startup scouting process for identifying potential partnership candidates. This tool leverages Large Language Models (LLMs) to analyze startup profiles against specific challenge requirements and answer custom evaluation questions, streamlining the initial screening process that typically requires manual research.

The tool reads challenge requirements from a markdown file, processes a database of startup companies from a JSONL file, and uses AI to match companies against the criteria while answering user-defined evaluation questions. 

For this purpose a UXS Defense Startup Challenge `uxs-startup-challenge.md` and a JSONL file with potential candidates `companies.jsonl` have been attached to this repository. 

You can use a free tool like [Ollama](https://docs.ollama.com/quickstart) to run an LLM locally, or integrate with cloud-based AI services. Here's an example of how the tool should work:

```bash
$ ./startup-scout --challenge-file ./uxs-startup-challenge.md --companies-db ./companies.jsonl --query "Is the company based in Germany?"

Analyzing 847 companies against challenge requirements...
Found 3 companies matching the challenge criteria

────────────────────────────────────────────────────────────────────────────

DEDRONE (dedrone.com)
Description: Advanced Solutions for Airspace Security Against Unauthorized Drone Activity

Query: "Is the company based in Germany?"
Answer: No - Headquartered in San Francisco, CA with European operations in Germany

────────────────────────────────────────────────────────────────────────────

FLOWTECH DYNAMICS (flowtech-dynamics.de)
Description: AI-Powered Industrial Process Optimization and Predictive Maintenance Solutions

Query: "Is the company based in Germany?"
Answer: Yes - Founded and headquartered in Munich, Bavaria

────────────────────────────────────────────────────────────────────────────

SECUREVAULT SYSTEMS (securevault.io)
Description: Enterprise-Grade Zero-Trust Security Platform for Cloud Infrastructure

Query: "Is the company based in Germany?"
Answer: No - Based in London, UK with development teams across Europe

────────────────────────────────────────────────────────────────────────────

Summary: 3 companies identified, 1 based in Germany
Export results: ./startup-scout-results-2024-10-28.json
```

## Requirements

### Core Functionality
- Parse challenge requirements from markdown files
- Load and process company data from JSONL format
- Use LLM to evaluate company-challenge fit
- Answer custom user queries about each matching company
- Filter companies based on challenge criteria

### Command Line Interface
```bash
./startup-scout [OPTIONS]

Options:
  --challenge-file, -c    Path to challenge requirements (markdown)
  --companies-db, -d      Path to companies database (JSONL)
  --query, -q            Question to ask about each matching company
  --help, -h             Show help message
```

## Implementation Notes

You have complete freedom in your implementation approach - the example above is purely illustrative. Feel free to hardcode parameters, simplify the interface, or focus on specific components that showcase your skills. We're more interested in your problem-solving approach and code quality than a pixel-perfect recreation of the example output.

**Time Budget:** Please limit yourself to 4 hours maximum. If you can't complete the full implementation, that's perfectly fine - submit what you have along with notes on your approach, challenges encountered, and how you would continue given more time.

## Configuration

The CLI can be customized via environment variables:

- `STARTUP_SCOUT_PREFILTER`: Set to `false` to disable keyword prefiltering by default. Use the `--no-prefilter` flag to override per run.
- `STARTUP_SCOUT_MAX_CONCURRENCY`: Controls the default concurrency for LLM evaluations. If unset, the tool will fan out to all candidate companies; pass `--max-concurrency` on the command line to limit it for a specific run.
- Use `--max-companies <N>` to raise or lower the evaluation cap (set it to `0` for no limit).

