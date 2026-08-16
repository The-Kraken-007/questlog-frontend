import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoalDto, CreateGoalRequest, UpdateGoalRequest } from '../models/goal';
import { GamifiedResult } from '../models/gamified-result';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/goals';

  getAll(): Observable<GoalDto[]> {
    return this.http.get<GoalDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<GoalDto> {
    return this.http.get<GoalDto>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateGoalRequest): Observable<GoalDto> {
    return this.http.post<GoalDto>(this.baseUrl, request);
  }

  update(id: number, request: UpdateGoalRequest): Observable<GamifiedResult<GoalDto>> {
    return this.http.put<GamifiedResult<GoalDto>>(`${this.baseUrl}/${id}`, request);
  }

  addMilestone(goalId: number, title: string): Observable<GoalDto> {
    return this.http.post<GoalDto>(`${this.baseUrl}/${goalId}/milestones`, { title });
  }

  toggleMilestone(milestoneId: number): Observable<GamifiedResult<GoalDto>> {
    return this.http.put<GamifiedResult<GoalDto>>(`/api/milestones/${milestoneId}/toggle`, {});
  }
}
