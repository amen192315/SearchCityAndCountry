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
import { DataCity } from '../../data/interfaces/city/dataCity.interface';
import { CustomNumber } from '../../helpers/pipes/custom-number.pipe';
import { RoundPipe } from '../../helpers/pipes/round-number.pipe';

@Component({
  selector: 'app-city-details-popup',
  imports: [CustomNumber, MatDialogModule, RoundPipe],
  templateUrl: './city-details-popup.component.html',
  styleUrl: './city-details-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityDetailsPopupComponent {
  readonly dialogRef = inject(MatDialogRef<DataCity>);
  readonly data = inject<DataCity>(MAT_DIALOG_DATA);
  constructor() {}
}
