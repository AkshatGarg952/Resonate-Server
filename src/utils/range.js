// src/utils/range.utils.js

export function evaluateValueAgainstRange(value, range) {
  if (value === null || value === undefined) {
    return {
      status: "unknown",
      reason: "Value not found in report",
    };
  }

  if (value < range.min) {
    return {
      status: "bad",
      reason: "Below normal range",
    };
  }

  if (value > range.max) {
    return {
      status: "bad",
      reason: "Above normal range",
    };
  }

  return {
    status: "good",
    reason: "Within normal range",
  };
}
