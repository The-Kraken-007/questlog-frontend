import { Injectable, signal } from '@angular/core';
import { Achievement } from '../models/achievement';

/**
 * Active "celebration" toast/overlay state. Components like
 * `CelebrationHostComponent` read these signals and render the UI; feature
 * components call `notify*` after a successful mutating API call.
 *
 * Each signal is set to a non-null payload for a short time, then cleared by
 * an internal timer. Setting a new value while the previous toast is still
 * on-screen replaces it and resets the timer.
 */
@Injectable({ providedIn: 'root' })
export class CelebrationService {
  /** Currently-displayed XP gain ("+10 XP") — null when no toast visible. */
  readonly xpGain = signal<{ xp: number } | null>(null);

  /** Currently-displayed level-up overlay — null when not shown. */
  readonly levelUp = signal<{ level: number; title: string } | null>(null);

  /** Queue of achievements unlocked in one action — drained after a delay. */
  readonly achievementUnlocks = signal<readonly Achievement[] | null>(null);

  private xpTimer: ReturnType<typeof setTimeout> | null = null;
  private levelUpTimer: ReturnType<typeof setTimeout> | null = null;
  private achievementTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly XP_DURATION_MS = 2200;
  private readonly LEVEL_UP_DURATION_MS = 3500;
  private readonly ACHIEVEMENT_DURATION_MS = 3500;

  /** Title for a given level. Mirrors backend `LevelCalculator.GetTitle`. */
  static titleFor(level: number): string {
    if (level <= 4) return 'Novice';
    if (level <= 9) return 'Apprentice';
    if (level <= 19) return 'Adept';
    if (level <= 29) return 'Specialist';
    if (level <= 39) return 'Expert';
    if (level <= 49) return 'Master';
    if (level <= 74) return 'Grandmaster';
    if (level <= 99) return 'Champion';
    return 'Mythic';
  }

  /** Show a "+XP" toast. Replaces any existing toast. */
  notifyXpGain(xp: number): void {
    if (xp <= 0) return;
    this.xpGain.set({ xp });
    this.resetTimer('xp');
  }

  /** Show the level-up overlay until the timer elapses. */
  notifyLevelUp(level: number): void {
    this.levelUp.set({ level, title: CelebrationService.titleFor(level) });
    this.resetTimer('levelUp');
  }

  /** Show achievement unlock toasts (each card clears together). */
  notifyAchievementUnlocks(achievements: readonly Achievement[]): void {
    if (achievements.length === 0) return;
    this.achievementUnlocks.set(achievements);
    this.resetTimer('achievement');
  }

  /** Convenience — process a GamifiedResult payload in one call. */
  notifyFromGamifiedResult(result: {
    xpAwarded: number;
    newLevel: number | null;
    levelUp: boolean;
    newAchievements: Achievement[];
  }): void {
    if (result.xpAwarded > 0) this.notifyXpGain(result.xpAwarded);
    if (result.levelUp && result.newLevel !== null) this.notifyLevelUp(result.newLevel);
    if (result.newAchievements?.length > 0) this.notifyAchievementUnlocks(result.newAchievements);
  }

  /** Dismiss everything immediately (used in tests). */
  clear(): void {
    this.xpGain.set(null);
    this.levelUp.set(null);
    this.achievementUnlocks.set(null);
    if (this.xpTimer) clearTimeout(this.xpTimer);
    if (this.levelUpTimer) clearTimeout(this.levelUpTimer);
    if (this.achievementTimer) clearTimeout(this.achievementTimer);
    this.xpTimer = this.levelUpTimer = this.achievementTimer = null;
  }

  private resetTimer(which: 'xp' | 'levelUp' | 'achievement'): void {
    if (which === 'xp') {
      if (this.xpTimer) clearTimeout(this.xpTimer);
      this.xpTimer = setTimeout(() => this.xpGain.set(null), this.XP_DURATION_MS);
    } else if (which === 'levelUp') {
      if (this.levelUpTimer) clearTimeout(this.levelUpTimer);
      this.levelUpTimer = setTimeout(() => this.levelUp.set(null), this.LEVEL_UP_DURATION_MS);
    } else {
      if (this.achievementTimer) clearTimeout(this.achievementTimer);
      this.achievementTimer = setTimeout(() => this.achievementUnlocks.set(null), this.ACHIEVEMENT_DURATION_MS);
    }
  }
}