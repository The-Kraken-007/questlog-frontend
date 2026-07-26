import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../toast';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let toastSpy: { error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Mock localStorage if it's not defined in the test environment (e.g., Node 22+)
    if (typeof localStorage === 'undefined' || !localStorage) {
      const store: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { for (const k in store) delete store[k]; },
        length: 0,
        key: (index: number) => null
      };
      Object.defineProperty(globalThis, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
    }
    localStorage.clear();

    toastSpy = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: toastSpy },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('toasts the detail message from a ProblemDetails error', () => {
    http.get('/api/habits').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/habits');
    req.flush(
      { title: 'Resource not found.', detail: 'Habit 5 does not exist.', status: 404 },
      { status: 404, statusText: 'Not Found' }
    );

    expect(toastSpy.error).toHaveBeenCalledWith('Habit 5 does not exist.');
  });

  it('falls back to the ProblemDetails title when no detail is present', () => {
    http.get('/api/habits').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/habits');
    req.flush(
      { title: 'An unexpected error occurred.', status: 500 },
      { status: 500, statusText: 'Server Error' }
    );

    expect(toastSpy.error).toHaveBeenCalledWith('An unexpected error occurred.');
  });

  it('toasts the first field error from a validation ProblemDetails', () => {
    http.post('/api/habits', { name: '' }).subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/habits');
    req.flush(
      {
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: { Name: ['Name is required.'], Emoji: ['Emoji is required.'] }
      },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(toastSpy.error).toHaveBeenCalledWith('Name is required.');
  });

  it('does not toast on 401 (auth flow owns those)', () => {
    http.get('/api/habits').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/habits');
    req.flush({ title: 'Unauthorized', status: 401 }, { status: 401, statusText: 'Unauthorized' });

    expect(toastSpy.error).not.toHaveBeenCalled();
  });

  it('rethrows the error so services can still react', () => {
    let caught: any;
    http.get('/api/habits').subscribe({ error: (err) => (caught = err) });

    const req = httpMock.expectOne('/api/habits');
    req.flush({ title: 'fail', status: 500 }, { status: 500, statusText: 'Server Error' });

    expect(caught).toBeTruthy();
    expect(caught.status).toBe(500);
  });

  it('toasts a generic message when the error is not ProblemDetails', () => {
    http.get('/api/habits').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/habits');
    req.error(new ProgressEvent('error'), { status: 0 });

    expect(toastSpy.error).toHaveBeenCalledWith('Network error — please check your connection.');
  });

  it('never exposes the correlation id in the toast message', () => {
    localStorage.setItem('ql_correlation_id', 'secret-trace-id');
    http.get('/api/habits').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/habits');
    req.flush(
      { title: 'fail', detail: 'Something broke.', status: 500, correlationId: 'secret-trace-id' },
      { status: 500, statusText: 'Server Error' }
    );

    const message = toastSpy.error.mock.calls[0][0] as string;
    expect(message).not.toContain('secret-trace-id');
    expect(message).not.toContain('Ref:');
  });
});
