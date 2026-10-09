import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'dark',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#e0e8ff',
    primaryBorderColor: '#4338ca',
    lineColor: '#a78bfa',
    secondaryColor: '#1e1b4b',
    tertiaryColor: '#0f0d2e',
    background: '#0f0d2e',
    mainBkg: '#1e1b4b',
    nodeBorder: '#4338ca',
    clusterBkg: '#1e1b4b',
    titleColor: '#e0e8ff',
    edgeLabelBackground: '#0f0d2e',
  },
  flowchart: {
    curve: 'basis',
    padding: 15,
  },
});

let globalMermaidCounter = 0;

interface Props {
  chart: string;
  className?: string;
}

export function MermaidRenderer({ chart, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    if (!chart) return;
    let cancelled = false;

    const renderChart = async () => {
      const uniqueId = `mermaid-${Date.now()}-${globalMermaidCounter++}`;
      try {
        const { svg } = await mermaid.render(uniqueId, chart);
        if (!cancelled) {
          setSvgContent(DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } }));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setSvgContent('');
        }
        // Clean up any orphaned elements mermaid may have created
        const orphan = document.getElementById(uniqueId);
        if (orphan) orphan.remove();
      }
    };

    renderChart();
    return () => { cancelled = true; };
  }, [chart]);

  if (!chart) return null;

  return (
    <div className={`rounded-xl bg-surface-900/50 p-4 overflow-x-auto ${className}`}>
      {svgContent && (
        <div
          ref={containerRef}
          className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
      {error && (
        <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs font-mono">Mermaid Error: {error}</p>
          <pre className="text-white/60 text-xs mt-1 font-mono overflow-x-auto whitespace-pre-wrap">{chart}</pre>
        </div>
      )}
    </div>
  );
}
