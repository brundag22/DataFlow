import { db } from './database';

// These IDs belonged to the sample graph shipped before the empty-workspace onboarding.
// Only these known built-in records are removed; user-created nodes are untouched.
const LEGACY_SAMPLE_IDS = [
  'la-vectors', 'la-matrices', 'la-determinants', 'la-eigenvalues', 'la-svd',
  'gt-basics', 'gt-traversal', 'gt-shortest-path', 'gt-mst', 'gt-network-flow',
  'sd-load-balancing', 'sd-caching', 'sd-databases', 'sd-microservices', 'sd-cap-theorem',
  'algo-complexity', 'algo-sorting', 'algo-dp', 'algo-trees', 'algo-hashing',
];
const CLEANUP_KEY = 'dataflow-legacy-sample-cleanup-v1';

export async function removeLegacySampleNodes(): Promise<void> {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(CLEANUP_KEY) === 'done') return;
  const existing = await db.nodes.bulkGet(LEGACY_SAMPLE_IDS);
  const idsToRemove = LEGACY_SAMPLE_IDS.filter((id, index) => existing[index]);
  if (idsToRemove.length > 0) {
    await db.transaction('rw', db.nodes, db.cards, db.reviewLogs, db.positions, async () => {
      await db.nodes.bulkDelete(idsToRemove);
      await db.cards.bulkDelete(idsToRemove);
      await db.positions.bulkDelete(idsToRemove);
      for (const id of idsToRemove) await db.reviewLogs.where('nodeId').equals(id).delete();
      const remaining = await db.nodes.toArray();
      await Promise.all(remaining.map(node => {
        const prerequisites = node.prerequisites.filter(id => !idsToRemove.includes(id));
        return prerequisites.length === node.prerequisites.length ? undefined : db.nodes.put({ ...node, prerequisites, updatedAt: Date.now() });
      }));
    });
  }
  if (typeof localStorage !== 'undefined') localStorage.setItem(CLEANUP_KEY, 'done');
}
