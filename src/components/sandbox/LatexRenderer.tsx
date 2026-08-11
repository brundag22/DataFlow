import { useRef, useEffect, useState } from 'react';
import katex from 'katex';

interface Props {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function LatexRenderer({ latex, displayMode = true, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !latex) return;
    try {
      containerRef.current.innerHTML = katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
      });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      containerRef.current.innerHTML = '';
    }
  }, [latex, displayMode]);

  if (!latex) return null;

  return (
    <div className={`${className}`}>
      <div ref={containerRef} className="text-white/90 overflow-x-auto py-3 px-4 text-center" />
      {error && (
        <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs font-mono">{error}</p>
          <pre className="text-white/60 text-xs mt-1 font-mono overflow-x-auto">{latex}</pre>
        </div>
      )}
    </div>
  );
}
