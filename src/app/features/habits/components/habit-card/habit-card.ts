import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitDto, HabitEntryDto } from '../../../../core/models/habit';
import { StreakBadgeComponent } from '../../../../shared/components/streak-badge/streak-badge';
import { HeatmapComponent } from '../../../../shared/components/heatmap/heatmap';
import { HabitService } from '../../../../core/api/habit';

@Component({
  selector: 'app-habit-card',
  imports: [CommonModule, StreakBadgeComponent, HeatmapComponent],
  template: `
    <div class="habit-card glass-panel" [class.expanded]="isExpanded()">
      
      <div class="card-header" (click)="toggleExpand()">
        <div class="habit-info">
          <span class="emoji">{{ habit.emoji }}</span>
          <div class="details">
            <h3>{{ habit.name }}</h3>
            <app-streak-badge [count]="habit.currentStreak"></app-streak-badge>
          </div>
        </div>

        <div class="actions" (click)="$event.stopPropagation()">
          <button 
            class="toggle-btn" 
            [class.completed]="habit.isCompletedToday"
            (click)="onToggle($event)"
            [attr.aria-label]="habit.isCompletedToday ? 'Mark incomplete' : 'Mark complete'">
            @if (habit.isCompletedToday) { <span class="checkmark">✓</span> }
          </button>
        </div>
      </div>

      @if (isExpanded()) {
        <div class="card-body">
          <div class="heatmap-section">
            <h4>Activity (Last 3 Months)</h4>
            @if (isLoadingEntries()) {
              <div class="loading-state">Loading history...</div>
            } @else {
              <app-heatmap [entries]="entries()"></app-heatmap>
            }
          </div>

          <div class="card-footer">
            <button class="btn-archive" (click)="onArchive()">
              <span class="icon">🗑️</span> Archive Habit
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: `
    .habit-card {
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .habit-card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .habit-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .emoji {
      font-size: 2rem;
      background: rgba(255, 255, 255, 0.05);
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .details h3 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .toggle-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid var(--color-surface-border);
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: white;
      font-weight: bold;
    }

    .toggle-btn:hover {
      border-color: var(--color-primary);
      background: rgba(124, 58, 237, 0.1);
    }

    .toggle-btn.completed {
      background: var(--color-primary);
      border-color: var(--color-primary);
      transform: scale(1.1);
      box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
    }

    /* Expanded State */
    .card-body {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--color-surface-border);
      animation: fadeIn 0.3s ease;
    }

    .heatmap-section h4 {
      margin: 0 0 12px 0;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .loading-state {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      padding: 20px 0;
      text-align: center;
    }

    .card-footer {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .btn-archive {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-archive:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.5);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class HabitCardComponent {
  @Input({ required: true }) habit!: HabitDto;
  @Output() toggle = new EventEmitter<void>();
  @Output() archive = new EventEmitter<void>();

  private readonly habitService = inject(HabitService);

  isExpanded = signal(false);
  isLoadingEntries = signal(false);
  entries = signal<HabitEntryDto[]>([]);

  toggleExpand() {
    this.isExpanded.update(v => !v);
    
    // Fetch entries if we just expanded and don't have them yet
    if (this.isExpanded() && this.entries().length === 0) {
      this.loadEntries();
    }
  }

  onToggle(event: Event) {
    event.stopPropagation(); // prevent expand
    this.toggle.emit();
  }

  onArchive() {
    if (confirm(`Are you sure you want to archive "${this.habit.name}"?`)) {
      this.archive.emit();
    }
  }

  private loadEntries() {
    this.isLoadingEntries.set(true);
    // Fetch last 3 months
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 90);
    
    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = today.toISOString().split('T')[0];

    this.habitService.getEntries(this.habit.id, fromStr, toStr).subscribe({
      next: (data) => {
        this.entries.set(data);
        this.isLoadingEntries.set(false);
      },
      error: (err) => {
        console.error('Failed to load heatmap entries', err);
        this.isLoadingEntries.set(false);
      }
    });
  }
}
