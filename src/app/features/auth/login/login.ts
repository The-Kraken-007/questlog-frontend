import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../core/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  isLoading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  onSubmit() {
    if (!this.email || !this.password) return;
    this.isLoading.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        const msg = err?.error?.title ?? err?.error?.message ?? 'Login failed. Please try again.';
        this.toast.error(msg);
        this.isLoading.set(false);
      }
    });
  }
}
