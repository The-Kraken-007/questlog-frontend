import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../core/api/habit';
import { HabitDto } from '../../core/models/habit';
import { HabitCardComponent } from './components/habit-card/habit-card';
import { CreateHabitModalComponent } from './components/create-habit-modal/create-habit-modal';
import { ToastService } from '../../core/toast';

@Component({
  selector: 'app-habits',
  imports: [CommonModule, HabitCardComponent, CreateHabitModalComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-title">
          <h2>My Habits</h2>
          <p class="subtitle">Build your daily routines</p>
        </div>
        <button class="btn-new" (click)="isCreateModalOpen.set(true)">
          <span class="icon">+</span> New Habit
        </button>
      </header>

      @if (isLoading()) {
        <div class="loading-state">Loading habits...</div>
      } @else if (habits().length === 0) {
        <div class="empty-state glass-panel">
          <span class="empty-icon">🌱</span>
          <h3>No habits yet</h3>
          <p>Start small. Create your first daily habit!</p>
          <button class="btn-new" (click)="isCreateModalOpen.set(true)">Create Habit</button>
        </div>
      } @else {
        <div class="habits-list">
          @for (habit of habits(); track habit.id) {
            <app-habit-card 
              [habit]="habit"
              (toggle)="onToggleHabit(habit)"
              (archive)="onArchiveHabit(habit)">
            </app-habit-card>
          }
        </div>
      }

      <app-create-habit-modal
        [isOpen]="isCreateModalOpen()"
        (closed)="isCreateModalOpen.set(false)"
        (created)="onCreateHabit($event)">
      </app-create-habit-modal>
    </div>
  `,
  styles: `
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 10px;
    }

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

    .subtitle {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.95rem;
    }

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

    .btn-new:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
    }

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

    .empty-icon {
      font-size: 3rem;
    }

    .empty-state h3 {
      color: var(--color-text);
      margin: 0;
    }

    .empty-state .btn-new {
      margin-top: 12px;
    }

    .habits-list {
      display: flex;
      flex-direction: column;
    }
  `
})
export class Habits implements OnInit {
  private readonly habitService = inject(HabitService);
  private readonly toast = inject(ToastService);

  habits = signal<HabitDto[]>([]);
  isLoading = signal(true);
  isCreateModalOpen = signal(false);

  ngOnInit() {
    this.loadHabits();
  }

  loadHabits() {
    this.isLoading.set(true);
    this.habitService.getAll().subscribe({
      next: (data) => {
        this.habits.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load habits', err);
        this.toast.error('Failed to load habits. Is the backend running?');
        this.isLoading.set(false);
      }
    });
  }

  onCreateHabit(data: {name: string, emoji: string}) {
    this.habitService.create(data).subscribe({
      next: (newHabit) => {
        // Optimistically add to the list
        this.habits.update(h => [...h, newHabit]);
      },
      error: (err) => {
        console.error('Failed to create habit', err);
        this.toast.error('Could not create habit. Please try again.');
      }
    });
  }

  onToggleHabit(habit: HabitDto) {
    const today = new Date().toISOString().split('T')[0];
    
    // Optimistic UI update
    const previousCompleted = habit.isCompletedToday;
    const previousStreak = habit.currentStreak;
    
    this.habits.update(list => list.map(h => {
      if (h.id === habit.id) {
        return {
          ...h,
          isCompletedToday: !previousCompleted,
          currentStreak: !previousCompleted ? previousStreak + 1 : Math.max(0, previousStreak - 1)
        };
      }
      return h;
    }));

    // API call
    this.habitService.toggle(habit.id, today).subscribe({
      next: (updatedHabit) => {
        // Sync with exact server state just in case logic differed
        this.habits.update(list => list.map(h => h.id === updatedHabit.id ? updatedHabit : h));
      },
      error: (err) => {
        console.error('Failed to toggle habit', err);
        this.toast.error('Could not update habit. Please try again.');
        // Revert optimistic update
        this.habits.update(list => list.map(h => {
          if (h.id === habit.id) {
            return {
              ...h,
              isCompletedToday: previousCompleted,
              currentStreak: previousStreak
            };
          }
          return h;
        }));
      }
    });
  }

  onArchiveHabit(habit: HabitDto) {
    this.habitService.update(habit.id, { isArchived: true }).subscribe({
      next: () => {
        this.habits.update(list => list.filter(h => h.id !== habit.id));
      },
      error: (err) => {
        console.error('Failed to archive habit', err);
        this.toast.error('Could not archive habit. Please try again.');
      }
    });
  }
}
