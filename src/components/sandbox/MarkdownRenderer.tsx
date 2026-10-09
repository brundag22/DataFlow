import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

export function MarkdownRenderer({ content, className = '' }: { content: string; className?: string }) {
  if (!content) return null;
  return <div className={`prose prose-invert max-w-none ${className}`}><ReactMarkdown>{DOMPurify.sanitize(content)}</ReactMarkdown></div>;
}
