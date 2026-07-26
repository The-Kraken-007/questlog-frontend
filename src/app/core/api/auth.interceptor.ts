import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { CORRELATION_ID_STORAGE_KEY } from './correlation.interceptor';

/**
 * Attaches the JWT Bearer token to every outgoing API request.
 * Runs after the base-url interceptor (order matters in app.config.ts).
 *
 * On 401 the session is over (expired/invalid token): clear the correlation
 * id too so the next login starts a fresh tracing session.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const authReq = token && req.url.includes('/api/')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem(CORRELATION_ID_STORAGE_KEY);
      }
      return throwError(() => err);
    })
  );
};
