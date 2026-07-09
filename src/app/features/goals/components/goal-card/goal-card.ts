import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalDto, MilestoneDto, GoalStatus } from '../../../../core/models/goal';
import { GoalService } from '../../../../core/api/goal';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar';

@Component({
  selector: 'app-goal-card',
  imports: [CommonModule, FormsModule, ProgressBarComponent],
  template: `
    <div class="goal-card glass-panel" [class.expanded]="isExpanded()" [class]="'status-' + goal.status.toLowerCase()">

      <!-- Card Header (always visible) -->
      <div class="card-header" (click)="toggleExpand()">
        <div class="header-left">
          <div class="status-dot" [title]="goal.status"></div>
          <div class="goal-meta">
            <h3>{{ goal.title }}</h3>
            @if (goal.targetDate) {
              <span class="due-date" [class.overdue]="isOverdue">
                🗓 {{ formatDate(goal.targetDate) }}{{ isOverdue ? ' · Overdue' : '' }}
              </span>
            }
          </div>
        </div>
        <div class="header-right">
          <div class="progress-summary">
            <span class="milestone-count">{{ completedMilestones }}/{{ goal.milestones.length }}</span>
          </div>
          <span class="expand-chevron" [class.open]="isExpanded()">›</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <app-progress-bar [percent]="goal.progressPercent"></app-progress-bar>
      </div>

      <!-- Expanded Content -->
      @if (isExpanded()) {
        <div class="card-body">

          @if (goal.description) {
            <p class="description">{{ goal.description }}</p>
          }

          <!-- Milestones -->
          <div class="milestones-section">
            <h4>Milestones</h4>

            @if (goal.milestones.length === 0) {
              <p class="no-milestones">No milestones yet. Add one below!</p>
            } @else {
              <ul class="milestone-list">
                @for (ms of goal.milestones; track ms.id) {
                  <li class="milestone-item" [class.completed]="ms.isCompleted" (click)="onToggleMilestone(ms)">
                    <span class="ms-check">{{ ms.isCompleted ? '✓' : '' }}</span>
                    <span class="ms-title">{{ ms.title }}</span>
                  </li>
                }
              </ul>
            }

            <!-- Add Milestone -->
            <div class="add-milestone">
              <input
                type="text"
                [(ngModel)]="newMilestoneTitle"
                placeholder="Add a milestone..."
                class="milestone-input"
                (keyup.enter)="onAddMilestone()"
              />
              <button class="btn-add" (click)="onAddMilestone()" [disabled]="!newMilestoneTitle.trim()">Add</button>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="card-footer">
            <div class="status-actions">
              @if (goal.status !== 'Completed') {
                <button class="btn-status complete" (click)="onUpdateStatus('Completed')">Mark Complete</button>
              }
              @if (goal.status === 'Active') {
                <button class="btn-status pause" (click)="onUpdateStatus('Paused')">Pause</button>
              }
              @if (goal.status === 'Paused') {
                <button class="btn-status resume" (click)="onUpdateStatus('Active')">Resume</button>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: `
    .goal-card {
      padding: 16px;
      margin-bottom: 16px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      border-left: 3px solid transparent;
    }

    .goal-card.status-active { border-left-color: var(--color-primary); }
    .goal-card.status-paused { border-left-color: #f59e0b; }
    .goal-card.status-completed { border-left-color: #10b981; opacity: 0.75; }

    .goal-card:hover { background: rgba(255, 255, 255, 0.04); }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
      background: var(--color-text-muted);
    }

    .status-active .status-dot { background: var(--color-primary); box-shadow: 0 0 8px rgba(124, 58, 237, 0.5); }
    .status-paused .status-dot { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.5); }
    .status-completed .status-dot { background: #10b981; }

    .goal-meta h3 {
      margin: 0 0 4px 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .due-date {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    .due-date.overdue { color: #ef4444; font-weight: 500; }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .milestone-count {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-variant-numeric: tabular-nums;
    }

    .expand-chevron {
      color: var(--color-text-muted);
      font-size: 1.3rem;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-block;
    }

    .expand-chevron.open { transform: rotate(90deg); }

    .progress-section { margin-top: 14px; }

    /* Expanded body */
    .card-body {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--color-surface-border);
      animation: fadeSlideIn 0.25s ease;
    }

    .description {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 0 0 20px 0;
      line-height: 1.6;
    }

    .milestones-section h4 {
      margin: 0 0 10px 0;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .no-milestones {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      font-style: italic;
      margin: 0 0 12px 0;
    }

    .milestone-list {
      list-style: none;
      padding: 0;
      margin: 0 0 12px 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .milestone-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--color-surface-border);
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .milestone-item:hover { background: rgba(255, 255, 255, 0.07); }

    .milestone-item.completed .ms-title {
      text-decoration: line-through;
      color: var(--color-text-muted);
    }

    .ms-check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--color-surface-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: bold;
      flex-shrink: 0;
      transition: all 0.2s;
      color: white;
    }

    .milestone-item.completed .ms-check {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .ms-title { font-size: 0.9rem; color: var(--color-text); }

    .add-milestone {
      display: flex;
      gap: 8px;
    }

    .milestone-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--color-surface-border);
      padding: 9px 12px;
      border-radius: 8px;
      color: var(--color-text);
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .milestone-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .btn-add {
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.3);
      color: var(--color-primary-end);
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-add:hover:not(:disabled) { background: rgba(124, 58, 237, 0.25); }
    .btn-add:disabled { opacity: 0.4; cursor: not-allowed; }

    .card-footer {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid var(--color-surface-border);
      display: flex;
      justify-content: flex-end;
    }

    .status-actions { display: flex; gap: 8px; }

    .btn-status {
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
      background: transparent;
    }

    .btn-status.complete {
      border-color: rgba(16, 185, 129, 0.3);
      color: #10b981;
    }
    .btn-status.complete:hover { background: rgba(16, 185, 129, 0.1); }

    .btn-status.pause {
      border-color: rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }
    .btn-status.pause:hover { background: rgba(245, 158, 11, 0.1); }

    .btn-status.resume {
      border-color: rgba(124, 58, 237, 0.3);
      color: var(--color-primary-end);
    }
    .btn-status.resume:hover { background: rgba(124, 58, 237, 0.1); }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class GoalCardComponent {
  @Input({ required: true }) goal!: GoalDto;
  @Output() goalUpdated = new EventEmitter<GoalDto>();

  private readonly goalService = inject(GoalService);

  isExpanded = signal(false);
  newMilestoneTitle = '';

  get completedMilestones(): number {
    return this.goal.milestones.filter(m => m.isCompleted).length;
  }

  get isOverdue(): boolean {
    if (!this.goal.targetDate || this.goal.status === 'Completed') return false;
    return new Date(this.goal.targetDate) < new Date();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }

  onToggleMilestone(ms: MilestoneDto) {
    this.goalService.toggleMilestone(ms.id).subscribe({
      next: (updated) => this.goalUpdated.emit(updated),
      error: (err) => console.error('Failed to toggle milestone', err)
    });
  }

  onAddMilestone() {
    const title = this.newMilestoneTitle.trim();
    if (!title) return;
    this.goalService.addMilestone(this.goal.id, title).subscribe({
      next: (updated) => {
        this.goalUpdated.emit(updated);
        this.newMilestoneTitle = '';
      },
      error: (err) => console.error('Failed to add milestone', err)
    });
  }

  onUpdateStatus(status: GoalStatus) {
    this.goalService.update(this.goal.id, { status }).subscribe({
      next: (updated) => this.goalUpdated.emit(updated),
      error: (err) => console.error('Failed to update goal status', err)
    });
  }
}
