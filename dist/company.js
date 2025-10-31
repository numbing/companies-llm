"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCompanies = loadCompanies;
exports.companyMatchesKeywords = companyMatchesKeywords;
exports.prefilterCompanies = prefilterCompanies;
const fs_1 = require("fs");
function loadCompanies(path) {
    const content = (0, fs_1.readFileSync)(path, "utf-8");
    const lines = content.split(/\r?\n/);
    const companies = [];
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed)
            return;
        try {
            const parsed = JSON.parse(trimmed);
            companies.push(parsed);
        }
        catch (error) {
            throw new Error(`Invalid JSON on line ${index + 1} in ${path}`);
        }
    });
    return companies;
}
function companyMatchesKeywords(company, keywords) {
    if (!keywords.length)
        return true;
    const parts = [];
    const pushIfString = (value) => {
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
    }
    else if (typeof keywordField === "string") {
        parts.push(keywordField.toLowerCase());
    }
    if (!parts.length) {
        return true;
    }
    const haystack = parts.join(" ");
    return keywords.some((keyword) => haystack.includes(keyword));
}
function prefilterCompanies(companies, keywords, enabled) {
    if (!enabled || !keywords.length) {
        return { filtered: companies, skipped: 0 };
    }
    const filtered = [];
    let skipped = 0;
    companies.forEach((company) => {
        if (companyMatchesKeywords(company, keywords)) {
            filtered.push(company);
        }
        else {
            skipped += 1;
        }
    });
    return { filtered, skipped };
}
