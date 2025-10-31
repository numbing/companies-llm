"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printHelp = printHelp;
exports.parseArgs = parseArgs;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
function printHelp() {
    console.log(`
Usage: startup-scout [options]

Options:
  --challenge-file, -c   Path to challenge requirements markdown (required)
  --companies-db, -d     Path to companies database JSONL (required)
  --query, -q            Analyst question to ask about each company
  --model, -m            Model to use for evaluation (default: ${constants_1.DEFAULT_MODEL})
  --ollama-host          Base URL for the Ollama server (default: http://localhost:11434)
  --min-fit-score        Minimum score (0-1) to consider a match (default: 0.5)
  --max-companies        Limit evaluated companies (default: 5, use 0 for no limit)
  --max-concurrency      Maximum concurrent LLM evaluations (default: unlimited)
  --no-prefilter         Disable keyword prefilter (evaluate every company)
  --help, -h             Show this message
`.trim());
}
function parseArgs(argv) {
    const args = [...argv];
    const defaultPrefilter = (process.env.STARTUP_SCOUT_PREFILTER ?? "true").toLowerCase() !== "false";
    const defaultConcurrency = (0, utils_1.coercePositiveInteger)(process.env.STARTUP_SCOUT_MAX_CONCURRENCY, Number.MAX_SAFE_INTEGER);
    const options = {
        query: "",
        model: constants_1.DEFAULT_MODEL,
        ollamaHost: process.env.OLLAMA_HOST ?? "http://localhost:11434",
        minFitScore: 0.5,
        maxCompanies: 5,
        maxConcurrency: defaultConcurrency,
        usePrefilter: defaultPrefilter,
        helpRequested: false,
    };
    while (args.length) {
        const token = args.shift();
        if (!token)
            break;
        const next = args[0];
        switch (token) {
            case "--challenge-file":
            case "-c":
                if (!next)
                    throw new Error(`${token} requires a value`);
                options.challengeFile = next;
                args.shift();
                break;
            case "--companies-db":
            case "-d":
                if (!next)
                    throw new Error(`${token} requires a value`);
                options.companiesDb = next;
                args.shift();
                break;
            case "--query":
            case "-q":
                if (!next)
                    throw new Error(`${token} requires a value`);
                options.query = next;
                args.shift();
                break;
            case "--model":
            case "-m":
                if (!next)
                    throw new Error(`${token} requires a value`);
                options.model = next;
                args.shift();
                break;
            case "--ollama-host":
                if (!next)
                    throw new Error(`${token} requires a value`);
                options.ollamaHost = next;
                args.shift();
                break;
            case "--min-fit-score":
                if (!next)
                    throw new Error(`${token} requires a value`);
                options.minFitScore = Number(next);
                if (Number.isNaN(options.minFitScore) || options.minFitScore < 0 || options.minFitScore > 1) {
                    throw new Error("min-fit-score must be a number between 0 and 1.");
                }
                args.shift();
                break;
            case "--max-companies":
                if (!next)
                    throw new Error(`${token} requires a value`);
                const parsedLimit = Number(next);
                if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
                    throw new Error("max-companies must be a non-negative integer.");
                }
                options.maxCompanies = parsedLimit === 0 ? null : parsedLimit;
                args.shift();
                break;
            case "--max-concurrency":
                if (!next)
                    throw new Error(`${token} requires a value`);
                const parsedConcurrency = Number(next);
                if (Number.isNaN(parsedConcurrency) || parsedConcurrency <= 0) {
                    throw new Error("max-concurrency must be a positive integer.");
                }
                options.maxConcurrency = parsedConcurrency;
                args.shift();
                break;
            case "--no-prefilter":
                options.usePrefilter = false;
                break;
            case "--help":
            case "-h":
                options.helpRequested = true;
                break;
            default:
                throw new Error(`Unknown option: ${token}`);
        }
    }
    if (!options.challengeFile) {
        throw new Error("Missing required option: --challenge-file");
    }
    if (!options.companiesDb) {
        throw new Error("Missing required option: --companies-db");
    }
    return options;
}
