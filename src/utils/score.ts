export function formatDiff(diff: number) {
  if (diff === 0) {
    return "E";
  }

  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

export function formatAverageDiff(diff: number) {
  const rounded = Math.round(diff * 10) / 10;
  if (rounded === 0) {
    return "±0";
  }

  return rounded > 0 ? `+${rounded.toFixed(1)}` : `−${Math.abs(rounded).toFixed(1)}`;
}
