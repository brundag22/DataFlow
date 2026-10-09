import { useState, useEffect, useCallback } from 'react';
import { useReviewStore } from '../../stores/reviewStore';
import { useGraphStore } from '../../stores/graphStore';
import { db } from '../../db/database';
import { LatexRenderer } from '../sandbox/LatexRenderer';
import { MermaidRenderer } from '../sandbox/MermaidRenderer';
import { CodeExecutor } from '../sandbox/CodeExecutor';
import type { KnowledgeNode, Rating } from '../../types';
import { previewIntervals } from '../../engine/fsrs';

const categoryConfig: Record<string, { icon: string; color: string }> = {
  formula: { icon: '∑', color: 'text-cyan-400' },
  algorithm: { icon: '◇', color: 'text-violet-400' },
  architecture: { icon: '⬡', color: 'text-rose-400' },
  concept: { icon: '◈', color: 'text-amber-400' },
  theorem: { icon: '∿', color: 'text-emerald-400' },
};

const ratingConfig: { rating: Rating; label: string; color: string; bg: string; key: string }[] = [
  { rating: 1, label: 'Again', color: 'text-red-400', bg: 'bg-red-500/15 hover:bg-red-500/25 border-red-500/20', key: '1' },
  { rating: 2, label: 'Hard', color: 'text-orange-400', bg: 'bg-orange-500/15 hover:bg-orange-500/25 border-orange-500/20', key: '2' },
  { rating: 3, label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/20', key: '3' },
  { rating: 4, label: 'Easy', color: 'text-blue-400', bg: 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/20', key: '4' },
];
const formatInterval = (milliseconds: number) => milliseconds < 3_600_000 ? `${Math.max(1, Math.round(milliseconds / 60_000))}m` : `${Math.max(1, Math.round(milliseconds / 86_400_000))}d`;

export function ReviewPanel() {
  const {
    dueCards,
    currentCardIndex,
    isReviewing,
    showAnswer,
    sessionStats,
    loadDueCards,
    showCardAnswer,
    rateCard,
    endReview,
  } = useReviewStore();

  const { viewMode, setViewMode } = useGraphStore();
  const [currentNode, setCurrentNode] = useState<KnowledgeNode | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const isVisible = isReviewing || viewMode === 'review';

  const currentCard = dueCards[currentCardIndex];

  // Tick timer for elapsed seconds
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStats.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible, sessionStats.startTime]);

  useEffect(() => {
    if (isVisible && dueCards.length === 0) {
      loadDueCards();
    }
  }, [isVisible, dueCards.length, loadDueCards]);

  useEffect(() => {
    if (currentCard) {
      db.nodes.get(currentCard.nodeId).then((node) => {
        if (node) setCurrentNode(node);
      });
    } else {
      setCurrentNode(null);
    }
  }, [currentCard]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.code === 'Escape') {
        endReview();
        setViewMode('graph');
        return;
      }
      if (e.code === 'Space' && !showAnswer) {
        e.preventDefault();
        showCardAnswer();
        return;
      }
      if (showAnswer) {
        const key = parseInt(e.key);
        if (key >= 1 && key <= 4) {
          rateCard(key as Rating);
        }
      }
    },
    [isVisible, showAnswer, showCardAnswer, rateCard, endReview, setViewMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isVisible) return null;

  const handleExit = () => {
    endReview();
    setViewMode('graph');
  };

  // Empty state
  if (dueCards.length === 0 || !currentCard) {
    return (
      <div className="fixed inset-0 z-50 bg-surface-950/[0.98] flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-3">All caught up!</h2>
          <p className="text-white/40 text-lg mb-4">No cards are due for review right now.</p>
          {sessionStats.reviewed > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] inline-block">
              <div className="text-sm text-white/50">Session summary</div>
              <div className="flex gap-6 mt-2">
                <div><span className="text-2xl font-bold text-white">{sessionStats.reviewed}</span><span className="text-xs text-white/30 ml-1">reviewed</span></div>
                <div><span className="text-2xl font-bold text-emerald-400">{sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%</span><span className="text-xs text-white/30 ml-1">accuracy</span></div>
              </div>
            </div>
          )}
          <div>
            <button
              onClick={handleExit}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all hover:scale-105"
            >
              Back to Graph
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = dueCards.length > 0 ? ((currentCardIndex + 1) / dueCards.length) * 100 : 0;
  const accuracy = sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0;
  const config = currentNode ? categoryConfig[currentNode.category] : null;
  const intervals = previewIntervals(currentCard);

  return (
    <div className="fixed inset-0 z-50 bg-surface-950/[0.98] flex flex-col items-center justify-center p-8">
      {/* Top Bar */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-white/40">
          <span className="bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            {currentCardIndex + 1} / {dueCards.length}
          </span>
          <span>⏱ {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
          <span>🎯 {accuracy}%</span>
        </div>
        <button aria-label="Exit review" onClick={handleExit} className="text-white/30 hover:text-white/60 transition-colors text-lg hover:bg-white/5 p-2 rounded-lg">✕</button>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl h-1 rounded-full bg-white/[0.06] mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl animate-scale-in" key={currentCard.nodeId}>
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              {config && (
                <span className={`text-2xl ${config.color}`}>{config.icon}</span>
              )}
              <h2 className="text-xl font-bold text-white">{currentNode?.title}</h2>
            </div>

            {!showAnswer && (
              <div className="text-center py-8">
                <p className="text-white/40 text-lg mb-6">Can you recall this concept?</p>
                <button
                  onClick={showCardAnswer}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-white rounded-xl font-medium hover:from-indigo-500/30 hover:to-cyan-500/30 transition-all hover:scale-105"
                >
                  Show Answer <span className="text-white/30 text-sm ml-2">(Space)</span>
                </button>
              </div>
            )}
          </div>

          {/* Answer Content */}
          {showAnswer && currentNode && (
            <div className="p-6 space-y-4 animate-slide-up max-h-[40vh] overflow-y-auto">
              <p className="text-white/70 leading-relaxed">{currentNode.description}</p>
              {currentNode.latex && (
                <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06]">
                  <LatexRenderer latex={currentNode.latex} />
                </div>
              )}
              {currentNode.mermaid && (
                <div className="rounded-xl overflow-hidden">
                  <MermaidRenderer chart={currentNode.mermaid} />
                </div>
              )}
              {currentNode.code && (
                <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06]">
                  <pre className="text-sm font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">{currentNode.code}</pre>
                </div>
              )}
            </div>
          )}

          {/* Rating Buttons */}
          {showAnswer && (
            <div className="p-6 border-t border-white/[0.06]">
              <div className="grid grid-cols-4 gap-3">
                {ratingConfig.map(({ rating, label, color, bg, key }) => (
                  <button
                    key={rating}
                    onClick={() => rateCard(rating)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border ${bg} transition-all hover:scale-105`}
                  >
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                    <span className="text-[10px] text-white/30">{formatInterval(intervals[rating])}</span>
                    <span className="text-[9px] text-white/20">({key})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
