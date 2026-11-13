/** One day, expressed as YYYY-MM-DD in UTC. */
export type UtcDayKey = string;

export interface DailyPuzzle<T> {
  dayKey: UtcDayKey;
  index: number;
  item: T;
}

export interface DailyPuzzleOptions {
  /** Same namespace and item order produce the same puzzle on every device. */
  namespace: string;
  /** By default, the current time. */
  at?: Date;
}

const DAY_MS = 86_400_000;

function assertValidDate(date: Date): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError("Expected a valid Date");
  }
}

/** A timezone-independent date key. Daily puzzles reset at 00:00 UTC. */
export function getUtcDayKey(date: Date = new Date()): UtcDayKey {
  assertValidDate(date);
  return date.toISOString().slice(0, 10);
}

/** FNV-1a 32-bit hash: deterministic, fast, and NOT cryptographically secure. */
export function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Reproducible PRNG for casual games; never use for security or money. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Choose one deterministic daily puzzle from a stable, non-empty item list. */
export function getDailyPuzzle<T>(
  items: readonly T[],
  options: DailyPuzzleOptions,
): DailyPuzzle<T> {
  if (items.length === 0) {
    throw new RangeError("Daily puzzle items must not be empty");
  }
  if (!options.namespace.trim()) {
    throw new RangeError("A non-empty puzzle namespace is required");
  }
  const dayKey = getUtcDayKey(options.at);
  const random = seededRandom(hash32(`${options.namespace}:${dayKey}`));
  const index = Math.floor(random() * items.length);
  return { dayKey, index, item: items[index]! };
}

/** Shuffle without changing the input array. */
export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  const random = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/** Milliseconds until the next 00:00 UTC boundary. */
export function millisecondsUntilUtcReset(at: Date = new Date()): number {
  assertValidDate(at);
  const next = Date.UTC(
    at.getUTCFullYear(),
    at.getUTCMonth(),
    at.getUTCDate() + 1,
  );
  return next - at.getTime();
}

function parsedDayMilliseconds(key: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const ms = Date.parse(`${key}T00:00:00.000Z`);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10) === key ? ms : null;
}

/**
 * Current completed-day streak. If today's puzzle is unfinished, yesterday
 * may still anchor the streak. Duplicate dates and malformed dates are ignored.
 */
export function currentStreak(
  solvedDays: readonly string[],
  at: Date = new Date(),
): number {
  const today = getUtcDayKey(at);
  const valid = new Set(
    solvedDays.filter((day) => parsedDayMilliseconds(day) !== null),
  );
  let cursor = parsedDayMilliseconds(today)!;
  if (!valid.has(today)) cursor -= DAY_MS;
  let streak = 0;
  while (valid.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

export interface ShareResult {
  name: string;
  dayKey: UtcDayKey;
  marks: readonly string[];
  url?: string;
}

/** Build a spoiler-free result string suitable for copying to social apps. */
export function formatShareResult(result: ShareResult): string {
  const lines = [`${result.name} ${result.dayKey}`, result.marks.join("")];
  if (result.url) lines.push(result.url);
  return lines.join("\n");
}
