import { Achievement } from './achievement';

/**
 * Generic envelope returned by mutating endpoints (habit toggle, goal update,
 * milestone toggle, daily log save) that may award XP or unlock achievements.
 * The original DTO data is in `data`; the gamification deltas are top-level so
 * callers can both update local state and react to XP/level/achievements.
 *
 * Must stay in sync with backend `GamifiedResult<T>`.
 */
export interface GamifiedResult<T> {
  data: T;
  xpAwarded: number;
  newLevel: number | null;
  levelUp: boolean;
  newAchievements: Achievement[];
  idempotent: boolean;
}