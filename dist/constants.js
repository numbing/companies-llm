"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLM_RESPONSE_SCHEMA = exports.DEFAULT_MODEL = void 0;
exports.DEFAULT_MODEL = "deepseek-v3.1:671b-cloud";
exports.LLM_RESPONSE_SCHEMA = `
{
  "fit": {
    "score": "float between 0 and 1 indicating how well the company fits the challenge.",
    "verdict": "\\"fit\\" if score >= 0.5, else \\"no_fit\\".",
    "rationale": "Concise explanation of the fit assessment."
  },
  "query": {
    "answer": "\\"yes\\", \\"no\\", or \\"unknown\\" based on the analyst question.",
    "rationale": "Short explanation referencing the company data."
  }
}
`.trim();
