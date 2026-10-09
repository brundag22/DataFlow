import { evaluate } from 'mathjs';

const worker = globalThis as typeof globalThis & {
  onmessage: (event: MessageEvent<{ code: string }>) => void;
  postMessage: (message: unknown) => void;
};

worker.onmessage = async ({ data }) => {
  const logs: { type: 'log' | 'error' | 'warn' | 'result'; message: string }[] = [];
  const format = (value: unknown) => typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
  const capturedConsole = {
    log: (...args: unknown[]) => logs.push({ type: 'log', message: args.map(format).join(' ') }),
    info: (...args: unknown[]) => logs.push({ type: 'log', message: args.map(format).join(' ') }),
    warn: (...args: unknown[]) => logs.push({ type: 'warn', message: args.map(format).join(' ') }),
    error: (...args: unknown[]) => logs.push({ type: 'error', message: args.map(format).join(' ') }),
  };
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as FunctionConstructor;
    const fn = new AsyncFunction('console', 'math', 'JSON', 'Array', 'Math', 'Object', 'String', 'Number', 'parseInt', 'parseFloat', 'Map', 'Set', 'Promise', 'setTimeout', 'Infinity', 'NaN', 'undefined', 'isNaN', 'isFinite',
      '"use strict"; const document = undefined, window = undefined, indexedDB = undefined, self = undefined; return (async () => {' + data.code + '})();');
    const result = await fn(capturedConsole, { evaluate }, JSON, Array, Math, Object, String, Number, parseInt, parseFloat, Map, Set, Promise, setTimeout, Infinity, NaN, undefined, isNaN, isFinite);
    if (result !== undefined) logs.push({ type: 'result', message: '→ ' + format(result) });
    worker.postMessage({ type: 'complete', logs });
  } catch (error) {
    worker.postMessage({ type: 'complete', logs: logs.concat({ type: 'error', message: 'Error: ' + String(error) }) });
  }
};
