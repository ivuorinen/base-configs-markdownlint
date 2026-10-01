# Architecture Profile

Generated: 2026-09-25

Confidence: none — manual review required

## Detected Patterns

Detected: none.

No catalogued pattern reaches Low confidence. Structural evidence:

- Source is two files: `index.json` (the markdownlint rule set) and `scripts/postinstall.cjs` (install-time
  starter-file writer).
- Import edges: `scripts/postinstall.cjs` → `@ivuorinen/config-checker` and Node built-ins. `index.json` is data;
  consumers reach it through markdownlint's `extends` resolution.
- `package.json` `exports` routes `.` → `./index.json`; `main` is `index.json`.

Shape, for orientation (descriptive, not a catalogued pattern): shareable-config package — one JSON data file plus
one install-time script with a side effect outside its own tree (`INIT_CWD`).

## Detected Combination

None.

## Inferred Structural Rules

None.

## Ambiguities & Contradictions

None.
