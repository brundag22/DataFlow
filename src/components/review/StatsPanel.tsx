import { useState, useEffect } from 'react';
import { useReviewStore } from '../../stores/reviewStore';
import { useGraphStore } from '../../stores/graphStore';
import { db } from '../../db/database';
import type { FSRSCard } from '../../types';

export function StatsPanel() {
  const { stats, loadStats } = useReviewStore();
  const { nodes: graphNodes, dueNodeIds } = useGraphStore();
  const [mounted, setMounted] = useState(false);
  const [cardStates, setCardStates] = useState({ new: 0, learning: 0, review: 0, relearning: 0 });
  const [recentLogs, setRecentLogs] = useState<{ day: string; count: number }[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    loadStats();

    const loadCardStates = async () => {
      const cards = await db.cards.toArray();
      const counts = { new: 0, learning: 0, review: 0, relearning: 0 };
      for (const card of cards) {
        counts[card.state]++;
      }
      setCardStates(counts);
    };

    const loadRecentActivity = async () => {
      const now = Date.now();
      const days: { day: string; count: number }[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const firstDay = new Date(now - 6 * 86400000);
      firstDay.setHours(0, 0, 0, 0);
      const logs = await db.reviewLogs.where('review').between(firstDay.getTime(), now, true, true).toArray();
      const counts = new Map<string, number>();
      for (const log of logs) {
        const date = new Date(log.review);
        date.setHours(0, 0, 0, 0);
        const key = date.toISOString().slice(0, 10);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now - i * 86400000);
        dayStart.setHours(0, 0, 0, 0);
        days.push({
          day: dayNames[dayStart.getDay()],
          count: counts.get(dayStart.toISOString().slice(0, 10)) || 0,
        });
      }
      setRecentLogs(days);
    };

    const loadCategoryBreakdown = async () => {
      const allNodes = await db.nodes.toArray();
      const breakdown: Record<string, number> = {};
      for (const node of allNodes) {
        breakdown[node.category] = (breakdown[node.category] || 0) + 1;
      }
      setCategoryBreakdown(breakdown);
    };

    loadCardStates();
    loadRecentActivity();
    loadCategoryBreakdown();
  }, [loadStats]);

  const total = cardStates.new + cardStates.learning + cardStates.review + cardStates.relearning;
  const maxActivity = Math.max(...recentLogs.map(d => d.count), 1);

  const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
    formula: { bg: 'bg-cyan-500', text: 'text-cyan-400', label: 'Formulas' },
    algorithm: { bg: 'bg-violet-500', text: 'text-violet-400', label: 'Algorithms' },
    architecture: { bg: 'bg-rose-500', text: 'text-rose-400', label: 'Architecture' },
    concept: { bg: 'bg-amber-500', text: 'text-amber-400', label: 'Concepts' },
    theorem: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Theorems' },
  };

  const AnimatedNumber = ({ value, className = '' }: { value: number | string; className?: string }) => (
    <span className={`inline-block transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${className}`}>
      {value}
    </span>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-white/30 text-sm">Your learning progress at a glance</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Nodes", value: stats?.totalNodes ?? total, icon: '📚', color: 'text-white' },
          { label: "Due Now", value: dueNodeIds.size, icon: '🔔', color: 'text-rose-400' },
          { label: "Today's Reviews", value: stats?.reviewsToday ?? 0, icon: '📝', color: 'text-indigo-400' },
          { label: "Avg Retention", value: `${Math.round((stats?.averageRetention ?? 0) * 100)}%`, icon: '🎯', color: 'text-cyan-400' },
          { label: "Mastered", value: stats?.masteredNodes ?? 0, icon: '⭐', color: 'text-emerald-400' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.06] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{icon}</span>
              <div className="text-[10px] uppercase tracking-wider text-white/30">{label}</div>
            </div>
            <AnimatedNumber value={value} className={`text-3xl font-bold ${color}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card States Distribution */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white/60 mb-4">Card States</h3>
          <div className="space-y-3">
            {[
              { label: 'New', count: cardStates.new, color: 'bg-blue-500', textColor: 'text-blue-400' },
              { label: 'Learning', count: cardStates.learning, color: 'bg-amber-500', textColor: 'text-amber-400' },
              { label: 'Review', count: cardStates.review, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Relearning', count: cardStates.relearning, color: 'bg-rose-500', textColor: 'text-rose-400' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`text-xs font-medium w-24 ${textColor}`}>{label}</span>
                <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className={`h-full ${color}/60 rounded-full transition-all duration-700`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-white/40 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
          
          {/* Donut summary */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/[0.04]">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Total Cards</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white/60 mb-4">Knowledge by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([cat, count]) => {
              const config = categoryColors[cat] || { bg: 'bg-white', text: 'text-white/60', label: cat };
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-24 capitalize ${config.text}`}>{config.label}</span>
                  <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className={`h-full ${config.bg}/50 rounded-full transition-all duration-700`}
                      style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Day Activity */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white/60 mb-4">7-Day Review Activity</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {recentLogs.length > 0 ? recentLogs.map((dayData, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-white/40 font-mono">{dayData.count}</span>
              <div
                className="w-full bg-gradient-to-t from-indigo-500/60 to-violet-400/30 rounded-t-md transition-all duration-500 hover:from-indigo-500/80 hover:to-violet-400/50"
                style={{ height: `${Math.max((dayData.count / maxActivity) * 100, 4)}%` }}
              />
              <span className="text-[9px] text-white/25 font-medium">{dayData.day}</span>
            </div>
          )) : (
            // Placeholder for when there's no data
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-white/40 font-mono">0</span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-500/20 to-violet-400/10 rounded-t-md"
                  style={{ height: '4%' }}
                />
                <span className="text-[9px] text-white/25 font-medium">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white/60 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            onClick={() => {
              const { setViewMode } = useGraphStore.getState();
              setViewMode('graph');
            }}
            className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group"
          >
            <span className="text-xl mb-2 block group-hover:scale-110 transition-transform inline-block">🔗</span>
            <div className="text-sm font-medium text-white/80">Explore Graph</div>
            <div className="text-xs text-white/30 mt-0.5">View your knowledge network</div>
          </button>
          <button 
            onClick={async () => {
              const { loadDueCards, startReview } = useReviewStore.getState();
              await loadDueCards();
              startReview();
            }}
            className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group"
          >
            <span className="text-xl mb-2 block group-hover:scale-110 transition-transform inline-block">🧠</span>
            <div className="text-sm font-medium text-white/80">Start Review</div>
            <div className="text-xs text-white/30 mt-0.5">{dueNodeIds.size} cards due now</div>
          </button>
          <button 
            onClick={() => loadStats()}
            className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group"
          >
            <span className="text-xl mb-2 block group-hover:scale-110 transition-transform inline-block">🔄</span>
            <div className="text-sm font-medium text-white/80">Refresh Stats</div>
            <div className="text-xs text-white/30 mt-0.5">Update all metrics</div>
          </button>
        </div>
      </div>
    </div>
  );
}
