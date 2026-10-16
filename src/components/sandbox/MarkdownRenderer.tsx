import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

import { MermaidRenderer } from './MermaidRenderer';
import { CodeExecutor } from './CodeExecutor';

const runnableLanguages = new Set(['js', 'javascript', 'mjs', 'cjs']);

export function MarkdownRenderer({ content, className = '' }: { content: string; className?: string }) {
  if (!content) return null;
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ className: codeClassName, children, ...props }) {
            const language = /language-(\w+)/.exec(codeClassName || '')?.[1]?.toLowerCase();
            const code = String(children).replace(/\n$/, '');
            if (language === 'mermaid') return <MermaidRenderer chart={code} className="not-prose my-4" />;
            if (language && runnableLanguages.has(language)) return <CodeExecutor code={code} className="not-prose my-4" />;
            if (codeClassName) return <pre className="not-prose overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4"><code className={codeClassName} {...props}>{children}</code></pre>;
            return <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200" {...props}>{children}</code>;
          },
        }}
      >
        {DOMPurify.sanitize(content)}
      </ReactMarkdown>
    </div>
  );
}
