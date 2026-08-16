import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DailyLogService } from './daily-log';

describe('DailyLogService', () => {
  let service: DailyLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DailyLogService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DailyLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET log by date', () => {
    const mockLog = { id: 1, date: '2026-07-05', content: 'Had a great day!', createdAt: '', updatedAt: '' };

    service.getByDate('2026-07-05').subscribe(log => {
      expect(log.content).toBe('Had a great day!');
    });

    const req = httpMock.expectOne('/api/logs/2026-07-05');
    expect(req.request.method).toBe('GET');
    req.flush(mockLog);
  });

  it('should POST to save a log and return a gamified result', () => {
    const payload = { date: '2026-07-05', content: 'Test entry' };
    const mockResponse = {
      data: { id: 1, date: '2026-07-05', content: 'Test entry', createdAt: '', updatedAt: '' },
      xpAwarded: 15,
      newLevel: null,
      levelUp: false,
      newAchievements: [],
      idempotent: false
    };

    service.save(payload).subscribe(result => {
      expect(result.data.date).toBe('2026-07-05');
      expect(result.xpAwarded).toBe(15);
    });

    const req = httpMock.expectOne('/api/logs');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should GET logs in range', () => {
    service.getInRange('2026-06-28', '2026-07-05').subscribe();

    const req = httpMock.expectOne(r => r.url === '/api/logs');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('from')).toBe('2026-06-28');
    expect(req.request.params.get('to')).toBe('2026-07-05');
    req.flush([]);
  });
});
