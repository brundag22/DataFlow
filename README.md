# DataFlow

DataFlow is a local-first knowledge graph and spaced-repetition workspace for organizing technical concepts. Nodes are connected on an interactive canvas and can carry review metadata, formulas, Mermaid diagrams, and executable JavaScript examples.

## Key Features

- **Knowledge graph canvas:** Explore concept nodes and prerequisite relationships with `@xyflow/react`.
- **Spaced repetition:** Review due cards with an FSRS-inspired scheduler and four rating choices.
- **Node detail views:** Inspect descriptions, tags, prerequisites, LaTeX formulas, Mermaid diagrams, and code examples.
- **Code sandbox:** Run node examples with captured console output and optional canvas rendering in the browser.
- **Local-first persistence:** Store nodes, cards, review logs, and graph positions in IndexedDB through Dexie.
- **Review analytics:** View due-card counts, retention, review activity, and category breakdowns in the statistics panel.
- **Dark interface:** Use the responsive dark-themed interface for graph navigation, node details, and reviews.

## Technical Stack

| Area | Technology |
| --- | --- |
| UI | React 19.1 with React DOM |
| Language | TypeScript 5.8 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Graph canvas | `@xyflow/react` 12 |
| State management | Zustand 5 |
| Persistence | Dexie 4 and `dexie-react-hooks` |
| Mathematical rendering and evaluation | KaTeX 0.16 and mathjs 14 |
| Diagram rendering | Mermaid 11 |

## Installation and Development

1. Clone the repository and enter the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — run the TypeScript project build and create a production bundle.

## Current Scope

DataFlow currently focuses on the graph, node-detail, review, sandbox, and statistics workflows. Automated tests, import/export, node CRUD, and additional accessibility and security hardening are tracked as follow-up engineering work.
