import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreateNode: () => void;
}

const steps = [
  {
    eyebrow: '01 · Start small',
    title: 'Build one useful card',
    body: 'A DataFlow node is also a review card. Give it a clear concept title, choose its category and difficulty, then add a short description.',
    detail: 'Think “Binary search” rather than “Algorithms”. One node should represent one thing you want to remember.',
  },
  {
    eyebrow: '02 · Add living content',
    title: 'Teach the idea inside the card',
    body: 'Use Markdown for explanation, LaTeX for formulas, Mermaid for diagrams, and JavaScript for small interactive experiments.',
    detail: 'Fenced Mermaid and JavaScript blocks in Markdown render and run in your browser. Press Ctrl/Cmd + Enter in a code block to execute it.',
  },
  {
    eyebrow: '03 · Link the path',
    title: 'Connect prerequisites',
    body: 'Edit a node and select the concepts that should come before it. DataFlow draws the edge and rejects circular prerequisite chains.',
    detail: 'For example: Arrays → Binary search → Search trees. Use Auto-layout when the map starts to grow.',
  },
  {
    eyebrow: '04 · Remember it',
    title: 'Review the graph, not a pile',
    body: 'Every node gets an FSRS-style review card. Rate recall honestly and the next due date is calculated from the same scheduler that powers the graph.',
    detail: 'Your graph and review history stay in this browser. Export a JSON backup from Settings before clearing site data.',
  },
];

export function TutorialModal({ open, onClose, onCreateNode }: Props) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const close = () => {
    setStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="DataFlow tutorial">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-indigo-400/20 bg-[#0f0d2e] shadow-2xl shadow-indigo-950/50">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative border-b border-white/[0.07] p-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">DataFlow field guide</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Build a connected study card</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/50">A quick tour from your first concept to a working knowledge graph.</p>
            </div>
            <button onClick={close} aria-label="Close tutorial" className="rounded-lg px-2 py-1 text-white/40 hover:bg-white/10 hover:text-white">✕</button>
          </div>
          <div className="mt-6 flex gap-2" aria-label="Tutorial progress">
            {steps.map((item, index) => <button key={item.eyebrow} onClick={() => setStep(index)} aria-label={`Go to tutorial step ${index + 1}`} className={`h-1.5 flex-1 rounded-full transition-colors ${index <= step ? 'bg-gradient-to-r from-indigo-400 to-cyan-400' : 'bg-white/10'}`} />)}
          </div>
        </div>
        <div className="relative grid gap-6 p-6 md:grid-cols-[150px_1fr] md:p-8">
          <div className="flex gap-2 md:block md:space-y-3">
            {steps.map((item, index) => <button key={item.eyebrow} onClick={() => setStep(index)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors md:w-full ${index === step ? 'bg-white/10 text-white' : 'text-white/35 hover:bg-white/5 hover:text-white/60'}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${index === step ? 'bg-indigo-500 text-white' : 'bg-white/10'}`}>{index + 1}</span><span className="hidden md:block">{item.eyebrow.split(' · ')[1]}</span></button>)}
          </div>
          <div className="min-h-[230px]">
            <p className="font-mono text-xs text-cyan-300/70">{current.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-bold text-white">{current.title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/65">{current.body}</p>
            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-xs leading-6 text-white/45">{current.detail}</div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <button onClick={close} className="text-sm text-white/40 hover:text-white/70">Skip for now</button>
              <div className="flex gap-2">
                {step > 0 && <button onClick={() => setStep(value => value - 1)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Back</button>}
                {isLast ? <button onClick={() => { close(); onCreateNode(); }} className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110">Create your first node</button> : <button onClick={() => setStep(value => value + 1)} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">Next step <span aria-hidden="true">→</span></button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
