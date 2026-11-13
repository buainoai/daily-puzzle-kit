import assert from "node:assert/strict";
import test from "node:test";
import {
  currentStreak,
  formatShareResult,
  getDailyPuzzle,
  getUtcDayKey,
  millisecondsUntilUtcReset,
  shuffleWithSeed,
} from "../src/index.ts";

test("UTC date key does not depend on the player's local timezone", () => {
  assert.equal(getUtcDayKey(new Date("2026-11-13T23:59:59Z")), "2026-11-13");
  assert.equal(getUtcDayKey(new Date("2026-11-14T00:00:00Z")), "2026-11-14");
});

test("daily selection is stable for everyone with the same list", () => {
  const list = ["word", "logic", "geography", "music"];
  const options = { namespace: "example-game", at: new Date("2026-11-13T12:00:00Z") };
  const a = getDailyPuzzle(list, options);
  const b = getDailyPuzzle(list, { ...options, at: new Date("2026-11-13T22:00:00Z") });
  assert.deepEqual(a, b);
  assert.equal(a.item, list[a.index]);
});

test("daily selection rejects missing data", () => {
  assert.throws(() => getDailyPuzzle([], { namespace: "a" }), RangeError);
  assert.throws(() => getDailyPuzzle([1], { namespace: " " }), RangeError);
});

test("seeded shuffle is repeatable and does not mutate input", () => {
  const original = [1, 2, 3, 4, 5];
  assert.deepEqual(shuffleWithSeed(original, 42), shuffleWithSeed(original, 42));
  assert.deepEqual(original, [1, 2, 3, 4, 5]);
  assert.deepEqual(shuffleWithSeed(original, 42).sort(), original);
});

test("UTC reset countdown", () => {
  assert.equal(millisecondsUntilUtcReset(new Date("2026-11-13T23:59:58Z")), 2_000);
});

test("current streak includes today or yesterday, not older days", () => {
  const at = new Date("2026-11-13T12:00:00Z");
  assert.equal(currentStreak(["2026-11-11", "2026-11-12"], at), 2);
  assert.equal(currentStreak(["2026-11-11", "2026-11-12", "2026-11-13"], at), 3);
  assert.equal(currentStreak(["2026-11-10"], at), 0);
  assert.equal(currentStreak(["2026-11-12", "2026-11-12", "not-a-date"], at), 1);
});

test("share result is readable without revealing answers", () => {
  assert.equal(
    formatShareResult({
      name: "Example Daily Puzzle",
      dayKey: "2026-11-13",
      marks: ["🟩", "🟨", "🟩"],
      url: "https://example.com",
    }),
    "Example Daily Puzzle 2026-11-13\n🟩🟨🟩\nhttps://example.com",
  );
});
