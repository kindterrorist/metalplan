# Project Analysis — MetalPlans (snapshot)

Date: 2026-02-09

## High-level inventory
- Frontend: React + Vite (source under `src/`, `components/`, `views/`)
- Electron: `electron/` with `main.js`, `preload.js`, `database.js`, migrations
- Bundles: `dist-react/` (built assets present in repo)
- Scripts: Common Node/Electron scripts and CJS utilities in root (`*.cjs`, `run-migration-006.cjs`, etc.)
- Key files inspected: `vite.config.ts`, `services/geminiService.ts`, `utils/security.cjs`, `services/exportService.ts`, `src/hooks/useUIState.ts`

## Major findings / problems
1. Secrets exposure and API key handling
   - `vite.config.ts` injects `process.env.GEMINI_API_KEY` into the client bundle at build time (bakes secret into frontend if set at build). See [vite.config.ts](vite.config.ts#L1-L40).
   - The UI stores the Gemini API key in `localStorage` (`localStorage.setItem("gemini_api_key", key)`) and passes it from renderer to the `@google/genai` client in the browser. See [src/hooks/useUIState.ts](src/hooks/useUIState.ts#L1-L260) and [services/geminiService.ts](services/geminiService.ts#L1-L120).
   - Risk: API keys present in client memory/storage or bundle can be extracted by an attacker or a user; calls made from renderer leak usage and quota, and increase attack surface.

2. Cryptography and credential storage weaknesses
   - `utils/security.cjs` uses a hard-coded default `encryptionKey` and `scryptSync(seed, "salt", 32)` with a static salt string. It also uses SHA-256 without a per-password salt for `hashPassword`. See [utils/security.cjs](utils/security.cjs#L1-L200).
   - Risks: predictable keys and lack of per-password salt makes stored hashes vulnerable; encryption key derivation with static salt undermines encryption strength.

3. Unsafe DOM operations / XSS surface
   - `services/exportService.ts` and `utils/exportUtils.ts` build HTML strings and use `innerHTML` to render templates for export and `html2canvas`. See [services/exportService.ts](services/exportService.ts#L1-L240) and `utils/exportUtils.ts` (found in repo).
   - Risk: if any user-provided data (athlete names, notes) is inserted without escaping, exported HTML or generated images could include malicious scripts or markup.

4. Weak typing and `any` usage across the codebase
   - Many `any` and `as any` usages found in UI components and hooks (e.g., views, export modal, contexts). This reduces type-safety and allows bugs to pass unnoticed. (Search matches across `src/`, `views/`, `components/`).

5. Verbose console/debug output
   - Several scripts and migration utilities use `console.log` heavily (migration runner, backupManager, migration scripts, cjs tests). While useful for local dev, consider controlled logging or debug flags for production.

6. Committed build artifacts and vendor code
   - `dist-react/` contains built bundles and vendor code (also includes the `@google/genai` client bundle). Keeping built bundles in the repo increases repo size and can unintentionally store secrets or versions. Prefer .gitignore for build outputs.

7. Dependency surface
   - Noted dependencies: `@google/genai`, `better-sqlite3`, `electron`, `electron-builder`, `vite`, `react` etc. Versions should be audited for vulnerabilities and compatibility (next step: `npm audit` / `npm outdated`).

## Recommended actionable improvements (prioritized)
1. Secrets & API calls
   - Remove any secret injection into client bundles. Do NOT use `define` to bake `GEMINI_API_KEY` into the frontend. Replace with a safe IPC pattern:
     - Store secrets in Electron main process or OS keychain (use `keytar` or platform credential store).
     - Renderer asks main (via secure IPC) to perform Gemini requests. Main performs calls server-side using stored API key and returns safe responses.
   - Stop storing API keys in `localStorage`. Use secure storage or prompt per-session and keep in-memory only.

2. Cryptography & password handling
   - Replace `hashPassword` with a salted, adaptive KDF: use `bcrypt`, `argon2`, or `scrypt` with per-password random salt. Do not use plain SHA-256 for passwords.
   - Avoid hardcoded `encryptionKey` defaults. Require operator to set a secure key, or derive a key per-installation with user-provided passphrase plus strong salt.
   - Use unique salts and store them alongside password hashes. Use established libraries rather than custom crypto flows.

3. DOM safety
   - Avoid unsanitized `innerHTML` with user content. Use safe templating and HTML escaping for user-provided fields. If `innerHTML` is required, strictly sanitize inputs and clearly document the data flow.

4. TypeScript safety
   - Enable stricter TypeScript options in `tsconfig.json`: at minimum `noImplicitAny: true`, preferably `strict: true`.
   - Replace `as any` and `any` with proper types incrementally, starting from core modules and contexts.

5. Repo hygiene & CI
   - Remove/ignore `dist-react/` from source control; add build outputs to `.gitignore` and use CI to generate artifacts.
   - Add a linting and formatting pipeline: `ESLint`, `Prettier`, and TypeScript config checks on CI.
   - Add `npm audit` and automated dependency checking (Dependabot or similar) in CI.

6. Logging and error handling
   - Replace ad-hoc `console.log` statements in production code with a configurable logger (log levels) and sensitive data redaction.

7. Security scanning & tests
   - Run `npm audit` and check for vulnerable packages.
   - Add unit tests for `SecurityManager` behaviors and add integration tests around export and migration flows.

## Files of interest (inspect / fix)
- [vite.config.ts](vite.config.ts#L1-L40) — remove secret baking
- [src/hooks/useUIState.ts](src/hooks/useUIState.ts#L1-L260) — remove localStorage secrets
- [services/geminiService.ts](services/geminiService.ts#L1-L120) — move API calls to main or trusted layer
- [utils/security.cjs](utils/security.cjs#L1-L200) — fix crypto usage
- [services/exportService.ts](services/exportService.ts#L1-L240) & [utils/exportUtils.ts](utils/exportUtils.ts#L1-L999) — sanitize HTML templates

## Next recommended actions I can do now
- Run `npm audit` and report vulnerabilties (requires running `npm` in workspace).
- Propose and implement concrete changes: move Gemini calls to Electron `main.js` using secure IPC and `keytar` storage, and update UI to request suggestion via IPC.
- Replace insecure password hashing with `bcrypt`/`argon2` implementation.
- Add `tsconfig` stricter options and a small PR fixing top `any` occurrences.

---

If you want, I can now:
- Run `npm audit` and `npm outdated` and paste the results here.
- Start implementing the safer API-key flow (store in keychain + main-process proxy + remove localStorage usage).
- Create linting and TypeScript strictness changes and fix a first batch of `any` usages.

Tell me which next action you'd like me to take.