import { collectChallengeKeywords, parseChallenge } from "./challenge";
import { loadCompanies, prefilterCompanies } from "./company";
import { evaluateCompany } from "./evaluation";
import { formatCompanyOutput } from "./output";
import { Company, Evaluation, CliOptions } from "./types";

export async function run(options: CliOptions): Promise<number> {
  const challenge = parseChallenge(options.challengeFile);
  const companies = loadCompanies(options.companiesDb);

  const challengeKeywords = collectChallengeKeywords(challenge);
  const { filtered: prefilteredCompanies, skipped } = prefilterCompanies(
    companies,
    challengeKeywords,
    options.usePrefilter,
  );

  console.log(`Loaded ${companies.length} companies from database.`);
  if (options.usePrefilter && challengeKeywords.length) {
    console.log(
      `Prefilter matched ${prefilteredCompanies.length} companies using ${challengeKeywords.length} challenge keywords` +
        (skipped > 0 ? ` (skipped ${skipped})` : ""),
    );
  }

  const limit = options.maxCompanies ?? prefilteredCompanies.length;
  const candidates = prefilteredCompanies.slice(0, limit);

  if (options.maxCompanies !== null && prefilteredCompanies.length > limit) {
    console.log(`Limiting evaluation to first ${limit} companies after filtering.`);
  }

  console.log(`Analyzing ${candidates.length} companies against challenge requirements...`);

  const matches: Array<{ company: Company; evaluation: Evaluation }> = [];

  if (candidates.length > 0) {
    let nextIndex = 0;
    const workerCount = Math.min(options.maxConcurrency, candidates.length);

    const workers = Array.from({ length: workerCount }, () =>
      (async () => {
        while (true) {
          const currentIdx = nextIndex;
          nextIndex += 1;
          if (currentIdx >= candidates.length) {
            break;
          }

          const company = candidates[currentIdx];
          try {
            const { match, evaluation } = await evaluateCompany(
              company,
              challenge,
              options.query,
              options.model,
              options.ollamaHost,
              options.minFitScore,
            );
            if (match) {
              matches.push({ company, evaluation });
            }
          } catch (error) {
            const name = typeof company.name === "string" ? company.name : "Unknown";
            console.error(`Failed to evaluate ${name}: ${(error as Error).message}`);
          }
        }
      })(),
    );

    await Promise.all(workers);
  }

  console.log(`Found ${matches.length} companies matching the challenge criteria\n`);

  if (matches.length) {
    const separator = "─".repeat(76);
    matches.forEach(({ company, evaluation }) => {
      console.log(separator);
      console.log();
      console.log(formatCompanyOutput(company, evaluation, options.query));
      console.log();
    });
    console.log(separator);

    const affirmative = matches.filter(({ evaluation }) => evaluation.query.answer === "yes").length;
    console.log(`\nSummary: ${matches.length} companies identified, ${affirmative} answered YES to the query`);
  } else {
    console.log("\nSummary: No companies met the fit threshold.");
  }

  return 0;
}
