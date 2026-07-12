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
  templateUrl: './goals.html',
  styleUrl: './goals.css'
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
