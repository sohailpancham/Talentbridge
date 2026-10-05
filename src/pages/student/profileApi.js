export const studyYears = [
  ["1", "First year"],
  ["2", "Second year"],
  ["3", "Third year"],
  ["4", "Fourth year"],
  ["5+", "Fifth year or above"],
];

export function yearLabel(value) {
  return studyYears.find(([id]) => id === value)?.[1] || value;
}

export async function requestProfile(userId, payload, signal) {
  const response = await fetch("/api/student/profile", {
    method: payload ? "PUT" : "GET",
    credentials: "include",
    cache: "no-store",
    signal,
    headers: {
      "X-TalentBridge-Account": String(userId),
      ...(payload
        ? { "Content-Type": "application/json", "X-TalentBridge-Request": "1" }
        : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      result?.message ||
        "Could not load or save your profile. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  if (
    String(result?.userId) !== String(userId) ||
    !result?.profile ||
    !Array.isArray(result.projects) ||
    !Number.isInteger(result.version)
  ) {
    throw new Error("Unexpected profile response. Refresh and try again.");
  }
  return result;
}
