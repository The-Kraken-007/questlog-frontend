import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css'
})
export class ProgressBarComponent {
  @Input({ required: true }) percent = 0;
}
