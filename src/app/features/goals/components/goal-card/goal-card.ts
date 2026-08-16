import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalDto, MilestoneDto, GoalStatus } from '../../../../core/models/goal';
import { GoalService } from '../../../../core/api/goal';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar';
import { CelebrationService } from '../../../../core/gamification/celebrations';

@Component({
  selector: 'app-goal-card',
  imports: [CommonModule, FormsModule, ProgressBarComponent],
  templateUrl: './goal-card.html',
  styleUrl: './goal-card.css'
})
export class GoalCardComponent {
  @Input({ required: true }) goal!: GoalDto;
  @Output() goalUpdated = new EventEmitter<GoalDto>();

  private readonly goalService = inject(GoalService);
  private readonly celebrations = inject(CelebrationService);

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
      next: (response) => {
        this.goalUpdated.emit(response.data);
        this.celebrations.notifyFromGamifiedResult(response);
      },
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
      next: (response) => {
        this.goalUpdated.emit(response.data);
        this.celebrations.notifyFromGamifiedResult(response);
      },
      error: (err) => console.error('Failed to update goal status', err)
    });
  }
}
