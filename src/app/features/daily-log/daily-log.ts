import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyLogService } from '../../core/api/daily-log';
import { DailyLogDto } from '../../core/models/daily-log';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../core/toast';

@Component({
  selector: 'app-daily-log',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">

      <!-- Page header with date navigation -->
      <header class="page-header">
        <div class="header-title">
          <h2>Daily Log</h2>
          <p class="subtitle">{{ formattedSelectedDate() }}</p>
        </div>
        <div class="date-nav">
          <button class="nav-btn" (click)="shiftDay(-1)" title="Previous day">‹</button>
          <button class="today-btn" (click)="goToToday()" [class.active]="isToday()">Today</button>
          <button class="nav-btn" (click)="shiftDay(1)" [disabled]="isToday()" title="Next day">›</button>
        </div>
      </header>

      <!-- Main editor -->
      <div class="editor-card glass-panel">
        <div class="editor-toolbar">
          <span class="save-indicator" [class.saving]="isSaving()" [class.saved]="isSaved()">
            @if (isSaving()) { ⏳ Saving... }
            @else if (isSaved()) { ✓ Saved }
          </span>
        </div>
        <textarea
          class="editor"
          [(ngModel)]="editorContent"
          (ngModelChange)="onContentChange($event)"
          placeholder="What's on your mind today? Write freely — this is your private journal..."
          [disabled]="isLoading()"
        ></textarea>
        <div class="editor-footer">
          <span class="char-count">{{ editorContent.length }} characters</span>
        </div>
      </div>

      <!-- Past 7 days quick-view -->
      <section class="past-logs">
        <h3>Recent Entries</h3>
        @if (isLoadingHistory()) {
          <p class="muted">Loading history...</p>
        } @else if (pastLogs().length === 0) {
          <p class="muted">No entries in the past 7 days.</p>
        } @else {
          <div class="log-list">
            @for (log of pastLogs(); track log.date) {
              <div
                class="log-entry glass-panel"
                [class.active]="log.date === selectedDate()"
                (click)="selectDate(log.date)">
                <div class="log-entry-header">
                  <span class="log-date">{{ formatShortDate(log.date) }}</span>
                  <span class="log-preview">{{ preview(log.content) }}</span>
                </div>
              </div>
            }
          </div>
        }
      </section>

    </div>
  `,
  styles: `
    .page-container { max-width: 800px; margin: 0 auto; padding: 10px; }

    /* ── Header ── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-title h2 {
      margin: 0 0 4px 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .subtitle { margin: 0; color: var(--color-text-muted); font-size: 0.95rem; }

    .date-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-btn {
      background: var(--color-surface);
      border: 1px solid var(--color-surface-border);
      color: var(--color-text);
      width: 34px;
      height: 34px;
      border-radius: 8px;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .nav-btn:hover:not(:disabled) {
      border-color: var(--color-primary);
      color: var(--color-primary-end);
    }

    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .today-btn {
      background: transparent;
      border: 1px solid var(--color-surface-border);
      color: var(--color-text-muted);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .today-btn.active {
      background: rgba(124, 58, 237, 0.12);
      border-color: var(--color-primary);
      color: var(--color-primary-end);
    }

    /* ── Editor ── */
    .editor-card {
      padding: 0;
      overflow: hidden;
      margin-bottom: 32px;
    }

    .editor-toolbar {
      display: flex;
      justify-content: flex-end;
      padding: 10px 16px;
      border-bottom: 1px solid var(--color-surface-border);
      min-height: 40px;
    }

    .save-indicator {
      font-size: 0.8rem;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .save-indicator.saving, .save-indicator.saved { opacity: 1; }
    .save-indicator.saving { color: var(--color-text-muted); }
    .save-indicator.saved { color: #10b981; }

    .editor {
      width: 100%;
      min-height: 320px;
      background: transparent;
      border: none;
      padding: 20px;
      color: var(--color-text);
      font-size: 1rem;
      font-family: inherit;
      line-height: 1.8;
      resize: vertical;
      box-sizing: border-box;
    }

    .editor:focus { outline: none; }

    .editor::placeholder { color: var(--color-text-muted); opacity: 0.6; }

    .editor:disabled { opacity: 0.5; cursor: not-allowed; }

    .editor-footer {
      padding: 8px 20px;
      border-top: 1px solid var(--color-surface-border);
      display: flex;
      justify-content: flex-end;
    }

    .char-count { font-size: 0.75rem; color: var(--color-text-muted); }

    /* ── Past logs ── */
    .past-logs h3 {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      margin: 0 0 14px 0;
    }

    .muted { color: var(--color-text-muted); font-size: 0.9rem; }

    .log-list { display: flex; flex-direction: column; gap: 8px; }

    .log-entry {
      padding: 14px 16px;
      cursor: pointer;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .log-entry:hover { background: rgba(255, 255, 255, 0.04); }

    .log-entry.active {
      border-left-color: var(--color-primary);
      background: rgba(124, 58, 237, 0.05);
    }

    .log-entry-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .log-date {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .log-preview {
      font-size: 0.9rem;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `
})
export class DailyLog implements OnInit, OnDestroy {
  private readonly logService = inject(DailyLogService);
  private readonly toast = inject(ToastService);
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
      next: (saved) => {
        this.isSaving.set(false);
        this.isSaved.set(true);
        // Refresh history so the sidebar stays up to date
        this.loadHistory();
        // Auto-clear "Saved" badge after 2s
        setTimeout(() => this.isSaved.set(false), 2000);
      },
      error: (err) => {
        console.error('Failed to save log', err);
        this.toast.error('Could not save your log. Please try again.');
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
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoadingHistory.set(false);
      }
    });
  }

  private todayStr(): string {
    return this.dateStr(new Date());
  }

  private dateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
