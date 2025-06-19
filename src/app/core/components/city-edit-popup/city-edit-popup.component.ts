import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CityData } from '../../../pages/cities/models/cityData.interface';

@Component({
  selector: 'app-city-edit-popup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './city-edit-popup.component.html',
  styleUrl: './city-edit-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityEditPopupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CityEditPopupComponent>);
  readonly data = inject<CityData>(MAT_DIALOG_DATA);

  editForm = this.fb.group({
    name: [this.data.name, Validators.required],
    country: [this.data.country, Validators.required],
    region: [this.data.region, Validators.required],
    population: [
      this.data.population,
      [Validators.required, Validators.min(0)],
    ],
    latitude: [this.data.latitude],
    longitude: [this.data.longitude],
    regionCode: [this.data.regionCode],
  });

  saveChanges() {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
