export function normalizeScoreToPercent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }

  const scaledValue = Math.abs(value) <= 1 ? value * 100 : value;
  const roundedValue = Math.round(scaledValue);

  return Math.max(0, Math.min(100, roundedValue));
}

export function formatScorePercent(value: number | null | undefined): string {
  const normalizedScore = normalizeScoreToPercent(value);
  return normalizedScore == null ? '—' : `${normalizedScore}%`;
}

export function scoreToProgressValue(value: number | null | undefined): number {
  return normalizeScoreToPercent(value) ?? 0;
}
