import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslocoDirective } from '@jsverse/transloco';
import { NavLinksComponent } from '../nav-links/nav-buttons.component';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    LanguageSwitcherComponent,
    TranslocoDirective,
    NavLinksComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {}
