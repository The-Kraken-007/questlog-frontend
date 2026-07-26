import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../core/api/habit';
import { HabitDto } from '../../core/models/habit';
import { HabitCardComponent } from './components/habit-card/habit-card';
import { CreateHabitModalComponent } from './components/create-habit-modal/create-habit-modal';

@Component({
  selector: 'app-habits',
  imports: [CommonModule, HabitCardComponent, CreateHabitModalComponent],
  templateUrl: './habits.html',
  styleUrl: './habits.css'
})
export class Habits implements OnInit {
  private readonly habitService = inject(HabitService);

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
      error: () => {
        // Error toast is handled globally by errorInterceptor
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
      error: () => { /* Error toast handled globally by errorInterceptor */ }
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
      error: () => {
        // Error toast handled globally by errorInterceptor; revert the optimistic update
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
      error: () => { /* Error toast handled globally by errorInterceptor */ }
    });
  }
}
