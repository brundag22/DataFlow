import { db } from '../db/database';
import { Rating, AppStats } from '../types';
import { createNewCard, scheduleCard, calculateRetrievability, isDue } from './fsrs';

export async function initializeCards(nodeIds: string[]): Promise<void> {
  const existingCards = await db.cards.where('nodeId').anyOf(nodeIds).toArray();
  const existingIds = new Set(existingCards.map(c => c.nodeId));
  
  const newCards = nodeIds
    .filter(id => !existingIds.has(id))
    .map(id => createNewCard(id));
    
  if (newCards.length > 0) {
    await db.cards.bulkAdd(newCards);
  }
}

export async function getDueCards(limit?: number) {
  const now = Date.now();
  let query = db.cards.where('due').belowOrEqual(now);
  if (limit) {
    query = query.limit(limit);
  }
  return await query.toArray();
}

export async function reviewCard(nodeId: string, rating: Rating): Promise<void> {
  const card = await db.cards.get(nodeId);
  if (!card) throw new Error(`Card not found for nodeId: ${nodeId}`);
  
  const { card: nextCard, log } = scheduleCard(card, rating);
  
  await db.transaction('rw', db.cards, db.reviewLogs, async () => {
    await db.cards.put(nextCard);
    await db.reviewLogs.add(log);
  });
}

export async function getNodeRetention(nodeId: string): Promise<number> {
  const card = await db.cards.get(nodeId);
  if (!card || card.state === 'new') return 0;
  
  const elapsedDays = Math.max(0, (Date.now() - card.lastReview) / 86400000);
  return calculateRetrievability(elapsedDays, card.stability);
}

export async function getAllRetentions(): Promise<Map<string, number>> {
  const cards = await db.cards.toArray();
  const retentions = new Map<string, number>();
  const now = Date.now();
  
  for (const card of cards) {
    if (card.state === 'new') {
      retentions.set(card.nodeId, 0);
    } else {
      const elapsedDays = Math.max(0, (now - card.lastReview) / 86400000);
      retentions.set(card.nodeId, calculateRetrievability(elapsedDays, card.stability));
    }
  }
  return retentions;
}

export async function getReviewStats(): Promise<AppStats> {
  const now = Date.now();
  const startOfDay = new Date().setHours(0,0,0,0);
  
  const allCards = await db.cards.toArray();
  const totalNodes = allCards.length;
  
  const dueForReview = allCards.filter(c => c.due <= now).length;
  const masteredNodes = allCards.filter(c => c.state === 'review' && c.stability > 21).length;
  
  let totalRetention = 0;
  let retCount = 0;
  
  for (const card of allCards) {
    if (card.state !== 'new') {
      const elapsedDays = Math.max(0, (now - card.lastReview) / 86400000);
      totalRetention += calculateRetrievability(elapsedDays, card.stability);
      retCount++;
    }
  }
  const averageRetention = retCount > 0 ? totalRetention / retCount : 0;
  
  const reviewsToday = await db.reviewLogs
    .where('review')
    .aboveOrEqual(startOfDay)
    .count();
    
  return {
    totalNodes,
    dueForReview,
    masteredNodes,
    averageRetention,
    streakDays: 0,
    reviewsToday
  };
}

export async function getDueNodeIds(): Promise<Set<string>> {
  const dueCards = await getDueCards();
  return new Set(dueCards.map(c => c.nodeId));
}
