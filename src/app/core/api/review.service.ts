import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SavedReflection, WeeklyReview } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);

  readonly review = signal<WeeklyReview | null>(null);
  readonly isLoading = signal(false);

  getWeeklyReview(week: string): Observable<WeeklyReview> {
    this.isLoading.set(true);
    return this.http.get<WeeklyReview>('/api/review/weekly', { params: { week } }).pipe(
      tap({
        next: (review) => {
          this.review.set(review);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  saveReflection(weekStart: string, notes: string): Observable<SavedReflection> {
    return this.http.post<SavedReflection>('/api/review/reflection', { weekStart, notes });
  }
}
