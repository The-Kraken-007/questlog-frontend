import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Achievements } from './achievements';
import { AchievementsService } from '../../core/api/achievements.service';

const mockAchievements = [
  { key: 'first_flame', name: 'First Flame', description: 'Complete any habit', category: 'Streak' as const, icon: '🔥', unlocked: true, unlockedAt: '2026-08-10T00:00:00Z' },
  { key: 'week_warrior', name: 'Week Warrior', description: '7-day streak', category: 'Streak' as const, icon: '⚔️', unlocked: false, unlockedAt: null },
  { key: 'goal_getter', name: 'Goal Getter', description: 'Complete first goal', category: 'Milestone' as const, icon: '🎯', unlocked: true, unlockedAt: '2026-08-09T00:00:00Z' },
  { key: 'dedicated', name: 'Dedicated', description: '5 days in a week', category: 'Consistency' as const, icon: '📅', unlocked: false, unlockedAt: null },
  { key: 'night_owl', name: 'Night Owl', description: 'After midnight', category: 'Special' as const, icon: '🦉', unlocked: false, unlockedAt: null },
];

describe('Achievements', () => {
  let component: Achievements;
  let fixture: ComponentFixture<Achievements>;
  let httpTesting: HttpTestingController;
  let service: AchievementsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Achievements],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    service = TestBed.inject(AchievementsService);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Achievements);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/achievements').flush([]);
    expect(component).toBeTruthy();
  });

  it('should show loading skeletons initially', () => {
    fixture.detectChanges();
    const skeletons = fixture.nativeElement.querySelectorAll('.skeleton-card');
    expect(skeletons.length).toBe(8);
    httpTesting.expectOne('/api/achievements').flush([]);
  });

  it('should display achievements after loading', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/achievements').flush(mockAchievements);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.achievement-card:not(.skeleton-card)');
    expect(cards.length).toBe(5);
  });

  it('should show correct unlocked count', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/achievements').flush(mockAchievements);
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('.subtitle');
    expect(subtitle.textContent).toContain('2 / 5 unlocked');
  });

  it('should filter by category', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/achievements').flush(mockAchievements);
    fixture.detectChanges();

    // Click "Streak" filter
    component.setFilter('Streak');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.achievement-card:not(.skeleton-card)');
    expect(cards.length).toBe(2); // first_flame + week_warrior
  });

  it('should show all when "All" filter is active', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/achievements').flush(mockAchievements);
    fixture.detectChanges();

    component.setFilter('Streak');
    fixture.detectChanges();
    expect(component.filtered().length).toBe(2);

    component.setFilter('All');
    fixture.detectChanges();
    expect(component.filtered().length).toBe(5);
  });

  it('should show locked achievements with question marks', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/achievements').flush(mockAchievements);
    fixture.detectChanges();

    const lockedCards = fixture.nativeElement.querySelectorAll('.achievement-card.locked');
    expect(lockedCards.length).toBe(3); // week_warrior, dedicated, night_owl

    const lockIcons = fixture.nativeElement.querySelectorAll('.lock-icon');
    expect(lockIcons.length).toBe(3);
  });

  it('should show unlocked achievement name and date', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/achievements').flush(mockAchievements);
    fixture.detectChanges();

    const unlockedCards = fixture.nativeElement.querySelectorAll('.achievement-card:not(.locked):not(.skeleton-card)');
    expect(unlockedCards.length).toBe(2);

    const names = fixture.nativeElement.querySelectorAll('.achievement-name');
    const nameTexts = Array.from(names).map((n: any) => n.textContent.trim());
    expect(nameTexts).toContain('First Flame');
    expect(nameTexts).toContain('Goal Getter');
  });
});
