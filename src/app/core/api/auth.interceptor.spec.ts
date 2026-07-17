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
});
