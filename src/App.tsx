import { useEffect, useState } from 'react';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { NodeModal } from './components/graph/NodeModal';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ReviewPanel } from './components/review/ReviewPanel';
import { StatsPanel } from './components/review/StatsPanel';
import { useGraphStore } from './stores/graphStore';
import { useReviewStore } from './stores/reviewStore';

function App() {
  const { initialize, isInitialized, isModalOpen, viewMode } = useGraphStore();
  const { isReviewing, loadDueCards } = useReviewStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await initialize();
      await loadDueCards();
      // Small delay so loading screen shows smoothly
      setTimeout(() => setLoading(false), 600);
    }
    init();
  }, [initialize, loadDueCards]);

  if (loading || !isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          {/* Animated Logo */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-indigo-500/40">
              D
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 animate-ping opacity-20" />
            {/* Orbiting dots */}
            <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/40" />
            <div className="absolute -bottom-2 -left-2 w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse shadow-lg shadow-violet-400/40" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              DataFlow
            </h1>
            <p className="text-white/30 text-sm mt-2 tracking-wide">Knowledge Graph &bull; Spaced Repetition &bull; Sandbox</p>
          </div>
          {/* Loading bar */}
          <div className="w-64 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full loading-bar-animation" />
          </div>
          <p className="text-white/20 text-xs font-mono">Initializing knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 relative overflow-hidden">
          {viewMode === 'graph' && <GraphCanvas />}
          {viewMode === 'sandbox' && (
            <div className="h-full overflow-y-auto p-8">
              <StatsPanel />
            </div>
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      {isModalOpen && <NodeModal />}
      {isReviewing && <ReviewPanel />}
    </div>
  );
}

export default App;
