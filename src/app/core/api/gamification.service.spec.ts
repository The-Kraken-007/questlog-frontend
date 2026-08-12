import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { GamificationService } from './gamification.service';

describe('GamificationService', () => {
  let service: GamificationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GamificationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch profile from correct endpoint', () => {
    const mockProfile = {
      totalXp: 100,
      currentLevel: 2,
      title: 'Novice',
      xpInCurrentLevel: 0,
      xpForCurrentLevel: 282,
      xpToNextLevel: 282
    };

    service.getProfile().subscribe(profile => {
      expect(profile).toEqual(mockProfile);
    });

    const req = httpTesting.expectOne('/api/gamification/profile');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should update profile signal on success', () => {
    const mockProfile = {
      totalXp: 500,
      currentLevel: 3,
      title: 'Novice',
      xpInCurrentLevel: 118,
      xpForCurrentLevel: 519,
      xpToNextLevel: 401
    };

    service.getProfile().subscribe();
    httpTesting.expectOne('/api/gamification/profile').flush(mockProfile);

    expect(service.profile()).toEqual(mockProfile);
    expect(service.isLoading()).toBe(false);
  });

  it('should set loading state during fetch', () => {
    expect(service.isLoading()).toBe(false);

    service.getProfile().subscribe();
    expect(service.isLoading()).toBe(true);

    httpTesting.expectOne('/api/gamification/profile').flush({});
    expect(service.isLoading()).toBe(false);
  });

  it('should clear loading state on error', () => {
    service.getProfile().subscribe({ error: () => {} });
    expect(service.isLoading()).toBe(true);

    httpTesting.expectOne('/api/gamification/profile').error(new ProgressEvent('error'));
    expect(service.isLoading()).toBe(false);
    expect(service.profile()).toBeNull();
  });
});
