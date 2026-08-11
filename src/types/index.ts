export type NodeCategory = 'formula' | 'algorithm' | 'architecture' | 'concept' | 'theorem';
export type NodeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface KnowledgeNode {
  id: string;
  title: string;
  category: NodeCategory;
  difficulty: NodeDifficulty;
  description: string;
  latex?: string;
  mermaid?: string;
  code?: string;
  markdown?: string;
  tags: string[];
  prerequisites: string[];
  createdAt: number;
  updatedAt: number;
}

export type Rating = 1 | 2 | 3 | 4;
export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export interface FSRSCard {
  nodeId: string;
  state: CardState;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  due: number;
  lastReview: number;
}

export interface ReviewLog {
  id?: number;
  nodeId: string;
  rating: Rating;
  state: CardState;
  scheduledDays: number;
  elapsedDays: number;
  review: number;
  stability: number;
  difficulty: number;
}

export interface NodePosition {
  nodeId: string;
  x: number;
  y: number;
}

export interface AppStats {
  totalNodes: number;
  dueForReview: number;
  masteredNodes: number;
  averageRetention: number;
  streakDays: number;
  reviewsToday: number;
}

export type ViewMode = 'graph' | 'review' | 'sandbox';
export type SidebarTab = 'nodes' | 'stats' | 'settings';
