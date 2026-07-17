import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container';
import { AuthService } from '../api/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  // inject() works without constructor injection in standalone components
  protected auth = inject(AuthService);
}
