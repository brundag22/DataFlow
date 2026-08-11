import { useState, useRef, useCallback } from 'react';
import * as math from 'mathjs';

interface Props {
  code: string;
  className?: string;
}

interface OutputLine {
  type: 'log' | 'error' | 'warn' | 'result';
  message: string;
}

export function CodeExecutor({ code, className = '' }: Props) {
  const [editableCode, setEditableCode] = useState(code);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);
    setExecutionTime(null);
    setShowCanvas(false);

    const logs: OutputLine[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
      error: (...args: any[]) => logs.push({ type: 'error', message: args.map(a => String(a)).join(' ') }),
      warn: (...args: any[]) => logs.push({ type: 'warn', message: args.map(a => String(a)).join(' ') }),
      info: (...args: any[]) => logs.push({ type: 'log', message: args.map(a => String(a)).join(' ') }),
    };

    const start = performance.now();
    try {
      // Check if code uses canvas
      const usesCanvas = editableCode.includes('canvas') || editableCode.includes('getContext');
      if (usesCanvas) {
        setShowCanvas(true);
        // Wait for canvas to be in DOM
        await new Promise(r => setTimeout(r, 50));
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      // Build the sandbox function
      const fn = new Function(
        'math', 'console', 'performance', 'canvas', 'ctx',
        'JSON', 'Array', 'Math', 'Object', 'String', 'Number', 'parseInt', 'parseFloat',
        'Map', 'Set', 'Promise', 'setTimeout', 'Infinity', 'NaN', 'undefined', 'isNaN', 'isFinite',
        editableCode
      );
      
      const result = await fn(
        math, customConsole, performance, canvas, ctx,
        JSON, Array, Math, Object, String, Number, parseInt, parseFloat,
        Map, Set, Promise, setTimeout, Infinity, NaN, undefined, isNaN, isFinite,
      );
      
      if (result !== undefined) {
        logs.push({ type: 'result', message: `→ ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}` });
      }
    } catch (err) {
      logs.push({ type: 'error', message: `Error: ${String(err)}` });
    }
    const end = performance.now();

    setOutput(logs);
    setExecutionTime(end - start);
    setIsRunning(false);
  }, [editableCode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
    // Tab to indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = editableCode.substring(0, start) + '  ' + editableCode.substring(end);
      setEditableCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }, [editableCode, runCode]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Code Editor */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 group">
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          <span className="text-[9px] text-white/20 px-2 py-0.5 rounded bg-white/[0.04] font-mono">
            Ctrl+Enter to run
          </span>
        </div>
        <div className="absolute top-0 left-0 w-10 h-full bg-white/[0.02] border-r border-white/[0.04] flex flex-col items-center pt-4 text-[10px] text-white/15 font-mono leading-[18px]">
          {editableCode.split('\n').map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#080620] pl-12 pr-4 pt-4 pb-4 font-mono text-sm text-emerald-300 resize-y min-h-[140px] focus:outline-none leading-[18px] code-editor"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          <span>{isRunning ? '⏳' : '▶'}</span> {isRunning ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={() => { setOutput([]); setShowCanvas(false); }}
          className="px-3 py-2 text-white/40 text-sm hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-all"
        >
          Clear
        </button>
        <button
          onClick={() => setEditableCode(code)}
          className="px-3 py-2 text-white/40 text-sm hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-all"
        >
          Reset
        </button>
        {executionTime !== null && (
          <span className="ml-auto text-[11px] text-white/25 font-mono">
            ⏱ {executionTime.toFixed(2)}ms
          </span>
        )}
      </div>

      {/* Canvas Output */}
      {showCanvas && (
        <div className="rounded-xl bg-black/40 border border-white/10 p-4 animate-slide-up">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Canvas Output
          </div>
          <canvas 
            ref={canvasRef} 
            width={500} 
            height={300}
            className="w-full max-w-[500px] rounded-lg border border-white/[0.06] bg-surface-900"
          />
        </div>
      )}

      {/* Console Output */}
      {output.length > 0 && (
        <div className="rounded-xl bg-black/40 border border-white/10 overflow-hidden animate-slide-up">
          <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Console Output</span>
            <span className="text-[10px] text-white/20 ml-auto font-mono">{output.length} line{output.length > 1 ? 's' : ''}</span>
          </div>
          <div className="p-4 font-mono text-sm max-h-48 overflow-y-auto space-y-1">
            {output.map((line, i) => (
              <div
                key={i}
                className={`break-all whitespace-pre-wrap ${
                  line.type === 'error' ? 'text-red-400' :
                  line.type === 'warn' ? 'text-yellow-400' :
                  line.type === 'result' ? 'text-cyan-400 font-semibold' :
                  'text-emerald-400'
                }`}
              >
                <span className="text-white/15 mr-2 select-none">{
                  line.type === 'error' ? '✕' :
                  line.type === 'warn' ? '⚠' :
                  line.type === 'result' ? '→' : '›'
                }</span>
                {line.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
