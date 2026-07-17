import { Routes } from '@angular/router';
import { Shell } from './core/shell/shell';
import { Dashboard } from './features/dashboard/dashboard';
import { Habits } from './features/habits/habits';
import { Goals } from './features/goals/goals';
import { DailyLog } from './features/daily-log/daily-log';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { authGuard } from './core/api/auth.guard';

export const routes: Routes = [
  // ── Public routes (no auth required) ─────────────────────────────────────
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },

  // ── Protected routes (requires valid JWT via authGuard) ───────────────────
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'habits', component: Habits },
      { path: 'goals', component: Goals },
      { path: 'log', component: DailyLog },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
