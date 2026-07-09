export interface HabitDto {
  id: number;
  name: string;
  emoji: string;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  isCompletedToday: boolean;
  currentStreak: number;
}

export interface HabitEntryDto {
  id: number;
  habitId: number;
  date: string;
  isCompleted: boolean;
}

export interface CreateHabitRequest {
  name: string;
  emoji?: string;
}

export interface UpdateHabitRequest {
  name?: string;
  emoji?: string;
  sortOrder?: number;
  isArchived?: boolean;
}
