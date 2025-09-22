# Repository Guidelines

## Project Structure & Module Organization
The Vite + React client lives under `src/`, with `main.tsx` bootstrapping the UI and `App.tsx` hosting the scoring + poster experience. Shared UI primitives are in `src/components/ui/` (shadcn-derived) and should stay presentation-only. Static assets and printable art files belong in `public/`. Serverless endpoints for scoring and leaderboard aggregation sit in `api/` and are designed for Vercel’s edge runtime; keep request parsing and Redis access isolated in this layer.

## Build, Test, and Development Commands
Install deps once with `npm install`. Use `npm run dev` for the hot-reloading client during feature work. Run `npm run build` to produce the production bundle in `dist/`, and `npm run preview` to smoke-test that bundle locally. When you need API parity with production, run `npx vercel dev` so the `api/*.mjs` handlers execute alongside the Vite dev server.

## Coding Style & Naming Conventions
Stick to idiomatic TypeScript + React functional components. Follow the existing Prettier-style formatting—two-space indentation, double quotes, trailing semicolons, and arrow functions. Import shared modules via the `@/` alias (set in `tsconfig.json` and `vite.config.ts`). Use PascalCase for components, camelCase for utilities, and kebab-case for file names. Tailwind utility classes should read from left to right in layout → spacing → typography order; keep custom tokens in `src/styles.css`.

## Testing Guidelines
There is no automated suite yet, so document manual QA in each PR. Run `npm run dev`, exercise the rubric sliders, and confirm leaderboard/API requests succeed with sample payloads (e.g., `curl -X POST api/score`). When adding tests, place them next to the code as `*.test.tsx` or in `src/__tests__/`, and prefer Vitest + React Testing Library for future coverage.

## Commit & Pull Request Guidelines
Write concise, imperative commit subjects (~70 characters) that mention the affected surface—avoid placeholder messages like `hey`. Group related edits into a single commit where possible. PRs should explain the intent, list manual test steps, reference any issue IDs, and include before/after visuals for UI tweaks. Call out new environment variables or migrations so deploy previews stay healthy.

## Security & Configuration Tips
Keep secrets out of commits; store `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `JURY_PASSWORD` in `.env.local` or Vercel project settings. Rotate tokens after sharing temporary previews. For new API routes, default responses to `no-store` caching like `api/leaderboard.mjs` to avoid stale scoring data.
