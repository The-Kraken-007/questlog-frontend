import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';
import { TestBed as _TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

describe('authGuard', () => {
  let routerSpy: any;
  let authServiceSpy: any;

  beforeEach(() => {
    routerSpy = { createUrlTree: vi.fn() };
    
    // Default mock behavior is unauthenticated
    authServiceSpy = { isAuthenticated: vi.fn().mockReturnValue(false) };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
  });

  it('should allow navigation if user is authenticated', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /login if user is NOT authenticated', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);
    
    const mockUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
