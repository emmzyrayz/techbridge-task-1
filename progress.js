const PROGRESS_STORAGE_KEY = "techbridge-attempted-challenges";

function getAttemptedChallengeIds() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markChallengeAttempted(id) {
  const attempted = getAttemptedChallengeIds();
  if (!attempted.includes(id)) {
    attempted.push(id);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(attempted));
  }
  return attempted;
}
