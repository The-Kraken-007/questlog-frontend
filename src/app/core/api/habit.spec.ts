import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HabitService } from './habit';

describe('HabitService', () => {
  let service: HabitService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HabitService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(HabitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all habits', () => {
    const mockHabits = [
      { id: 1, name: 'Drink Water', emoji: '💧', currentStreak: 5, isCompletedToday: false, isArchived: false, sortOrder: 0, createdAt: new Date().toISOString() }
    ];

    service.getAll().subscribe(habits => {
      expect(habits.length).toBe(1);
      expect(habits[0].name).toBe('Drink Water');
    });

    const req = httpMock.expectOne('/api/habits');
    expect(req.request.method).toBe('GET');
    req.flush(mockHabits);
  });
});
