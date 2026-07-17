import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: any;

  beforeEach(() => {
    // Clear localStorage before each test so we have a clean slate
    localStorage.clear();

    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created and initially unauthenticated', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('should authenticate user and store token/user on login', () => {
    const mockResponse = { token: 'fake-jwt', username: 'testuser', email: 'test@test.com' };

    service.login('test@test.com', 'password').subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com', password: 'password' });
    req.flush(mockResponse);

    // Assert state after successful response
    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('fake-jwt');
    expect(service.currentUser()?.username).toBe('testuser');

    // Assert localStorage
    expect(localStorage.getItem('questlog_token')).toBe('fake-jwt');
    expect(JSON.parse(localStorage.getItem('questlog_user')!)).toEqual({ username: 'testuser', email: 'test@test.com' });
  });

  it('should authenticate user and store token/user on register', () => {
    const mockResponse = { token: 'fake-jwt-reg', username: 'newuser', email: 'new@test.com' };

    service.register('newuser', 'new@test.com', 'password').subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'newuser', email: 'new@test.com', password: 'password' });
    req.flush(mockResponse);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('fake-jwt-reg');
  });

  it('should clear state and redirect to login on logout', () => {
    // Manually set state to simulate logged in
    localStorage.setItem('questlog_token', 'token');
    localStorage.setItem('questlog_user', JSON.stringify({ username: 'u', email: 'e' }));
    service.token.set('token');
    service.currentUser.set({ username: 'u', email: 'e' });

    // Act
    service.logout();

    // Assert
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('questlog_token')).toBeNull();
    expect(localStorage.getItem('questlog_user')).toBeNull();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should initialize correctly if token exists in localStorage', () => {
    localStorage.setItem('questlog_token', 'existing-token');
    localStorage.setItem('questlog_user', JSON.stringify({ username: 'existing', email: 'e@e.com' }));
    
    // Re-create service so it reads from localStorage on instantiation
    const newService = new AuthService(TestBed.inject(HttpTestingController) as any, routerSpy);

    expect(newService.isAuthenticated()).toBe(true);
    expect(newService.token()).toBe('existing-token');
    expect(newService.currentUser()?.username).toBe('existing');
  });
});
