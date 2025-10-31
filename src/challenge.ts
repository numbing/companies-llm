import { readFileSync } from "fs";

import { Challenge } from "./types";

export function parseChallenge(path: string): Challenge {
  const content = readFileSync(path, "utf-8");
  const lines = content.split(/\r?\n/);

  let title = "";
  const sections: Record<string, string[]> = {};
  let currentSection: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      currentSection = null;
    } else if (line.startsWith("## ")) {
      currentSection = line.slice(3).trim();
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
    } else if (line.startsWith("- ")) {
      const section = currentSection ?? "General";
      sections[section] = sections[section] ?? [];
      sections[section].push(line.slice(2).trim());
    } else {
      const section = currentSection ?? "General";
      sections[section] = sections[section] ?? [];
      sections[section].push(line);
    }
  }

  return { title, sections };
}

export function challengeSummary(challenge: Challenge): string {
  const pieces: string[] = [];
  if (challenge.title) {
    pieces.push(`Challenge: ${challenge.title}`);
  }
  for (const [section, items] of Object.entries(challenge.sections)) {
    if (!items.length) continue;
    pieces.push(`${section}:`);
    items.forEach((item) => pieces.push(`- ${item}`));
  }
  return pieces.join("\n");
}

export function collectChallengeKeywords(challenge: Challenge): string[] {
  const keywordsSection = challenge.sections["Keywords"] ?? [];
  if (!keywordsSection.length) return [];

  const tokens = keywordsSection
    .flatMap((entry) => entry.split(/[,;/]/))
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 2);

  return Array.from(new Set(tokens));
}
