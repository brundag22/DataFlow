import { useEffect, useState } from 'react';
import { db } from '../../db/database';
import { useGraphStore } from '../../stores/graphStore';
import { reviewCard } from '../../engine/scheduler';
import type { KnowledgeNode, FSRSCard, Rating } from '../../types';
import { LatexRenderer } from '../sandbox/LatexRenderer';
import { MermaidRenderer } from '../sandbox/MermaidRenderer';
import { SandboxCard } from '../sandbox/SandboxCard';

const categoryColors: Record<string, string> = {
  formula: '#22d3ee',
  algorithm: '#a78bfa',
  architecture: '#fb7185',
  concept: '#fbbf24',
  theorem: '#34d399',
};

const categoryIcons: Record<string, string> = {
  formula: '∑',
  algorithm: '◇',
  architecture: '⬡',
  concept: '◈',
  theorem: '∿',
};

export function NodeModal() {
  const { selectedNodeId, closeModal, refreshDueState } = useGraphStore();
  const [node, setNode] = useState<KnowledgeNode | null>(null);
  const [card, setCard] = useState<FSRSCard | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sandbox' | 'review'>('overview');
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedNodeId) return;
    const loadData = async () => {
      const n = await db.nodes.get(selectedNodeId);
      const c = await db.cards.get(selectedNodeId);
      if (n) setNode(n);
      if (c) setCard(c);
    };
    loadData();
  }, [selectedNodeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  if (!selectedNodeId || !node) return null;

  const color = categoryColors[node.category] || '#6366f1';
  const icon = categoryIcons[node.category] || '◈';

  const handleReview = async (rating: Rating) => {
    if (!card) return;
    try {
      await reviewCard(card.nodeId, rating);
      const updatedCard = await db.cards.get(card.nodeId);
      if (updatedCard) setCard(updatedCard);
      await refreshDueState();
      const feedbackLabels: Record<number, string> = { 1: 'Again — see you soon!', 2: 'Hard — interval shortened', 3: 'Good — well done!', 4: 'Easy — excellent recall!' };
      setReviewFeedback(feedbackLabels[rating]);
      setTimeout(() => setReviewFeedback(null), 2000);
    } catch (err) {
      console.error('Review error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
      <div 
        className="relative w-full max-w-4xl bg-[#0f0d2e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold bg-white/5 border border-white/10"
              style={{ color }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{node.title}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                <span className="capitalize">{node.category}</span>
                <span>•</span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs">
                  {node.difficulty}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={closeModal}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="relative flex px-6 border-b border-white/10">
          {(['overview', 'sandbox', 'review'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab === 'overview' ? '📋 Overview' : tab === 'sandbox' ? '⚡ Sandbox' : '🧠 Review'}
              {activeTab === tab && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-all"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6 text-white/80">
              {node.description && (
                <div>
                  <p className="text-lg leading-relaxed">{node.description}</p>
                </div>
              )}
              
              {node.tags && node.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {node.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-indigo-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {node.prerequisites && node.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Prerequisites</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {node.prerequisites.map((req: string) => (
                      <div key={req} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-colors text-sm font-medium">
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {node.latex && (
                <div className="mt-6 p-6 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Formula</div>
                  <LatexRenderer latex={node.latex} />
                </div>
              )}
              {node.mermaid && (
                <div className="mt-6 p-6 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Diagram</div>
                  <MermaidRenderer chart={node.mermaid} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div className="min-h-[400px]">
              <SandboxCard node={node} />
            </div>
          )}

          {activeTab === 'review' && card && (
            <div className="space-y-8">
              {/* Review feedback toast */}
              {reviewFeedback && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-medium animate-slide-up">
                  {reviewFeedback}
                </div>
              )}

              {/* Card stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-1">State</div>
                  <div className="text-lg font-bold text-white capitalize">{card.state}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Reps</div>
                  <div className="text-lg font-bold text-cyan-400">{card.reps}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Stability</div>
                  <div className="text-lg font-bold text-amber-400">{card.stability?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Due Date</div>
                  <div className="text-lg font-bold text-indigo-400">
                    {card.due ? new Date(card.due).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Rating buttons */}
              <div className="pt-8 border-t border-white/10">
                <h3 className="text-center text-white/60 mb-6">How well did you remember this?</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => handleReview(1)} className="px-8 py-4 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl font-bold transition-all hover:scale-105">
                    Again (1)
                  </button>
                  <button onClick={() => handleReview(2)} className="px-8 py-4 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl font-bold transition-all hover:scale-105">
                    Hard (2)
                  </button>
                  <button onClick={() => handleReview(3)} className="px-8 py-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl font-bold transition-all hover:scale-105">
                    Good (3)
                  </button>
                  <button onClick={() => handleReview(4)} className="px-8 py-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl font-bold transition-all hover:scale-105">
                    Easy (4)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && !card && (
            <div className="flex flex-col items-center justify-center py-16 text-white/30">
              <span className="text-4xl mb-4">🧠</span>
              <p className="text-sm font-medium">No review card found for this node</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
