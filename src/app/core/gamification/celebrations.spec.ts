import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CelebrationService } from './celebrations';
import { Achievement } from '../models/achievement';

describe('CelebrationService', () => {
  let service: CelebrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CelebrationService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.clear();
    vi.useRealTimers();
  });

  const achievement: Achievement = {
    key: 'first_flame',
    name: 'First Flame',
    description: 'Complete any habit for the first time',
    category: 'Streak',
    icon: '🔥',
    unlocked: true,
    unlockedAt: '2026-08-13T00:00:00Z'
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('notifyXpGain sets the xpGain signal', () => {
    service.notifyXpGain(10);
    expect(service.xpGain()).toEqual({ xp: 10 });
  });

  it('notifyXpGain ignores zero or negative amounts', () => {
    service.notifyXpGain(0);
    expect(service.xpGain()).toBeNull();

    service.notifyXpGain(-5);
    expect(service.xpGain()).toBeNull();
  });

  it('notifyLevelUp sets the levelUp signal with title derived from level', () => {
    service.notifyLevelUp(5);
    expect(service.levelUp()).toEqual({ level: 5, title: 'Apprentice' });

    service.notifyLevelUp(50);
    expect(service.levelUp()?.title).toBe('Grandmaster');
  });

  it('titleFor returns correct tier for level ranges', () => {
    expect(CelebrationService.titleFor(1)).toBe('Novice');
    expect(CelebrationService.titleFor(4)).toBe('Novice');
    expect(CelebrationService.titleFor(5)).toBe('Apprentice');
    expect(CelebrationService.titleFor(19)).toBe('Adept');
    expect(CelebrationService.titleFor(20)).toBe('Specialist');
    expect(CelebrationService.titleFor(100)).toBe('Mythic');
  });

  it('notifyAchievementUnlocks sets the achievementUnlocks signal', () => {
    service.notifyAchievementUnlocks([achievement]);
    expect(service.achievementUnlocks()?.length).toBe(1);
    expect(service.achievementUnlocks()?.[0].key).toBe('first_flame');
  });

  it('notifyAchievementUnlocks ignores empty list', () => {
    service.notifyAchievementUnlocks([]);
    expect(service.achievementUnlocks()).toBeNull();
  });

  it('notifyFromGamifiedResult aggregates XP / level-up / achievements', () => {
    service.notifyFromGamifiedResult({
      xpAwarded: 50,
      newLevel: 7,
      levelUp: true,
      newAchievements: [achievement]
    });

    expect(service.xpGain()).toEqual({ xp: 50 });
    expect(service.levelUp()?.level).toBe(7);
    expect(service.achievementUnlocks()?.length).toBe(1);
  });

  it('notifyFromGamifiedResult skips XP when zero', () => {
    service.notifyFromGamifiedResult({
      xpAwarded: 0,
      newLevel: null,
      levelUp: false,
      newAchievements: []
    });

    expect(service.xpGain()).toBeNull();
    expect(service.levelUp()).toBeNull();
    expect(service.achievementUnlocks()).toBeNull();
  });

  it('notifyFromGamifiedResult handles undefined newAchievements gracefully', () => {
    // Simulates a rolling deploy where backend returns a shape the frontend doesn't expect
    service.notifyFromGamifiedResult({
      xpAwarded: 10,
      newLevel: null,
      levelUp: false,
      newAchievements: undefined as any
    });

    expect(service.xpGain()).toEqual({ xp: 10 });
    expect(service.levelUp()).toBeNull();
    expect(service.achievementUnlocks()).toBeNull();
  });

  it('clear() removes all signals', () => {
    service.notifyXpGain(50);
    service.notifyLevelUp(3);
    service.notifyAchievementUnlocks([achievement]);

    service.clear();

    expect(service.xpGain()).toBeNull();
    expect(service.levelUp()).toBeNull();
    expect(service.achievementUnlocks()).toBeNull();
  });

  it('xpGain signal auto-clears after the duration', () => {
    service.notifyXpGain(10);
    expect(service.xpGain()).not.toBeNull();

    vi.advanceTimersByTime(2200);
    expect(service.xpGain()).toBeNull();
  });

  it('levelUp signal auto-clears after the duration', () => {
    service.notifyLevelUp(5);
    expect(service.levelUp()).not.toBeNull();

    vi.advanceTimersByTime(3500);
    expect(service.levelUp()).toBeNull();
  });

  it('achievementUnlocks signal auto-clears after the duration', () => {
    service.notifyAchievementUnlocks([achievement]);
    expect(service.achievementUnlocks()).not.toBeNull();

    vi.advanceTimersByTime(3500);
    expect(service.achievementUnlocks()).toBeNull();
  });

  it('replacing an active xp toast resets the timer', () => {
    service.notifyXpGain(10);
    vi.advanceTimersByTime(2000); // close to expiry

    service.notifyXpGain(20); // new toast resets timer
    vi.advanceTimersByTime(500); // 500ms past first toast's expected expiry
    expect(service.xpGain()).toEqual({ xp: 20 }); // new toast still visible
  });
});