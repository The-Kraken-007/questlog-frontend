import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AchievementsService } from './achievements.service';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AchievementsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch achievements from correct endpoint', () => {
    const mockData = [
      { key: 'first_flame', name: 'First Flame', description: 'test', category: 'Streak' as const, icon: '🔥', unlocked: false, unlockedAt: null }
    ];

    service.getAchievements().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpTesting.expectOne('/api/achievements');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should update achievements signal on success', () => {
    const mockData = [
      { key: 'first_flame', name: 'First Flame', description: 'test', category: 'Streak' as const, icon: '🔥', unlocked: true, unlockedAt: '2026-08-10T00:00:00Z' }
    ];

    service.getAchievements().subscribe();
    httpTesting.expectOne('/api/achievements').flush(mockData);

    expect(service.achievements()).toEqual(mockData);
    expect(service.isLoading()).toBe(false);
  });

  it('should set loading state during fetch', () => {
    expect(service.isLoading()).toBe(false);

    service.getAchievements().subscribe();
    expect(service.isLoading()).toBe(true);

    httpTesting.expectOne('/api/achievements').flush([]);
    expect(service.isLoading()).toBe(false);
  });

  it('should clear loading state on error', () => {
    service.getAchievements().subscribe({ error: () => {} });
    expect(service.isLoading()).toBe(true);

    httpTesting.expectOne('/api/achievements').error(new ProgressEvent('error'));
    expect(service.isLoading()).toBe(false);
    expect(service.achievements()).toEqual([]);
  });
});
