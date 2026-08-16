import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabitDto, HabitEntryDto, CreateHabitRequest, UpdateHabitRequest } from '../models/habit';
import { GamifiedResult } from '../models/gamified-result';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/habits';

  getAll(): Observable<HabitDto[]> {
    return this.http.get<HabitDto[]>(this.baseUrl);
  }

  create(request: CreateHabitRequest): Observable<HabitDto> {
    return this.http.post<HabitDto>(this.baseUrl, request);
  }

  update(id: number, request: UpdateHabitRequest): Observable<HabitDto> {
    return this.http.put<HabitDto>(`${this.baseUrl}/${id}`, request);
  }

  toggle(id: number, date: string): Observable<GamifiedResult<HabitDto>> {
    return this.http.post<GamifiedResult<HabitDto>>(`${this.baseUrl}/${id}/toggle/${date}`, {});
  }

  getEntries(id: number, from?: string, to?: string): Observable<HabitEntryDto[]> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    return this.http.get<HabitEntryDto[]>(`${this.baseUrl}/${id}/entries`, { params });
  }
}
