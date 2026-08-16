export interface DailyXp {
  date: string;
  amount: number;
}

export interface LevelChange {
  from: number;
  to: number;
}

export interface HabitDay {
  date: string;
  completed: number;
  total: number;
  rate: number;
}

export interface HabitSummary {
  total: number;
  completed: number;
  rate: number;
  bestStreak: number;
  dailyBreakdown: HabitDay[];
}

export interface GoalSummary {
  active: number;
  completed: number;
  milestonesCompleted: number;
}

export interface DailyLogSummary {
  daysLogged: number;
  wordCount: number;
}

export interface AchievementSummary {
  key: string;
  name: string;
  icon: string;
  unlockedAt: string;
}

export interface Reflection {
  notes: string | null;
  exists: boolean;
}

export interface WeeklyReview {
  weekStart: string;
  weekEnd: string;
  xpEarned: { total: number; daily: DailyXp[] };
  levelChange: LevelChange;
  habits: HabitSummary;
  goals: GoalSummary;
  dailyLogs: DailyLogSummary;
  achievements: AchievementSummary[];
  reflection: Reflection;
}

/** Response of POST /api/review/reflection — shape mirrors Reflection. */
export interface SavedReflection {
  notes: string;
  exists: boolean;
}
