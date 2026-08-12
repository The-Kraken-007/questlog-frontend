export interface Achievement {
  key: string;
  name: string;
  description: string;
  category: 'Streak' | 'Milestone' | 'Consistency' | 'Special';
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}
