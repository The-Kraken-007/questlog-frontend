import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalDto, GoalStatus } from '../../core/models/goal';
import { GoalService } from '../../core/api/goal';
import { GoalCardComponent } from './components/goal-card/goal-card';
import { CreateGoalModalComponent } from './components/create-goal-modal/create-goal-modal';
import { ToastService } from '../../core/toast';

type FilterTab = 'All' | GoalStatus;

@Component({
  selector: 'app-goals',
  imports: [CommonModule, GoalCardComponent, CreateGoalModalComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-title">
          <h2>My Goals</h2>
          <p class="subtitle">Turn ambitions into achievements</p>
        </div>
        <button class="btn-new" (click)="isCreateModalOpen.set(true)">
          <span>+</span> New Goal
        </button>
      </header>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        @for (tab of tabs; track tab) {
          <button
            class="tab"
            [class.active]="activeFilter() === tab"
            (click)="activeFilter.set(tab)">
            {{ tab }}
            <span class="tab-count">{{ countByStatus(tab) }}</span>
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="loading-state">Loading goals...</div>
      } @else if (filteredGoals().length === 0) {
        <div class="empty-state glass-panel">
          <span class="empty-icon">🎯</span>
          <h3>{{ activeFilter() === 'All' ? 'No goals yet' : 'No ' + activeFilter() + ' goals' }}</h3>
          <p>Set a goal and track your progress towards it.</p>
          @if (activeFilter() === 'All') {
            <button class="btn-new" (click)="isCreateModalOpen.set(true)">Create Goal</button>
          }
        </div>
      } @else {
        <div class="goals-list">
          @for (goal of filteredGoals(); track goal.id) {
            <app-goal-card [goal]="goal" (goalUpdated)="onGoalUpdated($event)"></app-goal-card>
          }
        </div>
      }

      <app-create-goal-modal
        [isOpen]="isCreateModalOpen()"
        (closed)="isCreateModalOpen.set(false)"
        (created)="onCreateGoal($event)">
      </app-create-goal-modal>
    </div>
  `,
  styles: `
    .page-container { max-width: 800px; margin: 0 auto; padding: 10px; }

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

    .btn-new {
      background: linear-gradient(135deg, var(--color-primary-start), var(--color-primary-end));
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.2);
    }

    .btn-new:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4); }

    .filter-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .tab {
      background: transparent;
      border: 1px solid var(--color-surface-border);
      color: var(--color-text-muted);
      padding: 7px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .tab:hover { border-color: rgba(255, 255, 255, 0.2); color: var(--color-text); }

    .tab.active {
      background: rgba(124, 58, 237, 0.15);
      border-color: var(--color-primary);
      color: var(--color-primary-end);
    }

    .tab-count {
      background: rgba(255, 255, 255, 0.1);
      padding: 1px 7px;
      border-radius: 99px;
      font-size: 0.75rem;
    }

    .tab.active .tab-count { background: rgba(124, 58, 237, 0.2); }

    .loading-state, .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-muted);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      border-radius: 16px;
    }

    .empty-icon { font-size: 3rem; }
    .empty-state h3 { color: var(--color-text); margin: 0; }
    .empty-state .btn-new { margin-top: 12px; }
  `
})
export class Goals implements OnInit {
  private readonly goalService = inject(GoalService);
  private readonly toast = inject(ToastService);

  goals = signal<GoalDto[]>([]);
  isLoading = signal(true);
  isCreateModalOpen = signal(false);
  activeFilter = signal<FilterTab>('All');

  readonly tabs: FilterTab[] = ['All', 'Active', 'Paused', 'Completed'];

  ngOnInit() {
    this.loadGoals();
  }

  filteredGoals() {
    const filter = this.activeFilter();
    if (filter === 'All') return this.goals();
    return this.goals().filter(g => g.status === filter);
  }

  countByStatus(tab: FilterTab): number {
    if (tab === 'All') return this.goals().length;
    return this.goals().filter(g => g.status === tab).length;
  }

  loadGoals() {
    this.isLoading.set(true);
    this.goalService.getAll().subscribe({
      next: (data) => { this.goals.set(data); this.isLoading.set(false); },
      error: (err) => { console.error('Failed to load goals', err); this.toast.error('Failed to load goals. Is the backend running?'); this.isLoading.set(false); }
    });
  }

  onCreateGoal(data: { title: string; description?: string; targetDate?: string }) {
    this.goalService.create(data).subscribe({
      next: (newGoal) => this.goals.update(g => [newGoal, ...g]),
      error: (err) => { console.error('Failed to create goal', err); this.toast.error('Could not create goal. Please try again.'); }
    });
  }

  onGoalUpdated(updatedGoal: GoalDto) {
    this.goals.update(list => list.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  }
}
