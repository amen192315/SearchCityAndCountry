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

import { CustomNumber } from '../../pipes/custom-number.pipe';
import { RoundPipe } from '../../pipes/round-number.pipe';
import { CityData } from '../../../pages/cities/models/cityData.interface';

@Component({
  selector: 'app-city-details-popup',
  imports: [CustomNumber, MatDialogModule, RoundPipe],
  templateUrl: './city-details-popup.component.html',
  styleUrl: './city-details-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityDetailsPopupComponent {
  readonly dialogRef = inject(MatDialogRef<CityData>);
  readonly data = inject<CityData>(MAT_DIALOG_DATA);
  constructor() {}
}
