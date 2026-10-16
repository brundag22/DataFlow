# DataFlow web cards and graph tutorial

## Implementation approach

Preserve the existing React Flow graph, Dexie/IndexedDB storage, and FSRS scheduler. The repository already starts empty after the sample-node removal, so no seed cards will be reintroduced and existing user data will not be deleted automatically. Add an in-app tutorial that explains how to create a knowledge card/node, connect prerequisites, add Markdown/LaTeX/Mermaid/code content, and review the resulting card.

Markdown fenced blocks will be routed by language: `mermaid` renders through the existing strict Mermaid renderer, JavaScript-family blocks use the existing isolated Web Worker runner, and all other fenced blocks remain syntax-preserving code. This keeps execution browser-based and avoids local-machine APIs.

## Project structure

- `src/components/tutorial/TutorialModal.tsx`: guided card/graph creation tutorial and examples.
- `src/components/sandbox/MarkdownRenderer.tsx`: Markdown fence routing for Mermaid and browser-worker code.
- `src/components/sandbox/CodeExecutor.tsx`: browser-only execution UI and safety messaging.
- `src/App.tsx`, `src/components/layout/Header.tsx`, `src/components/graph/GraphCanvas.tsx`: tutorial entry points.
- `public/manus-routes.json`: static route manifest for the web app.

## Design

### Considered styles
- **Guided constellation** (0.06): a focused dark learning overlay with indigo/cyan path markers.
- **Notebook studio** (0.05): warm paper-like cards and an editor-first tutorial.
- **Technical cockpit** (0.04): dense utility panels and diagnostic readouts.

Chosen: **Guided constellation**.

- **Design Movement:** dark spatial canvas with luminous wayfinding, matching the existing graph aesthetic.
- **Core Principles:** teach by doing; preserve context; expose safe execution boundaries; keep each step scannable.
- **Color Philosophy:** indigo signals structure, cyan signals progression, emerald signals runnable content, and amber signals memory/review.
- **Layout Paradigm:** a compact left-to-right step path inside a centered overlay, with the graph visible behind it.
- **Signature Elements:** numbered orbit dots, compact code chips, and a glowing next-step action.
- **Interaction Philosophy:** a tutorial is always dismissible, resumable, and never mutates graph data.
- **Animation:** short fade/slide transitions only; no looping motion that competes with graph work.
- **Typography System:** existing system UI sans for prose and monospace for IDs, Markdown fences, and runtime labels.
- **Brand Essence:** a visual memory map for building connected study cards; spatial, practical, calm.
- **Brand Voice:** “Build one useful card.” / “Link the idea that comes before it.”
- **Wordmark & Logo:** retain the existing D mark so the update feels native.
- **Signature Brand Color:** indigo `#6366f1`, paired with cyan for forward motion.

## Required behavior

- The app remains empty by default; no example nodes/cards are seeded.
- Tutorial can be opened from the header and empty-graph onboarding.
- Tutorial explains new node/card creation, prerequisite linking, content blocks, graph layout, and review.
- Markdown fenced `mermaid` blocks render as diagrams.
- Markdown fenced JavaScript/TypeScript blocks run in an isolated Web Worker with the existing timeout and captured console.
- Non-executable fences remain readable and do not execute.
- Existing scheduler, graph persistence, export/import, and security constraints remain unchanged.
- The app is served as a web build with a static route manifest.
