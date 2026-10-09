import Dexie, { type Table } from 'dexie';
import type { KnowledgeNode, FSRSCard, ReviewLog, NodePosition } from '../types';

export class DataFlowDB extends Dexie {
  nodes!: Table<KnowledgeNode, string>;
  cards!: Table<FSRSCard, string>;
  reviewLogs!: Table<ReviewLog, number>;
  positions!: Table<NodePosition, string>;

  constructor() {
    super('DataFlowDB');
    this.version(1).stores({
      nodes: 'id, category, difficulty, *tags, updatedAt',
      cards: 'nodeId, state, due',
      reviewLogs: '++id, nodeId, review',
      positions: 'nodeId',
    });
    this.version(2).stores({}).upgrade(() => undefined);
  }
}

export const db = new DataFlowDB();
