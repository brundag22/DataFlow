import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreateNode: () => void;
  onOpenSettings: () => void;
}

type Step = {
  label: string;
  title: string;
  body: string;
  pointer: string;
  action?: 'create' | 'settings';
};

const steps: Step[] = [
  {
    label: '1 of 4 · Create',
    title: 'Start with one idea',
    body: 'A node is a study card. Give one concept a clear title, then add its explanation, formula, diagram, or code.',
    pointer: 'Look for the bright + button in the top-right, or use Create your first node in the empty canvas.',
    action: 'create',
  },
  {
    label: '2 of 4 · Edit',
    title: 'Change anything later',
    body: 'Click a card to open it. Choose Edit node to update the title, content, tags, difficulty, or prerequisites. The pencil appears in the node list when you hover a card.',
    pointer: 'Pointer → click a card, then choose “✎ Edit node”. Delete is safely available at the bottom of the editor.',
  },
  {
    label: '3 of 4 · Connect',
    title: 'Build the learning path',
    body: 'While editing, choose prerequisite concepts from the friendly list—no IDs to remember. DataFlow draws the connections and prevents circular paths.',
    pointer: 'Pointer → open Edit node → Prerequisites, then select the ideas that should come first.',
  },
  {
    label: '4 of 4 · Review',
    title: 'Make it stick',
    body: 'Use the Review button to practice due cards. Rate your recall honestly and the scheduler chooses the next review. Settings also lets you tune the look of the app.',
    pointer: 'Pointer → Settings gear for appearance controls, or Review in the top bar when cards are due.',
    action: 'settings',
  },
];

export function TutorialModal({ open, onClose, onCreateNode, onOpenSettings }: Props) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const close = () => { setStep(0); onClose(); };
  const runAction = () => {
    close();
    if (current.action === 'create') onCreateNode();
    if (current.action === 'settings') onOpenSettings();
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="DataFlow beginner tutorial">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-indigo-400/30 bg-[#0f0d2e] shadow-2xl shadow-indigo-950/60">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative border-b border-white/[0.08] p-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">DataFlow quick start</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Your first knowledge graph</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">Follow the pointer. Every step takes you to the exact control you need.</p>
            </div>
            <button onClick={close} aria-label="Close tutorial" className="rounded-lg px-2 py-1 text-white/45 hover:bg-white/10 hover:text-white">✕</button>
          </div>
          <div className="mt-6 flex gap-2" aria-label="Tutorial progress">
            {steps.map((item, index) => <button key={item.label} onClick={() => setStep(index)} aria-label={`Go to ${item.label}`} className={`h-2 flex-1 rounded-full transition-colors ${index <= step ? 'bg-gradient-to-r from-indigo-400 to-cyan-400' : 'bg-white/10'}`} />)}
          </div>
        </div>
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-3 text-cyan-300">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-xl font-bold">{step + 1}</span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">{current.label}</span>
          </div>
          <h3 className="mt-5 text-3xl font-bold text-white">{current.title}</h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/70">{current.body}</p>
          <div className="relative mt-6 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.06] p-5 pl-14 text-sm leading-6 text-cyan-100/80">
            <span className="absolute left-5 top-5 text-2xl text-cyan-300" aria-hidden="true">↗</span>
            <strong className="mr-1 text-cyan-200">Pointer:</strong>{current.pointer}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button onClick={close} className="text-sm text-white/40 hover:text-white/75">Skip tour</button>
            <div className="flex gap-2">
              {step > 0 && <button onClick={() => setStep(value => value - 1)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 hover:bg-white/5">Back</button>}
              {current.action && <button onClick={runAction} className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110">{current.action === 'create' ? 'Create a node now' : 'Open Settings now'} ↗</button>}
              {!isLast && !current.action && <button onClick={() => setStep(value => value + 1)} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15">Next step →</button>}
              {isLast && !current.action && <button onClick={close} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15">Finish tour</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
