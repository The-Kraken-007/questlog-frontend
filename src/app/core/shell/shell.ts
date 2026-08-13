import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container';
import { ModalComponent } from '../../shared/components/modal/modal';
import { CelebrationHostComponent } from '../gamification/celebration-host';
import { AuthService } from '../api/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent, ModalComponent, CelebrationHostComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  // inject() works without constructor injection in standalone components
  protected auth = inject(AuthService);

  isProfileMenuOpen = signal(false);
  isLogoutModalOpen = signal(false);

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  confirmLogout() {
    this.isLogoutModalOpen.set(true);
    this.isProfileMenuOpen.set(false);
  }

  executeLogout() {
    this.isLogoutModalOpen.set(false);
    this.auth.logout();
  }
}
