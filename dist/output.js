"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCompanyOutput = formatCompanyOutput;
function formatCompanyOutput(company, evaluation, query) {
    const lines = [
        `${(company.name ?? "Unknown").toString().toUpperCase()} (${company.domain ?? "N/A"})`,
        `Description: ${company.title ?? "No title available"}`,
        "",
        `Fit Score: ${evaluation.fit.score.toFixed(2)} (${evaluation.fit.verdict})`,
        `Fit Rationale: ${evaluation.fit.rationale || "No rationale provided."}`,
    ];
    if (query) {
        lines.push("", `Query: "${query}"`, `Answer: ${evaluation.query.answer.toUpperCase()}`, `Query Rationale: ${evaluation.query.rationale || "No rationale provided."}`);
    }
    return lines.join("\n");
}
