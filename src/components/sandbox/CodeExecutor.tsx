import { useState, useRef, useCallback, useEffect } from 'react';

interface Props { code: string; className?: string; }
interface OutputLine { type: 'log' | 'error' | 'warn' | 'result'; message: string; }

export function CodeExecutor({ code, className = '' }: Props) {
  const [editableCode, setEditableCode] = useState(code);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    workerRef.current?.terminate();
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const runCode = useCallback(() => {
    workerRef.current?.terminate();
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setIsRunning(true); setOutput([]); setExecutionTime(null);
    const started = performance.now();
    const workerModuleUrl = new URL('./codeWorker.ts', import.meta.url).href;
    const blobUrl = URL.createObjectURL(new Blob([`import ${JSON.stringify(workerModuleUrl)};`], { type: 'text/javascript' }));
    const worker = new Worker(blobUrl, { type: 'module' });
    URL.revokeObjectURL(blobUrl);
    workerRef.current = worker;
    const finish = (lines: OutputLine[]) => {
      worker.terminate(); workerRef.current = null;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setOutput(lines); setExecutionTime(performance.now() - started); setIsRunning(false);
    };
    worker.onmessage = ({ data }) => { if (data.type === 'complete') finish(data.logs); };
    worker.onerror = event => finish([{ type: 'error', message: `Error: ${event.message}` }]);
    worker.postMessage({ code: editableCode });
    timeoutRef.current = window.setTimeout(() => finish([{ type: 'error', message: 'Error: execution timed out after 3 seconds' }]), 3000);
  }, [editableCode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
    if (e.key === 'Tab') {
      e.preventDefault(); const target = e.target as HTMLTextAreaElement; const start = target.selectionStart;
      setEditableCode(editableCode.substring(0, start) + '  ' + editableCode.substring(target.selectionEnd));
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + 2; }, 0);
    }
  }, [editableCode, runCode]);

  return <div className={`space-y-3 ${className}`}>
    <div className="relative rounded-xl overflow-hidden border border-white/10">
      <div className="absolute top-2 right-2 text-[9px] text-white/20 px-2 py-0.5 rounded bg-white/[0.04] font-mono z-10">Ctrl+Enter to run</div>
      <textarea value={editableCode} onChange={e => setEditableCode(e.target.value)} onKeyDown={handleKeyDown}
        className="w-full bg-[#080620] p-4 font-mono text-sm text-emerald-300 resize-y min-h-[140px] focus:outline-none leading-[18px] code-editor" spellCheck={false} />
    </div>
    <div className="flex items-center gap-2">
      <button onClick={runCode} disabled={isRunning} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium disabled:opacity-50">{isRunning ? '⏳ Running...' : '▶ Run'}</button>
      <button onClick={() => setOutput([])} className="px-3 py-2 text-white/40 text-sm hover:text-white/70 rounded-lg">Clear</button>
      <button onClick={() => setEditableCode(code)} className="px-3 py-2 text-white/40 text-sm hover:text-white/70 rounded-lg">Reset</button>
      {executionTime !== null && <span className="ml-auto text-[11px] text-white/25 font-mono">⏱ {executionTime.toFixed(2)}ms</span>}
    </div>
    <p className="text-xs text-white/30">Code runs in a worker with no DOM, window, IndexedDB, or canvas access.</p>
    {output.length > 0 && <div className="rounded-xl bg-black/40 border border-white/10 overflow-hidden"><div className="px-4 py-2 border-b border-white/[0.06] text-[10px] text-white/30 uppercase tracking-wider">Console Output</div><div className="p-4 font-mono text-sm max-h-48 overflow-y-auto space-y-1">{output.map((line, i) => <div key={i} className={`break-all whitespace-pre-wrap ${line.type === 'error' ? 'text-red-400' : line.type === 'warn' ? 'text-yellow-400' : line.type === 'result' ? 'text-cyan-400' : 'text-emerald-400'}`}>{line.message}</div>)}</div></div>}
  </div>;
}
