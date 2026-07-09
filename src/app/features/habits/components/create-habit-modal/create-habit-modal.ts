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
  template: `
    <app-modal title="New Habit" [isOpen]="isOpen" (closed)="close()">
      <form (ngSubmit)="onSubmit()" #form="ngForm" class="create-form">
        
        <div class="form-group">
          <label for="habitName">Habit Name</label>
          <input 
            type="text" 
            id="habitName" 
            name="habitName" 
            [(ngModel)]="name" 
            required 
            placeholder="e.g. Drink Water"
            autocomplete="off"
            class="input-field"
            #nameInput="ngModel"
          />
          @if (nameInput.invalid && nameInput.touched) {
            <span class="error-text">Name is required</span>
          }
        </div>

        <div class="form-group">
          <label>Select Emoji</label>
          <div class="emoji-grid">
            @for (em of emojis; track em) {
              <button 
                type="button" 
                class="emoji-btn" 
                [class.selected]="selectedEmoji === em"
                (click)="selectedEmoji = em">
                {{ em }}
              </button>
            }
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Create Habit</button>
        </div>

      </form>
    </app-modal>
  `,
  styles: `
    .create-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text);
    }

    .input-field {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-surface-border);
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--color-text);
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.2s;
    }

    .input-field:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
    }

    .error-text {
      color: #ef4444;
      font-size: 0.8rem;
    }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      max-height: 150px;
      overflow-y: auto;
      padding: 4px;
      /* custom scrollbar */
      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    }

    .emoji-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid transparent;
      font-size: 1.5rem;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .emoji-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }

    .emoji-btn.selected {
      background: rgba(124, 58, 237, 0.2);
      border-color: var(--color-primary);
      box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-size: 0.95rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-text-muted);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--color-primary-start), var(--color-primary-end));
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
      transform: translateY(-1px);
    }
  `
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
