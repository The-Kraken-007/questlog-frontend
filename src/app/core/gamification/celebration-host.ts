import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CelebrationService } from './celebrations';

/**
 * Top-level overlay host for gamification celebrations. Mounted once in
 * `shell.html` so the XP / level-up / achievement toasts render above all
 * feature content. Reads signals from `CelebrationService` and renders the
 * appropriate UI; no input or output.
 */
@Component({
  selector: 'app-celebration-host',
  imports: [CommonModule],
  templateUrl: './celebration-host.html',
  styleUrl: './celebration-host.css'
})
export class CelebrationHostComponent {
  protected readonly celebrations = inject(CelebrationService);
}