import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal';

@Component({
  selector: 'app-create-goal-modal',
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './create-goal-modal.html',
  styleUrl: './create-goal-modal.css'
})
export class CreateGoalModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<{ title: string; description?: string; targetDate?: string }>();

  title = '';
  description = '';
  targetDate = '';

  close() {
    this.reset();
    this.closed.emit();
  }

  onSubmit() {
    if (!this.title.trim()) return;
    this.created.emit({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      targetDate: this.targetDate || undefined
    });
    this.close();
  }

  private reset() {
    this.title = '';
    this.description = '';
    this.targetDate = '';
  }
}
