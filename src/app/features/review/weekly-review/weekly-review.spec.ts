import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { WeeklyReview } from './weekly-review';
import { WeeklyReview as WeeklyReviewData } from '../../../core/models/review';
import { ReviewService } from '../../../core/api/review.service';

function mondayStr(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function makeReview(overrides: Partial<WeeklyReviewData> = {}): WeeklyReviewData {
  const base: WeeklyReviewData = {
    weekStart: mondayStr(new Date()),
    weekEnd: '2026-07-26',
    xpEarned: { total: 120, daily: [{ date: '2026-07-20', amount: 50 }] },
    levelChange: { from: 3, to: 4 },
    habits: {
      total: 3,
      completed: 12,
      rate: 57.1,
      bestStreak: 4,
      dailyBreakdown: [
        { date: '2026-07-20', completed: 2, total: 3, rate: 66.7 },
        { date: '2026-07-21', completed: 3, total: 3, rate: 100 },
        { date: '2026-07-22', completed: 0, total: 3, rate: 0 },
        { date: '2026-07-23', completed: 3, total: 3, rate: 100 },
        { date: '2026-07-24', completed: 1, total: 3, rate: 33.3 },
        { date: '2026-07-25', completed: 2, total: 3, rate: 66.7 },
        { date: '2026-07-26', completed: 1, total: 3, rate: 33.3 }
      ]
    },
    goals: { active: 2, completed: 1, milestonesCompleted: 3 },
    dailyLogs: { daysLogged: 5, wordCount: 1240 },
    achievements: [{ key: 'week_warrior', name: 'Week Warrior', icon: '⚔️', unlockedAt: '2026-07-22T00:00:00Z' }],
    reflection: { notes: 'Great week!', exists: true }
  };
  return { ...base, ...overrides };
}

describe('WeeklyReview', () => {
  let component: WeeklyReview;
  let fixture: ComponentFixture<WeeklyReview>;
  let httpTesting: HttpTestingController;
  let service: ReviewService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyReview],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideLocationMocks()]
    }).compileComponents();

    service = TestBed.inject(ReviewService);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WeeklyReview);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
    expect(component).toBeTruthy();
  });

  it('should show loading skeletons initially', () => {
    fixture.detectChanges();
    const skeletons = fixture.nativeElement.querySelectorAll('.skeleton-card');
    expect(skeletons.length).toBe(3);
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
  });

  it('should display XP earned and level change after load', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
    fixture.detectChanges();

    const values = fixture.nativeElement.querySelectorAll('.stat-value');
    expect(values[0].textContent).toContain('120');
    expect(values[1].textContent).toContain('Lv 3 → 4');
  });

  it('should show habit rate and best streak', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
    fixture.detectChanges();

    const rateBadge = fixture.nativeElement.querySelector('.rate-badge');
    expect(rateBadge.textContent).toContain('12/21 completed');
    const subStats = fixture.nativeElement.querySelector('.sub-stats');
    expect(subStats.textContent).toContain('4');
  });

  it('should render 7 heatmap cells for the week', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('.heatmap-cell');
    expect(cells.length).toBe(7);
  });

  it('should load saved reflection notes into the textarea', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
    fixture.detectChanges();

    expect(component.notes).toBe('Great week!');
  });

  it('should save reflection via POST', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
    fixture.detectChanges();

    component.notes = 'Updated notes';
    component.saveReflection();

    const req = httpTesting.expectOne('/api/review/reflection');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ weekStart: mondayStr(new Date()), notes: 'Updated notes' });
    req.flush({ notes: 'Updated notes', exists: true });

    expect(component.isSaving()).toBe(false);
    expect(component.isSaved()).toBe(true);
  });

  it('should navigate to previous week on shiftWeek(-1)', () => {
    fixture.detectChanges();
    httpTesting.expectOne(`/api/review/weekly?week=${mondayStr(new Date())}`).flush(makeReview());
    fixture.detectChanges();

    component.shiftWeek(-1);

    const prev = new Date(mondayStr(new Date()) + 'T00:00:00');
    prev.setDate(prev.getDate() - 7);
    const prevStr = mondayStr(prev);
    httpTesting.expectOne(`/api/review/weekly?week=${prevStr}`).flush(makeReview({ weekStart: prevStr }));
    expect(component.isCurrentWeek()).toBe(false);
  });
});
