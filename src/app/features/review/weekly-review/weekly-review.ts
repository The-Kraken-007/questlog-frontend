import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/api/review.service';
import { HabitHeatmapComponent } from '../habit-heatmap/habit-heatmap';

@Component({
  selector: 'app-weekly-review',
  imports: [CommonModule, FormsModule, RouterLink, HabitHeatmapComponent],
  templateUrl: './weekly-review.html',
  styleUrl: './weekly-review.css'
})
export class WeeklyReview implements OnInit {
  private readonly reviewService = inject(ReviewService);

  readonly review = this.reviewService.review;
  readonly isLoading = this.reviewService.isLoading;

  weekStart = signal(this.startOfWeek(new Date()));
  notes = '';
  isSaving = signal(false);
  isSaved = signal(false);

  weekLabel = computed(() => {
    const start = this.weekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  });

  isCurrentWeek = computed(() => {
    return this.dateStr(this.weekStart()) === this.dateStr(this.startOfWeek(new Date()));
  });

  levelChangeLabel = computed(() => {
    const lc = this.review()?.levelChange;
    if (!lc) return '—';
    return lc.from === lc.to ? `Level ${lc.to}` : `Lv ${lc.from} → ${lc.to}`;
  });

  habitRateLabel = computed(() => {
    const habits = this.review()?.habits;
    if (!habits || habits.total === 0) return 'No habits tracked';
    return `${habits.completed}/${habits.total * 7} completed (${habits.rate}%)`;
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.notes = '';
    this.isSaved.set(false);
    this.reviewService.getWeeklyReview(this.dateStr(this.weekStart())).subscribe({
      next: (review) => {
        if (review.reflection.exists && review.reflection.notes) {
          this.notes = review.reflection.notes;
        }
      },
      error: () => {}
    });
  }

  shiftWeek(delta: number) {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + delta * 7);
    this.weekStart.set(d);
    this.load();
  }

  saveReflection() {
    const notes = this.notes.trim();
    if (!notes || this.isSaving()) return;
    this.isSaving.set(true);
    this.reviewService.saveReflection(this.dateStr(this.weekStart()), notes).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isSaved.set(true);
        setTimeout(() => this.isSaved.set(false), 2000);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }

  /** Monday of the week containing `date`. */
  private startOfWeek(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  private dateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
