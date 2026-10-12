import { useEffect, useState } from 'react';
import { db } from '../../db/database';
import { useGraphStore } from '../../stores/graphStore';
import type { KnowledgeNode, NodeCategory, NodeDifficulty } from '../../types';

const categories: NodeCategory[] = ['formula', 'algorithm', 'architecture', 'concept', 'theorem'];
const difficulties: NodeDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const emptyNode = (): KnowledgeNode => ({ id: crypto.randomUUID(), title: '', category: 'concept', difficulty: 'beginner', description: '', tags: [], prerequisites: [], createdAt: Date.now(), updatedAt: Date.now() });

function createsCycle(candidate: KnowledgeNode, nodes: KnowledgeNode[]): boolean {
  const graph = new Map(nodes.map(node => [node.id, node.prerequisites]));
  graph.set(candidate.id, candidate.prerequisites);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const prerequisite of graph.get(id) || []) if (visit(prerequisite)) return true;
    visiting.delete(id); visited.add(id); return false;
  };
  return visit(candidate.id);
}

export function NodeEditorModal() {
  const { selectedNodeId, isEditorOpen, closeEditor, initialize } = useGraphStore();
  const [node, setNode] = useState<KnowledgeNode>(emptyNode());
  const [prerequisiteText, setPrerequisiteText] = useState('');
  const [tagText, setTagText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [availableNodes, setAvailableNodes] = useState<KnowledgeNode[]>([]);

  useEffect(() => {
    if (!isEditorOpen) return;
    db.nodes.toArray().then(items => setAvailableNodes(items.filter(item => item.id !== selectedNodeId)));
    if (selectedNodeId) db.nodes.get(selectedNodeId).then(found => { if (found) { setNode(found); setPrerequisiteText(found.prerequisites.join(', ')); setTagText(found.tags.join(', ')); } });
    else { setNode(emptyNode()); setPrerequisiteText(''); setTagText(''); }
    setError(null);
  }, [isEditorOpen, selectedNodeId]);

  if (!isEditorOpen) return null;
  const update = <K extends keyof KnowledgeNode>(key: K, value: KnowledgeNode[K]) => setNode(current => ({ ...current, [key]: value }));
  const save = async () => {
    const candidate = { ...node, title: node.title.trim(), tags: tagText.split(',').map(s => s.trim()).filter(Boolean), prerequisites: prerequisiteText.split(',').map(s => s.trim()).filter(Boolean), updatedAt: Date.now() };
    if (!candidate.title) return setError('Title is required.');
    const allNodes = await db.nodes.toArray();
    if (candidate.prerequisites.some(id => !allNodes.some(item => item.id === id) && id !== candidate.id)) return setError('Every prerequisite must reference an existing node ID.');
    if (createsCycle(candidate, allNodes)) return setError('This prerequisite would create a cycle. Choose an earlier concept instead.');
    await db.transaction('rw', db.nodes, db.cards, db.positions, async () => {
      await db.nodes.put(candidate);
      if (!selectedNodeId) { const card = await db.cards.get(candidate.id); if (!card) await db.cards.put({ nodeId: candidate.id, state: 'new', stability: 0, difficulty: 0, elapsedDays: 0, scheduledDays: 0, reps: 0, lapses: 0, due: Date.now(), lastReview: Date.now(), learningStep: 0 }); }
    });
    closeEditor(); await initialize();
  };
  const remove = async () => {
    if (!selectedNodeId || !window.confirm('Delete this node and its review history?')) return;
    await db.transaction('rw', db.nodes, db.cards, db.reviewLogs, db.positions, async () => {
      await db.nodes.delete(selectedNodeId); await db.cards.delete(selectedNodeId); await db.positions.delete(selectedNodeId); await db.reviewLogs.where('nodeId').equals(selectedNodeId).delete();
      const remaining = await db.nodes.toArray();
      await Promise.all(remaining.map(item => db.nodes.put({ ...item, prerequisites: item.prerequisites.filter(id => id !== selectedNodeId), updatedAt: Date.now() })));
    });
    closeEditor(); await initialize();
  };
  const fields: { key: keyof KnowledgeNode; label: string }[] = [{ key: 'description', label: 'Description' }, { key: 'markdown', label: 'Markdown' }, { key: 'latex', label: 'LaTeX' }, { key: 'mermaid', label: 'Mermaid' }, { key: 'code', label: 'Code' }];
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true" aria-label={selectedNodeId ? 'Edit node' : 'Create node'}>
    <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0d2e] p-6">
      <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold text-white">{selectedNodeId ? 'Edit node' : 'Create node'}</h2><button aria-label="Close editor" onClick={closeEditor} className="text-white/50 hover:text-white">✕</button></div>
      {error && <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-white/60">Title<input value={node.title} onChange={e => update('title', e.target.value)} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-white" /></label>
        <label className="text-sm text-white/60">Category<select value={node.category} onChange={e => update('category', e.target.value as NodeCategory)} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-white">{categories.map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="text-sm text-white/60">Difficulty<select value={node.difficulty} onChange={e => update('difficulty', e.target.value as NodeDifficulty)} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-white">{difficulties.map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="text-sm text-white/60">Tags<input value={tagText} onChange={e => setTagText(e.target.value)} placeholder="comma, separated" className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-white" /></label>
      </div>
      <label className="mt-4 block text-sm text-white/60">Prerequisites <span className="text-white/30">(optional)</span><select multiple value={prerequisiteText ? prerequisiteText.split(',').filter(Boolean) : []} onChange={e => setPrerequisiteText(Array.from(e.target.selectedOptions, option => option.value).join(','))} className="mt-1 min-h-24 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white">{availableNodes.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select><span className="mt-1 block text-xs text-white/30">Hold Ctrl/Cmd to select multiple. Prerequisites must already exist.</span></label>
      {fields.map(({ key, label }) => <label key={key} className="mt-4 block text-sm text-white/60">{label}<textarea value={(node[key] as string) || ''} onChange={e => update(key, e.target.value)} rows={key === 'description' || key === 'markdown' ? 3 : 4} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 font-mono text-sm text-white" /></label>)}
      <div className="mt-6 flex justify-between"><div>{selectedNodeId && <button onClick={remove} className="rounded-lg border border-rose-500/30 px-4 py-2 text-rose-300 hover:bg-rose-500/10">Delete</button>}</div><div className="flex gap-2"><button onClick={closeEditor} className="rounded-lg px-4 py-2 text-white/60">Cancel</button><button onClick={save} className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400">Save node</button></div></div>
    </div>
  </div>;
}
