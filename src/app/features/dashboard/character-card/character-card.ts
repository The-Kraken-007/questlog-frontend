import { Component, computed, inject, OnInit } from '@angular/core';
import { GamificationService } from '../../../core/api/gamification.service';

@Component({
  selector: 'app-character-card',
  imports: [],
  templateUrl: './character-card.html',
  styleUrl: './character-card.css'
})
export class CharacterCardComponent implements OnInit {
  private readonly gamificationService = inject(GamificationService);

  readonly profile = this.gamificationService.profile;
  readonly isLoading = this.gamificationService.isLoading;

  readonly xpPercent = computed(() => {
    const p = this.profile();
    if (!p || p.xpForCurrentLevel === 0) return 0;
    return Math.round((p.xpInCurrentLevel / p.xpForCurrentLevel) * 100);
  });

  ngOnInit() {
    this.gamificationService.getProfile().subscribe({
      error: () => { /* silently fail — card just won't show */ }
    });
  }
}
