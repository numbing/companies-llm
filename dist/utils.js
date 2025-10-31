"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coercePositiveInteger = coercePositiveInteger;
function coercePositiveInteger(raw, fallback) {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.floor(parsed);
}
