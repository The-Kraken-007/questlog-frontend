import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { WeeklyReview } from '../models/review';

const emptyReview: WeeklyReview = {
  weekStart: '2026-07-20',
  weekEnd: '2026-07-26',
  xpEarned: { total: 0, daily: [] },
  levelChange: { from: 1, to: 1 },
  habits: { total: 0, completed: 0, rate: 0, bestStreak: 0, dailyBreakdown: [] },
  goals: { active: 0, completed: 0, milestonesCompleted: 0 },
  dailyLogs: { daysLogged: 0, wordCount: 0 },
  achievements: [],
  reflection: { notes: null, exists: false }
};

describe('ReviewService', () => {
  let service: ReviewService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ReviewService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch weekly review with week param', () => {
    service.getWeeklyReview('2026-07-20').subscribe(data => {
      expect(data).toEqual(emptyReview);
    });

    const req = httpTesting.expectOne('/api/review/weekly?week=2026-07-20');
    expect(req.request.method).toBe('GET');
    req.flush(emptyReview);
  });

  it('should update review signal on success', () => {
    service.getWeeklyReview('2026-07-20').subscribe();
    httpTesting.expectOne('/api/review/weekly?week=2026-07-20').flush(emptyReview);

    expect(service.review()).toEqual(emptyReview);
    expect(service.isLoading()).toBe(false);
  });

  it('should set loading state during fetch', () => {
    expect(service.isLoading()).toBe(false);

    service.getWeeklyReview('2026-07-20').subscribe();
    expect(service.isLoading()).toBe(true);

    httpTesting.expectOne('/api/review/weekly?week=2026-07-20').flush(emptyReview);
    expect(service.isLoading()).toBe(false);
  });

  it('should clear loading state on error', () => {
    service.getWeeklyReview('2026-07-20').subscribe({ error: () => {} });
    expect(service.isLoading()).toBe(true);

    httpTesting.expectOne('/api/review/weekly?week=2026-07-20').error(new ProgressEvent('error'));
    expect(service.isLoading()).toBe(false);
  });

  it('should save reflection via POST', () => {
    service.saveReflection('2026-07-20', 'Solid week').subscribe(data => {
      expect(data).toEqual({ notes: 'Solid week', exists: true });
    });

    const req = httpTesting.expectOne('/api/review/reflection');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ weekStart: '2026-07-20', notes: 'Solid week' });
    req.flush({ notes: 'Solid week', exists: true });
  });
});
