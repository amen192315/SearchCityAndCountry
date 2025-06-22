import { Component } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoDirective, MatCheckboxModule, FormsModule, MatRadioModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent {
  currentLang: string;
  languages: string[];

  constructor(private translocoService: TranslocoService) {
    this.currentLang = this.translocoService.getActiveLang();
    const availableLangs = this.translocoService.getAvailableLangs();

    if (
      Array.isArray(availableLangs) &&
      typeof availableLangs[0] === 'string'
    ) {
      this.languages = availableLangs as string[];
    } else {
      this.languages = (availableLangs as { id: string; label: string }[]).map(
        (lang) => lang.id
      );
    }
  }

  changeLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang = lang;
  }
}
