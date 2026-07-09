export type GoalStatus = 'Active' | 'Paused' | 'Completed';

export interface MilestoneDto {
  id: number;
  goalId: number;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  completedAt: string | null;
}

export interface GoalDto {
  id: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: string;
  completedAt: string | null;
  progressPercent: number;
  milestones: MilestoneDto[];
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  targetDate?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: GoalStatus;
}
