import { create } from 'zustand';
import type { FSRSCard, Rating, AppStats } from '../types';
import { getDueCards, reviewCard as processReview, getReviewStats } from '../engine/scheduler';
import { useGraphStore } from './graphStore';
import { db } from '../db/database';

interface ReviewState {
  dueCards: FSRSCard[];
  currentCardIndex: number;
  isReviewing: boolean;
  showAnswer: boolean;
  stats: AppStats | null;
  sessionStats: {
    reviewed: number;
    correct: number;
    startTime: number;
  };

  loadDueCards: () => Promise<void>;
  startReview: () => void;
  showCardAnswer: () => void;
  rateCard: (rating: Rating) => Promise<void>;
  skipCard: () => void;
  endReview: () => void;
  loadStats: () => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  dueCards: [],
  currentCardIndex: 0,
  isReviewing: false,
  showAnswer: false,
  stats: null,
  sessionStats: { reviewed: 0, correct: 0, startTime: Date.now() },

  loadDueCards: async () => {
    const cards = await getDueCards(50);
    const { prerequisiteGateEnabled } = useGraphStore.getState();
    const gatedCards = prerequisiteGateEnabled ? await (async () => {
      const [nodes, allCards] = await Promise.all([db.nodes.toArray(), db.cards.toArray()]);
      const cardMap = new Map(allCards.map(card => [card.nodeId, card]));
      return cards.filter(card => {
        const node = nodes.find(item => item.id === card.nodeId);
        return !node || node.prerequisites.every(id => (cardMap.get(id)?.stability || 0) >= 7);
      });
    })() : cards;
    set({ dueCards: gatedCards });
  },

  startReview: () => set({
    isReviewing: true,
    currentCardIndex: 0,
    showAnswer: false,
    sessionStats: { reviewed: 0, correct: 0, startTime: Date.now() },
  }),

  showCardAnswer: () => set({ showAnswer: true }),

  rateCard: async (rating) => {
    const { dueCards, currentCardIndex, sessionStats } = get();
    const card = dueCards[currentCardIndex];
    if (!card) return;
    await processReview(card.nodeId, rating);
    const newStats = {
      reviewed: sessionStats.reviewed + 1,
      correct: rating >= 3 ? sessionStats.correct + 1 : sessionStats.correct,
      startTime: sessionStats.startTime,
    };
    const nextIndex = currentCardIndex + 1;
    if (nextIndex >= dueCards.length) {
      set({ isReviewing: false, showAnswer: false, sessionStats: newStats, currentCardIndex: 0 });
    } else {
      set({ currentCardIndex: nextIndex, showAnswer: false, sessionStats: newStats });
    }
    useGraphStore.getState().refreshDueState();
  },

  skipCard: () => {
    const { currentCardIndex, dueCards } = get();
    const nextIndex = currentCardIndex + 1;
    if (nextIndex >= dueCards.length) {
      set({ isReviewing: false, showAnswer: false, currentCardIndex: 0 });
    } else {
      set({ currentCardIndex: nextIndex, showAnswer: false });
    }
  },

  endReview: () => set({ isReviewing: false, showAnswer: false, currentCardIndex: 0 }),

  loadStats: async () => {
    const stats = await getReviewStats();
    set({ stats });
  },
}));
