import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GoalService } from './goal';

describe('GoalService', () => {
  let service: GoalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GoalService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GoalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all goals', () => {
    const mockGoals = [
      { id: 1, title: 'Run a marathon', status: 'Active', progressPercent: 30, milestones: [] }
    ];

    service.getAll().subscribe(goals => {
      expect(goals.length).toBe(1);
      expect(goals[0].title).toBe('Run a marathon');
    });

    const req = httpMock.expectOne('/api/goals');
    expect(req.request.method).toBe('GET');
    req.flush(mockGoals);
  });

  it('should PUT to toggle a milestone', () => {
    service.toggleMilestone(42).subscribe();

    const req = httpMock.expectOne('/api/milestones/42/toggle');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, milestones: [] });
  });
});
