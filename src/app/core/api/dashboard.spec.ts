import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET /api/dashboard', () => {
    const mockData = {
      todayHabits: { totalCount: 3, completedCount: 1, habits: [] },
      topStreaks: [],
      activeGoals: [],
      todayLog: null
    };

    service.get().subscribe(data => {
      expect(data.todayHabits.totalCount).toBe(3);
      expect(data.todayHabits.completedCount).toBe(1);
      expect(data.topStreaks).toEqual([]);
    });

    const req = httpMock.expectOne('/api/dashboard');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
