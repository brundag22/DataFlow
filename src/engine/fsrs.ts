import type { FSRSCard, ReviewLog, Rating } from '../types';

// FSRS weights. w17 and w18 are retained for reference but are unused here.
const w = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
  1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
  2.9898, 0.51655, 0.6621,
];
const DESIRED_RETENTION = 0.9;
const DECAY = -0.5;
const FACTOR = 19 / 81;
export const LEARNING_STEPS_MS = [1 * 60_000, 10 * 60_000] as const;
const DAY_MS = 86_400_000;

export function createNewCard(nodeId: string): FSRSCard {
  const now = Date.now();
  return {
    nodeId,
    state: 'new',
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    due: now,
    lastReview: now,
    learningStep: 0,
  };
}

export function calculateInitialDifficulty(rating: Rating): number {
  const d = w[4] - Math.exp(w[5] * (rating - 1)) + 1;
  return Math.min(Math.max(d, 1), 10);
}

export function calculateInitialStability(rating: Rating): number {
  return Math.max(w[rating - 1], 0.1);
}

export function calculateRetrievability(elapsedDays: number, stability: number): number {
  if (elapsedDays <= 0 || stability <= 0) return 1;
  return Math.pow(1 + FACTOR * elapsedDays / stability, DECAY);
}

export function calculateNextDifficulty(d: number, rating: Rating): number {
  const d0 = calculateInitialDifficulty(3);
  // w7 blends the rating-neutral initial difficulty with the prior difficulty.
  // w6 shifts difficulty according to the distance of the rating from Good (3).
  const nextD = w[6] * d0 + (1 - w[6]) * (d - w[5] * (rating - 3));
  return Math.min(Math.max(nextD, 1), 10);
}

export function calculateNextStabilitySuccess(d: number, s: number, r: number, rating: Rating): number {
  const hardPenalty = rating === 2 ? w[15] : 1;
  const easyBonus = rating === 4 ? w[16] : 1;
  const step = Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * hardPenalty * easyBonus;
  return Math.max(s * (1 + step), 0.1);
}

export function calculateNextStabilityFail(d: number, s: number, r: number): number {
  return Math.max(w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r)), 0.1);
}

export function calculateInterval(stability: number): number {
  const interval = (stability / FACTOR) * (Math.pow(DESIRED_RETENTION, 1 / DECAY) - 1);
  return Math.max(1, Math.round(interval));
}

function learningDue(card: FSRSCard, rating: Rating, now: number): { state: FSRSCard['state']; due: number; scheduledDays: number; learningStep?: number } {
  const step = card.learningStep ?? 0;
  if (rating === 1) {
    return { state: card.state === 'relearning' ? 'relearning' : 'learning', due: now + LEARNING_STEPS_MS[0], scheduledDays: 0, learningStep: 0 };
  }
  if (rating === 4) {
    return { state: 'review', due: now + calculateInterval(Math.max(card.stability, 1)) * DAY_MS, scheduledDays: calculateInterval(Math.max(card.stability, 1)), learningStep: undefined };
  }
  if (rating === 3 && step < LEARNING_STEPS_MS.length - 1) {
    return { state: 'learning', due: now + LEARNING_STEPS_MS[step + 1], scheduledDays: 0, learningStep: step + 1 };
  }
  const interval = calculateInterval(Math.max(card.stability, 1));
  return { state: 'review', due: now + interval * DAY_MS, scheduledDays: interval, learningStep: undefined };
}

export function scheduleCard(card: FSRSCard, rating: Rating, now: number = Date.now()): { card: FSRSCard; log: ReviewLog } {
  const elapsedDays = card.state === 'new' ? 0 : Math.max(0, (now - card.lastReview) / DAY_MS);
  const log: ReviewLog = {
    nodeId: card.nodeId, rating, state: card.state, scheduledDays: card.scheduledDays,
    elapsedDays, review: now, stability: card.stability, difficulty: card.difficulty,
  };
  const nextCard: FSRSCard = { ...card, lastReview: now, reps: card.reps + 1, elapsedDays };

  if (card.state === 'new') {
    nextCard.difficulty = calculateInitialDifficulty(rating);
    nextCard.stability = calculateInitialStability(rating);
    if (rating === 1) {
      nextCard.state = 'learning'; nextCard.learningStep = 0; nextCard.scheduledDays = 0; nextCard.due = now + LEARNING_STEPS_MS[0];
    } else {
      nextCard.state = 'review'; nextCard.learningStep = undefined; nextCard.scheduledDays = calculateInterval(nextCard.stability); nextCard.due = now + nextCard.scheduledDays * DAY_MS;
    }
  } else if (card.state === 'learning' || card.state === 'relearning') {
    Object.assign(nextCard, learningDue(card, rating, now));
  } else {
    const r = calculateRetrievability(elapsedDays, card.stability);
    nextCard.difficulty = calculateNextDifficulty(card.difficulty, rating);
    if (rating === 1) {
      nextCard.lapses += 1; nextCard.stability = calculateNextStabilityFail(card.difficulty, card.stability, r);
      nextCard.state = 'relearning'; nextCard.learningStep = 0; nextCard.scheduledDays = 0; nextCard.due = now + LEARNING_STEPS_MS[0];
    } else {
      nextCard.stability = calculateNextStabilitySuccess(card.difficulty, card.stability, r, rating);
      nextCard.scheduledDays = calculateInterval(nextCard.stability); nextCard.due = now + nextCard.scheduledDays * DAY_MS;
    }
  }
  return { card: nextCard, log };
}

export function previewIntervals(card: FSRSCard, now: number = Date.now()): Record<Rating, number> {
  return ([1, 2, 3, 4] as Rating[]).reduce((result, rating) => {
    result[rating] = Math.max(0, scheduleCard(card, rating, now).card.due - now);
    return result;
  }, {} as Record<Rating, number>);
}

export function isDue(card: FSRSCard, now: number = Date.now()): boolean {
  return card.due <= now;
}
