import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitEntryDto } from '../../../core/models/habit';

interface HeatmapDay {
  date: string;
  isCompleted: boolean;
  isFuture: boolean;
  isInMonth: boolean;
}

@Component({
  selector: 'app-heatmap',
  imports: [CommonModule],
  template: `
    <div class="heatmap-wrapper">
      <div class="months">
        @for (month of months(); track $index) {
          <span class="month-label">{{ month }}</span>
        }
      </div>
      <div class="heatmap-grid">
        @for (day of days(); track day.date) {
          <div 
            class="heatmap-cell" 
            [class.completed]="day.isCompleted" 
            [class.future]="day.isFuture"
            [title]="day.date + (day.isCompleted ? ': Completed' : '')">
          </div>
        }
      </div>
      <div class="legend">
        <span>Less</span>
        <div class="heatmap-cell"></div>
        <div class="heatmap-cell completed"></div>
        <span>More</span>
      </div>
    </div>
  `,
  styles: `
    .heatmap-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
    }
    
    .months {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      padding-left: 2px;
    }

    .heatmap-grid {
      display: grid;
      grid-template-rows: repeat(7, 1fr);
      grid-auto-flow: column;
      gap: 4px;
    }

    .heatmap-cell {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      background-color: var(--color-surface-border); /* Empty state */
      transition: background-color 0.2s ease, transform 0.1s ease;
    }
    
    .heatmap-cell:hover:not(.future) {
      transform: scale(1.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .heatmap-cell.completed {
      background-color: var(--color-primary);
      box-shadow: 0 0 5px rgba(124, 58, 237, 0.4);
    }

    .heatmap-cell.future {
      background-color: transparent;
      border: 1px dashed var(--color-surface-border);
      opacity: 0.3;
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      color: var(--color-text-muted);
      margin-top: 4px;
      justify-content: flex-end;
    }
  `
})
export class HeatmapComponent implements OnChanges {
  @Input() entries: HabitEntryDto[] = [];
  @Input() daysToDisplay = 91; // ~13 weeks

  days = signal<HeatmapDay[]>([]);
  months = signal<string[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entries']) {
      this.generateHeatmap();
    }
  }

  private generateHeatmap() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const generatedDays: HeatmapDay[] = [];
    const entryMap = new Map(this.entries.map(e => [e.date, e.isCompleted]));

    // We want the grid to end exactly on today's day of the week, so it fills perfectly.
    // However, CSS grid auto-flow column fills columns top to bottom.
    // If we just go back 91 days, the first day might be a random weekday, 
    // and CSS Grid will start it at the top left.
    // To align today at the bottom of the last column, we must ensure the total number of days is a multiple of 7.
    // Or we simply let the grid auto-flow. For simplicity, we just generate exactly `daysToDisplay` days,
    // and the grid will arrange them. 
    
    // Calculate the start date (daysToDisplay - 1 days ago)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (this.daysToDisplay - 1));

    // Align to Sunday of that week to make columns clean (optional, but good for grid)
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    
    // Now iterate until we reach the end of the current week (Saturday)
    const endDate = new Date(today);
    const endDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

    const current = new Date(startDate);
    const monthSet = new Set<string>();
    const monthLabels: string[] = [];

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const monthStr = current.toLocaleString('default', { month: 'short' });
      
      if (!monthSet.has(monthStr)) {
        monthSet.add(monthStr);
        // Only add label if it's the first week of the month approximately
        if (current.getDate() <= 7) {
          monthLabels.push(monthStr);
        }
      }

      generatedDays.push({
        date: dateStr,
        isCompleted: entryMap.get(dateStr) === true,
        isFuture: current > today,
        isInMonth: true
      });
      current.setDate(current.getDate() + 1);
    }

    this.days.set(generatedDays);
    this.months.set(monthLabels);
  }
}
