import { Routes } from '@angular/router';
import { Shell } from './core/shell/shell';
import { Dashboard } from './features/dashboard/dashboard';
import { Habits } from './features/habits/habits';
import { Goals } from './features/goals/goals';
import { DailyLog } from './features/daily-log/daily-log';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'habits', component: Habits },
      { path: 'goals', component: Goals },
      { path: 'log', component: DailyLog },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
