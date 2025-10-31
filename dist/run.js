"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const challenge_1 = require("./challenge");
const company_1 = require("./company");
const evaluation_1 = require("./evaluation");
const output_1 = require("./output");
async function run(options) {
    const challenge = (0, challenge_1.parseChallenge)(options.challengeFile);
    const companies = (0, company_1.loadCompanies)(options.companiesDb);
    const challengeKeywords = (0, challenge_1.collectChallengeKeywords)(challenge);
    const { filtered: prefilteredCompanies, skipped } = (0, company_1.prefilterCompanies)(companies, challengeKeywords, options.usePrefilter);
    console.log(`Loaded ${companies.length} companies from database.`);
    if (options.usePrefilter && challengeKeywords.length) {
        console.log(`Prefilter matched ${prefilteredCompanies.length} companies using ${challengeKeywords.length} challenge keywords` +
            (skipped > 0 ? ` (skipped ${skipped})` : ""));
    }
    const limit = options.maxCompanies ?? prefilteredCompanies.length;
    const candidates = prefilteredCompanies.slice(0, limit);
    if (options.maxCompanies !== null && prefilteredCompanies.length > limit) {
        console.log(`Limiting evaluation to first ${limit} companies after filtering.`);
    }
    console.log(`Analyzing ${candidates.length} companies against challenge requirements...`);
    const matches = [];
    if (candidates.length > 0) {
        let nextIndex = 0;
        const workerCount = Math.min(options.maxConcurrency, candidates.length);
        const workers = Array.from({ length: workerCount }, () => (async () => {
            while (true) {
                const currentIdx = nextIndex;
                nextIndex += 1;
                if (currentIdx >= candidates.length) {
                    break;
                }
                const company = candidates[currentIdx];
                try {
                    const { match, evaluation } = await (0, evaluation_1.evaluateCompany)(company, challenge, options.query, options.model, options.ollamaHost, options.minFitScore);
                    if (match) {
                        matches.push({ company, evaluation });
                    }
                }
                catch (error) {
                    const name = typeof company.name === "string" ? company.name : "Unknown";
                    console.error(`Failed to evaluate ${name}: ${error.message}`);
                }
            }
        })());
        await Promise.all(workers);
    }
    console.log(`Found ${matches.length} companies matching the challenge criteria\n`);
    if (matches.length) {
        const separator = "─".repeat(76);
        matches.forEach(({ company, evaluation }) => {
            console.log(separator);
            console.log();
            console.log((0, output_1.formatCompanyOutput)(company, evaluation, options.query));
            console.log();
        });
        console.log(separator);
        const affirmative = matches.filter(({ evaluation }) => evaluation.query.answer === "yes").length;
        console.log(`\nSummary: ${matches.length} companies identified, ${affirmative} answered YES to the query`);
    }
    else {
        console.log("\nSummary: No companies met the fit threshold.");
    }
    return 0;
}
