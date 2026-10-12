import { useState, useEffect, useRef } from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { useReviewStore } from '../../stores/reviewStore';
import { db } from '../../db/database';
import type { KnowledgeNode } from '../../types';
import { exportData, importData } from '../../db/transfer';

const CATEGORY_CONFIG: Record<string, { color: string; dot: string }> = {
  formula: { color: 'bg-cyan-400', dot: 'bg-cyan-400' },
  algorithm: { color: 'bg-violet-400', dot: 'bg-violet-400' },
  architecture: { color: 'bg-rose-400', dot: 'bg-rose-400' },
  concept: { color: 'bg-amber-400', dot: 'bg-amber-400' },
  theorem: { color: 'bg-emerald-400', dot: 'bg-emerald-400' },
};

const DIFFICULTY_DOTS: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const CATEGORIES = ['All', 'formula', 'algorithm', 'architecture', 'concept', 'theorem'];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, openModal, dueNodeIds, initialize, isInitialized, prerequisiteGateEnabled, setPrerequisiteGateEnabled } = useGraphStore();
  const [activeTab, setActiveTab] = useState<'nodes' | 'stats' | 'settings'>('nodes');
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { stats, loadStats } = useReviewStore();
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      const allNodes = await db.nodes.toArray();
      setNodes(allNodes);
    };
    fetchNodes();
    loadStats();
  }, [loadStats, isInitialized]);

  const filteredNodes = nodes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || n.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div
      className={`relative z-40 flex flex-col h-full max-md:absolute max-md:left-0 max-md:top-0 bg-[#0a0825]/90 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-[280px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center p-4 border-b border-white/5 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          D
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 whitespace-nowrap">
            DataFlow
          </h1>
          <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Knowledge Engine</span>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-around p-2 border-b border-white/5">
        {(['nodes', 'stats', 'settings'] as const).map((tab) => {
          const icons = { nodes: '☰', stats: '📊', settings: '⚙' };
          return (
            <button
              key={tab}
              aria-label={`${tab} tab`}
              onClick={() => setActiveTab(tab)}
              className={`p-2 rounded-lg transition-all text-sm ${
                activeTab === tab
                  ? 'bg-white/10 shadow-[0_0_10px_rgba(99,102,241,0.2)] text-white'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/60'
              }`}
            >
              {icons[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {!sidebarCollapsed && activeTab === 'nodes' && (
          <div className="p-3 flex flex-col h-full">
            <input
              type="text"
              placeholder="🔍 Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-indigo-500/50 mb-3 transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 mb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all capitalize ${
                    category === cat
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-transparent text-white/35 hover:bg-white/5 hover:text-white/50'
                  }`}
                >
                  {cat === 'All' && '●  '}{cat}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredNodes.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-5 text-center">
                  <p className="text-sm font-medium text-white/70">{nodes.length === 0 ? 'Your graph is empty' : 'No matching nodes'}</p>
                  <p className="mt-2 text-xs leading-5 text-white/35">{nodes.length === 0 ? 'Create a node from the + button to begin.' : 'Try a different search or category.'}</p>
                  {nodes.length === 0 && <button onClick={() => useGraphStore.getState().openEditor()} className="mt-3 rounded-lg bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30">Create node</button>}
                </div>
              )}
              {filteredNodes.map((node) => {
                const isDue = dueNodeIds.has(node.id);
                const dots = DIFFICULTY_DOTS[node.difficulty] || 1;
                return (
                  <div
                    key={node.id}
                    onClick={() => openModal(node.id)}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer group transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_CONFIG[node.category]?.dot || 'bg-white/30'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-white/70 truncate group-hover:text-white/90 transition-colors">
                        {node.title}
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: 4 }, (_, i) => (
                          <span key={i} className={`w-1 h-1 rounded-full ${i < dots ? 'bg-white/40' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                    {isDue && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)] animate-pulse shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!sidebarCollapsed && activeTab === 'stats' && (
          <div className="p-3 space-y-3 overflow-y-auto h-full">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total Nodes', value: stats?.totalNodes ?? nodes.length, color: 'text-white/80' },
                { label: 'Due', value: stats?.dueForReview ?? dueNodeIds.size, color: 'text-amber-400' },
                { label: 'Mastered', value: stats?.masteredNodes ?? 0, color: 'text-emerald-400' },
                { label: 'Retention', value: `${Math.round((stats?.averageRetention ?? 0) * 100)}%`, color: 'text-cyan-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
                  <div className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">{label}</div>
                  <div className={`text-xl font-bold ${color}`}>{value}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
              <div className="text-[10px] text-white/30 mb-3 uppercase tracking-wider">7-Day Activity</div>
              <div className="flex items-end justify-between h-14 gap-1">
                {[4, 7, 2, 9, 5, 8, 3].map((val, i) => (
                  <div key={i} className="w-full bg-gradient-to-t from-indigo-500/60 to-indigo-400/30 rounded-t-sm transition-all" style={{ height: `${val * 10}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-white/20 mt-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
              </div>
            </div>
          </div>
        )}

        {!sidebarCollapsed && activeTab === 'settings' && (
          <div className="p-4 space-y-6 overflow-y-auto h-full">
            <div>
              <label className="text-sm text-white/50 block mb-2">Desired Retention</label>
              <input type="range" min="80" max="99" defaultValue="90" className="w-full accent-indigo-500" />
              <div className="flex justify-between text-[10px] text-white/25 mt-1">
                <span>80%</span><span>90%</span><span>99%</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-white/50 block mb-2">Daily Review Limit</label>
              <input type="number" defaultValue={50} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <label className="flex items-center gap-3 text-sm text-white/60"><input type="checkbox" checked={prerequisiteGateEnabled} onChange={e => void setPrerequisiteGateEnabled(e.target.checked)} className="accent-indigo-500" /> Require prerequisites to have 7-day stability</label>
            <div className="space-y-2 pt-4 border-t border-white/5">
              <button onClick={() => void exportData()} className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/60 rounded-lg border border-white/[0.08] transition-colors">
                📦 Export Data
              </button>
              <button onClick={() => importRef.current?.click()} className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/60 rounded-lg border border-white/[0.08] transition-colors">📥 Import Data</button>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { await importData(file); await initialize(); } catch (error) { window.alert(error instanceof Error ? error.message : 'Import failed.'); } e.target.value = ''; }} />
              <button className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-sm text-rose-400 rounded-lg border border-rose-500/20 transition-colors">
                🗑 Reset Progress
              </button>
            </div>
            <div className="text-[10px] text-white/15 text-center pt-4">DataFlow v1.0.0</div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="p-3 border-t border-white/5 hover:bg-white/[0.04] flex items-center justify-center text-white/30 transition-colors"
      >
        {sidebarCollapsed ? '▶' : '◀'}
      </button>
    </div>
  );
}
