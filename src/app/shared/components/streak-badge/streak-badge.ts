import { Component, Input, computed, signal, effect, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-streak-badge',
  imports: [],
  templateUrl: './streak-badge.html',
  styleUrl: './streak-badge.css'
})
export class StreakBadgeComponent {
  @Input({ required: true }) count = 0;

  get isOnFire(): boolean {
    return this.count >= 7;
  }
}
