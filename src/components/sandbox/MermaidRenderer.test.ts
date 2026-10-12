import { describe, expect, it } from 'vitest';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

describe('Mermaid diagrams', () => {
  it('parses a supported flowchart', async () => {
    await expect(mermaid.parse('graph TD\n  A-->B')).resolves.toMatchObject({ diagramType: 'flowchart-v2' });
  });

  it('rejects invalid diagram syntax', async () => {
    await expect(mermaid.parse('not-a-mermaid-diagram')).rejects.toBeDefined();
  });
});
