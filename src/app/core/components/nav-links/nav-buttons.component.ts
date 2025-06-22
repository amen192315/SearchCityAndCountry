import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterModule, TranslocoDirective],
  templateUrl: './nav-buttons.component.html',
  styleUrl: './nav-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavLinksComponent {}
