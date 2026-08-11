import { FSRSCard, ReviewLog, Rating, CardState } from '../types';

const w = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 
  1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 
  2.9898, 0.51655, 0.6621
];
const DESIRED_RETENTION = 0.9;
const DECAY = -0.5;
const FACTOR = 19 / 81;

export function createNewCard(nodeId: string): FSRSCard {
  return {
    nodeId,
    state: 'new',
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    due: Date.now(),
    lastReview: Date.now(),
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
  if (elapsedDays === 0) return 1;
  return Math.pow(1 + FACTOR * elapsedDays / stability, DECAY);
}

export function calculateNextDifficulty(d: number, rating: Rating): number {
  const d0 = calculateInitialDifficulty(rating);
  const nextD = w[7] * d0 + (1 - w[7]) * d;
  return Math.min(Math.max(nextD, 1), 10);
}

export function calculateNextStabilitySuccess(d: number, s: number, r: number, rating: Rating): number {
  const hardPenalty = rating === 2 ? w[15] : 1;
  const easyBonus = rating === 4 ? w[16] : 1;
  
  const step = Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * hardPenalty * easyBonus;
  return s * (1 + step);
}

export function calculateNextStabilityFail(d: number, s: number, r: number): number {
  return Math.max(
    w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r)), 
    0.1
  );
}

export function calculateInterval(stability: number): number {
  const interval = (stability / FACTOR) * (Math.pow(DESIRED_RETENTION, 1 / DECAY) - 1);
  return Math.max(Math.round(interval), 1);
}

export function scheduleCard(card: FSRSCard, rating: Rating, now: number = Date.now()): { card: FSRSCard, log: ReviewLog } {
  const nextCard = { ...card };
  
  const log: ReviewLog = {
    nodeId: card.nodeId,
    rating,
    state: card.state,
    scheduledDays: card.scheduledDays,
    elapsedDays: card.state === 'new' ? 0 : (now - card.lastReview) / 86400000,
    review: now,
    stability: card.stability,
    difficulty: card.difficulty,
  };

  nextCard.lastReview = now;
  nextCard.reps += 1;
  nextCard.elapsedDays = log.elapsedDays;

  if (card.state === 'new') {
    nextCard.difficulty = calculateInitialDifficulty(rating);
    nextCard.stability = calculateInitialStability(rating);
    nextCard.state = rating === 1 ? 'learning' : 'review';
    nextCard.scheduledDays = calculateInterval(nextCard.stability);
    nextCard.due = now + nextCard.scheduledDays * 86400000;
  } else if (card.state === 'learning' || card.state === 'relearning') {
    if (rating === 1) {
      nextCard.scheduledDays = 0;
      nextCard.due = now + 5 * 60000; // Due in 5 mins
    } else {
      nextCard.state = 'review';
      nextCard.scheduledDays = calculateInterval(nextCard.stability);
      nextCard.due = now + nextCard.scheduledDays * 86400000;
    }
  } else if (card.state === 'review') {
    const r = calculateRetrievability(nextCard.elapsedDays, card.stability);
    nextCard.difficulty = calculateNextDifficulty(card.difficulty, rating);
    
    if (rating === 1) {
      nextCard.lapses += 1;
      nextCard.stability = calculateNextStabilityFail(card.difficulty, card.stability, r);
      nextCard.state = 'relearning';
      nextCard.scheduledDays = 0;
      nextCard.due = now + 5 * 60000;
    } else {
      nextCard.stability = calculateNextStabilitySuccess(card.difficulty, card.stability, r, rating);
      nextCard.scheduledDays = calculateInterval(nextCard.stability);
      nextCard.due = now + nextCard.scheduledDays * 86400000;
    }
  }

  return { card: nextCard, log };
}

export function isDue(card: FSRSCard, now: number = Date.now()): boolean {
  return card.due <= now;
}
