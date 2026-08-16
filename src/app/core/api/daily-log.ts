import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyLogDto, CreateOrUpdateLogRequest } from '../models/daily-log';
import { GamifiedResult } from '../models/gamified-result';

@Injectable({
  providedIn: 'root'
})
export class DailyLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/logs';

  getByDate(date: string): Observable<DailyLogDto> {
    return this.http.get<DailyLogDto>(`${this.baseUrl}/${date}`);
  }

  getInRange(from: string, to: string): Observable<DailyLogDto[]> {
    return this.http.get<DailyLogDto[]>(this.baseUrl, { params: { from, to } });
  }

  save(request: CreateOrUpdateLogRequest): Observable<GamifiedResult<DailyLogDto>> {
    return this.http.post<GamifiedResult<DailyLogDto>>(this.baseUrl, request);
  }
}
