import { useGraphStore } from '../../stores/graphStore';
import { useReviewStore } from '../../stores/reviewStore';
import type { ViewMode } from '../../types';

const viewModes: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: 'graph', icon: '🔗', label: 'Graph' },
  { mode: 'review', icon: '🧠', label: 'Review' },
  { mode: 'stats', icon: '📊', label: 'Dashboard' },
];

export function Header() {
  const { viewMode, setViewMode, dueNodeIds, nodes, openEditor } = useGraphStore();
  const { startReview, loadDueCards, dueCards } = useReviewStore();

  const handleViewChange = async (mode: ViewMode) => {
    if (mode === 'review') {
      await loadDueCards();
      startReview();
      // Don't change viewMode here — ReviewPanel overlays on top
    } else {
      setViewMode(mode);
    }
  };

  return (
    <div className="h-14 bg-white/[0.02] backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 shrink-0">
      {/* View Mode Toggles */}
      <div className="flex items-center gap-1">
        {viewModes.map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => handleViewChange(mode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === mode
                ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Node count */}
        <div className="text-xs text-white/20 font-mono hidden sm:block">
          {nodes.length} nodes
        </div>
        
        {/* Due Count Badge */}
        {dueNodeIds.size > 0 && (
          <button 
            onClick={() => handleViewChange('review')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-xs font-semibold text-rose-400">{dueNodeIds.size} due</span>
          </button>
        )}

        {/* Add Node Button */}
        <button aria-label="Create node" onClick={() => openEditor()} className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-105">
          +
        </button>
      </div>
    </div>
  );
}
