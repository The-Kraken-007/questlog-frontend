import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../toast';
import { CORRELATION_ID_STORAGE_KEY } from './correlation.interceptor';

/** RFC 7807 ProblemDetails shape returned by the backend for every error. */
interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Global API error handling. Every failed /api call lands here first:
 * the RFC 7807 ProblemDetails payload is turned into a single user-facing
 * toast, then the error is rethrown so feature services can still react
 * (e.g. revert an optimistic habit toggle).
 *
 * 401s are skipped — the auth flow (guard/interceptor) owns those.
 *
 * The correlation id is deliberately NOT shown to users. In dev mode the
 * full problem + correlation id are logged to the browser console so a
 * developer can grep backend logs by it.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        toast.error(buildUserMessage(err));
      }

      if (isDevMode()) {
        console.error(
          '[QuestLog] API error',
          { correlationId: localStorage.getItem(CORRELATION_ID_STORAGE_KEY) },
          err.error,
          err
        );
      }

      return throwError(() => err);
    })
  );
};

function buildUserMessage(err: HttpErrorResponse): string {
  const problem = err.error as ProblemDetails | null;

  if (problem && typeof problem === 'object') {
    // Validation errors: surface the first field-level message
    const firstFieldErrors = problem.errors ? Object.values(problem.errors)[0] : null;
    if (firstFieldErrors?.length) {
      return firstFieldErrors[0];
    }

    if (problem.detail) return problem.detail;
    if (problem.title) return problem.title;
  }

  if (err.status === 0) {
    return 'Network error — please check your connection.';
  }

  return 'Something went wrong. Please try again.';
}
