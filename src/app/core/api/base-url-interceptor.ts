import { HttpInterceptorFn } from '@angular/common/http';
import { isDevMode } from '@angular/core';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = isDevMode() ? 'http://localhost:5000' : ''; // Prod URL would go here
  
  if (req.url.startsWith('/api')) {
    const apiReq = req.clone({ url: `${baseUrl}${req.url}` });
    return next(apiReq);
  }
  
  return next(req);
};
