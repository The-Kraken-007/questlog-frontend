export interface HabitSummaryDto {
  id: number;
  name: string;
  emoji: string | null;
  isCompletedToday: boolean;
  currentStreak: number;
}

export interface TodayHabitsDto {
  totalCount: number;
  completedCount: number;
  habits: HabitSummaryDto[];
}

export interface StreakDto {
  habitId: number;
  name: string;
  emoji: string | null;
  currentStreak: number;
}

export interface ActiveGoalDto {
  id: number;
  title: string;
  status: string;
  progressPercent: number;
  totalMilestones: number;
  completedMilestones: number;
}

export interface DashboardTaskDto {
  id: number;
  questTaskListId: number;
  name: string;
  dueDate: string | null;
  isCompleted: boolean;
  listName: string;
}

export interface DashboardDto {
  todayHabits: TodayHabitsDto;
  topStreaks: StreakDto[];
  activeGoals: ActiveGoalDto[];
  todayLog: string | null;
  upcomingTasks: DashboardTaskDto[];
}
