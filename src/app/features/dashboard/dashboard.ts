import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/api/dashboard';
import { DashboardDto } from '../../core/models/dashboard';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar';
import { StreakBadgeComponent } from '../../shared/components/streak-badge/streak-badge';
import { HabitService } from '../../core/api/habit';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, ProgressBarComponent, StreakBadgeComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly habitService = inject(HabitService);

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
      error: () => { /* Error toast handled globally by errorInterceptor */ this.data.set(null); this.isLoading.set(false); }
    });
  }

  toggleHabit(habitId: number) {
    const today = new Date().toISOString().split('T')[0];
    this.habitService.toggle(habitId, today).subscribe({
      next: () => this.load(), // Refresh dashboard after toggle
      error: () => { /* Error toast handled globally by errorInterceptor */ }
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
