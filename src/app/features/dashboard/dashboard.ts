import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/api/dashboard';
import { DashboardDto } from '../../core/models/dashboard';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar';
import { StreakBadgeComponent } from '../../shared/components/streak-badge/streak-badge';
import { HabitService } from '../../core/api/habit';
import { ToastService } from '../../core/toast';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, ProgressBarComponent, StreakBadgeComponent],
  template: `
    <div class="page-container">

      <!-- Greeting header -->
      <header class="greeting">
        <div>
          <h2>Good {{ timeOfDay() }}<span class="wave">👋</span></h2>
          <p class="subtitle">{{ todayFormatted() }}</p>
        </div>
        <div class="date-badge glass-panel">
          <span class="day-num">{{ dayNum() }}</span>
          <span class="month-abbr">{{ monthAbbr() }}</span>
        </div>
      </header>

      @if (isLoading()) {
        <div class="skeleton-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-card glass-panel"></div>
          }
        </div>
      } @else if (data()) {

        <div class="widgets-grid">

          <!-- ── Widget 1: Today's Habits ──────────────────── -->
          <section class="widget glass-panel habits-widget">
            <div class="widget-header">
              <span class="widget-icon">✅</span>
              <h3>Today's Habits</h3>
              <a routerLink="/habits" class="widget-link">View all →</a>
            </div>

            <div class="habit-ring-row">
              <div class="ring-container">
                <svg viewBox="0 0 36 36" class="ring">
                  <path class="ring-bg" d="M18 2a16 16 0 1 1 0 32A16 16 0 0 1 18 2"/>
                  <path class="ring-fill"
                    [style.stroke-dasharray]="ringDash() + ' 100'"
                    d="M18 2a16 16 0 1 1 0 32A16 16 0 0 1 18 2"/>
                </svg>
                <div class="ring-label">
                  <span class="ring-num">{{ data()!.todayHabits.completedCount }}</span>
                  <span class="ring-denom">/ {{ data()!.todayHabits.totalCount }}</span>
                </div>
              </div>
              <div class="habit-quick-list">
                @for (habit of data()!.todayHabits.habits.slice(0, 4); track habit.id) {
                  <div class="habit-quick-item" (click)="toggleHabit(habit.id)">
                    <span class="hq-emoji">{{ habit.emoji ?? '✅' }}</span>
                    <span class="hq-name" [class.done]="habit.isCompletedToday">{{ habit.name }}</span>
                    <span class="hq-check" [class.done]="habit.isCompletedToday">
                      {{ habit.isCompletedToday ? '✓' : '' }}
                    </span>
                  </div>
                }
                @if (data()!.todayHabits.habits.length === 0) {
                  <p class="no-data">No habits yet. <a routerLink="/habits">Add one!</a></p>
                }
              </div>
            </div>
          </section>

          <!-- ── Widget 2: Top Streaks ─────────────────────── -->
          <section class="widget glass-panel streaks-widget">
            <div class="widget-header">
              <span class="widget-icon">🔥</span>
              <h3>Top Streaks</h3>
            </div>
            @if (data()!.topStreaks.length === 0) {
              <p class="no-data">Complete habits daily to build streaks!</p>
            } @else {
              <ul class="streak-list">
                @for (s of data()!.topStreaks; track s.habitId) {
                  <li class="streak-item">
                    <span class="streak-emoji">{{ s.emoji ?? '⚡' }}</span>
                    <span class="streak-name">{{ s.name }}</span>
                    <app-streak-badge [count]="s.currentStreak"></app-streak-badge>
                  </li>
                }
              </ul>
            }
          </section>

          <!-- ── Widget 3: Active Goals ─────────────────────── -->
          <section class="widget glass-panel goals-widget">
            <div class="widget-header">
              <span class="widget-icon">🎯</span>
              <h3>Active Goals</h3>
              <a routerLink="/goals" class="widget-link">View all →</a>
            </div>
            @if (data()!.activeGoals.length === 0) {
              <p class="no-data">No active goals. <a routerLink="/goals">Set one!</a></p>
            } @else {
              <ul class="goal-list">
                @for (goal of data()!.activeGoals; track goal.id) {
                  <li class="goal-item">
                    <div class="goal-item-header">
                      <span class="goal-title">{{ goal.title }}</span>
                      <span class="goal-milestones">{{ goal.completedMilestones }}/{{ goal.totalMilestones }}</span>
                    </div>
                    <app-progress-bar [percent]="goal.progressPercent"></app-progress-bar>
                  </li>
                }
              </ul>
            }
          </section>

          <!-- ── Widget 4: Today's Log ──────────────────────── -->
          <section class="widget glass-panel log-widget">
            <div class="widget-header">
              <span class="widget-icon">📝</span>
              <h3>Today's Log</h3>
              <a routerLink="/log" class="widget-link">Open →</a>
            </div>
            @if (data()!.todayLog) {
              <p class="log-preview">{{ data()!.todayLog }}</p>
            } @else {
              <div class="log-empty">
                <p class="no-data">Nothing written today.</p>
                <a routerLink="/log" class="btn-write">✍️ Write now</a>
              </div>
            }
          </section>

        </div>

      } @else {
        <div class="error-state glass-panel">
          <p>⚠️ Failed to load dashboard. Is the backend running?</p>
          <button class="btn-retry" (click)="load()">Retry</button>
        </div>
      }

    </div>
  `,
  styles: `
    .page-container { max-width: 900px; margin: 0 auto; padding: 10px; }

    /* ── Greeting ── */
    .greeting {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }

    .greeting h2 {
      font-size: 1.9rem;
      font-weight: 700;
      margin: 0 0 4px 0;
    }

    .wave { margin-left: 8px; display: inline-block; animation: wave 2s ease-in-out infinite; }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-10deg); }
    }

    .subtitle { color: var(--color-text-muted); margin: 0; }

    .date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 20px;
      border-radius: 12px;
      min-width: 64px;
    }

    .day-num {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      background: linear-gradient(135deg, var(--color-primary-start), var(--color-primary-end));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .month-abbr { font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }

    /* ── Skeleton ── */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .skeleton-card {
      height: 200px;
      border-radius: 16px;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }

    /* ── Widgets Grid ── */
    .widgets-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (max-width: 640px) {
      .widgets-grid { grid-template-columns: 1fr; }
      .skeleton-grid { grid-template-columns: 1fr; }
      .greeting h2 { font-size: 1.4rem; }
    }

    .widget { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

    .widget-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .widget-icon { font-size: 1.1rem; }
    .widget-header h3 { font-size: 1rem; font-weight: 600; margin: 0; flex: 1; }

    .widget-link {
      font-size: 0.8rem;
      color: var(--color-primary-end);
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .widget-link:hover { opacity: 0.8; }

    .no-data {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      font-style: italic;
    }

    .no-data a { color: var(--color-primary-end); text-decoration: none; }

    /* ── Habits Widget ── */
    .habit-ring-row { display: flex; gap: 20px; align-items: flex-start; }

    .ring-container { position: relative; width: 80px; height: 80px; flex-shrink: 0; }

    .ring { width: 80px; height: 80px; transform: rotate(-90deg); }

    .ring-bg {
      fill: none;
      stroke: rgba(255,255,255,0.07);
      stroke-width: 3;
      stroke-linecap: round;
      pathLength: 100;
    }

    .ring-fill {
      fill: none;
      stroke: url(#ring-gradient);
      stroke: var(--color-primary);
      stroke-width: 3;
      stroke-linecap: round;
      pathLength: 100;
      transition: stroke-dasharray 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ring-label {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1.1;
    }

    .ring-num { font-size: 1.2rem; font-weight: 700; }
    .ring-denom { font-size: 0.7rem; color: var(--color-text-muted); }

    .habit-quick-list { flex: 1; display: flex; flex-direction: column; gap: 6px; }

    .habit-quick-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .habit-quick-item:hover { background: rgba(255,255,255,0.05); }

    .hq-emoji { font-size: 1rem; }
    .hq-name { flex: 1; font-size: 0.85rem; transition: all 0.2s; }
    .hq-name.done { text-decoration: line-through; color: var(--color-text-muted); }

    .hq-check {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--color-surface-border);
      font-size: 0.65rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s;
    }

    .hq-check.done {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    /* ── Streaks Widget ── */
    .streak-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }

    .streak-item { display: flex; align-items: center; gap: 10px; }
    .streak-emoji { font-size: 1.2rem; }
    .streak-name { flex: 1; font-size: 0.9rem; }

    /* ── Goals Widget ── */
    .goal-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }

    .goal-item { display: flex; flex-direction: column; gap: 6px; }

    .goal-item-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .goal-title { font-size: 0.9rem; font-weight: 500; flex: 1; }
    .goal-milestones { font-size: 0.75rem; color: var(--color-text-muted); white-space: nowrap; }

    /* ── Log Widget ── */
    .log-preview {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .log-empty { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }

    .btn-write {
      background: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.3);
      color: var(--color-primary-end);
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-write:hover { background: rgba(124, 58, 237, 0.2); }

    /* ── Error state ── */
    .error-state {
      text-align: center;
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .btn-retry {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--color-surface-border);
      color: var(--color-text);
      padding: 8px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-retry:hover { background: rgba(255,255,255,0.1); }
  `
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly habitService = inject(HabitService);
  private readonly toast = inject(ToastService);

  data = signal<DashboardDto | null>(null);
  isLoading = signal(true);

  // Computed ring dash value (0-100 based on pathLength=100)
  ringDash = computed(() => {
    const d = this.data();
    if (!d || d.todayHabits.totalCount === 0) return 0;
    return Math.round((d.todayHabits.completedCount / d.todayHabits.totalCount) * 100);
  });

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.dashboardService.get().subscribe({
      next: (d) => { this.data.set(d); this.isLoading.set(false); },
      error: (err) => { console.error('Dashboard load failed', err); this.data.set(null); this.isLoading.set(false); this.toast.error('Failed to load dashboard. Is the backend running?'); }
    });
  }

  toggleHabit(habitId: number) {
    const today = new Date().toISOString().split('T')[0];
    this.habitService.toggle(habitId, today).subscribe({
      next: () => this.load(), // Refresh dashboard after toggle
      error: (err) => { console.error('Toggle failed', err); this.toast.error('Could not update habit.'); }
    });
  }

  timeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  todayFormatted(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  dayNum(): string {
    return new Date().getDate().toString();
  }

  monthAbbr(): string {
    return new Date().toLocaleString('en-US', { month: 'short' });
  }
}
