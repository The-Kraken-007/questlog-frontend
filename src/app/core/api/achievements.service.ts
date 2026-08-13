import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Achievement } from '../models/achievement';

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
  private readonly http = inject(HttpClient);

  readonly achievements = signal<Achievement[]>([]);
  readonly isLoading = signal(false);

  getAchievements(): Observable<Achievement[]> {
    this.isLoading.set(true);
    return this.http.get<Achievement[]>('/api/achievements').pipe(
      tap({
        next: (achievements) => {
          this.achievements.set(achievements);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }
}
