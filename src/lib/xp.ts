// Soft exponential XP curve: level N needs base * N^1.5 cumulative.
// Each level boundary: cumulative XP = round(80 * level^1.5)

const BASE = 80;

export function xpForLevel(level: number): number {
  // cumulative XP required to REACH this level (start of level)
  if (level <= 1) return 0;
  return Math.round(BASE * Math.pow(level, 1.5));
}

export function levelFromXp(xp: number): number {
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}

export function progressInLevel(xp: number) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const into = xp - floor;
  const span = ceil - floor;
  return { level, into, span, ceil, floor, pct: span === 0 ? 0 : (into / span) * 100 };
}
