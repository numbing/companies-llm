"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChallenge = parseChallenge;
exports.challengeSummary = challengeSummary;
exports.collectChallengeKeywords = collectChallengeKeywords;
const fs_1 = require("fs");
function parseChallenge(path) {
    const content = (0, fs_1.readFileSync)(path, "utf-8");
    const lines = content.split(/\r?\n/);
    let title = "";
    const sections = {};
    let currentSection = null;
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line)
            continue;
        if (line.startsWith("# ")) {
            title = line.slice(2).trim();
            currentSection = null;
        }
        else if (line.startsWith("## ")) {
            currentSection = line.slice(3).trim();
            if (!sections[currentSection]) {
                sections[currentSection] = [];
            }
        }
        else if (line.startsWith("- ")) {
            const section = currentSection ?? "General";
            sections[section] = sections[section] ?? [];
            sections[section].push(line.slice(2).trim());
        }
        else {
            const section = currentSection ?? "General";
            sections[section] = sections[section] ?? [];
            sections[section].push(line);
        }
    }
    return { title, sections };
}
function challengeSummary(challenge) {
    const pieces = [];
    if (challenge.title) {
        pieces.push(`Challenge: ${challenge.title}`);
    }
    for (const [section, items] of Object.entries(challenge.sections)) {
        if (!items.length)
            continue;
        pieces.push(`${section}:`);
        items.forEach((item) => pieces.push(`- ${item}`));
    }
    return pieces.join("\n");
}
function collectChallengeKeywords(challenge) {
    const keywordsSection = challenge.sections["Keywords"] ?? [];
    if (!keywordsSection.length)
        return [];
    const tokens = keywordsSection
        .flatMap((entry) => entry.split(/[,;/]/))
        .map((token) => token.trim().toLowerCase())
        .filter((token) => token.length > 2);
    return Array.from(new Set(tokens));
}
