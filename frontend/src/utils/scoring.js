export function scoreLabel(score) {
  if (score >= 85) return "Excellent fit";
  if (score >= 70) return "Good fit";
  if (score >= 50) return "Partial fit";
  return "Poor fit";
}

export function scoreRgb(score) {
  if (score >= 70) return [22, 163, 74];
  if (score >= 50) return [217, 119, 6];
  return [220, 38, 38];
}