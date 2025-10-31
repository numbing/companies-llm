import { challengeSummary } from "./challenge";
import { LLM_RESPONSE_SCHEMA } from "./constants";
import { Challenge, Company, Evaluation, JsonValue } from "./types";

export function buildPrompt(challenge: Challenge, company: Company, query: string): string {
  const description = typeof company.description === "string" ? company.description : "No description provided.";
  const keywordsValue = Array.isArray(company.keywords) ? company.keywords : [];
  const keywords = keywordsValue.length ? keywordsValue.join(", ") : "None listed";

  return `
You are assisting with defense innovation scouting. Evaluate how well the
given company matches the challenge requirements and answer the analyst's
follow-up question. Use only the provided information.

Challenge Summary:
${challengeSummary(challenge)}

Company Profile:
- Name: ${company.name ?? "Unknown"}
- Domain: ${company.domain ?? "Unknown"}
- Address: ${company.address ?? "Unknown"}
- Title: ${company.title ?? "Unknown"}
- Keywords: ${keywords}
- Description: ${description}

Analyst Question: ${query || "No additional question supplied."}

Respond using the JSON schema below.
"""
${LLM_RESPONSE_SCHEMA}
"""
`.trim();
}

export async function callModel(
  prompt: string,
  model: string,
  host: string,
  timeoutMs = 60_000,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const endpoint = `${host.replace(/\/$/, "")}/api/generate`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        format: "json",
        options: {
          temperature: 0.2,
        },
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Model error (${response.status}): ${detail || "unknown error"}`);
    }

    const payload = (await response.json()) as { response?: string };
    if (typeof payload.response !== "string") {
      throw new Error("Model returned an unexpected payload.");
    }

    return payload.response.trim();
  } finally {
    clearTimeout(timeout);
  }
}

function parseLLMJson(raw: string): Record<string, JsonValue> {
  try {
    return JSON.parse(raw) as Record<string, JsonValue>;
  } catch (error) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1)) as Record<string, JsonValue>;
    }
    throw error;
  }
}

export async function evaluateCompany(
  company: Company,
  challenge: Challenge,
  query: string,
  model: string,
  host: string,
  minFitScore: number,
): Promise<{ match: boolean; evaluation: Evaluation }> {
  const prompt = buildPrompt(challenge, company, query);
  const rawContent = await callModel(prompt, model, host);
  const response = parseLLMJson(rawContent);

  const fit = (response.fit ?? {}) as Record<string, JsonValue>;
  const score = typeof fit.score === "number" ? fit.score : Number(fit.score ?? 0);
  const verdict = typeof fit.verdict === "string" ? fit.verdict : "no_fit";
  const rationale = typeof fit.rationale === "string" ? fit.rationale.trim() : "";
  const querySection = (response.query ?? {}) as Record<string, JsonValue>;
  const queryAnswer = typeof querySection.answer === "string" ? querySection.answer.trim().toLowerCase() : "unknown";
  const queryRationale =
    typeof querySection.rationale === "string" ? querySection.rationale.trim() : "";

  const evaluation: Evaluation = {
    fit: {
      score,
      verdict,
      rationale,
    },
    query: {
      answer: queryAnswer || "unknown",
      rationale: queryRationale,
    },
    raw: response,
  };

  const isMatch = verdict === "fit" && score >= minFitScore;
  return { match: isMatch, evaluation };
}
