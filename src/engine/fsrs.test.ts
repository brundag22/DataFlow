import { describe, expect, it } from 'vitest';
import { calculateInitialDifficulty, calculateInitialStability, calculateInterval, calculateRetrievability, createNewCard, scheduleCard } from './fsrs';

describe('FSRS engine', () => {
  it('uses the first four weights for S0 ratings 1..4', () => {
    expect([1, 2, 3, 4].map(rating => calculateInitialStability(rating as 1 | 2 | 3 | 4))).toEqual([0.40255, 1.18385, 3.173, 15.69105]);
  });

  it('calculates D0(3) near 5.28', () => {
    expect(calculateInitialDifficulty(3)).toBeCloseTo(5.28, 2);
  });

  it('rounds calculated intervals with a minimum of one day', () => {
    for (const stability of [0.1, 1, 3.173, 15.69105]) {
      expect(calculateInterval(stability)).toBe(Math.max(1, Math.round(stability)));
    }
  });

  it('returns approximately 0.9 retention at a scheduled interval', () => {
    const stability = 10;
    const interval = calculateInterval(stability);
    expect(calculateRetrievability(interval, stability)).toBeCloseTo(0.9, 2);
  });

  it('puts a new Again card into one-minute learning', () => {
    const now = 1_000_000;
    const { card } = scheduleCard(createNewCard('a'), 1, now);
    expect(card.state).toBe('learning');
    expect(card.due - now).toBe(60_000);
  });
});
