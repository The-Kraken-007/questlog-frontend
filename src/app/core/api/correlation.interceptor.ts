import { HttpInterceptorFn } from '@angular/common/http';

export const CORRELATION_ID_STORAGE_KEY = 'ql_correlation_id';
export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

/**
 * Attaches the session's correlation id to every API request.
 *
 * One id is generated per login session (created by AuthService on login,
 * cleared on logout/401) and kept in localStorage so it survives page
 * reloads. The backend enriches every log line and ProblemDetails payload
 * with it, so a full user session can be traced end-to-end in the logs.
 *
 * If no id exists yet (e.g. session predates this feature), one is generated
 * and persisted here so all subsequent requests share it.
 */
export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  let corrId = localStorage.getItem(CORRELATION_ID_STORAGE_KEY);
  if (!corrId) {
    corrId = crypto.randomUUID();
    localStorage.setItem(CORRELATION_ID_STORAGE_KEY, corrId);
  }

  return next(req.clone({ setHeaders: { [CORRELATION_ID_HEADER]: corrId } }));
};
