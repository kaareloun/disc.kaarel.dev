export function formatDiff(diff: number) {
  if (diff === 0) {
    return "E";
  }

  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}
