import { db } from './database';
import type { FSRSCard, KnowledgeNode, NodePosition, ReviewLog } from '../types';

export interface DataFlowExport { version: 1; nodes: KnowledgeNode[]; cards: FSRSCard[]; reviewLogs: ReviewLog[]; positions: NodePosition[]; }

export async function exportData(): Promise<void> {
  const payload: DataFlowExport = { version: 1, nodes: await db.nodes.toArray(), cards: await db.cards.toArray(), reviewLogs: await db.reviewLogs.toArray(), positions: await db.positions.toArray() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `dataflow-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href);
}

function isObject(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object'; }
export function validateImport(value: unknown): value is DataFlowExport {
  if (!isObject(value) || value.version !== 1 || !Array.isArray(value.nodes) || !Array.isArray(value.cards) || !Array.isArray(value.reviewLogs) || !Array.isArray(value.positions)) return false;
  return value.nodes.every(n => isObject(n) && typeof n.id === 'string' && typeof n.title === 'string' && Array.isArray(n.prerequisites) && Array.isArray(n.tags)) && value.cards.every(c => isObject(c) && typeof c.nodeId === 'string' && typeof c.state === 'string' && typeof c.due === 'number') && value.reviewLogs.every(l => isObject(l) && typeof l.nodeId === 'string' && typeof l.review === 'number') && value.positions.every(p => isObject(p) && typeof p.nodeId === 'string' && typeof p.x === 'number' && typeof p.y === 'number');
}

export async function importData(file: File): Promise<void> {
  const parsed: unknown = JSON.parse(await file.text());
  if (!validateImport(parsed)) throw new Error('Invalid DataFlow export: expected schema version 1 with nodes, cards, reviewLogs, and positions.');
  await db.transaction('rw', db.nodes, db.cards, db.reviewLogs, db.positions, async () => {
    await Promise.all([db.nodes.clear(), db.cards.clear(), db.reviewLogs.clear(), db.positions.clear()]);
    await db.nodes.bulkPut(parsed.nodes); await db.cards.bulkPut(parsed.cards); await db.reviewLogs.bulkPut(parsed.reviewLogs); await db.positions.bulkPut(parsed.positions);
  });
}
