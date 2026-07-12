import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitDto, HabitEntryDto } from '../../../../core/models/habit';
import { StreakBadgeComponent } from '../../../../shared/components/streak-badge/streak-badge';
import { HeatmapComponent } from '../../../../shared/components/heatmap/heatmap';
import { HabitService } from '../../../../core/api/habit';

@Component({
  selector: 'app-habit-card',
  imports: [CommonModule, StreakBadgeComponent, HeatmapComponent],
  templateUrl: './habit-card.html',
  styleUrl: './habit-card.css'
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
