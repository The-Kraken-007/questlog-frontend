import { Component, Input } from '@angular/core';
import { HabitDay } from '../../../core/models/review';

@Component({
  selector: 'app-habit-heatmap',
  imports: [],
  templateUrl: './habit-heatmap.html',
  styleUrl: './habit-heatmap.css'
})
export class HabitHeatmapComponent {
  /** Exactly 7 entries (Mon–Sun) as returned by the weekly review endpoint. */
  @Input() days: HabitDay[] = [];

  readonly dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  cellClass(day: HabitDay | undefined): string {
    if (!day || day.total === 0) return 'none';
    if (day.rate >= 100) return 'full';
    if (day.rate > 0) return 'partial';
    return 'empty';
  }

  tooltip(day: HabitDay | undefined): string {
    if (!day || day.total === 0) return 'No habits tracked';
    return `${day.completed}/${day.total} habits completed`;
  }
}
