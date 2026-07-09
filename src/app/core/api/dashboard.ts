import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDto } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  get(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>('/api/dashboard');
  }
}
