import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { baseUrlInterceptor } from './core/api/base-url-interceptor';
import { authInterceptor } from './core/api/auth.interceptor';
import { correlationInterceptor } from './core/api/correlation.interceptor';
import { errorInterceptor } from './core/api/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    // Interceptor order matters: errors flow back in reverse, so the LAST
    // registered (errorInterceptor) sees failures first, toasts them, and
    // rethrows for feature services to react.
    provideHttpClient(withInterceptors([
      baseUrlInterceptor,
      correlationInterceptor,
      authInterceptor,
      errorInterceptor
    ]))
  ]
};
