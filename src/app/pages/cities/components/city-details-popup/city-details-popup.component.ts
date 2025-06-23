import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { CustomNumber } from '../../../../core/pipes/custom-number.pipe';
import { RoundPipe } from '../../../../core/pipes/round-number.pipe';
import { CityData } from '../../models/city.interface';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-city-details-popup',
  imports: [CustomNumber, MatDialogModule, RoundPipe, TranslocoDirective],
  templateUrl: './city-details-popup.component.html',
  styleUrl: './city-details-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityDetailsPopupComponent {
  readonly dialogRef = inject(MatDialogRef<CityData>);
  readonly data = inject<CityData>(MAT_DIALOG_DATA);
  constructor() {}
}
