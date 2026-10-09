# Changelog

## Unreleased

### Added

- FSRS learning steps, pure scheduling previews, streak calculation, and scheduler tests.
- Worker-isolated code execution with a three-second timeout.
- Sanitized Markdown and Mermaid output plus untrusted KaTeX rendering.
- Node CRUD, prerequisite cycle validation, JSON export/import, optional gating, and Dagre layout.
- ESLint, Prettier, Vitest, typecheck scripts, and GitHub Actions CI.

### Changed

- Corrected repository hygiene and README stack documentation.
- Persisted graph positions only after drag operations stop.
- Replaced sequential activity queries with one IndexedDB range query.
- Added Dexie version 2 migration and visible startup failure state.
