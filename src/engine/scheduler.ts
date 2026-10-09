import { db } from '../db/database';
import type { Rating, AppStats, ReviewLog } from '../types';
import { createNewCard, scheduleCard, calculateRetrievability, isDue } from './fsrs';

export async function initializeCards(nodeIds: string[]): Promise<void> {
  const existingCards = await db.cards.where('nodeId').anyOf(nodeIds).toArray();
  const existingIds = new Set(existingCards.map(c => c.nodeId));
  const newCards = nodeIds.filter(id => !existingIds.has(id)).map(id => createNewCard(id));
  if (newCards.length > 0) await db.cards.bulkAdd(newCards);
}

export async function getDueCards(limit?: number) {
  const now = Date.now();
  let query = db.cards.where('due').belowOrEqual(now);
  if (limit) query = query.limit(limit);
  return query.toArray();
}

export async function reviewCard(nodeId: string, rating: Rating, now: number = Date.now()): Promise<void> {
  await db.transaction('rw', db.cards, db.reviewLogs, async () => {
    const card = await db.cards.get(nodeId);
    if (!card) throw new Error(`Card not found for nodeId: ${nodeId}`);
    const { card: nextCard, log } = scheduleCard(card, rating, now);
    await db.cards.put(nextCard);
    await db.reviewLogs.add(log);
  });
}

export async function getNodeRetention(nodeId: string): Promise<number> {
  const card = await db.cards.get(nodeId);
  if (!card || card.state === 'new') return 0;
  return calculateRetrievability(Math.max(0, (Date.now() - card.lastReview) / 86400000), card.stability);
}

export async function getAllRetentions(): Promise<Map<string, number>> {
  const cards = await db.cards.toArray();
  const now = Date.now();
  return new Map(cards.map(card => [card.nodeId, card.state === 'new' ? 0 : calculateRetrievability(Math.max(0, (now - card.lastReview) / 86400000), card.stability)]));
}

export function calculateStreakDays(logs: Pick<ReviewLog, 'review'>[], now = new Date()): number {
  const reviewedDays = new Set(logs.map(log => {
    const date = new Date(log.review);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }));
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
  const yesterday = new Date(day.getTime() - 86400000);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
  if (!reviewedDays.has(todayKey) && !reviewedDays.has(yesterdayKey)) return 0;
  let streak = 0;
  const cursor = reviewedDays.has(todayKey) ? day : yesterday;
  while (reviewedDays.has(`${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getReviewStats(): Promise<AppStats> {
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const [allCards, todayLogs, allLogs] = await Promise.all([
    db.cards.toArray(),
    db.reviewLogs.where('review').aboveOrEqual(startOfDay).toArray(),
    db.reviewLogs.toArray(),
  ]);
  const reviewedCards = allCards.filter(c => c.state !== 'new');
  const averageRetention = reviewedCards.length
    ? reviewedCards.reduce((sum, card) => sum + calculateRetrievability(Math.max(0, (now - card.lastReview) / 86400000), card.stability), 0) / reviewedCards.length
    : 0;
  return {
    totalNodes: allCards.length,
    dueForReview: allCards.filter(card => isDue(card, now)).length,
    masteredNodes: allCards.filter(card => card.state === 'review' && card.stability > 21).length,
    averageRetention,
    streakDays: calculateStreakDays(allLogs),
    reviewsToday: todayLogs.length,
  };
}

export async function getDueNodeIds(): Promise<Set<string>> {
  return new Set((await getDueCards()).map(card => card.nodeId));
}
