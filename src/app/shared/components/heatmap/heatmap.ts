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
  templateUrl: './heatmap.html',
  styleUrl: './heatmap.css'
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
