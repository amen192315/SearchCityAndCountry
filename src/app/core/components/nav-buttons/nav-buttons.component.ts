import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-buttons',
  imports: [RouterLink, RouterModule],
  templateUrl: './nav-buttons.component.html',
  styleUrl: './nav-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavButtonsComponent {}
