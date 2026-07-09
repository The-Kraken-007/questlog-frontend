import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  template: `
    <div class="progress-container" [title]="percent + '% complete'">
      <div class="progress-track">
        <div class="progress-fill" [style.width.%]="percent"></div>
      </div>
      <span class="progress-label">{{ percent }}%</span>
    </div>
  `,
  styles: `
    .progress-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-track {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.07);
      border-radius: 99px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 99px;
      background: linear-gradient(90deg, var(--color-primary-start), var(--color-primary-end));
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 0 8px rgba(124, 58, 237, 0.4);
    }

    .progress-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-muted);
      min-width: 36px;
      text-align: right;
    }
  `
})
export class ProgressBarComponent {
  @Input({ required: true }) percent = 0;
}
