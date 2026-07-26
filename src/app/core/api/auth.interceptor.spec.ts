import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: any;

  beforeEach(() => {
    // Create a mock AuthService using signals
    authServiceSpy = {
      token: vi.fn().mockReturnValue('mock-token')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token exists and URL contains /api/', () => {
    // Make a request to an API endpoint
    http.get('/api/habits').subscribe();

    const req = httpMock.expectOne('/api/habits');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush([]);
  });

  it('should NOT add Authorization header if URL does not contain /api/', () => {
    // Make a request to a non-API endpoint (e.g. static asset)
    http.get('/assets/icon.png').subscribe();

    const req = httpMock.expectOne('/assets/icon.png');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should NOT add Authorization header if token is null', () => {
    // Update the spy to return null for the token
    authServiceSpy.token.mockReturnValue(null);

    http.get('/api/habits').subscribe();

    const req = httpMock.expectOne('/api/habits');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should clear the correlation id on 401 so the next login starts a new session', () => {
    // Mock localStorage if it's not defined in the test environment (e.g., Node 22+)
    if (typeof localStorage === 'undefined' || !localStorage) {
      const store: Record<string, string> = {};
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => { store[key] = value; },
          removeItem: (key: string) => { delete store[key]; },
          clear: () => { for (const k in store) delete store[k]; },
          length: 0,
          key: (index: number) => null
        },
        writable: true
      });
    }
    localStorage.setItem('ql_correlation_id', 'expired-session-id');

    http.get('/api/habits').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/habits');
    req.flush({ title: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('ql_correlation_id')).toBeNull();
  });
});
