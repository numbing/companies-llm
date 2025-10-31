# Startup Scouting Automation Tool

### Command Line Interface
```bash
./startup-scout [OPTIONS]

Options:
  --challenge-file, -c    Path to challenge requirements (markdown)
  --companies-db, -d      Path to companies database (JSONL)
  --query, -q            Question to ask about each matching company
  --help, -h             Show help message
```

## Configuration

The CLI can be customized via environment variables:

- `STARTUP_SCOUT_PREFILTER`: Set to `false` to disable keyword prefiltering by default. Use the `--no-prefilter` flag to override per run.
- `STARTUP_SCOUT_MAX_CONCURRENCY`: Controls the default concurrency for LLM evaluations. If unset, the tool will fan out to all candidate companies; pass `--max-concurrency` on the command line to limit it for a specific run.
- Use `--max-companies <N>` to raise or lower the evaluation cap (set it to `0` for no limit).

