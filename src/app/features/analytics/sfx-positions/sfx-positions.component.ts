import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositionsComponent } from '../../hedge/positions/positions.component';

@Component({
  selector: 'app-sfx-positions-analytics',
  standalone: true,
  imports: [CommonModule, PositionsComponent],
  template: `
    <app-positions></app-positions>
  `
})
export class SfxPositionsComponent {}
