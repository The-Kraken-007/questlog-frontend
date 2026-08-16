import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyLogService } from '../../core/api/daily-log';
import { DailyLogDto } from '../../core/models/daily-log';
import { CelebrationService } from '../../core/gamification/celebrations';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-daily-log',
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-log.html',
  styleUrl: './daily-log.css'
})
export class DailyLog implements OnInit, OnDestroy {
  private readonly logService = inject(DailyLogService);
  private readonly celebrations = inject(CelebrationService);
  private readonly destroy$ = new Subject<void>();
  private readonly contentChange$ = new Subject<string>();

  selectedDate = signal(this.todayStr());
  editorContent = '';

  isLoading = signal(false);
  isSaving = signal(false);
  isSaved = signal(false);
  isLoadingHistory = signal(false);
  pastLogs = signal<DailyLogDto[]>([]);

  formattedSelectedDate = computed(() => {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  });

  isToday = computed(() => this.selectedDate() === this.todayStr());

  ngOnInit() {
    // Wire up autosave: debounce 1.2s after user stops typing
    this.contentChange$.pipe(
      debounceTime(1200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(content => this.saveLog(content));

    this.loadForDate(this.selectedDate());
    this.loadHistory();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onContentChange(value: string) {
    this.isSaved.set(false);
    this.contentChange$.next(value);
  }

  shiftDay(delta: number) {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    this.selectDate(this.dateStr(d));
  }

  goToToday() {
    this.selectDate(this.todayStr());
  }

  selectDate(date: string) {
    this.selectedDate.set(date);
    this.loadForDate(date);
  }

  formatShortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  preview(content: string): string {
    const stripped = content.replace(/\n+/g, ' ').trim();
    return stripped.length > 80 ? stripped.slice(0, 80) + '…' : stripped || '(empty)';
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private loadForDate(date: string) {
    this.isLoading.set(true);
    this.editorContent = '';
    this.isSaved.set(false);

    this.logService.getByDate(date).subscribe({
      next: (log) => {
        this.editorContent = log.content;
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // 404 is expected when no log exists for that date — start with empty editor
        if (err.status !== 404) console.error('Failed to load log', err);
        this.editorContent = '';
        this.isLoading.set(false);
      }
    });
  }

  private saveLog(content: string) {
    if (!content.trim()) return; // Don't save empty logs
    this.isSaving.set(true);
    this.isSaved.set(false);

    this.logService.save({ date: this.selectedDate(), content }).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.isSaved.set(true);
        // Refresh history so the sidebar stays up to date
        this.loadHistory();
        // Auto-clear "Saved" badge after 2s
        setTimeout(() => this.isSaved.set(false), 2000);
        // Celebrate XP / level-up / achievement unlocks (only fires on first create)
        this.celebrations.notifyFromGamifiedResult(response);
      },
      error: () => {
        // Error toast handled globally by errorInterceptor
        this.isSaving.set(false);
      }
    });
  }

  private loadHistory() {
    this.isLoadingHistory.set(true);
    const to = this.todayStr();
    const from = this.dateStr(new Date(Date.now() - 6 * 86400000));

    this.logService.getInRange(from, to).subscribe({
      next: (logs) => {
        // Sort newest first
        this.pastLogs.set(logs.sort((a, b) => b.date.localeCompare(a.date)));
        this.isLoadingHistory.set(false);
      },
      error: () => {
        // Error toast handled globally by errorInterceptor
        this.isLoadingHistory.set(false);
      }
    });
  }

  private todayStr(): string {
    return this.dateStr(new Date());
  }

  private dateStr(d: Date): string {
    // toISOString() outputs UTC, which skews dates in non-UTC timezones.
    // Using local date components ensures the correct calendar date is used.
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
