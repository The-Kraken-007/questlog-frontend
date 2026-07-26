import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { correlationInterceptor, CORRELATION_ID_STORAGE_KEY, CORRELATION_ID_HEADER } from './correlation.interceptor';

describe('correlationInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

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

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([correlationInterceptor])),
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

  it('attaches the stored correlation id as X-Correlation-ID header', () => {
    localStorage.setItem(CORRELATION_ID_STORAGE_KEY, 'stored-corr-id');

    http.get('/api/habits').subscribe();

    const req = httpMock.expectOne('/api/habits');
    expect(req.request.headers.get(CORRELATION_ID_HEADER)).toBe('stored-corr-id');
    req.flush([]);
  });

  it('generates and persists a correlation id when none is stored', () => {
    http.get('/api/habits').subscribe();

    const req = httpMock.expectOne('/api/habits');
    const sentId = req.request.headers.get(CORRELATION_ID_HEADER);
    expect(sentId).toBeTruthy();
    expect(localStorage.getItem(CORRELATION_ID_STORAGE_KEY)).toBe(sentId);
    req.flush([]);
  });

  it('reuses the same correlation id across requests in the session', () => {
    http.get('/api/habits').subscribe();
    httpMock.expectOne('/api/habits').flush([]);

    http.get('/api/goals').subscribe();
    const second = httpMock.expectOne('/api/goals');
    expect(second.request.headers.get(CORRELATION_ID_HEADER))
      .toBe(localStorage.getItem(CORRELATION_ID_STORAGE_KEY));
    second.flush([]);
  });

  it('does not attach the header to non-api requests', () => {
    http.get('/assets/icon.png').subscribe();

    const req = httpMock.expectOne('/assets/icon.png');
    expect(req.request.headers.has(CORRELATION_ID_HEADER)).toBe(false);
    req.flush({});
  });
});
