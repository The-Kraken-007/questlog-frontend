import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { GamificationProfile } from '../models/gamification';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private readonly http = inject(HttpClient);

  readonly profile = signal<GamificationProfile | null>(null);
  readonly isLoading = signal(false);

  getProfile(): Observable<GamificationProfile> {
    this.isLoading.set(true);
    return this.http.get<GamificationProfile>('/api/gamification/profile').pipe(
      tap({
        next: (profile) => {
          this.profile.set(profile);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }
}
