import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/toast';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  // Step 1: enter email to request token
  // Step 2: enter token + new password to reset
  step = signal<1 | 2>(1);

  email = '';
  token = '';
  newPassword = '';
  isLoading = signal(false);

  constructor(private http: HttpClient, private toast: ToastService) {}

  requestToken() {
    if (!this.email) return;
    this.isLoading.set(true);

    this.http.post('/api/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.toast.success('Check the backend console for your reset token.');
        this.step.set(2);
        this.isLoading.set(false);
      },
      error: () => {
        // Always show success to avoid email enumeration (matches backend behaviour)
        this.toast.success('Check the backend console for your reset token.');
        this.step.set(2);
        this.isLoading.set(false);
      }
    });
  }

  resetPassword() {
    if (!this.token || !this.newPassword) return;
    this.isLoading.set(true);

    this.http.post('/api/auth/reset-password', {
      email: this.email,
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.toast.success('Password reset! You can now log in.');
        this.step.set(1); // reset back so user can go to login
        this.isLoading.set(false);
      },
      error: () => {
        // Error toast (invalid/expired token) handled globally by errorInterceptor
        this.isLoading.set(false);
      }
    });
  }
}
