import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database';
import { createNewCard, scheduleCard } from './fsrs';
import { calculateStreakDays, reviewCard } from './scheduler';

describe('scheduler', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('increments lapses and enters relearning after a review lapse', () => {
    const now = Date.now();
    const { card: reviewCardState } = scheduleCard(createNewCard('a'), 3, now);
    const { card: lapsed } = scheduleCard(reviewCardState, 1, now + 86_400_000);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.state).toBe('relearning');
  });

  it('writes one card and one log in the review transaction', async () => {
    const card = createNewCard('atomic');
    await db.cards.add(card);
    await reviewCard('atomic', 1, Date.now());
    expect(await db.cards.count()).toBe(1);
    expect(await db.reviewLogs.count()).toBe(1);
    expect((await db.cards.get('atomic'))?.state).toBe('learning');
  });

  it('counts distinct consecutive local calendar days ending today or yesterday', () => {
    const today = new Date(2026, 9, 9, 12);
    const day = (offset: number) => new Date(2026, 9, 9 - offset, 12).getTime();
    expect(calculateStreakDays([{ review: day(0) }, { review: day(0) }, { review: day(1) }, { review: day(2) }], today)).toBe(3);
    expect(calculateStreakDays([{ review: day(1) }, { review: day(2) }], today)).toBe(2);
    expect(calculateStreakDays([{ review: day(3) }], today)).toBe(0);
  });
});
