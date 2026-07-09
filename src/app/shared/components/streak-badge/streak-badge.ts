import { Component, Input, computed, signal, effect, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-streak-badge',
  imports: [],
  template: `
    <div class="streak-badge" [class.on-fire]="isOnFire" [class.hidden]="count === 0" title="{{ count }} day streak">
      <span class="icon">{{ isOnFire ? '🔥' : '⚡' }}</span>
      <span class="count">{{ count }}</span>
    </div>
  `,
  styles: `
    .streak-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-surface-border);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-muted);
      transition: all 0.3s ease;
    }

    .streak-badge.hidden {
      opacity: 0.5;
      filter: grayscale(100%);
    }

    .streak-badge.on-fire {
      background: rgba(255, 152, 0, 0.1);
      border-color: rgba(255, 152, 0, 0.3);
      color: #ff9800;
      box-shadow: 0 0 10px rgba(255, 152, 0, 0.2);
      animation: pulse 2s infinite;
    }

    .count {
      font-variant-numeric: tabular-nums;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(255, 152, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
    }
  `
})
export class StreakBadgeComponent {
  @Input({ required: true }) count = 0;

  get isOnFire(): boolean {
    return this.count >= 7;
  }
}
