# PLSS Cloud-Agent Guide

## Project at a glance

This is the Utah GIS Public Lands Survey System (PLSS) application: a React map for viewing PLSS monuments and submitting monument records. It is a pnpm workspace with two Node 24 packages:

- The root package is a React 19, Vite 8, Tailwind 4, ArcGIS JavaScript SDK web app. It deploys as Firebase Hosting.
- `functions/` contains ESM Firebase Functions v2 (HTTP callables plus Auth, Firestore, and Storage triggers). Firebase Hosting and Functions both target Node 24 (`firebase.json`, `package.json`, and `functions/package.json`).

The repository is small application source plus a large generated/installed ArcGIS asset surface. Do not inspect or edit `public/assets/`, `dist/`, coverage output, `node_modules/`, or `.emulator-data/`; they are generated or local data. Trust this guide and search only when it is incomplete or demonstrably wrong.

## Bootstrap and commands

Always use pnpm 11 and Node 24. CI installs Java 21 for Firebase emulators; a Java 21-or-newer runtime is required locally for storage-rules tests. From the repository root, run:

```sh
pnpm install --frozen-lockfile
```

This is the CI bootstrap and succeeds with the committed lockfile. `pnpm-workspace.yaml` has strict package-age and approved-build policies; do not use another package manager or rewrite the lockfile unless the task changes dependencies.

Run validation in this order after relevant changes:

```sh
CI=1 pnpm test:ci
pnpm lint
pnpm check
pnpm build
```

- `test:ci` starts a temporary Firebase Storage emulator on port 9199 and runs all Vitest suites, including Functions, shared schemas, state machines, UI utilities, and `storage.rules.test.mjs`. It passed locally with 9 files / 323 tests in about 17 seconds after emulator startup. `CI=1` is essential locally because `pnpm test` includes `--ui --open`; without CI it opens the Vitest UI and remains interactive. Firebase may report a nonfatal Java `Unsafe` deprecation warning or use logging port 4501 if 4500 is occupied.
- `lint` is the PR gate: root ESLint uses `@ugrc/eslint-config` and fails on any warning. The Functions package has a legacy local lint script, but root `pnpm lint` covers repository CI.
- `build` runs Vite and writes the deployable Firebase Hosting bundle to `dist/`, including copied ArcGIS assets. The production build passed locally. A generated-CSS pseudo-class warning can appear and is currently nonfatal.
- `pnpm format` modifies files. Run `pnpm exec prettier --write <modified-files>` as appropriate for changed files that Prettier supports. Use `pnpm exec prettier --check <changed-files>` when a formatting-only validation is needed; Prettier organizes imports and Tailwind classes.

For interactive development, first authenticate with Firebase, copy `.env` to `.env.local`, and copy `functions/.secret` to `functions/.secret.local`; populate the existing placeholders with authorized development values. Never commit either local file or secrets. Then run `pnpm start` and use `http://localhost:5173/`. It starts Vite and Auth/Functions/Firestore/Storage emulators; it waits for the Firebase emulator UI at port 4000. It is a long-running command, not a PR validation. `pnpm dev:firebase-state` imports and exports `.emulator-data`; use it only when persistent emulator data is wanted. Deploy commands require repository/cloud credentials and should not be run by a cloud agent.

## Architecture and change locations

- `src/main.jsx` configures Firebase and React Query providers, then renders `src/components/app/App.jsx`. Firebase configuration is parsed from `VITE_FIREBASE_CONFIG`; other browser-visible variables must use the `VITE_` prefix.
- `src/components/pageElements/` contains map-oriented screens and the corner-submission wizard; `formElements/` contains reusable inputs; `layoutElements/` has navigation/drawer; `machines/` contains XState logic; `reducers/AppReducer.js` owns app-level UI/map state. Add or update nearby `*.test.js` / `*.stories.jsx` using existing patterns.
- `functions/index.js` is the Functions export and authorization boundary. Keep its lazy imports and v2 trigger/callable conventions; implement endpoint bodies in `functions/https/`, document-trigger code in `functions/database/submissions/`, and reusable validation/formatting in `functions/shared/`. Sensitive integrations use `defineSecret` (`SENDGRID_API_KEY`, `SHARED_DRIVE_ID`), not client environment variables.
- `functions/firebase.js` intentionally configures localhost and the dev Firebase project for `NODE_ENV=development` or `test`.
- `firestore.rules`, `storage.rules`, and `firestore.indexes.json` are deployed Firebase configuration. Storage rules have the executable root test above; preserve the 5 MB and authenticated-user constraints unless requirements intentionally change. Firestore submissions/stats require an authenticated, elevated submitter.
- `vite.config.js` is Vite/Vitest configuration and hardcodes `FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199` for tests. `firebase.json` controls Functions runtime, Hosting `dist/`, rewrites, security headers, and emulator ports. `eslint.config.js`, `.prettierrc`, and `pnpm-workspace.yaml` are the style and package-policy configuration.

## CI and delivery

`.github/workflows/pull_request.yml` is the required PR pipeline: pnpm 11, Node from `package.json`, frozen install, Java 21, `pnpm test:ci`, then `pnpm lint`. Preview deployment occurs only after those pass and only for eligible non-`dev` PR authors; it builds with `pnpm build --mode dev` and protected Firebase credentials. Do not depend on previews to validate a change.

Pushes to `main` and `dev` use the release automation. Published prereleases deploy to staging and releases deploy to production through protected credentials; both build with `pnpm build`. Repository root also contains `README.md` (local setup and domain context), `firebase.json`, rules/index configuration, `vite.config.js`, `eslint.config.js`, `pnpm-lock.yaml`, `CHANGELOG.md`, and `AI_ATTESTATION.md`.
