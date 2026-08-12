import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AchievementsService } from '../../core/api/achievements.service';
import { Achievement } from '../../core/models/achievement';

type CategoryFilter = 'All' | 'Streak' | 'Milestone' | 'Consistency' | 'Special';

@Component({
  selector: 'app-achievements',
  imports: [DatePipe],
  templateUrl: './achievements.html',
  styleUrl: './achievements.css'
})
export class Achievements implements OnInit {
  private readonly achievementsService = inject(AchievementsService);

  readonly achievements = this.achievementsService.achievements;
  readonly isLoading = this.achievementsService.isLoading;
  readonly activeFilter = signal<CategoryFilter>('All');

  readonly categories: CategoryFilter[] = ['All', 'Streak', 'Milestone', 'Consistency', 'Special'];

  readonly filtered = computed(() => {
    const filter = this.activeFilter();
    const all = this.achievements();
    if (filter === 'All') return all;
    return all.filter(a => a.category === filter);
  });

  readonly unlockedCount = computed(() =>
    this.achievements().filter(a => a.unlocked).length
  );

  ngOnInit() {
    this.achievementsService.getAchievements().subscribe({
      error: () => { /* handled globally */ }
    });
  }

  setFilter(filter: CategoryFilter) {
    this.activeFilter.set(filter);
  }

  trackByKey(_: number, item: Achievement) {
    return item.key;
  }
}
