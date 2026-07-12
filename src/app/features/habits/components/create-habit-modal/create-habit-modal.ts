import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal';

const COMMON_EMOJIS = [
  '💧', '🏃', '🏋️', '📚', '🧘', '🥗', '🍎', '💤', 
  '✍️', '🎸', '💻', '🎨', '🧹', '🚶', '🚴', '💊',
  '💰', '🌱', '☀️', '📵'
];

@Component({
  selector: 'app-create-habit-modal',
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './create-habit-modal.html',
  styleUrl: './create-habit-modal.css'
})
export class CreateHabitModalComponent {
  @Input() isOpen = false;
  
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<{name: string, emoji: string}>();

  emojis = COMMON_EMOJIS;
  
  name = '';
  selectedEmoji = '💧'; // default

  close() {
    this.resetForm();
    this.closed.emit();
  }

  onSubmit() {
    if (this.name.trim()) {
      this.created.emit({ name: this.name.trim(), emoji: this.selectedEmoji });
      this.close();
    }
  }

  private resetForm() {
    this.name = '';
    this.selectedEmoji = '💧';
  }
}
