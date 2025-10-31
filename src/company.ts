import { readFileSync } from "fs";

import { Company, JsonValue } from "./types";

export function loadCompanies(path: string): Company[] {
  const content = readFileSync(path, "utf-8");
  const lines = content.split(/\r?\n/);
  const companies: Company[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const parsed = JSON.parse(trimmed) as Company;
      companies.push(parsed);
    } catch (error) {
      throw new Error(`Invalid JSON on line ${index + 1} in ${path}`);
    }
  });

  return companies;
}

export function companyMatchesKeywords(company: Company, keywords: string[]): boolean {
  if (!keywords.length) return true;

  const parts: string[] = [];

  const pushIfString = (value?: JsonValue) => {
    if (typeof value === "string") {
      parts.push(value.toLowerCase());
    }
  };

  pushIfString(company.name);
  pushIfString(company.title);
  pushIfString(company.description);
  pushIfString(company.address);

  const keywordField = company.keywords;
  if (Array.isArray(keywordField)) {
    keywordField.forEach((entry) => {
      if (typeof entry === "string") {
        parts.push(entry.toLowerCase());
      }
    });
  } else if (typeof keywordField === "string") {
    parts.push(keywordField.toLowerCase());
  }

  if (!parts.length) {
    return true;
  }

  const haystack = parts.join(" ");
  return keywords.some((keyword) => haystack.includes(keyword));
}

export function prefilterCompanies(
  companies: Company[],
  keywords: string[],
  enabled: boolean,
): { filtered: Company[]; skipped: number } {
  if (!enabled || !keywords.length) {
    return { filtered: companies, skipped: 0 };
  }

  const filtered: Company[] = [];
  let skipped = 0;

  companies.forEach((company) => {
    if (companyMatchesKeywords(company, keywords)) {
      filtered.push(company);
    } else {
      skipped += 1;
    }
  });

  return { filtered, skipped };
}
