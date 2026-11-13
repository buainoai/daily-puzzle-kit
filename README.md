# Daily Puzzle Kit

Small, framework-agnostic TypeScript utilities for building **daily browser games**, **Wordle-style puzzles**, and **DLE games**.

Create a shared daily puzzle without running a database or server just to choose today's challenge. The same UTC date, namespace, and item list produce the same result on every device.


## Features

- **Deterministic daily puzzle selection** with a stable 00:00 UTC reset
- **Seeded shuffle and random numbers** for repeatable game boards
- **UTC reset countdown** for displaying the next puzzle time
- **Local streak calculations** without a user account
- **Spoiler-free results** for copy-and-share game scores
- **Zero runtime dependencies**, works with Astro, plain TypeScript, React, or other front ends

## Quick start

Requires Node.js 22.7 or later for the built-in TypeScript test runner.

```bash
npm install
npm test
npm run build
```

```ts
import {
  getDailyPuzzle,
  currentStreak,
  formatShareResult,
} from "./src/index.js";

const today = getDailyPuzzle(
  ["WORD", "LOGIC", "MAP", "MUSIC"],
  { namespace: "my-daily-game-v1" },
);

console.log(today.dayKey, today.item);
console.log(currentStreak(["2026-11-11", "2026-11-12"]));
console.log(formatShareResult({
  name: "My Daily Game",
  dayKey: today.dayKey,
  marks: ["🟩", "🟨", "🟩"],
  url: "https://example.com",
}));
```

For direct use in a TypeScript project, copy `src/index.ts` or compile this package with `npm run build` and import from `dist/index.js`.

## Important behavior

1. The daily boundary is **00:00 UTC**, not local midnight. Adapt it before using a different reset time.
2. All players must have the same, identically ordered puzzle list and namespace. If the list changes, past puzzles may change. Version the namespace or snapshot the item list when you update it.
3. Pseudorandom selection is **not cryptographically secure** and does not prevent people from seeing future puzzles. Do not use it for prizes, betting, or other security-sensitive outcomes.
4. Streaks are calculated from dates supplied by the client. Persist them in local storage or your own account system as needed.

## Development

```bash
npm run build
npm test
```

The repo is intentionally small: one core TypeScript module and built-in Node.js tests. The tests run against source with Node's TypeScript type stripping; publishing JavaScript still requires a TypeScript build. No UI framework or server is required.

## Licensing and npm publication

This public repository is a starter project, **not an npm-published package**. Its `package.json` is marked private to avoid accidental npm publication; that setting does not make the GitHub repository private. A public repository does not automatically grant open-source reuse rights. Before inviting third-party code reuse, confirm ownership and add a license (MIT is a typical option for this kind of utility).
