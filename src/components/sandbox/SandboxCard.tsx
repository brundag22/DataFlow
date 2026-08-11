import type { KnowledgeNode } from '../../types';
import { LatexRenderer } from './LatexRenderer';
import { MermaidRenderer } from './MermaidRenderer';
import { CodeExecutor } from './CodeExecutor';

interface Props {
  node: KnowledgeNode;
}

export function SandboxCard({ node }: Props) {
  const hasContent = node.latex || node.mermaid || node.code;
  
  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/30">
        <span className="text-4xl mb-4">⚡</span>
        <p className="text-sm font-medium">No sandbox content available</p>
        <p className="text-xs mt-1">Add LaTeX, Mermaid diagrams, or code to this node</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {node.latex && (
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
            <span className="text-cyan-400 text-sm">Σ</span>
            <h3 className="text-sm font-semibold text-white/70">Formula</h3>
          </div>
          <LatexRenderer latex={node.latex} className="p-4" />
        </div>
      )}
      {node.mermaid && (
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
            <span className="text-violet-400 text-sm">◥</span>
            <h3 className="text-sm font-semibold text-white/70">Diagram</h3>
          </div>
          <MermaidRenderer chart={node.mermaid} className="p-4" />
        </div>
      )}
      {node.code && (
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
            <span className="text-emerald-400 text-sm">▶</span>
            <h3 className="text-sm font-semibold text-white/70">Live Code</h3>
          </div>
          <CodeExecutor code={node.code} className="p-4" />
        </div>
      )}
    </div>
  );
}
